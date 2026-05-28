import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Store from "@/models/Store";
import User from "@/models/User";
import jwt from "jsonwebtoken";

export async function GET(req: Request) {
  await connectDB();

  // Read token from cookie
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

  // Only agent can access this API
  if (decoded.role !== "agent") {
    return NextResponse.json(
      { error: "Only agents can access assigned stores" },
      { status: 403 }
    );
  }

  // Fetch agent from DB
  const agent = await User.findById(decoded.id);

  if (!agent) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 });
  }

  // Agent must have assigned stores
  if (!agent.assignedStores || agent.assignedStores.length === 0) {
    return NextResponse.json({ stores: [] });
  }

  // Fetch store details
  const stores = await Store.find({
    _id: { $in: agent.assignedStores },
  });


  return NextResponse.json({ stores });
}
