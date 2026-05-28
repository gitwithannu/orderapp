"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id;

  const [productName, setProductName] = useState("");
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);

  const boxSizes = ["50G", "100G", "200G"];
  const pouchSizes = ["5G", "10G"];

  // Fetch product details
  useEffect(() => {
    fetch(`/api/products/${productId}`)
      .then((res) => res.json())
      .then((data) => {
        setProductName(data.product.product_name);
        setVariants(data.product.variants);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Product fetch error:", err);
        setLoading(false);
      });
  }, [productId]);

  const handleVariantChange = (index, field, value) => {
    const updated = [...variants];
    updated[index][field] = value;

    if (field === "type") {
      updated[index].size = "";
    }

    setVariants(updated);
  };

  const addVariant = () => {
    setVariants([...variants, { type: "", size: "", price: "" }]);
  };

  const removeVariant = (index) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    const res = await fetch(`/api/products/${productId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        product_name: productName,
        variants,
      }),
    });

    if (res.ok) {
      router.push("/admin/products?updated=1");
    }
  };

  if (loading) return <div className="p-8 text-center">Loading product...</div>;

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto bg-white shadow rounded p-8">
        <h1 className="text-3xl font-bold mb-6">Edit Product</h1>

        {/* Product Name */}
        <div className="mb-4">
          <label className="block mb-1 font-medium">Product Name</label>
          <input
            className="w-full border p-3 rounded"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
          />
        </div>

        {/* Variants */}
        <h2 className="text-xl font-semibold mb-3">Variants</h2>

        {variants.map((v, index) => (
          <div
            key={index}
            className="grid grid-cols-4 gap-4 mb-4 items-center"
          >
            {/* Type */}
            <select
              className="border p-3 rounded"
              value={v.type}
              onChange={(e) =>
                handleVariantChange(index, "type", e.target.value)
              }
            >
              <option value="">Type</option>
              <option value="Box">Box</option>
              <option value="Pouch">Pouch</option>
            </select>

            {/* Size */}
            <select
              className="border p-3 rounded"
              value={v.size}
              onChange={(e) =>
                handleVariantChange(index, "size", e.target.value)
              }
              disabled={!v.type}
            >
              <option value="">Size</option>

              {v.type === "Box" &&
                boxSizes.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}

              {v.type === "Pouch" &&
                pouchSizes.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
            </select>

            {/* Price */}
            <input
              type="number"
              className="border p-3 rounded"
              placeholder="Price"
              value={v.price}
              onChange={(e) =>
                handleVariantChange(index, "price", e.target.value)
              }
            />

            {/* Remove */}
            <button
              onClick={() => removeVariant(index)}
              className="px-3 py-2 bg-red-600 text-white rounded"
            >
              X
            </button>
          </div>
        ))}

        <button
          onClick={addVariant}
          className="px-4 py-2 bg-gray-700 text-white rounded mb-6"
        >
          + Add Variant
        </button>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}
