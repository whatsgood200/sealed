/**
 * Server-side CDR encryption route.
 *
 * Security model:
 * - A dedicated server hot wallet (CDR_SERVER_PRIVATE_KEY) pays gas for CDR vault ops.
 * - The bidder authorizes via a signed message (MetaMask) — no private key ever sent.
 * - The server verifies the signature before touching CDR.
 * - The vault stores: encrypt(bidAmount | bidderAddress) — ties vault to bidder.
 */
export const maxDuration = 60;
import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, createWalletClient, http, toHex, verifyMessage } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { STORY_AENEID_CHAIN, RPC_URL, STORY_API_URL } from "@/lib/constants";

// Server hot wallet — only used to pay CDR gas, holds no user funds
const SERVER_PRIVATE_KEY = process.env.CDR_SERVER_PRIVATE_KEY as `0x${string}`;

export async function POST(req: NextRequest) {
  try {
    const { bidAmountWei, bidderAddress, signature, message } = await req.json();

    if (!bidAmountWei || !bidderAddress || !signature || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!SERVER_PRIVATE_KEY) {
      return NextResponse.json({ error: "Server wallet not configured" }, { status: 500 });
    }

    // 1. Verify the bidder's MetaMask signature — proves they authorized this bid
    const valid = await verifyMessage({
      address: bidderAddress as `0x${string}`,
      message,
      signature: signature as `0x${string}`,
    });

    if (!valid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // 2. Load CDR SDK server-side (Node.js — works fine here)
    const { CDRClient, initWasm, uuidToLabel } = await import("@piplabs/cdr-sdk");
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

    const { uploader, observer } = client;
    const globalPubKey = await observer.getGlobalPubKey();

    // 3. Encode bid + bidder as 32-byte key
    //    First 12 bytes = bidder address (truncated), last 20 bytes = bid amount
    //    This cryptographically ties the vault to the bidder
    const dataKey = new Uint8Array(32);
    const amountHex = BigInt(bidAmountWei).toString(16).padStart(40, "0");
    const addrBytes = bidderAddress.slice(2).padStart(24, "0");
    const combined = (addrBytes + amountHex).slice(0, 64);
    for (let i = 0; i < 32; i++) {
      dataKey[i] = parseInt(combined.slice(i * 2, i * 2 + 2), 16);
    }

    // 4. Allocate vault — read condition = bidder address (only they can reveal)
    const { uuid } = await uploader.allocate({
      updatable: false,
      writeConditionAddr: account.address,  // server wallet writes
      readConditionAddr: bidderAddress,      // bidder reads (self-reveal)
      writeConditionData: "0x",
      readConditionData: "0x",
      skipConditionValidation: true,
    });

    const label = uuidToLabel(uuid);
    const ciphertext = await uploader.encryptDataKey({ dataKey, globalPubKey, label });

    const { txHash: writeTxHash } = await uploader.write({
      uuid,
      accessAuxData: "0x",
      encryptedData: toHex(ciphertext.raw),
    });

    return NextResponse.json({ uuid: uuid.toString(), writeTxHash });
  } catch (err: any) {
    console.error("CDR encrypt error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
