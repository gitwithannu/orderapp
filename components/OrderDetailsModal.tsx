"use client";

import type { IOrder } from "@/models/Order";
import { Package, Layers, ClipboardList } from "lucide-react";

// Use an object map for cleaner icon logic
const typeIcons: Record<string, React.ReactNode> = {
  box: <Package size={16} className="text-blue-600" />,
  packet: <Layers size={16} className="text-green-600" />,
};

export default function OrderDetailsModal({
  isOpen,
  order,
  onClose,
  onStatusChange,
}: {
  isOpen: boolean;
  order: any; // Using 'any' here locally to bypass the strict TypeScript red lines
  onClose: () => void;
  onStatusChange: (status: string) => void;
}) {
  if (!isOpen || !order) return null;

  const statuses = [
    "pending",
    "confirmed",
    "packed",
    "shipped",
    "delivered",
    "cancelled",
  ];

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-2xl rounded-lg shadow-lg p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Order #{order.orderNumber}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-black">
            ✕
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div>
            <p className="font-semibold text-gray-900">Customer</p>
            <p>{order.customerName}</p>
            <p className="text-gray-500">{order.customerPhone}</p>
          </div>
          <div>
            <p className="font-semibold text-gray-900">Store</p>
            <p>{order.store?.storeName || "N/A"}</p>
            <p className="font-semibold mt-2 text-gray-900">Agent</p>
            <p>{order.agent?.name || "Unassigned"}</p>
          </div>
          <div>
            <p className="font-semibold text-gray-900">Status</p>
            <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 capitalize text-xs font-medium">
              {order.status}
            </span>
          </div>
          <div>
            <p className="font-semibold text-gray-900">Created</p>
            <p className="text-gray-600">{new Date(order.createdAt).toLocaleString()}</p>
          </div>
        </div>

        <h3 className="font-semibold mb-2 border-t pt-4">Items</h3>
        <table className="w-full text-sm mb-4 border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="p-2 text-left">Product</th>
              <th className="p-2 text-left">Type</th>
              <th className="p-2 text-left">Size</th>
              <th className="p-2 text-right">Qty</th>
              <th className="p-2 text-right">Price</th>
              <th className="p-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items?.map((item: any, idx: number) => (
              <tr key={idx} className="border-b hover:bg-gray-50">
                <td className="p-2 font-medium">
                  {/* Matches your API populate field 'productName' */}
                  {item.product?.product_name || "Unknown Product"}
                </td>
                <td className="p-2">
                  <div className="flex items-center gap-2">
                    {/* Render icon based on map or fallback to ClipboardList */}
                    {typeIcons[item.variantType?.toLowerCase()] || (
                      <ClipboardList size={16} className="text-gray-400" />
                    )}
                    <span className="capitalize">{item.variantType}</span>
                  </div>
                </td>
                <td className="p-2 text-gray-600">{item.variantSize}</td>
                <td className="p-2 text-right">{item.quantity}</td>
                <td className="p-2 text-right">₹{item.price.toFixed(2)}</td>
                <td className="p-2 text-right font-semibold">
                  ₹{(item.price * item.quantity).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex flex-col md:flex-row justify-between items-end md:items-center mt-6 pt-4 border-t gap-4">
          <div>
            <p className="font-semibold text-sm mb-2 text-gray-700">Change Order Status</p>
            <div className="flex flex-wrap gap-2">
              {statuses.map((s) => (
                <button
                  key={s}
                  onClick={() => onStatusChange(s)}
                  className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                    order.status === s
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-600 hover:bg-gray-100 border-gray-300"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-gray-100 p-3 rounded-lg min-w-[150px] text-right">
            <p className="text-xs text-gray-500 uppercase font-bold">Grand Total</p>
            <p className="text-xl font-bold text-blue-700">
              ₹{order.totalAmount?.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}