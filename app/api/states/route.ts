/* import fs from "fs";
import path from "path"; */
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import State from "@/models/State";


export async function GET() {
  await connectDB();
  const states = await State.find().lean();
  console.log(" ======================= state find ======================")
  console.log(states)

  return NextResponse.json(states);

}
