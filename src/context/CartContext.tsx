"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Artwork } from "@/data/artworks";

export type CartLine = {
  id: string;
  title: string;
  artist: string;
  price: number;
  plate: number;
  photo?: string;
};

type CartValue = {
  lines: CartLine[];
  count: number;
  total: number;
  isOpen: boolean;
  pulse: number;
  add: (artwork: Artwork) => void;
  remove: (id: string) => void;
  clear: () => void;
  has: (id: string) => boolean;
  openCart: () => void;
  closeCart: () => void;
  /** Lines dropped by the last catalogue check, so the drawer can say why
      something the customer put there is no longer in the basket. */
  removed: CartLine[];
  dismissRemoved: () => void;
};

const STORAGE_KEY = "bah_cart_lines";

const CartContext = createContext<CartValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [pulse, setPulse] = useState(0);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setLines(JSON.parse(raw) as CartLine[]);
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {}
  }, [lines, hydrated]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // --- keeping the basket honest against the catalogue ----------------------
  //
  // The basket used to be emptied by one thing only: the confirmation page
  // calling clear() after a payment. That page is not reliably reached. A
  // bKash customer on a phone pays inside the bKash app and very often never
  // returns to the browser — the IPN settles the order server-side and the
  // browser, whenever it comes back, still has the piece sitting in its
  // basket as though nothing happened.
  //
  // So the basket no longer waits to be told. It asks the catalogue which of
  // its lines are still for sale and drops the rest. That covers the payment
  // the customer just made, a piece someone else bought while this basket sat
  // open, and a piece the gallery withdrew — all of which are the same
  // problem, and none of which the browser can know about on its own.

  const linesRef = useRef<CartLine[]>([]);
  useEffect(() => {
    linesRef.current = lines;
  }, [lines]);

  const [removed, setRemoved] = useState<CartLine[]>([]);

  const prune = useCallback(async () => {
    const current = linesRef.current;
    if (current.length === 0) return;

    try {
      const res = await fetch("/api/cart/prune", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: current.map((l) => l.id) }),
      });
      if (!res.ok) return;

      const { unavailable } = (await res.json()) as { unavailable?: unknown };
      if (!Array.isArray(unavailable) || unavailable.length === 0) return;

      const gone = new Set(unavailable.filter((s): s is string => typeof s === "string"));
      setRemoved(current.filter((l) => gone.has(l.id)));
      setLines((prev) => prev.filter((l) => !gone.has(l.id)));
    } catch {
      // Offline, or the request was cut short. Nobody's basket gets emptied
      // because a fetch failed — the next check will catch up.
    }
  }, []);

  // Once on load, and again whenever the drawer is opened: the two moments the
  // customer is about to act on what the basket says.
  useEffect(() => {
    if (hydrated) void prune();
  }, [hydrated, prune]);

  const add = useCallback((artwork: Artwork) => {
    // No price means "on request" — there is nothing for checkout to charge.
    if (artwork.status === "sold" || !(artwork.price > 0)) return;
    setLines((prev) => {
      if (prev.some((l) => l.id === artwork.id)) return prev;
      return [
        ...prev,
        {
          id: artwork.id,
          title: artwork.title,
          artist: artwork.artist,
          price: artwork.price,
          plate: artwork.plate,
          photo: artwork.photo,
        },
      ];
    });
    setPulse((n) => n + 1);
  }, []);

  const remove = useCallback((id: string) => {
    setLines((prev) => prev.filter((l) => l.id !== id));
  }, []);

  const value = useMemo<CartValue>(
    () => ({
      lines,
      count: lines.length,
      total: lines.reduce((sum, l) => sum + l.price, 0),
      isOpen,
      pulse,
      add,
      remove,
      clear: () => setLines([]),
      has: (id: string) => lines.some((l) => l.id === id),
      openCart: () => {
        setIsOpen(true);
        void prune();
      },
      closeCart: () => setIsOpen(false),
      removed,
      dismissRemoved: () => setRemoved([]),
    }),
    [lines, isOpen, pulse, add, remove, prune, removed]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
