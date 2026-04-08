import { NextRequest, NextResponse } from "next/server";

export async function GET() {

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`, {
    method: "GET",
  });
  const data = await res.json();
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get("better-auth.session_data")?.value; 
  const body = await req.json();
    console.log("token",token)
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, 
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  return NextResponse.json(data);
}