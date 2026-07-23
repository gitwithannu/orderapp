"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function StorePage() {
  const [stores, setStores] = useState([]);
  const [filteredStores, setFilteredStores] = useState([]);
  const [search, setSearch] = useState("");
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedSector, setSelectedSector] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch all stores
  useEffect(() => {
    fetch("/api/stores")
      .then(res => res.json())
      .then(data => {
        setStores(data);
        setFilteredStores(data);
      });
  }, []);

  // Fetch states
  useEffect(() => {
    fetch("/api/states")
      .then(res => res.json())
      .then(data => setStates(data));
  }, []);

  // Fetch cities when state changes
  useEffect(() => {
    if (!selectedState) return;
    fetch(`/api/cities/${selectedState}`)
      .then(res => res.json())
      .then(data => setCities(data));
  }, [selectedState]);

  // Fetch sectors when city changes
  useEffect(() => {
    if (!selectedCity) return;
    fetch(`/api/sector/${selectedCity}`)
      .then(res => res.json())
      .then(data => setSectors(data));
  }, [selectedCity]);

  // Filter logic
  useEffect(() => {
    let results = stores;

    if (selectedState) results = results.filter((s: any) => s.state === selectedState);
    if (selectedCity) results = results.filter((s: any) => s.city === selectedCity);
    if (selectedSector) results = results.filter((s: any) => s.sector === selectedSector);

    if (search) {
      const query = search.toLowerCase();
      results = results.filter((s: any) =>
        Object.values(s).join(" ").toLowerCase().includes(query)
      );
    }

    setFilteredStores(results);
    setCurrentPage(1);
  }, [search, selectedState, selectedCity, selectedSector, stores]);

  // Pagination
  const totalPages = Math.ceil(filteredStores.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentStores = filteredStores.slice(startIndex, startIndex + itemsPerPage);

  return (
     <div className="p-1 md:p-8 bg-gray-50 min-h-screen">
         <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-md p-4 md:p-8">
            <h1 className="md:text-3xl font-bold mb-6 text-gray-800">Store Directory</h1>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-6">
                {/* State Dropdown */}
                <div className="w-full sm:w-48">
                <label className="block mb-1 font-medium">State</label>
                <select
                    value={selectedState}
                    onChange={(e) => {
                    setSelectedState(e.target.value);
                    setSelectedCity("");
                    setSelectedSector("");
                    }}
                    className="border rounded px-3 py-2 w-full"
                >
                    <option value="">All States</option>
                    {states.map((s: any) => (
                    <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                </select>
                </div>

                {/* City Dropdown */}
                <div className="w-full sm:w-48">
                <label className="block mb-1 font-medium">City</label>
                <select
                    value={selectedCity}
                    onChange={(e) => {
                    setSelectedCity(e.target.value);
                    setSelectedSector("");
                    }}
                    className={`border rounded px-3 py-2 w-full transition 
                    ${!selectedState 
                        ? "bg-gray-200 text-gray-500 cursor-not-allowed" 
                        : "bg-white text-black cursor-pointer"}`
                    }
                    disabled={!selectedState}
                >
                    <option value="">All Cities</option>
                    {cities.map((city: string, index: number) => (
                    <option key={index} value={city}>{city}</option>
                    ))}
                </select>
                </div>

                {/* Sector Dropdown */}
                <div className="w-full sm:w-48">
                <label className="block mb-1 font-medium">Sector / Area</label>
                <select
                    disabled={!selectedCity}
                    value={selectedSector}
                    onChange={(e) => setSelectedSector(e.target.value)}
                    className={`border rounded px-3 py-2 w-full transition 
                        ${!selectedCity 
                        ? "bg-gray-200 text-gray-500 cursor-not-allowed" 
                        : "bg-white text-black cursor-pointer"}`
                    }
                
                >
                    <option value="">All Sectors</option>
                    {sectors.map((sector: string, index: number) => (
                    <option key={index} value={sector}>{sector}</option>
                    ))}
                </select>
                </div>

                {/* Search */}
                <div className="w-full sm:w-48">
                <label className="block mb-1 font-medium">Search</label>
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search store..."
                    className="border rounded px-3 py-2 w-full sm:w-64"
                />
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full border-collapse border border-gray-300">
                <thead className="bg-gray-100">
                    <tr>
                    <th className="border p-2 text-left">Store Name</th>
                    <th className="border p-2 text-left">Owner</th>
                    <th className="border p-2 text-left">Mobile</th>
                    <th className="border p-2 text-left">State</th>
                    <th className="border p-2 text-left">City</th>
                    <th className="border p-2 text-left">Sector</th>
                    <th className="border p-2 text-left">Address</th>
                    <th className="border p-2 text-left">Activity</th>
                    <th className="border p-2 text-left">Created At</th>
                    </tr>
                </thead>
                <tbody>
                    {currentStores.map((store: any) => (
                    <tr key={store._id} className="hover:bg-gray-50">
                        <td className="border p-2">{store.storeName}</td>
                        <td className="border p-2">{store.ownerName}</td>
                        <td className="border p-2">{store.ownerMobile}</td>
                        <td className="border p-2">{store.state}</td>
                        <td className="border p-2">{store.city}</td>
                        <td className="border p-2">{store.sector}</td>
                        <td className="border p-2">{store.address}</td>
                        {/* 👇 Activity column with link */}
                        <td className="border p-2 text-center">
                        <Link
                            href={`/order-page?storeId=${store._id}`}
                            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                        >
                            Place Order
                        </Link>
                        </td>
                        <td className="border p-2">
                        {new Date(store.createdAt).toLocaleDateString()}
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-4">
                <p className="text-gray-600">
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredStores.length)} of {filteredStores.length} entries
                </p>
                <div className="flex gap-2">
                <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => p - 1)}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                >
                    Prev
                </button>
                {[...Array(totalPages)].map((_, i) => (
                    <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-3 py-1 border rounded ${currentPage === i + 1 ? "bg-blue-600 text-white" : ""}`}
                    >
                    {i + 1}
                    </button>
                ))}
                <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(p => p + 1)}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                >
                    Next
                </button>
                </div>
            </div>
        </div>
    </div>
  );
}
