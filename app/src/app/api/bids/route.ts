import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const supabase = createServiceClient();
  const auctionId = req.nextUrl.searchParams.get("auctionId");
  if (!auctionId) return NextResponse.json({ error: "auctionId required" }, { status: 400 });

  const { data, error } = await supabase
    .from("bids")
    .select("*")
    .eq("auction_id", auctionId)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const supabase = createServiceClient();
  const body = await req.json();

  // Upsert bid record
  const { data, error } = await supabase
    .from("bids")
    .upsert({
      auction_id: body.auctionId,
      bidder_address: body.bidderAddress,
      vault_uuid: body.vaultUuid,
      revealed: false,
      revealed_amount: null,
      tx_hash: body.txHash,
    }, { onConflict: "auction_id,bidder_address" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Increment bid_count on auction
  await supabase.rpc("increment_bid_count", { auction_id: body.auctionId });

  return NextResponse.json(data, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const supabase = createServiceClient();
  const body = await req.json();

  const { data, error } = await supabase
    .from("bids")
    .update({ revealed: true, revealed_amount: body.revealedAmount })
    .eq("auction_id", body.auctionId)
    .eq("bidder_address", body.bidderAddress)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
