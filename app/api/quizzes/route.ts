import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const page = searchParams.get("page") ?? "0";
  const size = searchParams.get("size") ?? "10";
  const search = searchParams.get("search") ?? "";
  const categoryId = searchParams.get("categoryId") ?? "";
  const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/quizzes`);

  url.searchParams.set("page", page);
  url.searchParams.set("size", size);
  url.searchParams.set("categoryId",categoryId);

  if (search.trim()) {
    url.searchParams.set("search", search);
  }

  const res = await fetch(url.toString(), {
    method: "GET",
    cache: "no-store",
  });

  const data = await res.json();

  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get("access_token")?.value; 
  const body = await req.json();
    console.log("token",token)
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/quizzes`, {
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