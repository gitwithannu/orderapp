import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";

export async function GET() {
  await connectDB();

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const count = await Order.countDocuments({
    createdAt: { $gte: startOfToday }
  });

  return Response.json({ count });
}
