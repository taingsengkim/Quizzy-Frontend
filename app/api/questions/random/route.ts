import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/questions/random?${searchParams.toString()}`
  );
  const data = await res.json();
  return NextResponse.json(data);
}