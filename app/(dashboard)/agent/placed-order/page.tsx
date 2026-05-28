"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function CreateOrderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const storeId = searchParams.get("storeId");

  const [store, setStore] = useState<any>(null);
  const [products, setProducts] = useState([]);

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  const [items, setItems] = useState([
    { product: "", variantType: "", variantSize: "", quantity: 1, price: 0 },
  ]);

  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);

  // ⭐ Fetch store details
  useEffect(() => {
    if (!storeId) return;

    fetch(`/api/stores/${storeId}`)
      .then((res) => res.json())
      .then((data) => {
        setStore(data);
        setCustomerName(data.ownerName);
        setCustomerPhone(data.ownerMobile);
        setLoading(false);
      });
  }, [storeId]);

  // ⭐ Fetch products
  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) =>
        setProducts(Array.isArray(data) ? data : data.products || [])
      );
  }, []);

  // ⭐ Handle item changes
  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;

    const product = products.find((p) => p._id === updated[index].product);

    if (field === "product") {
      updated[index].variantType = "";
      updated[index].variantSize = "";
      updated[index].price = 0;
    }

    if (field === "variantType") {
      updated[index].variantSize = "";
      updated[index].price = 0;
    }

    if (field === "variantSize") {
      const variant = product?.variants.find(
        (v) =>
          v.type === updated[index].variantType &&
          v.size === updated[index].variantSize
      );
      updated[index].price = variant?.price || 0;
    }

    setItems(updated);
  };

  const addItem = () => {
    setItems([
      ...items,
      { product: "", variantType: "", variantSize: "", quantity: 1, price: 0 },
    ]);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const totalAmount = items.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0
  );

  // ⭐ Submit order
  const handleSubmit = async () => {
    if (!store) return;

    setLoading(true);

    const res = await fetch("/api/agent/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        store: store._id,
        customerName,
        customerPhone,
        items,
        notes,
        totalAmount,
      }),
    });

    setLoading(false);

    if (res.ok) {
      router.push("/agent/orders?success=1");
    }
  };

  if (loading || !store) {
    return (
      <div className="p-8 text-center text-gray-600">
        Loading store details...
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto bg-white shadow rounded p-8">
        <h1 className="text-3xl font-bold mb-6">Create Order</h1>

        {/* Store */}
        <div className="mb-4">
          <label className="block mb-1 font-medium">Store</label>
          <input
            className="w-full border p-3 rounded bg-gray-100"
            value={store.storeName}
            readOnly
          />
        </div>

        {/* Customer Info */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block mb-1 font-medium">Customer Name</label>
            <input
              className="w-full border p-3 rounded"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Customer Phone</label>
            <input
              className="w-full border p-3 rounded"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
            />
          </div>
        </div>

        {/* Order Items */}
        <h2 className="text-xl font-semibold mb-3">Order Items</h2>

        {items.map((item, index) => {
          const product = products.find((p) => p._id === item.product);
          const variantTypes = product
            ? [...new Set(product.variants.map((v) => v.type))]
            : [];

          const variantSizes = product
            ? product.variants.filter((v) => v.type === item.variantType)
            : [];

          return (
            <div
              key={index}
              className="grid grid-cols-5 gap-4 mb-4 items-center"
            >
              {/* Product */}
              <select
                className="border p-3 rounded"
                value={item.product}
                onChange={(e) =>
                  handleItemChange(index, "product", e.target.value)
                }
              >
                <option value="">Product</option>
                {products.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.product_name}
                  </option>
                ))}
              </select>

              {/* Variant Type */}
              <select
                className="border p-3 rounded"
                value={item.variantType}
                onChange={(e) =>
                  handleItemChange(index, "variantType", e.target.value)
                }
                disabled={!item.product}
              >
                <option value="">Type</option>
                {variantTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>

              {/* Variant Size */}
              <select
                className="border p-3 rounded"
                value={item.variantSize}
                onChange={(e) =>
                  handleItemChange(index, "variantSize", e.target.value)
                }
                disabled={!item.variantType}
              >
                <option value="">Size</option>
                {variantSizes.map((v) => (
                  <option key={v.size} value={v.size}>
                    {v.size}
                  </option>
                ))}
              </select>

              {/* Quantity */}
              {item.variantType === "Pouch" ? (
                <select
                  className="border p-3 rounded"
                  value={item.quantity}
                  onChange={(e) =>
                    handleItemChange(index, "quantity", Number(e.target.value))
                  }
                >
                  <option value="">Ladi</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((l) => (
                    <option key={l} value={l}>
                      {l} Ladi
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="number"
                  className="border p-3 rounded"
                  value={item.quantity}
                  onChange={(e) =>
                    handleItemChange(index, "quantity", Number(e.target.value))
                  }
                />
              )}

              {/* Price */}
              <input
                type="text"
                className="border p-3 rounded bg-gray-100"
                value={item.price}
                readOnly
              />

              {/* Remove */}
              <button
                onClick={() => removeItem(index)}
                className="px-3 py-2 bg-red-600 text-white rounded"
              >
                X
              </button>
            </div>
          );
        })}

        <button
          onClick={addItem}
          className="px-4 py-2 bg-gray-700 text-white rounded mb-6"
        >
          + Add Item
        </button>

        {/* Notes */}
        <div className="mb-4">
          <label className="block mb-1 font-medium">Notes</label>
          <textarea
            className="w-full border p-3 rounded"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          ></textarea>
        </div>

        {/* Total */}
        <div className="text-right text-xl font-bold mb-6">
          Total: ₹{totalAmount.toFixed(2)}
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700"
        >
          {loading ? "Submitting..." : "Submit Order"}
        </button>
      </div>
    </div>
  );
}
