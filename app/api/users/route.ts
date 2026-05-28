import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import AssignedRegions from "@/models/AssignedRegions";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export async function GET() {
  await connectDB();

  try {
    const users = await User.find().select("-password");
    return NextResponse.json({ users });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  await connectDB();

  // Read token
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

  // Only superadmin can create users
  if (decoded.role !== "superadmin") {
    return NextResponse.json(
      { error: "Only superadmin can create users" },
      { status: 403 }
    );
  }

  const body = await req.json();
  const { name, email, password, role, permissions, state, city } = body;

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const newUser = await User.create({
    name,
    email,
    password: hashedPassword,
    role,
    permissions,
  });

  // ⭐ Assign region if provided
  let assignedRegion = null;

  if (state && city) {
    // Prevent duplicate region assignment
    const exists = await AssignedRegions.findOne({
      userId: newUser._id,
      state,
      city,
    });

    if (!exists) {
      assignedRegion = await AssignedRegions.create({
        userId: newUser._id,
        state,
        city,
      });
    }
  }

  return NextResponse.json({
    message: "User created successfully",
    user: newUser,
    assignedRegion,
  });
}

export async function DELETE(req: Request) {
  await connectDB();

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

  if (decoded.role !== "superadmin") {
    return NextResponse.json(
      { error: "Only superadmin can delete users" },
      { status: 403 }
    );
  }

  const { id } = await req.json();

  if (!id) {
    return NextResponse.json(
      { error: "User ID is required" },
      { status: 400 }
    );
  }

  const deletedUser = await User.findByIdAndDelete(id);

  if (!deletedUser) {
    return NextResponse.json(
      { error: "User not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ message: "User deleted successfully" });
}

export async function PUT(req: Request) {
  await connectDB();

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

  if (decoded.role !== "superadmin") {
    return NextResponse.json(
      { error: "Only superadmin can update users" },
      { status: 403 }
    );
  }

  const body = await req.json();
  const { id, name, email, role, permissions, password } = body;

  if (!id) {
    return NextResponse.json(
      { error: "User ID is required" },
      { status: 400 }
    );
  }

  // Check duplicate email
  const existing = await User.findOne({ email, _id: { $ne: id } });
  if (existing) {
    return NextResponse.json(
      { error: "Email already exists" },
      { status: 400 }
    );
  }

  const updateData: any = {
    name,
    email,
    role,
    permissions,
  };

  if (password && password.trim() !== "") {
    updateData.password = await bcrypt.hash(password, 10);
  }

  const updatedUser = await User.findByIdAndUpdate(id, updateData, {
    new: true,
  }).select("-password");

  if (!updatedUser) {
    return NextResponse.json(
      { error: "User not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    message: "User updated successfully",
    user: updatedUser,
  });
}
