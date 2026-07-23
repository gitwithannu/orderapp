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
  const [isLoading, setIsLoading] = useState(false);
  const statusStyles: Record<string, string> = {
    pending: "bg-amber-100 text-amber-800 border-amber-200",
    confirmed: "bg-blue-100 text-blue-800 border-blue-200",
    packed: "bg-purple-100 text-purple-800 border-purple-200",
    shipped: "bg-indigo-100 text-indigo-800 border-indigo-200",
    delivered: "bg-green-100 text-green-800 border-green-200",
    cancelled: "bg-rose-100 text-rose-800 border-rose-200",
  };

  const fetchOrders = () => {
    setIsLoading(true); // Turn loader ON
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
      })
      .catch((err) => console.error("Error fetching orders:", err))
      .finally(() => {
        setIsLoading(false); // Turn loader OFF
      });
  };

  useEffect(() => {
    fetchOrders();
  }, [page, statusFilter]);
  const handleStatusChange = async (status: string) => {
    if (!selectedOrder) return;
    setIsLoading(true); // Turn loader ON
    try {
      const res = await fetch("/api/superadmin/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedOrder._id, status }),
      });
      if (res.ok) {
        setDetailsOpen(false);
        fetchOrders();
      } else {
        setIsLoading(false); // Turn loader OFF if response fails
      }
    } catch (error) {
      console.error("Error changing status:", error);
      setIsLoading(false); // Turn loader OFF on error
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
      <div className="p-1 md:p-8 bg-gray-50 min-h-screen">
        {/* Loading Spinner Overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 transition-all">
            <div className="bg-white p-5 rounded-xl shadow-xl flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm font-medium text-gray-700">Processing...</p>
            </div>
          </div>
        )}
        <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-md p-4 md:p-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <h1 className="text-2xl font-bold mb-6 text-gray-800">
            Orders Management
          </h1>
          </div>
          <div className="flex flex-col lg:flex-row gap-4 justify-between lg:items-center mb-6">
            <input
              type="text"
              placeholder="Search by order, customer, phone..."
              className="border p-3 rounded w-full md:w-1/3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setPage(1);
                  fetchOrders();
                }
              }}
            />
            <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 max-w-full [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <span className="text-sm text-gray-600 shrink-0">Status:</span>
              <button
                onClick={() => {
                  setStatusFilter("");
                  setPage(1);
                }}
                className={`px-3 py-1 rounded text-sm border shrink-0 ${
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
                  className={`px-3 py-1 rounded text-sm border capitalize shrink-0 ${
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

          <div className="w-full overflow-x-auto border rounded-md">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-gray-100 border-b text-gray-700 text-[12px] md:text-sm whitespace-nowrap">
                  <th className="p-1">Order #</th>
                  <th className="p-1">Customer</th>
                  <th className="p-1 hidden md:table-cell">Phone</th>
                  <th className="p-1">Store</th>
                  <th className="p-1">Agent</th>
                  <th className="p-1 text-right">Total</th>
                  <th className="p-1">Status</th>
                  <th className="p-1">Created</th>
                  <th className="p-1">Actions</th>
                </tr>
              </thead>
              <tbody>
                {
                  orders?.length > 0 ? (
                  orders.map(
                    (order) => (
                    <tr key={order._id.toString()} className="border-b hover:bg-gray-50 text-[12px] md:text-sm whitespace-nowrap">
                      <td className="p-1 font-medium text-gray-900">{order.orderNumber}</td>
                      <td className="p-1 text-gray-700">{order.customerName}</td>
                      <td className="p-1 text-gray-600 hidden md:table-cell">{order.customerPhone}</td>
                      <td className="p-1 text-gray-600">{order.store?.storeName}</td>
                      <td className="p-1 text-gray-600">{order.agent?.name}</td>
                      <td className="p-1 text-right font-semibold text-gray-900">
                        ₹ {order.totalAmount.toFixed(2)}
                      </td>
                      <td className="p-3">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-medium border capitalize ${statusStyles[order.status.toLowerCase()] || "bg-gray-100 text-gray-800 border-gray-200"}`}>
                          {order.status}
                        </span>
                      </td>
                     <td className="p-3 text-gray-500">
                        {new Date(order.createdAt).toLocaleString()}
                      </td>
                     <td className="p-3 text-center">
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setDetailsOpen(true);
                          }}
                         className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 transition"
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
                    <td className="p-6 text-center text-gray-500" colSpan={9}>
                      No orders found
                    </td>
                  </tr>
               )}
              </tbody>
            </table>
          </div>
          <div className="flex justify-center items-center gap-4 mt-6">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-4 py-2 bg-gray-200 text-sm font-medium rounded disabled:opacity-50 transition active:scale-95"
            > Previous</button>
            <span className="text-sm font-medium text-gray-700">Page {page} of {totalPages} </span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-4 py-2 bg-gray-200 text-sm font-medium rounded disabled:opacity-50 transition active:scale-95"
            > Next </button>
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
