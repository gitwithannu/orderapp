import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";


export async function POST(req:resquest){
    await connectDB();
    const body = await req.json();

    const newOrder = await Order.create(body)

    return NextResponse.json(
        { message: "order Saved", orderId: newOrder._id },
        { status: 201 }
    );
    
}