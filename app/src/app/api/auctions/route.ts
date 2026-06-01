import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

export async function GET() {
  const supabase = createServiceClient();
  const now = Math.floor(Date.now() / 1000);

  await supabase
    .from("auctions")
    .update({ phase: "revealing" })
    .eq("phase", "bidding")
    .lt("deadline", now);

  const { data, error } = await supabase
    .from("auctions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const supabase = createServiceClient();
  const body = await req.json();

  // Log body to debug
  console.log("POST /api/auctions body:", JSON.stringify(body, null, 2));

  const insertData = {
    contract_address:  body.contractAddress,
    condition_address: body.conditionAddress ?? null,
    creator_address:   body.creatorAddress,
    title:             body.title,
    description:       body.description ?? "",
    image_uri:         body.imageUri || null,
    reserve_price:     body.reservePrice?.toString(),
    bid_deposit:       body.bidDeposit?.toString(),
    deadline:          body.deadline,
    reveal_window:     body.revealWindow,
    bid_count:         0,
    phase:             "bidding",
    winner_address:    null,
    winning_amount:    null,
    tx_hash:           body.txHash,
  };

  console.log("Inserting:", JSON.stringify(insertData, null, 2));

  const { data, error } = await supabase
    .from("auctions")
    .insert(insertData)
    .select()
    .single();

  if (error) {
    console.error("Supabase insert error:", error);
    return NextResponse.json({ error: error.message, details: error.details, hint: error.hint }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
