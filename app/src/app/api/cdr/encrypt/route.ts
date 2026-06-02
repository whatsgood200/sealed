export const maxDuration = 60;

import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, createWalletClient, http, toHex, verifyMessage } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { STORY_AENEID_CHAIN, RPC_URL, STORY_API_URL } from "@/lib/constants";

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

    // Verify bidder's MetaMask signature
    const valid = await verifyMessage({
      address: bidderAddress as `0x${string}`,
      message,
      signature: signature as `0x${string}`,
    });
    if (!valid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const { CDRClient, initWasm, uuidToLabel } = await import("@piplabs/cdr-sdk");
    await initWasm();

    const account = privateKeyToAccount(SERVER_PRIVATE_KEY);
    const publicClient = createPublicClient({ chain: STORY_AENEID_CHAIN, transport: http(RPC_URL) });
    const walletClient = createWalletClient({ account, chain: STORY_AENEID_CHAIN, transport: http(RPC_URL) });

    const client = new CDRClient({ network: "testnet", publicClient, walletClient, apiUrl: STORY_API_URL });
    const { uploader, observer } = client;
    const globalPubKey = await observer.getGlobalPubKey();

    // Encode bid as 32-byte big-endian
    const dataKey = new Uint8Array(32);
    const hex = BigInt(bidAmountWei).toString(16).padStart(64, "0");
    for (let i = 0; i < 32; i++) {
      dataKey[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
    }

    // Both conditions = server wallet address
    // Security is enforced by our signature verification above, not CDR conditions
    const { uuid } = await uploader.allocate({
      updatable: false,
      writeConditionAddr: account.address,
      readConditionAddr:  account.address,  // server wallet reads on behalf of bidder
      writeConditionData: "0x",
      readConditionData:  "0x",
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
