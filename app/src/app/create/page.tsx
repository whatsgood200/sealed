"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { parseEther } from "viem";
import { useCreateAuction } from "@/hooks/useAuction";
import { MIN_REVEAL_WINDOW_HOURS } from "@/lib/constants";
import { Info, ChevronRight } from "lucide-react";

const PRESET_DURATIONS = [
  { label: "1 hour", hours: 1 },
  { label: "6 hours", hours: 6 },
  { label: "1 day", hours: 24 },
  { label: "3 days", hours: 72 },
  { label: "1 week", hours: 168 },
];

export default function CreatePage() {
  const router = useRouter();
  const { isConnected } = useAccount();
  const createAuction = useCreateAuction();

  const [form, setForm] = useState({
    title: "",
    description: "",
    imageUri: "",
    reservePrice: "",
    bidDeposit: "",
    durationHours: 24,
    revealWindowHours: 12,
  });

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSubmit = useCallback(async () => {
    if (!form.title || !form.reservePrice || !form.bidDeposit) return;

    const now = Math.floor(Date.now() / 1000);
    const deadline = now + form.durationHours * 3600;
    const revealWindow = Math.max(form.revealWindowHours, MIN_REVEAL_WINDOW_HOURS) * 3600;

    const result = await createAuction.mutateAsync({
      title: form.title,
      description: form.description,
      imageUri: form.imageUri,
      reservePrice: parseEther(form.reservePrice),
      bidDeposit: parseEther(form.bidDeposit),
      deadline,
      revealWindow,
    });

    router.push(`/auction/${result.id}`);
  }, [form, createAuction, router]);

  const isValid = form.title.length > 0 &&
    Number(form.reservePrice) > 0 &&
    Number(form.bidDeposit) > 0 &&
    Number(form.bidDeposit) <= Number(form.reservePrice);

  return (
    <div style={{ maxWidth: 660, margin: "0 auto", padding: "48px 24px" }}>

      {/* Page header */}
      <div style={{ marginBottom: 36 }}>
        <h1 style={{
          fontFamily: "var(--font-display)",
          fontSize: 42,
          fontWeight: 300,
          letterSpacing: "-0.02em",
          marginBottom: 10,
          lineHeight: 1.1,
        }}>
          New Auction
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.6 }}>
          Deploy a sealed-bid auction on Story. All bids are CDR-encrypted — no one can see amounts until reveal.
        </p>
      </div>

      {/* Form */}
      <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>

        {/* Section: Item */}
        <div className="card" style={{ padding: "22px 24px" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 400, marginBottom: 18 }}>
            Item details
          </h2>

          <div style={{ marginBottom: 16 }}>
            <label className="label">Title *</label>
            <input
              className="input-base"
              placeholder="e.g. Rare 1/1 NFT, Project contract, Domain name…"
              value={form.title}
              onChange={set("title")}
              maxLength={120}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label className="label">Description</label>
            <textarea
              className="input-base"
              placeholder="Describe what you're auctioning…"
              value={form.description}
              onChange={set("description") as unknown as React.ChangeEventHandler<HTMLTextAreaElement>}
              rows={3}
              style={{ resize: "vertical", minHeight: 80, fontFamily: "var(--font-body)" }}
            />
          </div>

          <div>
            <label className="label">Image / Media URL (optional)</label>
            <input
              className="input-base"
              placeholder="https://..."
              value={form.imageUri}
              onChange={set("imageUri")}
            />
          </div>
        </div>

        {/* Section: Pricing */}
        <div className="card" style={{ padding: "22px 24px" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 400, marginBottom: 18 }}>
            Pricing
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <label className="label">Reserve price (IP) *</label>
              <input
                className="input-base"
                type="number"
                step="0.001"
                min="0"
                placeholder="0.00"
                value={form.reservePrice}
                onChange={set("reservePrice")}
              />
              <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 5 }}>
                Min winning bid
              </p>
            </div>
            <div>
              <label className="label">Bid deposit (IP) *</label>
              <input
                className="input-base"
                type="number"
                step="0.001"
                min="0"
                placeholder="0.00"
                value={form.bidDeposit}
                onChange={set("bidDeposit")}
              />
              <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 5 }}>
                Locked per bidder, refundable
              </p>
            </div>
          </div>

          {Number(form.bidDeposit) > Number(form.reservePrice) && (
            <div style={{
              marginTop: 12, padding: "10px 12px",
              background: "var(--red-dim)", border: "1px solid rgba(239,68,68,0.2)",
              borderRadius: 8, fontSize: 12, color: "#FCA5A5",
              display: "flex", gap: 8,
            }}>
              <Info size={12} style={{ marginTop: 1, flexShrink: 0 }} />
              Deposit should not exceed the reserve price.
            </div>
          )}
        </div>

        {/* Section: Timing */}
        <div className="card" style={{ padding: "22px 24px" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 400, marginBottom: 18 }}>
            Timing
          </h2>

          <div style={{ marginBottom: 16 }}>
            <label className="label">Bidding duration</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {PRESET_DURATIONS.map(({ label, hours }) => (
                <button
                  key={hours}
                  onClick={() => setForm(f => ({ ...f, durationHours: hours }))}
                  style={{
                    padding: "7px 14px",
                    borderRadius: 8,
                    border: `1px solid ${form.durationHours === hours ? "var(--amber)" : "var(--border)"}`,
                    background: form.durationHours === hours ? "var(--amber-dim)" : "var(--bg-elevated)",
                    color: form.durationHours === hours ? "var(--amber)" : "var(--text-secondary)",
                    fontSize: 13,
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Reveal window (hours)</label>
            <input
              className="input-base"
              type="number"
              min={MIN_REVEAL_WINDOW_HOURS}
              max={72}
              value={form.revealWindowHours}
              onChange={(e) => setForm(f => ({ ...f, revealWindowHours: Number(e.target.value) }))}
              style={{ maxWidth: 180 }}
            />
            <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 5 }}>
              Time after deadline for bidders to reveal. Min {MIN_REVEAL_WINDOW_HOURS}h.
            </p>
          </div>
        </div>

        {/* CDR info */}
        <div style={{
          background: "var(--amber-dim)",
          border: "1px solid rgba(245,158,11,0.15)",
          borderRadius: 12,
          padding: "14px 16px",
          display: "flex", gap: 10,
        }}>
          <Info size={14} color="var(--amber)" style={{ marginTop: 1, flexShrink: 0 }} />
          <p style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6 }}>
            Each bidder encrypts their bid into a <strong style={{ color: "var(--text-primary)" }}>CDR vault</strong> on Story.
            The vault stores only ciphertext on-chain. Bids are revealed by the bidder after deadline via threshold decryption —
            the smart contract settles automatically with no admin required.
          </p>
        </div>

        {/* Submit */}
        {!isConnected ? (
          <div style={{ display: "flex", justifyContent: "center" }}>
            <ConnectButton />
          </div>
        ) : (
          <button
            className="btn-primary"
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              gap: 8, padding: "14px", fontSize: 15,
            }}
            onClick={handleSubmit}
            disabled={!isValid || createAuction.isPending}
          >
            {createAuction.isPending ? (
              "Deploying auction…"
            ) : (
              <>Deploy Auction <ChevronRight size={16} /></>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
