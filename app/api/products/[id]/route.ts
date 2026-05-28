import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import jwt from "jsonwebtoken";

export async function GET(req, context) {
  await connectDB();

  const { id } = await context.params; // Next.js 14 fix

  const product = await Product.findById(id).lean();
  return NextResponse.json({ product });
}

export async function PUT(req, context) {
  await connectDB();

  const { id } = await context.params; // Next.js 14 fix
  const body = await req.json();

  // Extract token from cookies
  const cookieHeader = req.headers.get("cookie") || "";
  const token = cookieHeader.split("token=")[1]?.split(";")[0];

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Decode JWT
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  // Permission check
  if (!decoded.permissions.includes("edit_product")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Update product
  const updatedProduct = await Product.findByIdAndUpdate(
    id,
    {
      product_name: body.product_name,
      variants: body.variants,
    },
    { new: true }
  );

  return NextResponse.json({
    message: "Product updated",
    product: updatedProduct,
  });
}

export async function DELETE(req, context) {
  await connectDB();

  const { id } = await context.params;

  // Read token from cookies
  const cookieHeader = req.headers.get("cookie") || "";
  const token = cookieHeader.split("token=")[1]?.split(";")[0];

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Decode JWT
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  // Permission check
  if (!decoded.permissions.includes("manage_products")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Delete product
  try {
    await Product.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
