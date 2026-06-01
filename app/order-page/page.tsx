"use client";

import { useEffect, useState, Suspense } from "react"; // 1. Added Suspense
import Select from "react-select";
import { useSearchParams } from "next/navigation";

// 2. Create a separate component for the logic
function OrderFormContent() {
  const searchParams = useSearchParams();
  const storeId = searchParams.get("storeId");

  const [store, setStore] = useState<any>(null);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [quantity, setQuantity] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!selectedProduct) {
      alert("Please select a product");
      return;
    }

    const orderData = {
      storeId: store._id,
      storeName: store.storeName,
      productName: selectedProduct.value,
      quantity: Number(quantity),
      notes,
    };
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData),
    });

    const data = await res.json();

    if (res.ok) {
      window.location.href = `/thank-you?orderId=${data.orderId}`;
    }
  };

  // Fetch store details
  useEffect(() => {
    if (!storeId) return;
    fetch(`/api/stores/${storeId}`)
      .then(res => res.json())
      .then(data => {
        setStore(data);
        setLoading(false);
      });
  }, [storeId]);

  // Fetch products
  useEffect(() => {
    fetch("/api/products")
      .then(res => res.json())
      .then(data => {
        setProducts(data.products || []);
        setLoading(false);
      })
      .catch(err => console.error("Product fetch error:", err));
  }, []);

  const productOptions = products.map((p: any) => ({
    value: p.product_name,
    label: `${p.product_name} (Qty: ${p.quantity})`,
  }));

  if (loading) {
    return <div className="p-8 text-center text-gray-600">Loading store details...</div>;
  }

  if (!store) {
    return <div className="p-8 text-center text-red-600">Store not found.</div>;
  }

  return (
    <div className="p-8 w-full max-w-7xl mx-auto bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 border-b pb-3">Place Order</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Store Info */}
        <div className="bg-white shadow rounded p-6 border border-gray-200">
          <h2 className="text-xl font-semibold mb-3">Store Information</h2>
          <div className="space-y-1 text-gray-700">
            <p><strong>Store:</strong> {store.storeName}</p>
            <p><strong>Owner:</strong> {store.ownerName}</p>
            <p><strong>Mobile:</strong> {store.ownerMobile}</p>
            <p><strong>State:</strong> {store.state}</p>
            <p><strong>City:</strong> {store.city}</p>
            <p><strong>Sector:</strong> {store.sector}</p>
            <p><strong>Address:</strong> {store.address}</p>
          </div>
        </div>

        {/* Order Form */}
        <div className="bg-white shadow rounded p-6 border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Order Details</h2>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block mb-2 font-medium">Select Product</label>
              <Select
                options={productOptions}
                value={selectedProduct}
                onChange={setSelectedProduct}
                placeholder="Search or select product..."
                className="text-gray-700"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Quantity</label>
              <input
                type="number"
                className="w-full border rounded px-3 py-2"
                placeholder="Enter quantity"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Notes</label>
              <textarea
                className="w-full border rounded px-3 py-2"
                placeholder="Any special instructions"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 transition"
            >
              Submit Order
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// 3. The main export that Next.js uses
export default function OrderPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading Page...</div>}>
      <OrderFormContent />
    </Suspense>
  );
}
