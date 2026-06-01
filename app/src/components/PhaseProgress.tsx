"use client";

import { Lock, Eye, Trophy } from "lucide-react";

interface Props {
  phase: "bidding" | "revealing" | "settled";
  deadline: number;
  revealWindow: number;
}

export function PhaseProgress({ phase, deadline, revealWindow }: Props) {
  const steps = [
    { icon: Lock,   label: "Bidding",  key: "bidding"  },
    { icon: Eye,    label: "Reveal",   key: "revealing" },
    { icon: Trophy, label: "Settled",  key: "settled"  },
  ];

  const idx = steps.findIndex(s => s.key === phase);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
      {steps.map(({ icon: Icon, label, key }, i) => {
        const done    = i < idx;
        const active  = i === idx;
        const color   = active ? "var(--amber)" : done ? "var(--green)" : "var(--text-muted)";
        const bgColor = active ? "var(--amber-dim)" : done ? "var(--green-dim)" : "var(--bg-elevated)";
        const borderC = active ? "rgba(245,158,11,0.4)" : done ? "rgba(16,185,129,0.3)" : "var(--border)";

        return (
          <div key={key} style={{ display: "flex", alignItems: "center", flex: i < steps.length - 1 ? 1 : undefined }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
              <div style={{
                width: 34, height: 34, borderRadius: "50%",
                background: bgColor,
                border: `1px solid ${borderC}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.3s",
              }}>
                <Icon size={13} color={color} />
              </div>
              <span style={{ fontSize: 10, color, letterSpacing: "0.04em", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div style={{
                flex: 1,
                height: 1,
                marginBottom: 16,
                marginInline: 6,
                background: done ? "var(--green)" : "var(--border)",
                transition: "background 0.3s",
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}
