"use client";

import { useAuctions } from "@/hooks/useAuction";
import { AuctionCard } from "@/components/AuctionCard";
import Link from "next/link";
import { Plus, Lock, Eye, Trophy, Zap } from "lucide-react";

const HOW_IT_WORKS = [
  {
    icon: Lock,
    title: "Bid in secret",
    body: "Encrypt your bid via CDR vaults. Your amount is sealed on-chain — nobody can peek, not even the auctioneer.",
    color: "#F59E0B",
  },
  {
    icon: Eye,
    title: "Reveal after deadline",
    body: "Once the auction closes, decrypt your vault and submit your real bid amount. The smart contract verifies everything on-chain.",
    color: "#A78BFA",
  },
  {
    icon: Trophy,
    title: "Winner settles on-chain",
    body: "The highest revealed bid wins. Settlement is automatic — funds transfer to the creator, losers get refunded. No human in the loop.",
    color: "#10B981",
  },
];

export default function Home() {
  const { data: auctions, isLoading } = useAuctions();

  const active = auctions?.filter(a => a.phase !== "settled") ?? [];
  const past   = auctions?.filter(a => a.phase === "settled") ?? [];

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 24px" }}>

      {/* Hero */}
      <div style={{ maxWidth: 640, marginBottom: 72 }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 7,
          background: "var(--amber-dim)", border: "1px solid rgba(245,158,11,0.2)",
          borderRadius: 20, padding: "5px 12px", marginBottom: 24,
        }}>
          <Zap size={11} color="var(--amber)" />
          <span style={{ fontSize: 11, color: "var(--amber)", fontWeight: 500, letterSpacing: "0.04em" }}>
            Powered by Story CDR
          </span>
        </div>

        <h1 style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(42px, 6vw, 68px)",
          fontWeight: 300,
          color: "var(--text-primary)",
          lineHeight: 1.05,
          letterSpacing: "-0.025em",
          marginBottom: 20,
        }}>
          Auctions where<br />
          <em style={{ fontStyle: "italic", color: "var(--amber)" }}>no one cheats.</em>
        </h1>

        <p style={{
          fontSize: 16,
          color: "var(--text-secondary)",
          lineHeight: 1.7,
          marginBottom: 28,
          maxWidth: 500,
        }}>
          Sealed-Bid auctions powered by CDR threshold encryption. Your bid is encrypted
          on-chain — no auctioneer, no admin, no trust required.
        </p>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link href="/create">
            <button className="btn-primary" style={{ display: "flex", alignItems: "center", gap: 7, padding: "11px 20px" }}>
              <Plus size={15} />
              Create Auction
            </button>
          </Link>
          <a
            href="https://docs.story.foundation/developers/cdr-sdk/overview"
            target="_blank"
            rel="noopener noreferrer"
          >
            <button className="btn-secondary">
              How CDR Works ↗
            </button>
          </a>
        </div>
      </div>

      {/* How it works */}
      <div style={{ marginBottom: 72 }}>
        <h2 style={{
          fontFamily: "var(--font-display)",
          fontSize: 13,
          fontWeight: 400,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--text-muted)",
          marginBottom: 20,
        }}>
          How it works
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
          {HOW_IT_WORKS.map(({ icon: Icon, title, body, color }, i) => (
            <div key={i} className="card" style={{ padding: "20px 22px" }}>
              <div style={{
                width: 36, height: 36, borderRadius: 9,
                background: `${color}18`,
                border: `1px solid ${color}30`,
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: 14,
              }}>
                <Icon size={16} color={color} />
              </div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)", marginBottom: 6 }}>
                {String(i + 1).padStart(2, "0")}
              </div>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 19, fontWeight: 400, marginBottom: 8 }}>
                {title}
              </h3>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                {body}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Active auctions */}
      <section style={{ marginBottom: 56 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 400 }}>
            Live Auctions
          </h2>
          {active.length > 0 && (
            <span style={{
              fontFamily: "var(--font-mono)", fontSize: 12,
              color: "var(--amber)", background: "var(--amber-dim)",
              border: "1px solid rgba(245,158,11,0.2)",
              padding: "3px 10px", borderRadius: 20,
            }}>
              {active.length} live
            </span>
          )}
        </div>

        {isLoading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
            {[1, 2, 3].map(i => (
              <div key={i} className="card" style={{ height: 220, background: "var(--bg-elevated)", opacity: 0.5 }} />
            ))}
          </div>
        ) : active.length === 0 ? (
          <div className="card" style={{ padding: "48px 24px", textAlign: "center" }}>
            <p style={{ color: "var(--text-muted)", marginBottom: 16 }}>No live auctions yet.</p>
            <Link href="/create">
              <button className="btn-primary">Create the first one</button>
            </Link>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
            {active.map((a, i) => (
              <AuctionCard
                key={a.id}
                auction={a}
                style={{ opacity: 1 }}
              />
            ))}
          </div>
        )}
      </section>

      {/* Past auctions */}
      {past.length > 0 && (
        <section>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 400, marginBottom: 20 }}>
            Settled
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
            {past.map(a => (
              <AuctionCard key={a.id} auction={a} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
