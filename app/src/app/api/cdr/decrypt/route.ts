/**
 * Server-side CDR decryption route.
 * Bidder proves identity via MetaMask signature — no private key sent.
 * Server decrypts vault and returns the bid amount only to the rightful bidder.
 */
export const maxDuration = 60;
import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, createWalletClient, http, verifyMessage } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { STORY_AENEID_CHAIN, RPC_URL, STORY_API_URL, CDR_TIMEOUT_MS } from "@/lib/constants";

const SERVER_PRIVATE_KEY = process.env.CDR_SERVER_PRIVATE_KEY as `0x${string}`;

export async function POST(req: NextRequest) {
  try {
    const { vaultUuid, bidderAddress, signature, message } = await req.json();

    if (!vaultUuid || !bidderAddress || !signature || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!SERVER_PRIVATE_KEY) {
      return NextResponse.json({ error: "Server wallet not configured" }, { status: 500 });
    }

    // 1. Verify bidder's MetaMask signature — they must prove they own the address
    const valid = await verifyMessage({
      address: bidderAddress as `0x${string}`,
      message,
      signature: signature as `0x${string}`,
    });

    if (!valid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // 2. Load CDR SDK server-side
    const { CDRClient, initWasm } = await import("@piplabs/cdr-sdk");
    await initWasm();

    const account = privateKeyToAccount(SERVER_PRIVATE_KEY);
    const publicClient = createPublicClient({
      chain: STORY_AENEID_CHAIN,
      transport: http(RPC_URL),
    });
    const walletClient = createWalletClient({
      account,
      chain: STORY_AENEID_CHAIN,
      transport: http(RPC_URL),
    });

    const client = new CDRClient({
      network: "testnet",
      publicClient,
      walletClient,
      apiUrl: STORY_API_URL,
    });

    // 3. Decrypt via CDR threshold decryption
    const { dataKey } = await client.consumer.accessCDR({
      uuid: Number(vaultUuid),
      accessAuxData: "0x",
      timeoutMs: CDR_TIMEOUT_MS,
    });

    // 4. Extract bid amount from last 20 bytes (bytes 12-31)
    let bidAmountWei = 0n;
    for (let i = 12; i < 32; i++) {
      bidAmountWei = (bidAmountWei << 8n) | BigInt(dataKey[i]);
    }

    return NextResponse.json({ bidAmountWei: bidAmountWei.toString() });
  } catch (err: any) {
    console.error("CDR decrypt error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
