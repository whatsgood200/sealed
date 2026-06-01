"use client";

import { useState, use } from "react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { formatEther } from "viem";
import { useAuctionById, useRevealBid, useSettleAuction } from "@/hooks/useAuction";
import { BidModal } from "@/components/BidModal";
import { RevealModal } from "@/components/RevealModal";
import { Countdown } from "@/components/Countdown";
import { StatCard } from "@/components/StatCard";
import { formatIP, formatAddress } from "@/lib/format";
import { EXPLORER_URL } from "@/lib/constants";
import {
  Lock, Eye, Trophy, ExternalLink, Users,
  ChevronLeft, Shield, AlertCircle,
} from "lucide-react";
import Link from "next/link";

export default function AuctionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { address, isConnected } = useAccount();
  const { data: auction, isLoading, refetch } = useAuctionById(id);
  const revealBid = useRevealBid(id, (auction?.contract_address ?? "0x0") as `0x${string}`);
  const settleAuction = useSettleAuction(id, (auction?.contract_address ?? "0x0") as `0x${string}`);

  const [showBidModal, setShowBidModal] = useState(false);
const [showRevealModal, setShowRevealModal] = useState(false);

  if (isLoading) {
    return (
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "48px 24px" }}>
        <div style={{ height: 320, borderRadius: 16, background: "var(--bg-elevated)", opacity: 0.5 }} />
      </div>
    );
  }

  if (!auction) {
    return (
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "80px 24px", textAlign: "center" }}>
        <p style={{ color: "var(--text-muted)" }}>Auction not found.</p>
        <Link href="/"><button className="btn-secondary" style={{ marginTop: 16 }}>← Back</button></Link>
      </div>
    );
  }

  const now = Math.floor(Date.now() / 1000);
  const isCreator = address?.toLowerCase() === auction.creator_address.toLowerCase();
  const hasBid = (auction as any).bids?.some(
    (b: any) => b.bidder_address.toLowerCase() === address?.toLowerCase()
  );
  const myBid = (auction as any).bids?.find(
    (b: any) => b.bidder_address.toLowerCase() === address?.toLowerCase()
  );
  const canReveal = auction.phase === "revealing" && myBid && !myBid.revealed;
  const canSettle = now > auction.deadline + auction.reveal_window && !auction.phase.includes("settled");
  const revealWindowEnd = auction.deadline + auction.reveal_window;

  const PHASE_CONFIG = {
    bidding: { label: "Bidding Open", color: "var(--amber)", bg: "var(--amber-dim)" },
    revealing: { label: "Reveal Phase", color: "#A78BFA", bg: "rgba(139,92,246,0.1)" },
    settled: { label: "Settled", color: "var(--green)", bg: "var(--green-dim)" },
  };
  const phase = PHASE_CONFIG[auction.phase];

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px" }}>

      {/* Back */}
      <Link href="/" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6, color: "var(--text-muted)", fontSize: 13, marginBottom: 28 }}>
        <ChevronLeft size={14} /> All Auctions
      </Link>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24, alignItems: "start" }}>

        {/* LEFT */}
        <div>
          {/* Title section */}
          <div className="card" style={{ padding: "28px 30px", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                background: phase.bg,
                border: `1px solid ${phase.color}30`,
                borderRadius: 20, padding: "4px 12px",
              }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: phase.color }} />
                <span style={{ fontSize: 11, fontWeight: 500, color: phase.color, letterSpacing: "0.04em" }}>
                  {phase.label}
                </span>
              </div>
            </div>

            <h1 style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(28px, 4vw, 40px)",
              fontWeight: 300,
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
              marginBottom: 14,
            }}>
              {auction.title}
            </h1>

            <p style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.7, marginBottom: 20 }}>
              {auction.description}
            </p>

            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                by <span style={{ fontFamily: "var(--font-mono)", color: "var(--text-secondary)" }}>
                  {formatAddress(auction.creator_address)}
                </span>
              </span>
              <span style={{ color: "var(--border)" }}>·</span>
              <a
                href={`${EXPLORER_URL}/tx/${auction.tx_hash}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: 12, color: "var(--text-muted)", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}
              >
                View on-chain <ExternalLink size={10} />
              </a>
            </div>
          </div>

          {/* Stats grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            <StatCard label="Reserve Price" value={formatIP(BigInt(auction.reserve_price))} accent />
            <StatCard label="Bid Deposit" value={formatIP(BigInt(auction.bid_deposit))} sub="refunded to losers" />
            <StatCard label="Bidders" value={String(auction.bid_count)} sub="sealed bids" />
            <StatCard
              label="Reveal Window"
              value={`${auction.reveal_window / 3600}h`}
              sub="after deadline"
            />
          </div>

          {/* Timeline */}
          <div className="card" style={{ padding: "22px 24px", marginBottom: 16 }}>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 400, marginBottom: 18 }}>
              Timeline
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {[
                {
                  icon: Lock,
                  label: "Bidding closes",
                  time: new Date(auction.deadline * 1000).toLocaleString(),
                  done: now >= auction.deadline,
                  color: "var(--amber)",
                },
                {
                  icon: Eye,
                  label: "Reveal window closes",
                  time: new Date(revealWindowEnd * 1000).toLocaleString(),
                  done: now >= revealWindowEnd,
                  color: "#A78BFA",
                },
                {
                  icon: Trophy,
                  label: "Settlement available",
                  time: "After reveal window",
                  done: auction.phase === "settled",
                  color: "var(--green)",
                },
              ].map(({ icon: Icon, label, time, done, color }, i) => (
                <div key={i} style={{ display: "flex", gap: 14, paddingBottom: i < 2 ? 18 : 0 }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: "50%",
                      background: done ? `${color}18` : "var(--bg-elevated)",
                      border: `1px solid ${done ? color + "40" : "var(--border)"}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                    }}>
                      <Icon size={13} color={done ? color : "var(--text-muted)"} />
                    </div>
                    {i < 2 && (
                      <div style={{
                        width: 1, flexGrow: 1, marginTop: 4,
                        background: done ? `${color}30` : "var(--border)",
                      }} />
                    )}
                  </div>
                  <div style={{ paddingTop: 5 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: done ? "var(--text-primary)" : "var(--text-secondary)", marginBottom: 2 }}>
                      {label}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                      {time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CDR proof panel */}
          <div style={{
            background: "var(--amber-dim)",
            border: "1px solid rgba(245,158,11,0.15)",
            borderRadius: 12,
            padding: "16px 18px",
            display: "flex", gap: 12,
          }}>
            <Shield size={16} color="var(--amber)" style={{ marginTop: 2, flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4, color: "var(--text-primary)" }}>
                CDR-protected bids
              </div>
              <p style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                Every bid on this auction is stored as ciphertext in a CDR threshold-encrypted vault.
                Not even the auctioneer can read bid amounts before the reveal phase.
                Decryption requires a threshold of Story validators — no single party holds the key.
              </p>
              <a
                href={`${EXPLORER_URL}/address/${auction.contract_address}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: 11, color: "var(--amber)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4, marginTop: 8 }}
              >
                View contract <ExternalLink size={10} />
              </a>
            </div>
          </div>
        </div>

        {/* RIGHT — Action panel */}
        <div style={{ position: "sticky", top: 76 }}>
          <div className="card" style={{ padding: "22px", marginBottom: 12 }}>

            {/* Settled winner */}
            {auction.phase === "settled" && (
              <div style={{ marginBottom: 20 }}>
                {auction.winner_address ? (
                  <div style={{
                    background: "var(--green-dim)",
                    border: "1px solid rgba(16,185,129,0.2)",
                    borderRadius: 12,
                    padding: "16px",
                    textAlign: "center",
                  }}>
                    <Trophy size={20} color="var(--green)" style={{ margin: "0 auto 8px" }} />
                    <div style={{ fontSize: 11, color: "var(--green)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 6 }}>
                      Winner
                    </div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--text-primary)", marginBottom: 4 }}>
                      {formatAddress(auction.winner_address, 8)}
                    </div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 18, color: "var(--green)", fontWeight: 500 }}>
                      {formatIP(BigInt(auction.winning_amount ?? "0"))}
                    </div>
                  </div>
                ) : (
                  <div style={{
                    background: "var(--red-dim)",
                    border: "1px solid rgba(239,68,68,0.2)",
                    borderRadius: 12,
                    padding: "16px",
                    textAlign: "center",
                    color: "var(--red)",
                  }}>
                    <AlertCircle size={20} style={{ margin: "0 auto 8px" }} />
                    <div style={{ fontSize: 13 }}>Reserve not met — all bids refunded</div>
                  </div>
                )}
              </div>
            )}

            {/* Countdown */}
            {auction.phase !== "settled" && (
              <div style={{ marginBottom: 20 }}>
                {auction.phase === "bidding" ? (
                  <Countdown
                    deadline={auction.deadline}
                    label="Bidding closes in"
                    onExpire={refetch}
                  />
                ) : (
                  <Countdown
                    deadline={revealWindowEnd}
                    label="Reveal window closes in"
                    onExpire={refetch}
                  />
                )}
              </div>
            )}

            <hr className="divider" />

            {/* Bid count */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
              <Users size={14} color="var(--text-muted)" />
              <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                <strong style={{ color: "var(--text-primary)" }}>{auction.bid_count}</strong> sealed bid{auction.bid_count !== 1 ? "s" : ""} registered
              </span>
            </div>

            {/* Action buttons */}
            {!isConnected ? (
              <ConnectButton />
            ) : auction.phase === "bidding" ? (
              hasBid ? (
                <div style={{
                  padding: "12px 14px",
                  background: "var(--green-dim)",
                  border: "1px solid rgba(16,185,129,0.2)",
                  borderRadius: 10,
                  fontSize: 13,
                  color: "var(--green)",
                  display: "flex", alignItems: "center", gap: 8,
                }}>
                  <Lock size={13} />
                  Your bid is sealed
                </div>
              ) : (
                <button
                  className="btn-primary"
                  style={{ width: "100%", padding: "13px", fontSize: 14 }}
                  onClick={() => setShowBidModal(true)}
                >
                  Place Sealed Bid
                </button>
              )
            ) : auction.phase === "revealing" ? (
              canReveal ? (
                <button
                  className="btn-primary"
                  style={{ width: "100%", padding: "13px", fontSize: 14 }}
                  onClick={() => setShowRevealModal(true)}
                  
                  disabled={revealBid.isPending}
                >
                  {revealBid.isPending ? "Decrypting & revealing…" : "Reveal My Bid"}
                </button>
              ) : myBid?.revealed ? (
                <div style={{
                  padding: "12px 14px",
                  background: "var(--green-dim)",
                  border: "1px solid rgba(16,185,129,0.2)",
                  borderRadius: 10,
                  fontSize: 13, color: "var(--green)",
                  display: "flex", alignItems: "center", gap: 8,
                }}>
                  <Eye size={13} />
                  Bid revealed — {formatIP(BigInt(myBid.revealed_amount ?? "0"))}
                </div>
              ) : (
                <div style={{ padding: "12px 14px", background: "var(--bg-elevated)", borderRadius: 10, fontSize: 13, color: "var(--text-muted)" }}>
                  No bid to reveal
                </div>
              )
            ) : null}

            {/* Settle button */}
            {canSettle && (
              <button
                className="btn-secondary"
                style={{ width: "100%", padding: "12px", fontSize: 13, marginTop: 10 }}
                onClick={() => settleAuction.mutate()}
                disabled={settleAuction.isPending}
              >
                {settleAuction.isPending ? "Settling…" : "Settle Auction"}
              </button>
            )}
          </div>

          {/* Bidder list — only visible post-reveal */}
          {auction.phase !== "bidding" && (auction as any).bids?.length > 0 && (
            <div className="card" style={{ padding: "18px" }}>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 400, marginBottom: 14 }}>
                Bidders
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {(auction as any).bids.map((bid: any) => (
                  <div key={bid.id} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "8px 10px",
                    background: bid.bidder_address.toLowerCase() === auction.winner_address?.toLowerCase()
                      ? "var(--green-dim)" : "var(--bg-elevated)",
                    borderRadius: 8,
                    border: `1px solid ${bid.bidder_address.toLowerCase() === auction.winner_address?.toLowerCase()
                      ? "rgba(16,185,129,0.2)" : "transparent"}`,
                  }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-secondary)" }}>
                      {formatAddress(bid.bidder_address)}
                    </span>
                    <span style={{ fontSize: 11, color: bid.revealed ? "var(--green)" : "var(--text-muted)" }}>
                      {bid.revealed ? formatIP(BigInt(bid.revealed_amount ?? "0")) : "Sealed"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bid modal */}
      {showBidModal && (
  <BidModal auction={auction} onClose={() => setShowBidModal(false)} />
)}
{showRevealModal && myBid && (
  <RevealModal
    auctionId={auction.id}
    contractAddress={auction.contract_address}
    vaultUuid={String(myBid.vault_uuid)}
    depositWei={BigInt(auction.bid_deposit)}
    bidderAddress={address ?? ""}
    onClose={() => setShowRevealModal(false)}
  />
)}
    </div>
  );
}
