import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/categories/${id}`,
    { method: "DELETE" }
  );

  if (!res.ok) {
    return NextResponse.json(
      { message: "Failed to delete category" },
      { status: res.status }
    );
  }

  return NextResponse.json({ message: "Category deleted successfully" }, { status: 200 });
}