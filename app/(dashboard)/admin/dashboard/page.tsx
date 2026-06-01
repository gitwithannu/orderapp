"use client";
import { useState, useEffect } from "react";

interface User {
  permissions: string[];
  name?: string;
  email?: string;
}

export default function AdminOrders() {
   const [user, setUser] = useState<User | null>(null);
  
    useEffect(() => {
      fetch("/api/me")
        .then((res) => res.json())
        .then((data) => setUser(data.user));
    }, []);
  
    if (!user) return <div>Loading...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Admin Order Management</h1>

      {/* Orders Table */}
      <div className="bg-white shadow rounded p-6">
        <h2 className="text-xl font-semibold mb-4">All Orders</h2>

        {user?.permissions?.includes("view_all_orders") ? (
          <div>Order table goes here…</div>
        ) : (
          <p className="text-red-600">You do not have permission to view orders.</p>
        )}
      </div>

      {/* Actions */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">

        {user?.permissions?.includes("update_order_status") && (
          <div className="bg-white shadow rounded p-6">
            <h3 className="font-semibold mb-2">Update Order Status</h3>
            <p className="text-gray-600">Admins can update order status.</p>
          </div>
        )}

        {user?.permissions?.includes("generate_invoice") && (
          <div className="bg-white shadow rounded p-6">
            <h3 className="font-semibold mb-2">Generate Invoice</h3>
            <p className="text-gray-600">Admins can generate invoices.</p>
          </div>
        )}

        {user?.permissions?.includes("manage_products") && (
          <div className="bg-white shadow rounded p-6">
            <h3 className="font-semibold mb-2">Manage Products</h3>
            <a href="/admin/products" className="text-blue-600 underline">
              Go to Products
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
