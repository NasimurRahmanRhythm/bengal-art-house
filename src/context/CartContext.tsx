"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
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

  const add = useCallback((artwork: Artwork) => {
    if (artwork.status === "sold") return;
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
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
    }),
    [lines, isOpen, pulse, add, remove]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
