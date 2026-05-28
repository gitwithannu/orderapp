import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import SectorArea from "@/models/SectorArea";

export async function GET(req: Request, { params}:any) {

   await connectDB();

  const { city } = await params;

  console.log("============ city  ======== ");
  console.log(city)

  const data = await SectorArea.findOne({  cities: city }).lean();

  if (!data) {
    return NextResponse.json([], { status: 200 });
  }

  return NextResponse.json(data.sector);
}
