import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Store from "@/models/Store";
import Order from "@/models/Order"; // Keep registered

export async function GET(req: Request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(req.url);
    const timeRange = searchParams.get("timeRange") || "2_weeks";
    const search = searchParams.get("search") || "";

    // Parse the timeframe variable dynamically
    const cutoffDate = new Date();
    if (timeRange === "1_week") cutoffDate.setDate(cutoffDate.getDate() - 7);
    else if (timeRange === "1_month") cutoffDate.setMonth(cutoffDate.getMonth() - 1);
    else if (timeRange === "2_months") cutoffDate.setMonth(cutoffDate.getMonth() - 2);
    else {
      // Default fallback: 2_weeks
      cutoffDate.setDate(cutoffDate.getDate() - 14);
    }

    // Build standard Store name/info search query if typed
    const storeSearchFilter: any = {};
    if (search) {
      storeSearchFilter.$or = [
        { storeName: { $regex: search, $options: "i" } },
        { city: { $regex: search, $options: "i" } },
        { state: { $regex: search, $options: "i" } },
      ];
    }

    const inactiveStores = await Store.aggregate([
      // Apply initial store textual search if present
      ...(search ? [{ $match: storeSearchFilter }] : []),
      {
        $lookup: {
          from: "orders",
          localField: "_id",
          foreignField: "store",
          let: { storeId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$store", "$$storeId"] },
                    { $gte: ["$createdAt", cutoffDate] }
                  ]
                }
              }
            }
          ],
          as: "recentOrders"
        }
      },
      {
        $match: {
          recentOrders: { $size: 0 } // No orders found within timeframe
        }
      },
      {
        $project: {
          recentOrders: 0
        }
      }
    ]);

    return NextResponse.json({
      success: true,
      stores: inactiveStores,
      total: inactiveStores.length
    });

  } catch (error: any) {
    console.error("Inactive Stores Fetch Error:", error.message);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}