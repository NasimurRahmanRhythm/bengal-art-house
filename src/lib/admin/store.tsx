"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import * as api from "./actions";
import type {
  AdminData,
  Artist,
  Artwork,
  BlogPost,
  Enquiry,
  Exhibition,
  GoverningMember,
  Order,
  PressRelease,
  Refund,
} from "./types";

// The dashboard's data layer.
//
// Reads come from Postgres once, on mount. Writes go to Postgres through the
// server actions in actions.ts, and the local copy is updated at the same time
// so the screen never waits on a round trip to redraw. If a write fails the
// message is surfaced in the shell and the row is rolled back by re-reading.
//
// There is no offline or preview mode. What is on screen is what is in the
// database, or an error saying why it is not — a dashboard that quietly shows
// invented rows is a dashboard whose numbers cannot be trusted.

type Status = "loading" | "live" | "error";

type Ctx = {
  data: AdminData;
  hydrated: boolean;
  status: Status;
  error: string;
  clearError: () => void;
  saveArtist: (a: Artist) => Promise<void>;
  deleteArtist: (id: string) => Promise<void>;
  saveArtwork: (w: Artwork) => Promise<void>;
  deleteArtwork: (id: string) => Promise<void>;
  setArtworkStatus: (id: string, status: Artwork["status"]) => Promise<void>;
  saveExhibition: (e: Exhibition) => Promise<void>;
  deleteExhibition: (id: string) => Promise<void>;
  saveMember: (m: GoverningMember) => Promise<void>;
  deleteMember: (id: string) => Promise<void>;
  setEnquiryStatus: (id: string, status: Enquiry["status"]) => Promise<void>;
  deleteEnquiry: (id: string) => Promise<void>;
  setPaymentStatus: (id: string, status: Order["paymentStatus"]) => Promise<void>;
  setFulfillmentStatus: (id: string, status: Order["fulfillmentStatus"]) => Promise<void>;
  recordRefund: (order: Order, refund: Omit<Refund, "at">, relist: boolean) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;
  savePost: (p: BlogPost) => Promise<void>;
  deletePost: (id: string) => Promise<void>;
  saveRelease: (p: PressRelease) => Promise<void>;
  deleteRelease: (id: string) => Promise<void>;
};

const AdminStore = createContext<Ctx | null>(null);

// What the dashboard holds before the database answers, and if it cannot.
// Never placeholder rows: the gallery has to be able to tell, at a glance,
// which of its artworks actually exist.
const EMPTY: AdminData = {
  artists: [],
  artworks: [],
  exhibitions: [],
  governingBody: [],
  enquiries: [],
  orders: [],
  posts: [],
  pressReleases: [],
};

type RowKey = keyof AdminData;

