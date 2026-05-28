"use client";

import { useEffect, useState } from "react";

export default function AgentOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/agent/orders")
      .then((res) => res.json())
      .then((data) => {
        setOrders(data.orders || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Orders fetch error:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="p-8 text-center">Loading orders...</div>;
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto bg-white shadow rounded p-8">
        <h1 className="text-3xl font-bold mb-6">My Orders</h1>

        {orders.length === 0 ? (
          <p>No orders found.</p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-3 text-left">Order #</th>
                <th className="border p-3 text-left">Customer</th>
                <th className="border p-3 text-left">Phone</th>
                <th className="border p-3 text-left">Store</th>
                <th className="border p-3 text-left">Total</th>
                <th className="border p-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order:any) => (
                <tr key={order._id}>
                  <td className="border p-3">{order.orderNumber}</td>
                  <td className="border p-3">{order.customerName}</td>
                  <td className="border p-3">{order.customerPhone}</td>
                  <td className="border p-3">{order.store?.storeName || "—"}</td>
                  <td className="border p-3">₹{order.totalAmount}</td>
                  <td className="border p-3 capitalize">{order.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
