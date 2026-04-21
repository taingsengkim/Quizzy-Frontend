import { NextRequest, NextResponse } from "next/server";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export async function GET(req: NextRequest) {
  try {
    if (!BASE_URL) {
      return NextResponse.json(
        { error: "API URL not configured" },
        { status: 500 }
      );
    }

    const { searchParams } = req.nextUrl;

    const page = searchParams.get("page") ?? "0";
    const size = searchParams.get("size") ?? "10";
    const search = searchParams.get("search") ?? "";

    const url = new URL(`${BASE_URL}/categories`);
    url.searchParams.set("page", page);
    url.searchParams.set("size", size);

    if (search) {
      url.searchParams.set("search", search);
    }

    const res = await fetch(url.toString(), {
      method: "GET",
      cache: "no-store",
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      return NextResponse.json(
        {
          error: "Backend error",
          status: res.status,
          data,
        },
        { status: res.status }
      );
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("CATEGORY GET ERROR:", err);

    return NextResponse.json(
      {
        error: "Server crash",
        message: String(err),
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!BASE_URL) {
      return NextResponse.json(
        { error: "API URL not configured" },
        { status: 500 }
      );
    }

    const token = req.cookies.get("better-auth.session_data")?.value;

    const body = await req.json();

    const res = await fetch(`${BASE_URL}/categories`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      return NextResponse.json(
        {
          error: "Backend error",
          status: res.status,
          data,
        },
        { status: res.status }
      );
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("CATEGORY POST ERROR:", err);

    return NextResponse.json(
      {
        error: "Server crash",
        message: String(err),
      },
      { status: 500 }
    );
  }
}


