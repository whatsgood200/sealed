"use client";

import { useState, useEffect } from "react";

interface Props {
  deadline: number; // unix timestamp
  label?: string;
  onExpire?: () => void;
}

export function Countdown({ deadline, label, onExpire }: Props) {
  const [timeLeft, setTimeLeft] = useState(computeTime(deadline));

  useEffect(() => {
    const id = setInterval(() => {
      const t = computeTime(deadline);
      setTimeLeft(t);
      if (t.total <= 0) {
        clearInterval(id);
        onExpire?.();
      }
    }, 1000);
    return () => clearInterval(id);
  }, [deadline, onExpire]);

  const { days, hours, mins, secs, total, urgent } = timeLeft;

  if (total <= 0) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
          {label ?? "Time up"}
        </span>
      </div>
    );
  }

  const segments = days > 0
    ? [{ val: days, unit: "d" }, { val: hours, unit: "h" }, { val: mins, unit: "m" }]
    : hours > 0
    ? [{ val: hours, unit: "h" }, { val: mins, unit: "m" }, { val: secs, unit: "s" }]
    : [{ val: mins, unit: "m" }, { val: secs, unit: "s" }];

  return (
    <div>
      {label && (
        <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 6, letterSpacing: "0.06em", textTransform: "uppercase" }}>
          {label}
        </div>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {segments.map(({ val, unit }, i) => (
          <div key={unit} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {i > 0 && (
              <span style={{
                color: urgent ? "var(--red)" : "var(--text-muted)",
                fontFamily: "var(--font-mono)",
                fontSize: 16,
                opacity: 0.5,
              }}>:</span>
            )}
            <div style={{
              background: "var(--bg-elevated)",
              border: `1px solid ${urgent ? "rgba(239,68,68,0.25)" : "var(--border)"}`,
              borderRadius: 8,
              padding: "4px 8px",
              minWidth: 44,
              textAlign: "center",
            }}>
              <div style={{
                fontFamily: "var(--font-mono)",
                fontSize: 18,
                fontWeight: 500,
                color: urgent ? "var(--red)" : "var(--text-primary)",
                lineHeight: 1,
              }}>
                {String(val).padStart(2, "0")}
              </div>
              <div style={{ fontSize: 9, color: "var(--text-muted)", letterSpacing: "0.06em", marginTop: 2 }}>
                {unit}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function computeTime(deadline: number) {
  const total = deadline - Math.floor(Date.now() / 1000);
  if (total <= 0) return { days: 0, hours: 0, mins: 0, secs: 0, total: 0, urgent: false };
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    mins: Math.floor((total % 3600) / 60),
    secs: total % 60,
    total,
    urgent: total < 3600,
  };
}
