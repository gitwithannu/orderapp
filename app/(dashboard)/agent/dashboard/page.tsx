  "use client";

  import { useState, useEffect } from "react";
interface User {
  permissions: string[];
  name?: string;
  email?: string;
}
  export default function AgentDashboard() {
      const [user, setUser] = useState<User | null>(null);
       
      useEffect(() => {
        fetch("/api/me")
          .then((res) => res.json())
          .then((data) => setUser(data.user));
      }, []);


      console.log("======================= agent =====================");
      console.log(user)
    
      if (!user) return <div>Loading...</div>;

    return (
      <div className="p-8 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Agent Dashboard</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Assigned Stores */}
          <div className="bg-white shadow rounded p-6 lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Assigned Stores</h2>
            <p className="text-gray-600">List of stores assigned to this agent.</p>
          </div>

          {/* Quick Actions */}
          <div className="bg-white shadow rounded p-6">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>

            {user?.permissions?.includes("create_order") && (
              <a
                href="/agent/create-order"
                className="block bg-blue-600 text-white text-center py-3 rounded mb-3"
              >
                Create New Order
              </a>
            )}

            {user?.permissions?.includes("view_own_orders") && (
              <a
                href="/agent/orders"
                className="block bg-gray-700 text-white text-center py-3 rounded"
              >
                View My Orders
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }
