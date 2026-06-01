"use client";

import { useState, useCallback } from "react";
import { useSignMessage } from "wagmi";
import { useRevealBid } from "@/hooks/useAuction";
import { X, Unlock } from "lucide-react";

interface Props {
  auctionId: string;
  contractAddress: string;
  vaultUuid: string;
  depositWei: bigint;
  bidderAddress: string;
  onClose: () => void;
}

export function RevealModal({ auctionId, contractAddress, vaultUuid, depositWei, bidderAddress, onClose }: Props) {
  const { signMessageAsync } = useSignMessage();
  const revealBid = useRevealBid(auctionId, contractAddress as `0x${string}`);

  const handleReveal = useCallback(async () => {
    await revealBid.mutateAsync({
      vaultUuid,
      depositWei,
      bidderAddress,
      signMessage: (msg: string) => signMessageAsync({ message: msg }),
    });
    onClose();
  }, [vaultUuid, depositWei, bidderAddress, revealBid, signMessageAsync, onClose]);

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="card" style={{ width: "100%", maxWidth: 400, padding: 0, overflow: "hidden" }}>
        <div style={{
          padding: "20px 24px", borderBottom: "1px solid var(--border)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Unlock size={14} color="#A78BFA" />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>Reveal Your Bid</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>CDR threshold decryption</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: 24 }}>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 24 }}>
            MetaMask will ask you to <strong style={{ color: "var(--text-primary)" }}>sign a message</strong> to prove you own this bid.
            The CDR vault will then be decrypted and your bid submitted on-chain automatically.
          </p>

          <button
            className="btn-primary"
            style={{ width: "100%", padding: "13px" }}
            onClick={handleReveal}
            disabled={revealBid.isPending}
          >
            {revealBid.isPending ? "Decrypting & revealing…" : "Sign & Reveal Bid"}
          </button>

          <p style={{ fontSize: 11, color: "var(--text-muted)", textAlign: "center", marginTop: 10 }}>
            MetaMask will ask you to sign once, then confirm a transaction.
          </p>
        </div>
      </div>
    </div>
  );
}
