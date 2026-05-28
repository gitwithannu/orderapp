import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import jwt from "jsonwebtoken";


export async function GET(req: Request) {
  await connectDB();

  const cookieHeader = req.headers.get("cookie") || "";
  const token = cookieHeader.split("token=")[1]?.split(";")[0];

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

  if (decoded.role !== "agent") {
    return NextResponse.json(
      { error: "Only agents can view their orders" },
      { status: 403 }
    );
  }

  const orders = await Order.find({ agent: decoded.id })
    .populate("store")
    .sort({ createdAt: -1 });

  return NextResponse.json({ orders });
}

export async function POST(req: Request) {
  await connectDB();
  

  // Get token
  const cookieHeader = req.headers.get("cookie") || "";
  const token = cookieHeader.split("token=")[1]?.split(";")[0];

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let decoded: any;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET!);
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 403 });
  }

  // Only agent can create orders
  if (decoded.role !== "agent") {
    return NextResponse.json(
      { error: "Only agents can create orders" },
      { status: 403 }
    );
  }

  const body = await req.json();

  const {
    store,
    customerName,
    customerPhone,
    items,
    notes,
    totalAmount,
  } = body;

  if (!store || !customerName || !customerPhone || !items?.length) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  // Generate order number
  const orderNumber = "ORD-" + Date.now();

  const newOrder = await Order.create({
    orderNumber,
    customerName,
    customerPhone,
    store,
    agent: decoded.id, // agent ID from token
    items,
    notes,
    totalAmount,
    status: "pending",
  });

  return NextResponse.json({
    message: "Order created successfully",
    order: newOrder,
  });
}
