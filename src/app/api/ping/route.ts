import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const secret = new URL(request.url).searchParams.get("secret");

  if (process.env.PING_SECRET && secret !== process.env.PING_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const { count, error } = await supabase
      .from("Ticket")
      .select("*", { count: "exact", head: true });

    if (error) throw error;

    return NextResponse.json({
      ok: true,
      tickets: count,
      ts: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: String(err) },
      { status: 500 }
    );
  }
}
