"use client";

import { useEffect, useState } from "react";
import type { FormState } from "@/types";

export default function CreateUserModal({
  isOpen,
  onClose,
  onCreated,
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    password: "",
    role: "agent",
    permissions: [],
  });

  // ✅ Add region state
  const [state, setState] = useState("");
  const [city, setCity] = useState("");

  // ✅ Scroll lock logic
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const togglePermission = (perm: string) => {
    setForm((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(perm)
        ? prev.permissions.filter((p) => p !== perm)
        : [...prev.permissions, perm],
    }));
  };

  const handleSubmit = async () => {
    const payload = { ...form, state, city };

    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      onCreated();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-lg rounded-lg shadow-lg p-6 animate-fadeIn">
        <h2 className="text-2xl font-bold mb-4">Create New User</h2>

        {/* Name */}
        <input
          name="name"
          placeholder="Full Name"
          className="w-full border p-3 rounded mb-4"
          value={form.name}
          onChange={handleChange}
        />

        {/* Email */}
        <input
          name="email"
          placeholder="Email"
          className="w-full border p-3 rounded mb-4"
          value={form.email}
          onChange={handleChange}
        />

        {/* Password */}
        <input
          name="password"
          type="password"
          placeholder="Password"
          className="w-full border p-3 rounded mb-4"
          value={form.password}
          onChange={handleChange}
        />

        {/* Role */}
        <select
          name="role"
          className="w-full border p-3 rounded mb-4"
          value={form.role}
          onChange={handleChange}
        >
          <option value="agent">Agent</option>
          <option value="admin">Admin</option>
          <option value="market">Market</option>
          <option value="superadmin">Super Admin</option>
        </select>

        {/* Region Assignment */}
        <label className="block font-medium mt-4">Assign Region</label>
        <div className="flex gap-4 mb-4">
          <select
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="border rounded px-3 py-2 w-1/2"
          >
            <option value="">Select State</option>
            <option value="Chandigarh">Chandigarh</option>
            <option value="Punjab">Punjab</option>
            <option value="Haryana">Haryana</option>
          </select>

          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="border rounded px-3 py-2 w-1/2"
          >
            <option value="">Select City</option>
            <option value="Chandigarh">Chandigarh</option>
            <option value="Mohali">Mohali</option>
            <option value="Panchkula">Panchkula</option>
          </select>
        </div>

        {/* Permissions */}
        <div className="mb-4">
          <p className="font-semibold mb-2">Permissions</p>
          {[
            "create_order",
            "view_own_orders",
            "view_all_orders",
            "manage_users",
            "manage_stores",
            "manage_products",
            "manage_markets",
          ].map((perm) => (
            <label key={perm} className="flex items-center gap-2 mb-1">
              <input
                type="checkbox"
                checked={form.permissions.includes(perm)}
                onChange={() => togglePermission(perm)}
              />
              {perm}
            </label>
          ))}
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Create User
          </button>
        </div>
      </div>
    </div>
  );
}
