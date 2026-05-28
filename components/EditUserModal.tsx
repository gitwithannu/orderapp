"use client";

import { useState } from "react";
import type { User } from "@/types";

export default function EditUserModal({
  isOpen,
  user,
  onClose,
  onUpdated,
}: {
  isOpen: boolean;
  user: User | null;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    role: user?.role || "agent",
    permissions: user?.permissions || [],
    password: "",
  });

  const handleUpdate = async () => {
    const res = await fetch("/api/users", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: user?._id,
        ...form,
      }),
    });

    if (res.ok) {
      onUpdated();
      onClose();
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-lg rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Edit User</h2>

        <input
          name="name"
          placeholder="Full Name"
          className="w-full border p-3 rounded mb-4"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <input
          name="email"
          placeholder="Email"
          className="w-full border p-3 rounded mb-4"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <select
          name="role"
          className="w-full border p-3 rounded mb-4"
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
        >
          <option value="agent">Agent</option>
          <option value="admin">Admin</option>
          <option value="market">Market</option>
          <option value="superadmin">Super Admin</option>
        </select>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdate}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
