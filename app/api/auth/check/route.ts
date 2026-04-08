// app/api/auth/check/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("better-auth.session_data")?.value;

  if (!token) {
    return NextResponse.json({ loggedIn: false }, { status: 401 });
  }

  return NextResponse.json({ loggedIn: true });
}