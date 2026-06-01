import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  // Verify cron secret
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const now = Math.floor(Date.now() / 1000);

  // Move bidding → revealing
  const { error: e1 } = await supabase
    .from("auctions")
    .update({ phase: "revealing" })
    .eq("phase", "bidding")
    .lt("deadline", now);

  if (e1) return NextResponse.json({ error: e1.message }, { status: 500 });

  return NextResponse.json({ ok: true, synced_at: now });
}
