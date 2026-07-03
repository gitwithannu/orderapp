"use client";

import { useEffect, useState } from "react";
import PermissionGate from "@/components/PermissionGate";
import VisitLogsModal from "@/components/VisitLogsModal"; // Import your new component

export default function InactiveStoresOrdersPage() {
  const [stores, setStores] = useState([]);
  const [timeFilter, setTimeFilter] = useState("2_weeks");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  // --- Modal Control State variables ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState<{ id: string; name: string } | null>(null);

  const limit = 10;

  const fetchInactiveStores = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (timeFilter) params.set("timeRange", timeFilter);
      if (search) params.set("search", search);

      const response = await fetch(`/api/superadmin/orders/inactive?${params.toString()}`);
      const result = await response.json();

      if (result.success) {
        const data = result.stores || [];
        setTotalPages(Math.ceil(data.length / limit) || 1);
        
        const startIndex = (page - 1) * limit;
        const pagedData = data.slice(startIndex, startIndex + limit);
        setStores(pagedData);
      } else {
        setError(result.error || "Failed to load data");
      }
    } catch (err) {
      setError("Network connectivity problem encountered.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInactiveStores();
  }, [page, timeFilter]);

  // Handler to safely mount and trigger the popup window definitions
  const handleOpenReasons = (storeId: string, storeName: string) => {
    setSelectedStore({ id: storeId, name: storeName });
    setIsModalOpen(true);
  };

  return (
    <PermissionGate permission="view_all_orders">
      <div className="p-8 bg-gray-50 min-h-[100dvh] flex flex-col">
        {isLoading && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 transition-all">
            <div className="bg-white p-5 rounded-xl shadow-xl flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm font-medium text-gray-700">Processing...</p>
            </div>
          </div>
        )}
        <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-md p-8 flex-grow">
          <h1 className="text-3xl font-bold mb-6 text-gray-800">
            Stores With No Recent Orders
          </h1>

          <div className="flex flex-wrap gap-4 justify-between items-center mb-6">
            <div className="flex flex-col gap-1 w-full sm:w-64">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-1">
                Filter by Inactivity Period
              </label>
              <select
                value={timeFilter}
                onChange={(e) => {
                  setTimeFilter(e.target.value);
                  setPage(1); 
                }}
                className="border p-3 rounded-lg bg-white text-gray-700 font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
              >
                <option value="1_week">1 Week</option>
                <option value="2_weeks">2 Weeks</option>
                <option value="1_month">1 Month</option>
                <option value="2_months">2 Months</option>
              </select>
            </div>

            <div className="flex flex-wrap gap-2 items-center w-full md:w-auto mt-4">
              <input
                type="text"
                placeholder="Search by store name, city, state..."
                className="border p-3 rounded w-full md:w-80 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setPage(1);
                    fetchInactiveStores();
                  }
                }}
              />
              <button 
                onClick={() => { setPage(1); fetchInactiveStores(); }}
                className="bg-blue-600 text-white px-5 py-3 rounded-md hover:bg-blue-700 font-medium transition"
              >
                Search
              </button>
            </div>
          </div>

          {error && <div className="mb-4 text-red-500 bg-red-50 p-3 rounded">{error}</div>}

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b text-gray-700 text-sm">
                  <th className="p-3">Store ID</th>
                  <th className="p-3">Store Name</th>
                  <th className="p-3">City</th>
                  <th className="p-3">State</th>
                  <th className="p-3">Status Label</th>
                  {/* --- NEW COLUMN HEADER --- */}
                  <th className="p-3">Reason</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {stores?.length > 0 ? (
                  stores.map((store: any) => (
                    <tr key={store._id} className="border-b hover:bg-gray-50 text-sm">
                      <td className="p-3 font-mono text-xs text-gray-500">{store._id}</td>
                      <td className="p-3 font-semibold text-gray-800">{store.storeName || "Unnamed Store"}</td>
                      <td className="p-3">{store.city || "—"}</td>
                      <td className="p-3">{store.state || "—"}</td>
                      <td className="p-3">
                        <span className="px-2.5 py-1 rounded-md text-xs font-medium border bg-rose-100 text-rose-800 border-rose-200">
                          No orders ({timeFilter.replace("_", " ")})
                        </span>
                      </td>
                      {/* --- NEW COLUMN REASON ACTION BUTTON --- */}
                      <td className="p-3">
                        <button
                          onClick={() => handleOpenReasons(store._id, store.storeName || "Unnamed Store")}
                          className="px-2.5 py-1 border border-blue-200 bg-blue-50 text-blue-700 rounded-md text-xs font-semibold hover:bg-blue-100 transition shadow-sm"
                        >
                          View Reasons
                        </button>
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => {
                            const params = new URLSearchParams();
                            if (timeFilter) params.set("timeRange", timeFilter);
                            if (search) params.set("search", search);
                            window.location.href = `/api/superadmin/stores/export-inactive?${params.toString()}`;
                          }}
                          className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition"
                        >
                          Export Info
                        </button>
                      </td>
                    </tr>
                  ))
               ) : (
                  <tr>
                    <td className="p-6 text-center text-gray-500" colSpan={7}>
                      No completely inactive stores found matching criteria.
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
              className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50 text-sm font-medium"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-sm text-gray-600">
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50 text-sm font-medium"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* --- RENDER LOG DETAILS MODAL DIALOG --- */}
      <VisitLogsModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedStore(null);
        }}
        storeId={selectedStore?.id || ""}
        storeName={selectedStore?.name || ""}
      />
    </PermissionGate>
  );
}
