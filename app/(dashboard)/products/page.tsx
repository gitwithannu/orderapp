"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getUser } from "@/utils/getUser"; // your JWT decode helper
// 1. Define the Shapes of your data
interface Variant {
  type: string;
  size: string;
  price: number;
}

interface Product {
  _id: string;
  product_name: string;
  variants: Variant[];
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const user = getUser(); // contains role + permissions

  console.log('============ user permission =============',user)
  const permissions = user?.permissions || [];

const canAdd = permissions.includes("manage_products");
const canEdit = permissions.includes("manage_products");
const canDelete = permissions.includes("manage_products");


  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.products || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Product fetch error:", err);
        setLoading(false);
      });
  }, []);

  async function handleDelete(id:string) {
  if (!confirm("Are you sure you want to delete this product?")) return;

  const res = await fetch(`/api/products/${id}`, {
    method: "DELETE",
  });

  if (res.ok) {
    // Remove deleted product from UI
    setProducts(prev => prev.filter(p => p._id !== id));
  }
}


  if (loading) return <div className="p-8 text-center">Loading products...</div>;

  return (
    <div className="p-1 md:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-md p-4 md:p-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
          <h1 className="md:text-3xl font-bold mb-2 sm:mb-6 text-gray-800">Products</h1>

          {canAdd && (
            <Link
              href="/products/add"
              className="p-1 sm:px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              + Add Product
            </Link>
          )}
        </div>

        {products.length === 0 ? (
          <p>No products found.</p>
        ) : (
          <div className="w-full overflow-x-auto border rounded-md">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-3 text-left">Product Name</th>
                <th className="border p-3 text-left">Variants</th>
                <th className="border p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id}>
                  <td className="border p-3 w-10">{p.product_name}</td>

                  <td className="border p-3">
                    {p.variants
                      .map((v) => `${v.type} ${v.size} ₹${v.price}`)
                      .join(", ")}
                  </td>

                  <td className="border p-3 space-x-2">
                    {canEdit && (
                      <Link
                        href={`/admin/products/${p._id}`}
                        className="px-3 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                      >
                        Edit
                      </Link>
                    )}

                    {canDelete && (
                      <button
                        onClick={() => handleDelete(p._id)}
                        className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Delete
                      </button>
                    )}

                    {!canEdit && !canDelete && (
                      <span className="text-gray-400">No actions allowed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>
    </div>
  );
}

// Delete handler
