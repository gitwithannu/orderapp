import { NextResponse } from 'next/server';
import mongoose from 'mongoose'; 
import { connectDB } from "@/lib/mongodb"; 
import StoreVisitLog from '@/models/StoreVisitLog';
import jwt from "jsonwebtoken";

// ==========================================
// 1. GET API: Fetch visit logs for a store
// ==========================================
export async function GET(request: Request) {
  try {
    await connectDB();

    // Authenticate user via token cookie
    const cookieHeader = request.headers.get("cookie") || "";
    const token = cookieHeader.split("token=")[1]?.split(";")[0];

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
      jwt.verify(token, process.env.JWT_SECRET!);
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 403 });
    }

    // Get storeId from query string (?storeId=xxxx)
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get("storeId");

    if (!storeId) {
      return NextResponse.json({ error: "Missing storeId query parameter" }, { status: 400 });
    }

    if (!mongoose.Types.ObjectId.isValid(storeId)) {
      return NextResponse.json({ error: "Invalid storeId format" }, { status: 400 });
    }

    // Fetch logs sorted from newest to oldest
    const logs = await StoreVisitLog.find({ storeId })
      .populate('agentId', 'name') 
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, logs }, { status: 200 });

  } catch (error: any) {
    console.error('Error fetching store visit logs:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: error.message },
      { status: 500 }
    );
  }
}

// ==========================================
// 2. POST API: Save a new visit log
// ==========================================
export async function POST(request: Request) {
  try {
    await connectDB();
  
    const cookieHeader = request.headers.get("cookie") || "";
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
  
    if (decoded.role !== "agent") {
      return NextResponse.json(
        { error: "Only agents can log store visits" },
        { status: 403 }
      );
    }  
  
    const body = await request.json();
    const { storeId, reasonCode, agentNotes, location } = body;

    if (!storeId || !reasonCode) {
      return NextResponse.json(
        { error: 'Missing required fields: storeId and reasonCode are required.' },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(decoded.id) || !mongoose.Types.ObjectId.isValid(storeId)) {
      return NextResponse.json(
        { error: 'Invalid agent ID or storeId format.' },
        { status: 400 }
      );
    }

    const newVisitLog = new StoreVisitLog({
      agentId: decoded.id, 
      storeId,
      reasonCode,
      agentNotes,
      location: location ? {
        latitude: location.latitude,
        longitude: location.longitude,
      } : undefined,
    });

    const savedLog = await newVisitLog.save();

    return NextResponse.json(
      { message: 'Store visit logged successfully', data: savedLog },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('Error saving store visit log:', error);

    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { error: 'Validation Failed', details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal Server Error', message: error.message },
      { status: 500 }
    );
  }
}