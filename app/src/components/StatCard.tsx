"use client";

interface Props {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
  style?: React.CSSProperties;
}

export function StatCard({ label, value, sub, accent, style }: Props) {
  return (
    <div style={{
      background: "var(--bg-card)",
      border: `1px solid ${accent ? "rgba(245,158,11,0.2)" : "var(--border)"}`,
      borderRadius: 12,
      padding: "16px 18px",
      ...style,
    }}>
      <div style={{
        fontSize: 11, fontWeight: 500, letterSpacing: "0.06em",
        textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 6,
      }}>
        {label}
      </div>
      <div style={{
        fontFamily: "var(--font-mono)",
        fontSize: 20,
        fontWeight: 500,
        color: accent ? "var(--amber)" : "var(--text-primary)",
        lineHeight: 1,
        marginBottom: sub ? 4 : 0,
      }}>
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>{sub}</div>
      )}
    </div>
  );
}
