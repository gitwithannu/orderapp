import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";

export async function GET() {
  try {
    await connectDB();
    const products = await Product.find().lean();
    return NextResponse.json({ products });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();

    const newProduct = await Product.create({
      product_name: body.product_name,
      variants: body.variants,
    });

    return NextResponse.json(
      { message: "Product added", product: newProduct },
      { status: 201 }
    );
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to add product" },
      { status: 500 }
    );
  }
}
