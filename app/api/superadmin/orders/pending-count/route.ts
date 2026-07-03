import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";

export async function GET() {
  await connectDB();

  const count = await Order.countDocuments({ status: "pending" });

  return Response.json({ count });
}
