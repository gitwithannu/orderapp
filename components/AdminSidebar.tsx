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
  FiChevronDown,
} from "react-icons/fi";

// Create an isolated sub-menu rendering component
function SidebarItem({ item, userPermissions, pathname }: { item: any; userPermissions: string[]; pathname: string }) {
  const [isOpen, setIsOpen] = useState(false);

  // 1. Permission Guard
  if (item.permission && !userPermissions.includes(item.permission)) {
    return null;
  }

  const hasChildren = item.children && item.children.length > 0;
  const isActive = pathname === item.href;
  
  // Auto-open menu if a child path is currently active
  const isChildActive = hasChildren && item.children.some((child: any) => pathname === child.href);
  
  // Use a quick hook rule effect to initialize open states on page refresh
  useEffect(() => {
    if (isChildActive) setIsOpen(true);
  }, [isChildActive]);

  if (hasChildren) {
    return (
      <div className="w-full">
        {/* Main Parent Row */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`
            w-full flex items-center justify-between p-3 rounded text-left transition text-gray-300 hover:bg-gray-800
            ${isChildActive ? "bg-gray-800/50 text-white" : ""}
          `}
        >
          <div className="flex items-center gap-3">
            {item.icon}
            <span>{item.label}</span>
          </div>
          <FiChevronDown
            size={16}
            className={`transform transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          />
        </button>

        {/* Collapsible Children Container */}
        {isOpen && (
          <div className="mt-1 pl-6 flex flex-col gap-1 border-l border-gray-700 ml-5">
            {item.children.map((child: any) => {
              if (child.permission && !userPermissions.includes(child.permission)) {
                return null;
              }

              const isChildCurrent = pathname === child.href;

              return (
                <Link
                  key={child.href}
                  href={child.href}
                  className={`
                    flex items-center gap-3 p-2 rounded text-sm transition relative
                    ${isChildCurrent ? "text-blue-400 font-medium" : "text-gray-400 hover:text-white hover:bg-gray-800"}
                  `}
                >
                  {isChildCurrent && (
                    <span className="absolute -left-6 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-blue-500"></span>
                  )}
                  <span>{child.label}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Standard Standalone Link (no children)
  return (
    <Link
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
}

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
          label: "Orders",
          href: "/orders",
          icon: <FiFileText size={18} />,
          permission: "view_all_orders",
          // --- NEW SUB-MENU CHILDREN CONFIGURED HERE ---
          children: [
            {
              label: "All Order",
              href: "/orders",
              permission: "view_all_orders", // Uses same view permission or specify a distinct one
            },
            {
              label: "Track Store",
              href: "/orders/track-store",
              permission: "view_all_orders", // Uses same view permission or specify a distinct one
            },
            {
              label: "Monitor Agents",
              href: "/orders/monitor-agents",
              permission: "view_all_orders",
            },
          ],
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
          label: "Create Store",
          href: "/agent/create-store",
          icon: <FiFileText size={18} />,
          permission: "create_store",
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

      <nav className="flex flex-col gap-6 flex-grow overflow-y-auto">
        {sidebarConfig.map((section) => (
          <div key={section.heading}>
            <p className="text-xs text-gray-400 font-semibold mb-2 px-2">
              {section.heading}
            </p>

            <div className="flex flex-col gap-1">
              {section.items.map((item) => (
                <SidebarItem 
                  key={item.label + item.href} 
                  item={item} 
                  userPermissions={userPermissions} 
                  pathname={pathname}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      <button
        onClick={handleLogout}
        className="flex items-center gap-3 p-3 rounded text-gray-300 hover:bg-red-600 hover:text-white transition mt-auto"
      >
        <FiLogOut size={18} />
        <span>Logout</span>
      </button>
    </aside>
  );
}
