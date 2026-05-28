"use client";
import { useEffect, useState } from "react";  
import PermissionGate from "@/components/PermissionGate";

export default function SuperAdminPanel() {

  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch("/api/me")
      .then((res) => res.json())
      .then((data) => setUser(data.user));
  }, []);

  if (!user) return <div>Loading...</div>;



return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Super Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <PermissionGate permission="manage_users">
          <div className="bg-white p-6 shadow rounded">
            <h2 className="text-xl font-semibold mb-2">User Management</h2>
            <p className="text-gray-600">Create, edit, and manage all users.</p>
          </div>
        </PermissionGate>

        <PermissionGate permission="manage_stores">
          <div className="bg-white p-6 shadow rounded">
            <h2 className="text-xl font-semibold mb-2">Store Management</h2>
            <p className="text-gray-600">Manage all stores across markets.</p>
          </div>
        </PermissionGate>

        <PermissionGate permission="manage_products">
          <div className="bg-white p-6 shadow rounded">
            <h2 className="text-xl font-semibold mb-2">Product Management</h2>
            <p className="text-gray-600">Add, update, and categorize products.</p>
          </div>
        </PermissionGate>

        <PermissionGate permission="manage_markets">
          <div className="bg-white p-6 shadow rounded">
            <h2 className="text-xl font-semibold mb-2">Market Management</h2>
            <p className="text-gray-600">Control markets and assign managers.</p>
          </div>
        </PermissionGate>

        <PermissionGate permission="view_all_orders">
          <div className="bg-white p-6 shadow rounded">
            <h2 className="text-xl font-semibold mb-2">All Orders</h2>
            <p className="text-gray-600">View and monitor all orders.</p>
          </div>
        </PermissionGate>

        <PermissionGate permission="override_order_status">
          <div className="bg-white p-6 shadow rounded">
            <h2 className="text-xl font-semibold mb-2">Override Order Status</h2>
            <p className="text-gray-600">Force‑update order statuses.</p>
          </div>
        </PermissionGate>

      </div>
    </div>
  );
}
