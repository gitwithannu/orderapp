import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import User from "@/models/User"; // Even if unused, this registers the 'User' model
import Store from "@/models/Store"; // This registers the 'Store' model
import Product from "@/models/Product";
import jwt from "jsonwebtoken";

function getTokenFromReq(req: Request) {
  const cookieHeader = req.headers.get("cookie") || "";
  return cookieHeader.split("token=")[1]?.split(";")[0];
}

async function requireSuperadmin(req: Request) {
  const token = getTokenFromReq(req);
  if (!token) return { error: "Unauthorized", status: 401 };

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    if (decoded.role !== "superadmin") {
      return { error: "Only superadmin allowed", status: 403 };
    }
    return { decoded };
  } catch {
    return { error: "Invalid token", status: 403 };
  }
}

export async function GET(req: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Number(searchParams.get("limit")) || 10;
    const status = searchParams.get("status") || "";
    const search = searchParams.get("search") || "";

    const filter: any = {};
    if (status) filter.status = status;

    if (search) {
      filter.$or = [
        { orderNumber: { $regex: search, $options: "i" } },
        { customerName: { $regex: search, $options: "i" } },
        { customerPhone: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    // Use Promise.all for speed
    const [total, orders] = await Promise.all([
      Order.countDocuments(filter),
      Order.find(filter)
        .populate({ path: "agent", model: User, select: "name email role" })
        .populate({ path: "store", model: Store, select: "storeName city state" })
        .populate({ path: "items.product", model: Product, select: "product_name" })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(), // Convert to plain JS objects for better performance
    ]);

    return NextResponse.json({
      orders,
      page,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    console.error("Order Fetch Error:", error.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  await connectDB();

  const auth = await requireSuperadmin(req);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await req.json();
  const { id, status } = body;

  if (!id || !status) {
    return NextResponse.json(
      { error: "Order ID and status are required" },
      { status: 400 }
    );
  }

  const updatedOrder = await Order.findByIdAndUpdate(
    id,
    { status },
    { new: true }
  )
    .populate("agent", "name email role") // ✅ CHANGE: "user" -> "agent"
    .populate("store", "storeName city state");

  if (!updatedOrder) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json({
    message: "Order status updated",
    order: updatedOrder,
  });
}
