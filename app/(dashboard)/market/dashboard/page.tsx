"use client";
import { getUser } from "@/utils/getUser";

export default function MarketDashboard() {
  const user: any = getUser();

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Market Manager Dashboard</h1>

      {/* Stores */}
      <div className="bg-white shadow rounded p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Stores in Your Market</h2>

        {user.permissions.includes("view_market_stores") ? (
          <div>Store list goes here…</div>
        ) : (
          <p className="text-red-600">No permission to view stores.</p>
        )}
      </div>

      {/* Orders */}
      <div className="bg-white shadow rounded p-6">
        <h2 className="text-xl font-semibold mb-4">Orders in Your Market</h2>

        {user.permissions.includes("view_market_orders") ? (
          <div>Market orders table…</div>
        ) : (
          <p className="text-red-600">No permission to view orders.</p>
        )}

        {user.permissions.includes("approve_order") && (
          <button className="mt-4 bg-green-600 text-white px-4 py-2 rounded">
            Approve Order
          </button>
        )}
      </div>
    </div>
  );
}