export function AdminStoreProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AdminData>(EMPTY);
  const [status, setStatus] = useState<Status>("loading");
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    const res = await api.loadAll();
    if (res.ok) {
      setData(res.data);
      setStatus("live");
      // A table that could not be read is still worth saying out loud — the
      // rest of the dashboard works, so nothing else would give it away.
      setError(res.warning);
      return true;
    }
    setStatus("error");
    setError(
      res.error === "not-configured"
        ? "No database connection. Add the Supabase keys to .env.local."
        : res.error,
    );
    return false;
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  /** Replace or prepend a row in the local copy. */
  const put = useCallback((key: RowKey, row: { id: string }, replacing?: string) => {
    setData((prev) => {
      const list = prev[key] as { id: string }[];
      const target = replacing ?? row.id;
      const i = list.findIndex((r) => r.id === target);
      return {
        ...prev,
        [key]: i === -1 ? [row, ...list] : list.map((r, j) => (j === i ? row : r)),
      } as AdminData;
    });
  }, []);

  const drop = useCallback((key: RowKey, id: string) => {
    setData((prev) => ({
      ...prev,
      [key]: (prev[key] as { id: string }[]).filter((r) => r.id !== id),
    }) as AdminData);
  }, []);

  const patch = useCallback((key: RowKey, id: string, fields: Record<string, unknown>) => {
    setData((prev) => ({
      ...prev,
      [key]: (prev[key] as { id: string }[]).map((r) => (r.id === id ? { ...r, ...fields } : r)),
    }) as AdminData);
  }, []);

  /**
   * Apply a change locally so the screen redraws at once, then persist it. On
   * failure the message is shown and the tables are re-read, so what is on
   * screen always matches what is actually stored.
   */
  const commit = useCallback(
    async (local: () => void, persist: () => Promise<void>) => {
      local();
      try {
        await persist();
      } catch (e) {
        setError(e instanceof Error ? e.message : "That change could not be saved.");
        await refresh();
      }
    },
    [refresh],
  );

  const value = useMemo<Ctx>(() => {
    /** Save through a server action, then swap the optimistic row for the
        stored one — a new row only gets its real id from Postgres. */
    const upsert = <T extends { id: string }>(
      key: RowKey,
      row: T,
      save: (row: T) => Promise<T>,
    ) =>
      commit(
        () => put(key, row),
        async () => {
          const saved = await save(row);
          put(key, saved, row.id);
        },
      );

    return {
      data,
      hydrated: status !== "loading",
      status,
      error,
      clearError: () => setError(""),

      saveArtist: (a) => upsert("artists", a, api.saveArtist),
      deleteArtist: (id) => commit(() => drop("artists", id), () => api.deleteArtist(id)),

      saveArtwork: (w) => upsert("artworks", w, api.saveArtwork),
      deleteArtwork: (id) => commit(() => drop("artworks", id), () => api.deleteArtwork(id)),
      setArtworkStatus: (id, s) =>
        commit(() => patch("artworks", id, { status: s }), () => api.setArtworkStatus(id, s)),

      saveExhibition: (e) => upsert("exhibitions", e, api.saveExhibition),
      deleteExhibition: (id) =>
        commit(() => drop("exhibitions", id), () => api.deleteExhibition(id)),

      saveMember: (m) => upsert("governingBody", m, api.saveMember),
      deleteMember: (id) => commit(() => drop("governingBody", id), () => api.deleteMember(id)),

      setEnquiryStatus: (id, s) =>
        commit(() => patch("enquiries", id, { status: s }), () => api.setEnquiryStatus(id, s)),
      deleteEnquiry: (id) => commit(() => drop("enquiries", id), () => api.deleteEnquiry(id)),

      // Payment status is the gateway's word, not the gallery's — editable only
      // so a stuck order can be reconciled by hand. Fulfilment is the gallery's
      // own workflow.
      setPaymentStatus: (id, s) =>
        commit(
          () => patch("orders", id, { paymentStatus: s, updatedAt: new Date().toISOString() }),
          () => api.setPaymentStatus(id, s),
        ),
      setFulfillmentStatus: (id, s) =>
        commit(
          () => patch("orders", id, { fulfillmentStatus: s, updatedAt: new Date().toISOString() }),
          () => api.setFulfillmentStatus(id, s),
        ),
      recordRefund: (order, refund, relist) =>
        commit(
          () => {
            const now = new Date().toISOString();
            patch("orders", order.id, {
              paymentStatus: "refunded",
              refund: { ...refund, at: now },
              updatedAt: now,
            });
            if (relist) {
              for (const item of order.items) {
                patch("artworks", item.artworkId, { status: "available" });
              }
            }
          },
          async () => {
            const saved = await api.recordRefund(order.id, refund, relist);
            patch("orders", order.id, { refund: saved });
          },
        ),
      deleteOrder: (id) => commit(() => drop("orders", id), () => api.deleteOrder(id)),

      savePost: (p) => upsert("posts", p, api.savePost),
      deletePost: (id) => commit(() => drop("posts", id), () => api.deletePost(id)),

      saveRelease: (p) => upsert("pressReleases", p, api.saveRelease),
      deleteRelease: (id) => commit(() => drop("pressReleases", id), () => api.deleteRelease(id)),
    };
  }, [data, status, error, commit, put, drop, patch]);

  return <AdminStore.Provider value={value}>{children}</AdminStore.Provider>;
}

export function useAdmin(): Ctx {
  const ctx = useContext(AdminStore);
  if (!ctx) throw new Error("useAdmin must be used inside AdminStoreProvider");
  return ctx;
}

// Convenience selectors used across screens.
export function useArtistMap() {
  const { data } = useAdmin();
  return useMemo(() => new Map(data.artists.map((a) => [a.id, a])), [data.artists]);
}

export function useArtworkMap() {
  const { data } = useAdmin();
  return useMemo(() => new Map(data.artworks.map((w) => [w.id, w])), [data.artworks]);
}

export function useCounts() {
  const { data } = useAdmin();
  return useMemo(
    () => ({
      artists: data.artists.length,
      artworks: data.artworks.length,
      available: data.artworks.filter((w) => w.status === "available").length,
      sold: data.artworks.filter((w) => w.status === "sold").length,
      reserved: data.artworks.filter((w) => w.status === "reserved").length,
      exhibitions: data.exhibitions.length,
      governingBody: data.governingBody.length,
      unread: data.enquiries.filter((e) => e.status === "new").length,
      orders: data.orders.length,
      // What the sidebar badge counts: paid but not yet sent out — the only
      // order state that is waiting on someone in the gallery.
      toFulfil: data.orders.filter(
        (o) => o.paymentStatus === "paid" && o.fulfillmentStatus !== "completed",
      ).length,
      // Net of refunds: a partly refunded order still counts for what the
      // gallery kept after the Return Policy deductions.
      revenue: data.orders.reduce(
        (sum, o) =>
          o.paymentStatus === "paid"
            ? sum + o.totalAmount
            : o.paymentStatus === "refunded"
              ? sum + o.totalAmount - (o.refund?.amount ?? o.totalAmount)
              : sum,
        0,
      ),
      posts: data.posts.length,
      drafts: data.posts.filter((p) => !p.published).length,
      press: data.pressReleases.length,
      stockValue: data.artworks
        .filter((w) => w.status === "available")
        .reduce((sum, w) => sum + w.price, 0),
    }),
    [data],
  );
}
