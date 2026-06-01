"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FiHome,
  FiUsers,
  FiShoppingBag,
  FiFileText,
  FiSettings,
  FiLogOut,
} from "react-icons/fi";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetch("/api/me")
      .then((res) => res.json())
      .then((data) => setUser(data.user));
  }, []);

  if (!user) return null;

  const userPermissions = user.permissions || [];

  const sidebarConfig = [
    {
      heading: "MAIN",
      items: [
        {
          label: "Dashboard",
          href: `/${user.role}/dashboard`,
          icon: <FiHome size={18} />,
          permission: null,
        },
      ],
    },
    {
      heading: "ORDERS",
      items: [
        {
          label: "Create Order",
          href: "/agent/create-order",
          icon: <FiFileText size={18} />,
          permission: "create_order",
        },
        {
          label: "Create Store",
          href: "/agent/create-store",
          icon: <FiFileText size={18} />,
          permission: "create_store",
        },
        {
          label: "All Orders",
          href: "/orders",
          icon: <FiFileText size={18} />,
          permission: "view_all_orders",
        },
        {
          label: "Market Orders",
          href: "/market/orders",
          icon: <FiFileText size={18} />,
          permission: "view_market_orders",
        },
      ],
    },
    {
      heading: "MANAGEMENT",
      items: [
        {
          label: "Users",
          href: "/users",
          icon: <FiUsers size={18} />,
          permission: "manage_users",
        },
        {
          label: "Stores",
          href: "/stores",
          icon: <FiShoppingBag size={18} />,
          permission: "manage_stores",
        },
        {
          label: "Products",
          href: "/products",
          icon: <FiShoppingBag size={18} />,
          permission: "manage_products",
        },
        {
          label: "Markets",
          href: "/superadmin/markets",
          icon: <FiHome size={18} />,
          permission: "manage_markets",
        },
      ],
    },
    {
      heading: "SYSTEM",
      items: [
        {
          label: "Invoices",
          href: "/admin/invoices",
          icon: <FiFileText size={18} />,
          permission: "generate_invoice",
        },
        {
          label: "Override Status",
          href: "/superadmin/order-status",
          icon: <FiSettings size={18} />,
          permission: "override_order_status",
        },
        {
          label: "Settings",
          href: "/settings",
          icon: <FiSettings size={18} />,
          permission: null,
        },
      ],
    },
  ];

  const handleLogout = async () => {
    await fetch("/api/logout");
    router.push("/login");
  };

  return (
    <aside className="w-64 h-screen bg-gray-900 text-white flex flex-col p-4">
      <h2 className="text-xl font-bold mb-6 capitalize">{user.role} Panel</h2>

      <nav className="flex flex-col gap-6 flex-grow">
        {sidebarConfig.map((section) => (
          <div key={section.heading}>
            <p className="text-xs text-gray-400 font-semibold mb-2 px-2">
              {section.heading}
            </p>

            <div className="flex flex-col gap-1">
              {section.items.map((item) => {
                if (item.permission && !userPermissions.includes(item.permission)) {
                  return null;
                }

                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      flex items-center gap-3 p-3 rounded relative transition
                      ${isActive ? "bg-gray-800 text-white" : "text-gray-300 hover:bg-gray-800"}
                    `}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-0 h-full w-1 bg-blue-500 rounded-r"></span>
                    )}

                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <button
        onClick={handleLogout}
        className="flex items-center gap-3 p-3 rounded text-gray-300 hover:bg-red-600 hover:text-white transition"
      >
        <FiLogOut size={18} />
        <span>Logout</span>
      </button>
    </aside>
  );
}
