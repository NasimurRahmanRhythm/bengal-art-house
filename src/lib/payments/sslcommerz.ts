import { createHash } from "node:crypto";

// Thin, dependency-free client for the three SSLCommerz endpoints this site
// touches: session init, transaction validation, and IPN signature checking.
//
// The official `sslcommerz-lts` npm package wraps the same three HTTP calls in
// a class that pins an old axios; there is nothing here worth a dependency.

const SANDBOX_BASE = "https://sandbox.sslcommerz.com";
const LIVE_BASE = "https://securepay.sslcommerz.com";

export type SslConfig = {
  storeId: string;
  storePassword: string;
  isLive: boolean;
  baseUrl: string;
  siteUrl: string;
};

/** Reads the gateway credentials, or throws naming the exact variable that is
    missing — a blank store id otherwise surfaces as an opaque gateway error
    page halfway through a real customer's checkout. */
export function sslConfig(): SslConfig {
  const storeId = process.env.SSLCOMMERZ_STORE_ID;
  const storePassword = process.env.SSLCOMMERZ_STORE_PASSWORD;

  if (!storeId) throw new Error("SSLCOMMERZ_STORE_ID is not set");
  if (!storePassword) throw new Error("SSLCOMMERZ_STORE_PASSWORD is not set");

  const isLive = process.env.SSLCOMMERZ_IS_LIVE === "true";

  return {
    storeId,
    storePassword,
    isLive,
    baseUrl: isLive ? LIVE_BASE : SANDBOX_BASE,
    siteUrl: siteUrl(),
  };
}

/** The origin SSLCommerz is told to send the customer back to. It must be a
    real, publicly reachable URL — the gateway redirects the customer's browser
    there and calls the IPN itself, so localhost works for the redirect legs
    but never for IPN. */
export function siteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/+$/, "");
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL)
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

// ---------------------------------------------------------------------------
// Session init
// ---------------------------------------------------------------------------

export type InitPayload = {
  tranId: string;
  amount: number;
  currency?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  city: string;
  postcode: string;
  country: string;
  productName: string;
  numItems: number;
};

export type InitResult =
  | { ok: true; gatewayUrl: string; sessionKey: string }
  | { ok: false; reason: string };

export async function initSession(payload: InitPayload): Promise<InitResult> {
  const cfg = sslConfig();

  // The gateway rejects the whole session if a required field is empty, so
  // every optional value falls back to something non-empty rather than "".
  const body = new URLSearchParams({
    store_id: cfg.storeId,
    store_passwd: cfg.storePassword,

    // Sent with two decimals: SSLCommerz compares the amount it validates
    // against this string, and "1800" vs "1800.00" has been known to trip the
    // comparison on their side.
    total_amount: payload.amount.toFixed(2),
    currency: payload.currency ?? "BDT",
    tran_id: payload.tranId,

    success_url: `${cfg.siteUrl}/api/payment/success`,
    fail_url: `${cfg.siteUrl}/api/payment/fail`,
    cancel_url: `${cfg.siteUrl}/api/payment/cancel`,
    ipn_url: `${cfg.siteUrl}/api/payment/ipn`,

    // shipping_method NO still requires the product block to be present.
    shipping_method: "NO",
    product_name: payload.productName,
    product_category: "Art",
    product_profile: "physical-goods",
    num_of_item: String(payload.numItems),

    cus_name: payload.customerName,
    cus_email: payload.customerEmail,
    cus_phone: payload.customerPhone,
    cus_add1: payload.address || "N/A",
    cus_city: payload.city || "Dhaka",
    cus_postcode: payload.postcode || "1000",
    cus_country: payload.country || "Bangladesh",

    // Echoed back untouched on every callback. tran_id already identifies the
    // order, but value_a costs nothing and makes an IPN body self-describing
    // when it is read out of a log months later.
    value_a: payload.tranId,
  });

  let res: Response;
  try {
    res = await fetch(`${cfg.baseUrl}/gwprocess/v4/api.php`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      cache: "no-store",
    });
  } catch (err) {
    return { ok: false, reason: `Could not reach SSLCommerz: ${String(err)}` };
  }

  if (!res.ok) {
    return { ok: false, reason: `SSLCommerz replied ${res.status}` };
  }

  const json = (await res.json()) as {
    status?: string;
    failedreason?: string;
    sessionkey?: string;
    GatewayPageURL?: string;
  };

  if (json.status !== "SUCCESS" || !json.GatewayPageURL) {
    return {
      ok: false,
      reason:
        json.failedreason || `SSLCommerz refused the session (${json.status ?? "no status"})`,
    };
  }

  return { ok: true, gatewayUrl: json.GatewayPageURL, sessionKey: json.sessionkey ?? "" };
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

