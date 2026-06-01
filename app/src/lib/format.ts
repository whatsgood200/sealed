import { formatEther, parseEther } from "viem";

export function formatIP(wei: bigint | string, decimals = 4): string {
  const val = typeof wei === "string" ? BigInt(wei) : wei;
  const formatted = formatEther(val);
  const num = parseFloat(formatted);
  if (num === 0) return "0 IP";
  if (num < 0.0001) return "< 0.0001 IP";
  return `${num.toLocaleString(undefined, { maximumFractionDigits: decimals })} IP`;
}

export function parseIP(amount: string): bigint {
  return parseEther(amount);
}

export function formatAddress(addr: string, chars = 6): string {
  return `${addr.slice(0, chars)}…${addr.slice(-4)}`;
}

export function formatTimeRemaining(deadline: number): {
  label: string;
  urgent: boolean;
  expired: boolean;
} {
  const now = Math.floor(Date.now() / 1000);
  const diff = deadline - now;

  if (diff <= 0) return { label: "Expired", urgent: false, expired: true };

  const days = Math.floor(diff / 86400);
  const hours = Math.floor((diff % 86400) / 3600);
  const mins = Math.floor((diff % 3600) / 60);
  const secs = diff % 60;

  const urgent = diff < 3600;

  if (days > 0) return { label: `${days}d ${hours}h`, urgent, expired: false };
  if (hours > 0) return { label: `${hours}h ${mins}m`, urgent, expired: false };
  return { label: `${mins}m ${secs}s`, urgent, expired: false };
}

export function formatPhase(phase: "bidding" | "revealing" | "settled"): string {
  return { bidding: "Bidding Open", revealing: "Reveal Phase", settled: "Settled" }[phase];
}
