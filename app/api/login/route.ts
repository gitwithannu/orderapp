import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import AssignedRegions from "@/models/AssignedRegions";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import Permission from "@/models/Permission";

export async function POST(req: Request) {
  await connectDB();
  const { email, password } = await req.json();

  // 1️⃣ Find user
  const user = await User.findOne({ email });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // 2️⃣ Validate password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  // 3️⃣ Get permissions for this role
  const permissionDoc = await Permission.findOne({ role: user.role });

  // 4️⃣ Fetch assigned region (if any)
  const region = await AssignedRegions.findOne({ userId: user._id });

  // 5️⃣ Build JWT payload
  const tokenPayload = {
    id: user._id,
    role: user.role,
    name: user.name,
    permissions: permissionDoc?.permissions || [],
    state: region?.state || null,
    city: region?.city || null,
  };

  // 6️⃣ Sign JWT
  const token = jwt.sign(tokenPayload, process.env.JWT_SECRET!, {
    expiresIn: "7d",
  });

  // 7️⃣ Create response
  const response = NextResponse.json({
    success: true,
    role: user.role,
    region: {
      state: region?.state || null,
      city: region?.city || null,
    },
  });

  // 8️⃣ Secure httpOnly cookie (server-only)
  response.cookies.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  });

  // 9️⃣ Readable cookie for React UI
  response.cookies.set("client_token", token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  });

  return response;
}
