import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import jwt from "jsonwebtoken";

export async function GET(req: Request) {
  await connectDB();

  const { searchParams } = new URL(req.url);

  const status = searchParams.get("status") || "";
  const search = (searchParams.get("search") || "").toLowerCase();

  const filter: any = {};
  if (status) filter.status = status;

  if (search) {
    filter.$or = [
      { orderNumber: { $regex: search, $options: "i" } },
      { customerName: { $regex: search, $options: "i" } },
      { customerPhone: { $regex: search, $options: "i" } },
    ];
  }

  const orders = await Order.find(filter).sort({ createdAt: -1 });

  const csvRows = [];
  csvRows.push(
    [
      "Order Number",
      "Customer Name",
      "Customer Phone",
      "Store",
      "Agent",
      "Total Amount",
      "Status",
      "Created At",
      "Items",
    ].join(",")
  );

  for (const order of orders) {
    const items = order.items
      .map(
        (i) =>
          `${i.productName} (x${i.quantity}) - ₹${(
            i.price * i.quantity
          ).toFixed(2)}`
      )
      .join(" | ");

    csvRows.push(
      [
        order.orderNumber,
        order.customerName,
        order.customerPhone,
        order.store,
        order.agent,
        order.totalAmount,
        order.status,
        order.createdAt.toISOString(),
        `"${items}"`,
      ].join(",")
    );
  }

  const csvString = csvRows.join("\n");

  return new NextResponse(csvString, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=orders.csv",
    },
  });
}
