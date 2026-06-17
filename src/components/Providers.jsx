"use client";

import { UserProvider } from "@/context/UserContext";
import { CartProvider } from "@/context/CartContext";

export default function Providers({ children }) {
  return (
    <UserProvider>
      <CartProvider>{children}</CartProvider>
    </UserProvider>
  );
}
