"use client";

import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { usePathname } from "next/navigation";

export function Navbar() {
  const pathname = usePathname();

  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 50,
      borderBottom: "1px solid var(--border)",
      background: "rgba(8,8,14,0.85)",
      backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
    }}>
      <div style={{
        maxWidth: 1200, margin: "0 auto",
        padding: "0 24px",
        height: 60,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        gap: 24,
      }}>
        {/* Logo */}
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 28, height: 28,
            background: "var(--amber)",
            borderRadius: 7,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1L13 4V10L7 13L1 10V4L7 1Z" stroke="#0A0A0F" strokeWidth="1.5" fill="none"/>
              <circle cx="7" cy="7" r="2" fill="#0A0A0F"/>
            </svg>
          </div>
          <span style={{
            fontFamily: "var(--font-display)",
            fontSize: 20,
            fontWeight: 500,
            color: "var(--text-primary)",
            letterSpacing: "-0.02em",
          }}>Sealed</span>
        </Link>

        {/* Nav links */}
        <nav style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {[
            { href: "/", label: "Auctions" },
            { href: "/create", label: "Create" },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              style={{
                padding: "6px 14px",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 400,
                textDecoration: "none",
                color: pathname === href ? "var(--text-primary)" : "var(--text-secondary)",
                background: pathname === href ? "rgba(255,255,255,0.06)" : "transparent",
                transition: "color 0.15s, background 0.15s",
              }}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Wallet */}
        <ConnectButton
          showBalance={false}
          chainStatus="icon"
          accountStatus="avatar"
        />
      </div>
    </header>
  );
}