export type ValidationResult = {
  status?: string; // VALID | VALIDATED | INVALID_TRANSACTION | ...
  tran_id?: string;
  val_id?: string;
  amount?: string;
  store_amount?: string;
  currency?: string;
  bank_tran_id?: string;
  card_type?: string;
  card_issuer?: string;
  card_brand?: string;
  tran_date?: string;
  risk_level?: string;
  risk_title?: string;
  error?: string;
  [key: string]: unknown;
};

/** Server-to-server confirmation that a payment is real.
 *
 *  This is the only thing allowed to move an order to `paid`. The redirect
 *  back from the gateway is a browser POST — anyone can forge it — and even a
 *  valid IPN signature only proves the message came from SSLCommerz, not that
 *  money settled. The validator API, called with the store password over a
 *  channel the customer cannot touch, is the authority. */
export async function validateTransaction(valId: string): Promise<ValidationResult | null> {
  const cfg = sslConfig();

  const url = new URL(`${cfg.baseUrl}/validator/api/validationserverAPI.php`);
  url.searchParams.set("val_id", valId);
  url.searchParams.set("store_id", cfg.storeId);
  url.searchParams.set("store_passwd", cfg.storePassword);
  url.searchParams.set("format", "json");
  url.searchParams.set("v", "1");

  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as ValidationResult;
  } catch {
    return null;
  }
}

/** VALID = validated on the spot. VALIDATED = validated by an earlier call
    (the IPN and the success redirect race each other, so whichever arrives
    second always sees this). Both mean the money is good. */
export function isPaidStatus(status: string | undefined): boolean {
  return status === "VALID" || status === "VALIDATED";
}

// ---------------------------------------------------------------------------
// IPN signature
// ---------------------------------------------------------------------------

/** Verifies the `verify_sign` hash SSLCommerz attaches to every callback.
 *
 *  `verify_key` names the fields that went into the hash. They are re-sorted
 *  alphabetically with the md5 of the store password appended as one more
 *  field, joined `k=v&k=v`, and md5'd.
 *
 *  A pass here is a cheap filter, not proof of payment — validateTransaction()
 *  is what authorises the order. A failure is worth logging loudly: it means
 *  either a forged callback or a store password that has drifted out of step
 *  with the merchant panel. */
export function verifySignature(fields: Record<string, string>): boolean {
  const verifySign = fields.verify_sign;
  const verifyKey = fields.verify_key;
  if (!verifySign || !verifyKey) return false;

  const cfg = sslConfig();

  const parts: Record<string, string> = {};
  for (const key of verifyKey.split(",")) {
    const name = key.trim();
    if (name && name in fields) parts[name] = fields[name];
  }
  parts.store_passwd = createHash("md5").update(cfg.storePassword).digest("hex");

  const hashString = Object.keys(parts)
    .sort()
    .map((k) => `${k}=${parts[k]}`)
    .join("&");

  return createHash("md5").update(hashString).digest("hex") === verifySign;
}

/** A transaction id short enough for the gateway's 30-character field and
    unguessable enough that the callback URLs cannot be walked. */
export function newTranId(): string {
  const stamp = Date.now().toString(36).toUpperCase();
  const noise = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `GH${stamp}${noise}`;
}
