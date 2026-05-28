import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import City from "@/models/City";


export async function GET(req:Request, { params}:any) {
   const { state } = await params; 

  const data = await City.findOne({ state }).lean();

  if (!data) {
    return NextResponse.json([], { status: 200 });
  }

  return NextResponse.json(data.cities);
}
