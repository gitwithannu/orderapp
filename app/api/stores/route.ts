import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Store from "@/models/Store";

export async function POST(req: Request) {
  await connectDB();
  const body = await req.json();
  const newStore = await Store.create(body);

  return NextResponse.json(
    { message: "Store saved successfully", store: newStore },
    { status: 201 }
  );
}

// GET ALL STORES
export async function GET() {
  await connectDB();
  const stores = await Store.find().lean();
  return NextResponse.json(stores);
}