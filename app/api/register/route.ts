import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  await connectDB();
  const token = req.headers.get("authorization");

    if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded: any = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET!);

    if (decoded.role !== "superadmin") {
    return NextResponse.json({ error: "Only superadmin can create users" }, { status: 403 });
    }

  const { name, email, password, role } = await req.json();

  const existing = await User.findOne({ email });
  if (existing) {
    return NextResponse.json({ error: "Email already exists" }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role,
  });

  return NextResponse.json({ message: "User created", user });
}
