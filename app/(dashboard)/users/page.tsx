"use client";

import { useEffect, useState } from "react";
import PermissionGate from "@/components/PermissionGate";
import CreateUserModal from "@/components/CreateUserModal";
import EditUserModal from "@/components/EditUserModal"
import type { User } from "@/types";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<keyof User>("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [openModal, setOpenModal] = useState(false);          

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    fetch("/api/users")
      .then((res) => res.json())
      .then((data) => setUsers(data.users));
  }, []);

  const filteredUsers = users
    .filter((u) =>
      `${u.name} ${u.email} ${u.role}`
        .toLowerCase()
        .includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const fieldA = (a[sortField]?.toString()|| "").toLowerCase();
      const fieldB = (b[sortField]?.toString()|| "").toLowerCase();

      if (fieldA < fieldB) return sortOrder === "asc" ? -1 : 1;
      if (fieldA > fieldB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    const refreshUsers = () => {
  fetch("/api/users")
    .then((res) => res.json())
    .then((data) => setUsers(data.users));
};

  const handleSort = (field: keyof User) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

 const handleDelete = async(id:string) =>{
  const res = await fetch('/api/users',{
    method: 'DELETE',
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),

  })
  if (res.ok) {
    setUsers(users.filter((u) => u._id !== id));
  }
 }

  return (
    <PermissionGate permission="manage_users">
      <div className="p-8 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold mb-6 text-gray-800">
            User Management
          </h1>

          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => setOpenModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              + Create User
            </button>

            <input
              type="text"
              placeholder="Search users..."
              className="border p-3 rounded w-1/3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b text-gray-700">
                  <th
                    className="p-4 cursor-pointer select-none"
                    onClick={() => handleSort("name")}
                  >
                    Name
                  </th>
                  <th
                    className="p-4 cursor-pointer select-none"
                    onClick={() => handleSort("email")}
                  >
                    Email
                  </th>
                  <th
                    className="p-4 cursor-pointer select-none"
                    onClick={() => handleSort("role")}
                  >
                    Role
                  </th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="border-b hover:bg-gray-50">
                    <td className="p-4">{user.name}</td>
                    <td className="p-4">{user.email}</td>
                    <td className="p-4 capitalize">
                      <span
                        className={`px-2 py-1 rounded text-sm font-medium ${
                          user.role === "superadmin"
                            ? "bg-red-100 text-red-700"
                            : user.role === "admin"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <button 
                      onClick={() => {
                          setSelectedUser(user);
                          setEditModalOpen(true);
                        }}                      
                      className="px-3 py-1 bg-blue-600 text-white rounded mr-2 hover:bg-blue-700 transition">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(user._id)}
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredUsers.length === 0 && (
                  <tr>
                    <td className="p-6 text-center text-gray-500" colSpan={4}>
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <CreateUserModal
          isOpen={openModal}
          onClose={() => setOpenModal(false)}
          onCreated={() => {
            fetch("/api/users")
              .then((res) => res.json())
              .then((data) => setUsers(data.users));
          }}
        />

      <EditUserModal
        isOpen={editModalOpen}
        user={selectedUser}
        onClose={() => setEditModalOpen(false)}
        onUpdated={refreshUsers}
      />


      </div>
    </PermissionGate>
  );
}
