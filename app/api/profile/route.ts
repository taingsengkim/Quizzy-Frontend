// app/api/profile/route.ts
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("better-auth.session_data")?.value;

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const res = await fetch("http://localhost:8090/api/v1/auth/profile", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`, // <--- Spring needs this
    },
  });

  const data = await res.json();
  return NextResponse.json(data);
}