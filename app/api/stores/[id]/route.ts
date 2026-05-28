import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Store from "@/models/Store";

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  await connectDB();

  const { id } = await context.params;   // ⭐ FIXED — unwrap the Promise

  const store = await Store.findById(id).lean();

  if (!store) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  return NextResponse.json(store);
}
