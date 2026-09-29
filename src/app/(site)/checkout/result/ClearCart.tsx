"use client";

import { useEffect } from "react";
import { useCart } from "@/context/CartContext";

/** Empties the basket, but only once a payment has actually been confirmed.
 *
 *  Clearing at the point the customer leaves for the gateway would be simpler
 *  and wrong: roughly a third of gateway sessions are abandoned, and a
 *  customer who backs out of an OTP screen should find their selection exactly
 *  where they left it. */
export default function ClearCart() {
  const { clear, count } = useCart();

  useEffect(() => {
    if (count > 0) clear();
  }, [clear, count]);

  return null;
}
