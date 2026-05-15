import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    ok: true,
    service: "kv-web-starter",
    time: new Date().toISOString(),
  });
}
