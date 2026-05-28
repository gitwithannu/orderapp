"use client";

import { useSearchParams } from "next/navigation";

export default function ThankYouPage() {
  const params = useSearchParams();
  const orderId = params.get("orderId");

  return (
    <div className="p-10 text-center">
      <h1 className="text-4xl font-bold text-green-600 mb-4">
        Thank You!
      </h1>

      <p className="text-lg text-gray-700 mb-6">
        Your order has been placed successfully.
      </p>

      <p className="text-gray-500">
        Order ID: <strong>{orderId}</strong>
      </p>

      <a
        href="/store-directory"
        className="mt-6 inline-block bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700"
      >
        Back to Store Directory
      </a>
    </div>
  );
}
