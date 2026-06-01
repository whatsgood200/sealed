"use client";

import { useState, useCallback } from "react";
import { useAccount, useSignMessage } from "wagmi";
import { parseEther } from "viem";
import { useSubmitBid } from "@/hooks/useAuction";
import { formatIP } from "@/lib/format";
import { X, Lock, Shield } from "lucide-react";
import type { AuctionRecord } from "@/types";

interface Props {
  auction: AuctionRecord;
  onClose: () => void;
}

export function BidModal({ auction, onClose }: Props) {
  const { isConnected, address } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [bidAmount, setBidAmount] = useState("");
  const submitBid = useSubmitBid(auction.id, auction.contract_address as `0x${string}`);
  const depositWei = BigInt(auction.bid_deposit);

  const handleSubmit = useCallback(async () => {
    if (!bidAmount || !address) return;
    const bidAmountWei = parseEther(bidAmount);
    // Pass signMessageAsync — MetaMask will prompt user to sign, no private key needed
    await submitBid.mutateAsync({
      bidAmountWei,
      depositWei,
      bidderAddress: address,
      signMessage: (msg: string) => signMessageAsync({ message: msg }),
    });
    onClose();
  }, [bidAmount, address, depositWei, submitBid, signMessageAsync, onClose]);

  const isLoading = submitBid.isPending;
  const isValid = bidAmount && Number(bidAmount) > 0;

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="card" style={{ width: "100%", maxWidth: 460, padding: 0, overflow: "hidden" }}>

        {/* Header */}
        <div style={{
          padding: "20px 24px", borderBottom: "1px solid var(--border)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: "var(--amber-dim)", border: "1px solid rgba(245,158,11,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Lock size={14} color="var(--amber)" />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>Place Sealed Bid</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Encrypted via CDR</div>
            </div>
          </div>
          <button onClick={onClose} style={{
            background: "none", border: "none", cursor: "pointer",
            color: "var(--text-muted)", padding: 4,
            display: "flex", alignItems: "center",
          }}>
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: 24 }}>
          {/* Auction */}
          <div style={{
            background: "var(--bg-elevated)", border: "1px solid var(--border)",
            borderRadius: 10, padding: "12px 14px", marginBottom: 18,
          }}>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 3, textTransform: "uppercase", letterSpacing: "0.05em" }}>Auction</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 16 }}>{auction.title}</div>
          </div>

          {/* Bid amount */}
          <div style={{ marginBottom: 18 }}>
            <label className="label">Your bid (IP)</label>
            <div style={{ position: "relative" }}>
              <input
                className="input-base"
                type="number" step="0.001" min="0"
                placeholder="0.00"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                style={{ paddingRight: 48 }}
                disabled={isLoading}
              />
              <span style={{
                position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
                fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-mono)",
              }}>IP</span>
            </div>
          </div>

          {/* How it works */}
          <div style={{
            background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.15)",
            borderRadius: 10, padding: "12px 14px", marginBottom: 18,
            display: "flex", gap: 10,
          }}>
            <Shield size={13} color="var(--amber)" style={{ marginTop: 2, flexShrink: 0 }} />
            <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.7 }}>
              MetaMask will ask you to <strong style={{ color: "var(--text-primary)" }}>sign a message</strong> to authorize this bid.
              Your bid amount is then <strong style={{ color: "var(--text-primary)" }}>encrypted via CDR</strong> and stored on-chain as ciphertext.
              <br />No private key required — just a signature.
            </div>
          </div>

          {/* Payment breakdown */}
          <div style={{ background: "var(--bg-elevated)", borderRadius: 10, padding: "12px 14px", marginBottom: 18 }}>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 8 }}>Payment breakdown</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                <span style={{ color: "var(--text-secondary)" }}>Deposit (refundable)</span>
                <span style={{ fontFamily: "var(--font-mono)" }}>{formatIP(depositWei)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                <span style={{ color: "var(--text-secondary)" }}>CDR vault fees</span>
                <span style={{ fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>paid by protocol</span>
              </div>
              <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: "4px 0" }} />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 500 }}>
                <span>Due now</span>
                <span style={{ fontFamily: "var(--font-mono)", color: "var(--amber)" }}>{formatIP(depositWei)} + gas</span>
              </div>
            </div>
          </div>

          {!isConnected ? (
            <div style={{ textAlign: "center", color: "var(--text-muted)", fontSize: 13, padding: "12px 0" }}>
              Connect your wallet to bid
            </div>
          ) : (
            <button
              className="btn-primary"
              style={{ width: "100%", padding: "13px", fontSize: 14 }}
              onClick={handleSubmit}
              disabled={!isValid || isLoading}
            >
              {isLoading ? "Encrypting & submitting…" : "Encrypt & Submit Bid"}
            </button>
          )}

          <p style={{ fontSize: 11, color: "var(--text-muted)", textAlign: "center", marginTop: 10 }}>
            MetaMask will ask you to sign once, then confirm a transaction.
          </p>
        </div>
      </div>
    </div>
  );
}
