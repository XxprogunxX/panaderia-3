"use client";
import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Header from "./components/Header";

export default function ClientHeaderLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const showHeader = !pathname.startsWith("/cafe") && !pathname.startsWith("/cafeproductos");

  return (
    <>
      {showHeader && <Header />}
      {children}
    </>
  );
} 