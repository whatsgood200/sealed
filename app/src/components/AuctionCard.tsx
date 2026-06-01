"use client";

import Link from "next/link";
import { Countdown } from "./Countdown";
import { formatIP, formatAddress } from "@/lib/format";
import type { AuctionRecord } from "@/types";

interface Props {
  auction: AuctionRecord;
  style?: React.CSSProperties;
}

export function AuctionCard({ auction, style }: Props) {
  const isSettled  = auction.phase === "settled";
  const isRevealing = auction.phase === "revealing";

  const accentColor = isSettled ? "#10B981" : isRevealing ? "#A78BFA" : "#F59E0B";
  const phaseLabel  = isSettled ? "Settled" : isRevealing ? "Reveal Phase" : "Bidding Open";

  return (
    <Link href={`/auction/${auction.id}`} style={{ textDecoration: "none", display: "block" }}>
      <div style={{
        background: "#181825",
        border: `1.5px solid ${accentColor}`,
        borderRadius: 16,
        overflow: "hidden",
        cursor: "pointer",
        transition: "transform 0.2s, box-shadow 0.2s",
        ...style,
      }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
          (e.currentTarget as HTMLDivElement).style.boxShadow = `0 8px 32px rgba(0,0,0,0.5)`;
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
          (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
        }}
      >
        {/* Top accent stripe */}
        <div style={{ height: 3, background: accentColor }} />

        <div style={{ padding: "20px 22px" }}>
          {/* Phase + bid count */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: accentColor }} />
              <span style={{ fontSize: 11, color: accentColor, fontWeight: 600, letterSpacing: "0.05em" }}>
                {phaseLabel}
              </span>
            </div>
            <span style={{ fontSize: 12, color: "#888", fontFamily: "monospace" }}>
              {auction.bid_count} bid{auction.bid_count !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Title */}
          <h3 style={{
            fontSize: 22,
            fontWeight: 400,
            color: "#FFFFFF",
            marginBottom: 6,
            lineHeight: 1.2,
            fontFamily: "Georgia, serif",
          }}>
            {auction.title}
          </h3>

          {/* Description */}
          {auction.description && (
            <p style={{
              fontSize: 13,
              color: "#AAAAAA",
              lineHeight: 1.5,
              marginBottom: 16,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}>
              {auction.description}
            </p>
          )}

          {/* Divider */}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", margin: "14px 0" }} />

          {/* Footer */}
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 11, color: "#666", marginBottom: 3, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Reserve
              </div>
              <div style={{ fontFamily: "monospace", fontSize: 14, color: "#FFFFFF", fontWeight: 500 }}>
                {formatIP(BigInt(auction.reserve_price))}
              </div>
            </div>

            {isSettled ? (
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 11, color: "#666", marginBottom: 2 }}>
                  {auction.winner_address ? "Won by" : "No winner"}
                </div>
                {auction.winner_address && (
                  <div style={{ fontFamily: "monospace", fontSize: 12, color: "#10B981" }}>
                    {formatAddress(auction.winner_address)}
                  </div>
                )}
              </div>
            ) : (
              <Countdown deadline={auction.deadline} />
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
