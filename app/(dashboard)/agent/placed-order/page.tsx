"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// --- Interfaces ---
interface Variant { type: string; size: string; price: number; }
interface Product { _id: string; product_name: string; variants: Variant[]; }
interface OrderItem { product: string; variantType: string; variantSize: string; quantity: number; price: number; }

// Main Form Component
function OrderForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const storeId = searchParams.get("storeId");

  const [store, setStore] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [items, setItems] = useState<OrderItem[]>([
    { product: "", variantType: "", variantSize: "", quantity: 1, price: 0 },
  ]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);

  // ⭐ Voice Recognition States (Only for Notes)
  const [voiceLang, setVoiceLang] = useState<"en-US" | "hi-IN">("en-US");
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition Engine
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        // Append speech naturally into your notes textarea
        setNotes((prev) => (prev ? `${prev} ${transcript}` : transcript));
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Voice typing is not supported on your current browser. Please try Google Chrome.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.lang = voiceLang;
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

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
  const handleItemChange = (index: number, field: keyof OrderItem, value: any) => {
    const updated = [...items];
    (updated[index] as any)[field] = value;

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

  const removeItem = (index: number) => {
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
    return <div className="p-8 text-center text-gray-600">Loading store details...</div>;
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto bg-white shadow rounded p-8">
        
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Create Order</h1>
          
          {/* --- Voice Input Language Selection Selector --- */}
          <div className="flex items-center gap-2 bg-gray-100 p-1.5 rounded-lg border">
            <span className="text-xs font-bold px-2 text-gray-500 uppercase">Voice Lang:</span>
            <button
              type="button"
              onClick={() => setVoiceLang("en-US")}
              className={`px-3 py-1 text-xs font-medium rounded-md transition ${voiceLang === "en-US" ? "bg-blue-600 text-white shadow" : "text-gray-600 hover:bg-gray-200"}`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setVoiceLang("hi-IN")}
              className={`px-3 py-1 text-xs font-medium rounded-md transition ${voiceLang === "hi-IN" ? "bg-blue-600 text-white shadow" : "text-gray-600 hover:bg-gray-200"}`}
            >
              हिन्दी
            </button>
          </div>
        </div>

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
            <div key={index} className="grid grid-cols-5 gap-4 mb-4 items-center">
              {/* Product */}
              <select
                className="border p-3 rounded"
                value={item.product}
                onChange={(e) => handleItemChange(index, "product", e.target.value)}
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
                onChange={(e) => handleItemChange(index, "variantType", e.target.value)}
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
                onChange={(e) => handleItemChange(index, "variantSize", e.target.value)}
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
                  onChange={(e) => handleItemChange(index, "quantity", Number(e.target.value))}
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
                  onChange={(e) => handleItemChange(index, "quantity", Number(e.target.value))}
                />
              )}

              {/* Price */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  className="border p-3 rounded bg-gray-100 w-full"
                  value={item.price}
                  readOnly
                />
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="px-3 py-2 bg-red-600 text-white rounded"
                >
                  X
                </button>
              </div>
            </div>
          );
        })}

        <button
          type="button"
          onClick={addItem}
          className="px-4 py-2 bg-gray-700 text-white rounded mb-6"
        >
          + Add Item
        </button>

        {/* Notes - ⭐ Voice Input Setup exclusively handled here */}
        <div className="mb-4">
          <label className="block mb-1 font-medium">Notes</label>
          <div className="relative">
            <textarea
              className="w-full border p-3 pr-12 rounded focus:ring-2 focus:ring-blue-500 outline-none"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Type notes or click microphone to use voice..."
            ></textarea>
            <button
              type="button"
              onClick={toggleListening}
              className={`absolute right-3 bottom-4 p-2 rounded-full transition ${isListening ? "bg-red-500 text-white animate-pulse" : "bg-gray-100 hover:bg-gray-200 text-gray-600"}`}
              title="Speak text into notes field"
            >
              🎙️
            </button>
          </div>
        </div>

        {/* Total */}
        <div className="text-right text-xl font-bold mb-6">
          Total: ₹{totalAmount.toFixed(2)}
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 disabled:bg-gray-400 transition"
        >
          {loading ? "Submitting..." : "Submit Order"}
        </button>
      </div>
    </div>
  );
}

// Default export wrapper handling next.js optimization safety bounds
export default function CreateOrderPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading interface...</div>}>
      <OrderForm />
    </Suspense>
  );
}
