"use client";

import { useEffect, useState } from "react";

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div className="p-8 text-center">Loading products...</div>;

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto bg-white shadow rounded p-8">
        <h1 className="text-3xl font-bold mb-6">Products</h1>

        {typeof window !== "undefined" &&
          window.location.search.includes("success=1") && (
            <div className="mb-4 p-3 bg-green-100 text-green-800 rounded">
              ✅ Product added successfully!
            </div>
          )}

        {products.length === 0 ? (
          <p>No products found.</p>
        ) : (
          <table className="w-full border-collapse">
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
                  <td className="border p-3">{p.product_name}</td>
                    <td className="border p-3">
                        {p.variants
                        .map((v) => `${v.type} ${v.size} ₹${v.price}`)
                        .join(", ")}
                    </td>
                    <td className="border p-3">
                        <a
                            href={`/admin/products/${p._id}`}
                            className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            Edit
                        </a>
                    </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
