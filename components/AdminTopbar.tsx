"use client";

import { getUser } from "@/utils/getUser";

export default function AdminTopbar() {
  const user = getUser(); // contains name, role, permissions

  return (
    <header className="w-full h-16 border-b bg-white flex items-center justify-between px-6">
      <h1 className="text-xl font-semibold">Admin Dashboard</h1>

      <div className="flex items-center gap-4">
        <input
          type="text"
          placeholder="Search..."
          className="border rounded px-3 py-1"
        />

        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-700">
            {user?.name || "User"}
          </span>

          <div className="w-10 h-10 rounded-full bg-gray-300"></div>
        </div>
      </div>
    </header>
  );
}
