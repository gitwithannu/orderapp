import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";

// Changed 'resquest' to 'Request'
export async function POST(req: Request) {
    await connectDB();
    
    try {
        const body = await req.json();
        const newOrder = await Order.create(body);

        return NextResponse.json(
            { message: "Order Saved", orderId: newOrder._id },
            { status: 201 }
        );
    } catch (error) {
        return NextResponse.json(
            { message: "Error saving order", error },
            { status: 500 }
        );
    }
}
