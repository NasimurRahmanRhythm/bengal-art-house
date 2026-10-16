import { createClient } from "@/lib/supabase/server";
import CheckoutForm from "./CheckoutForm";

// The signed-in customer's saved name and phone are read here, on the server,
// and handed to the form as its starting values. Signing in and the cart stay
// in the browser, where they live.
export default async function CheckoutPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let saved = { name: "", phone: "" };
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("full_name, phone")
      .eq("id", user.id)
      .maybeSingle();
    saved = { name: data?.full_name ?? "", phone: data?.phone ?? "" };
  }

  return <CheckoutForm saved={saved} />;
}
