"use client";

import Link from "next/link";
import { LucideIcon } from "lucide-react";

interface Props {
  icon: LucideIcon;
  title: string;
  body: string;
  action?: { label: string; href: string };
}

export function EmptyState({ icon: Icon, title, body, action }: Props) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", padding: "64px 24px", textAlign: "center",
    }}>
      <div style={{
        width: 52, height: 52, borderRadius: 14,
        background: "var(--bg-elevated)",
        border: "1px solid var(--border)",
        display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: 18,
      }}>
        <Icon size={22} color="var(--text-muted)" />
      </div>
      <h3 style={{
        fontFamily: "var(--font-display)",
        fontSize: 22, fontWeight: 400,
        marginBottom: 8, color: "var(--text-primary)",
      }}>
        {title}
      </h3>
      <p style={{ fontSize: 14, color: "var(--text-muted)", maxWidth: 320, lineHeight: 1.6, marginBottom: action ? 24 : 0 }}>
        {body}
      </p>
      {action && (
        <Link href={action.href}>
          <button className="btn-primary">{action.label}</button>
        </Link>
      )}
    </div>
  );
}
