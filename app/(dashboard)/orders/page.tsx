"use client";

import { useEffect, useState } from "react";
import PermissionGate from "@/components/PermissionGate";
import OrderDetailsModal from "@/components/OrderDetailsModal";
import type { IOrder } from "@/models/Order";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<IOrder | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const fetchOrders = () => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", "10");
    if (statusFilter) params.set("status", statusFilter);
    if (search) params.set("search", search);

    fetch(`/api/superadmin/orders?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setOrders(data.orders);
        setTotalPages(data.totalPages);
      });
  };

  useEffect(() => {
    fetchOrders();
  }, [page, statusFilter]);

  const handleStatusChange = async (status: string) => {
    if (!selectedOrder) return;

    const res = await fetch("/api/superadmin/orders", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: selectedOrder._id, status }),
    });

    if (res.ok) {
      setDetailsOpen(false);
      fetchOrders();
    }
  };

  const statuses = [
    "pending",
    "confirmed",
    "packed",
    "shipped",
    "delivered",
    "cancelled",
  ];

  return (
    <PermissionGate permission="view_all_orders">
      <div className="p-8 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold mb-6 text-gray-800">
            Orders Management
          </h1>

          <div className="flex flex-wrap gap-4 justify-between items-center mb-6">
            <input
              type="text"
              placeholder="Search by order, customer, phone..."
              className="border p-3 rounded w-full md:w-1/3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setPage(1);
                  fetchOrders();
                }
              }}
            />

            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm text-gray-600">Status:</span>
              <button
                onClick={() => {
                  setStatusFilter("");
                  setPage(1);
                }}
                className={`px-3 py-1 rounded text-sm border ${
                  statusFilter === ""
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                All
              </button>
              {statuses.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setStatusFilter(s);
                    setPage(1);
                  }}
                  className={`px-3 py-1 rounded text-sm border capitalize ${
                    statusFilter === s
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b text-gray-700 text-sm">
                  <th className="p-3">Order #</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3">Store</th>
                  <th className="p-3">Agent</th>
                  <th className="p-3 text-right">Total</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Created</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {
                  orders?.length > 0 ? (
                  orders.map(
                    (order) => (
                    <tr key={order._id.toString()} className="border-b hover:bg-gray-50 text-sm">
                      <td className="p-3 ">{order.orderNumber}</td>
                      <td className="p-3">{order.customerName}</td>
                      <td className="p-3">{order.customerPhone}</td>
                      <td className="p-3">{order.store?.storeName}</td>
                      <td className="p-3">{order.agent?.name}</td>
                      <td className="p-3 text-right">
                        ₹ {order.totalAmount.toFixed(2)}
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-1 rounded text-xs font-medium capitalize bg-gray-100">
                          {order.status}
                        </span>
                      </td>
                      <td className="p-3">
                        {new Date(order.createdAt).toLocaleString()}
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setDetailsOpen(true);
                          }}
                          className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition"
                        >
                          View
                        </button> | 

                        <button
                          onClick={() => {
                            const params = new URLSearchParams();
                            if (statusFilter) params.set("status", statusFilter);
                            if (search) params.set("search", search);

                            window.location.href = `/api/superadmin/orders/export?${params.toString()}`;
                          }}
                          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                        >
                          Export CSV
                      </button>


                      </td>
                    </tr>
                  )
                )
                
               ) : (

               
                  <tr>
                    <td
                      className="p-6 text-center text-gray-500"
                      colSpan={9}
                    >
                      No orders found
                    </td>
                  </tr>
               )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-center gap-4 mt-6">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-sm">
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>

        <OrderDetailsModal
          isOpen={detailsOpen}
          order={selectedOrder}
          onClose={() => setDetailsOpen(false)}
          onStatusChange={handleStatusChange}
        />
      </div>
    </PermissionGate>
  );
}
