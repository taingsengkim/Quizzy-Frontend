import { NextRequest, NextResponse } from "next/server";

// export async function GET() {

//   const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`, {
//     method: "GET",
//   });
//   const data = await res.json();
//   return NextResponse.json(data);
// }

export async function GET() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;

    console.log("ENV:", baseUrl);

    if (!baseUrl) {
      return NextResponse.json(
        { error: "API URL not configured" },
        { status: 500 }
      );
    }

    const res = await fetch(`${baseUrl}/categories`, {
     method: "GET",
  });

    const text = await res.text();

    console.log("STATUS:", res.status);
    console.log("RESPONSE:", text);

    if (!res.ok) {
      return NextResponse.json(
        { error: "Backend error", details: text },
        { status: res.status }
      );
    }

    return NextResponse.json(JSON.parse(text));

  } catch (err) {
    console.error("GET ERROR:", err);
    return NextResponse.json(
      { error: "Route crashed", message: String(err) },
      { status: 500 }
    );
  }
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