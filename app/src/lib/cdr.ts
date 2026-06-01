"use client";

/**
 * CDR client — browser side.
 *
 * Flow:
 * 1. User signs a message with MetaMask (proves identity, no private key needed)
 * 2. Signature + bid data sent to our API route
 * 3. Server hot wallet handles CDR vault transactions
 * 4. User never exposes their private key
 */

export async function encryptBid(
  bidAmountWei: bigint,
  bidderAddress: string,
  signMessage: (msg: string) => Promise<string>
): Promise<{ uuid: string; writeTxHash: string }> {
  // Build a deterministic message the bidder signs to authorize this bid
  const message = `Sealed: authorize encrypted bid of ${bidAmountWei.toString()} wei by ${bidderAddress} at ${Date.now()}`;
  const signature = await signMessage(message);

  const res = await fetch("/api/cdr/encrypt", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      bidAmountWei: bidAmountWei.toString(),
      bidderAddress,
      signature,
      message,
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error ?? "CDR encrypt failed");
  }

  return res.json();
}

export async function decryptBid(
  vaultUuid: string,
  bidderAddress: string,
  signMessage: (msg: string) => Promise<string>
): Promise<bigint> {
  const message = `Sealed: authorize reveal of vault ${vaultUuid} by ${bidderAddress} at ${Date.now()}`;
  const signature = await signMessage(message);

  const res = await fetch("/api/cdr/decrypt", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ vaultUuid, bidderAddress, signature, message }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error ?? "CDR decrypt failed");
  }

  const { bidAmountWei } = await res.json();
  return BigInt(bidAmountWei);
}
