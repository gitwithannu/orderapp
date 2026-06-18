"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// Standard list of reasons why an order wasn't placed
const NO_ORDER_REASONS = [
  { code: "OVERSTOCKED", label: "Overstocked (Owner has enough inventory)" },
  { code: "PRICE_DISAGREEMENT", label: "Price Disagreement / Wants discount" },
  { code: "OWNER_ABSENT", label: "Owner Absent / Decision maker away" },
  { code: "SHOWING_INTEREST", label: "Showing Interest, we have to visit again" },
  { code: "OWNER_BUSY", label: "Owner Busy, we have to visit again" },
  { code: "NOT_SHOWING_INTEREST", label: "Owner Not Showing Interest, we have to visit again" },
  { code: "COMPETITOR_SWITCHED", label: "Switched to a competitor product" },
  { code: "TEMPORARILY_CLOSED", label: "Store was temporarily closed" },
  { code: "OTHER", label: "Other (Specify in notes below)" },
];

function OrderForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const storeId = searchParams.get("storeId");

  const [store, setStore] = useState<any>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);

  // New States for No-Order tracking & GPS
  const [isNoOrder, setIsNoOrder] = useState(false);
  const [reasonCode, setReasonCode] = useState("");
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);

  // Voice Recognition States
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
        setNotes((prev) => (prev ? `${prev} ${transcript}` : transcript));
      };

      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
    }
  }, []);

  // Capture Agent's GPS position on component load
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoordinates({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error fetching GPS location:", error.message);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, []);

  // Fetch store details
  useEffect(() => {
    if (!storeId) return;

    fetch(`/api/stores/${storeId}`)
      .then((res) => res.json())
      .then((data) => {
        setStore(data);
        setCustomerName(data.ownerName || "");
        setCustomerPhone(data.ownerMobile || "");
        setLoading(false);
      })
      .catch((err) => console.error("Failed to load store metadata", err));
  }, [storeId]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Voice typing is not supported on your current browser. Please try Google Chrome.");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.lang = voiceLang;
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  // Unified Handler for standard Order OR a No-Order Visit Log
  const handleSubmit = async () => {
    if (!store) return;
    
    if (isNoOrder && !reasonCode) {
      alert("Please select a reason for logging a No-Order visit.");
      return;
    }

    setLoading(true);

    // Determine target API and payload based on toggle state
    const targetUrl = "/api/agent/store-visit" ;
    const payload =  {
          storeId: store._id,
          customerName,
          customerPhone,
          reasonCode,
          agentNotes: notes,
          latitude: coordinates?.lat,
          longitude: coordinates?.lng,
        }
    

    const res = await fetch(targetUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setLoading(false);

    if (res.ok) {
      router.push(isNoOrder ? "/agent/visits?success=1" : "/agent/orders?success=1");
    } else {
      alert("Something went wrong during submission. Please try again.");
    }
  };

  if (loading || !store) {
    return <div className="p-8 text-center text-gray-600">Loading store details...</div>;
  }

  return (
    <div className="p-4 sm:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto bg-white shadow rounded-lg p-6 sm:p-8">
        
        {/* Header Block */}
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center mb-6 border-b pb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Visit Store</h1>
            <p className="text-xs text-gray-500 mt-1">
              {coordinates ? "📍 GPS Location Captured" : "⚠️ Fetching GPS Coordinates..."}
            </p>
          </div>
          
          {/* Voice Input Language Selector */}
          <div className="flex items-center gap-2 bg-gray-100 p-1.5 rounded-lg border self-start sm:self-auto">
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



        {/* Store Detail (Read Only) */}
        <div className="mb-4">
          <label className="block mb-1 font-medium text-sm text-gray-700">Store Name</label>
          <input
            className="w-full border p-3 rounded bg-gray-100 font-medium text-gray-800"
            value={store.storeName}
            readOnly
          />
        </div>

        {/* Standard Workflow Fields (Hidden if No-Order is toggled active) */}
        {
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block mb-1 font-medium text-sm text-gray-700">Customer Name</label>
              <input
                className="w-full border p-3 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>

            <div>
              <label className="block mb-1 font-medium text-sm text-gray-700">Customer Phone</label>
              <input
                className="w-full border p-3 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
              />
            </div>
 
          </div>
          
        }
        {
         <div>
          <div className="mb-4 animate-fadeIn">
            <label className="block mb-1 font-semibold text-sm text-amber-900">Reason for No Order *</label>
            <select
              value={reasonCode}
              onChange={(e) => setReasonCode(e.target.value)}
              className="w-full border-2 border-amber-300 p-3 rounded bg-white focus:ring-2 focus:ring-amber-500 outline-none"
            >
              <option value="">-- Choose Reason Code --</option>
              {NO_ORDER_REASONS.map((r) => (
                <option key={r.code} value={r.code}>{r.label}</option>
              ))}
            </select>
          </div>
         </div>
        }

        {/* Notes Block with Integrated Voice Recognition Feature */}
        <div className="mb-6">
          <label className="block mb-1 font-medium text-sm text-gray-700">
            {"Visit Feedback Notes" }
          </label>
          <div className="relative">
            <textarea
              className="w-full border p-3 pr-28 pb-12 rounded focus:ring-2 focus:ring-blue-500 outline-none resize-none break-words min-h-[120px]"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={ "Provide any optional notes detailing the visit..." }
            ></textarea>
            
            <div className="absolute bottom-3 right-3 flex items-center gap-2 bg-white/80 p-1 rounded-md backdrop-blur-xs">
              {notes && (
                <button
                  type="button"
                  onClick={() => setNotes("")}
                  className="px-2.5 py-1 text-xs font-semibold bg-gray-200 hover:bg-gray-300 text-gray-600 rounded transition active:scale-95"
                >
                  Clear
                </button>
              )}
              <button
                type="button"
                onClick={toggleListening}
                className={`p-2 rounded-full transition ${isListening ? "bg-red-500 text-white animate-pulse" : "bg-gray-100 hover:bg-gray-200 text-gray-600"}`}
                title="Speak text into notes field"
              >
                🎙️
              </button>
            </div>
          </div>
        </div>

        {/* Submit Operations Action */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`w-full text-white py-3 rounded font-medium transition disabled:bg-gray-400 ${ "bg-amber-600 hover:bg-amber-700" }`}
        >
          {loading ? "Submitting..." :  "Log Visit Without Order" }
        </button>
      </div>
    </div>
  );
}

export default function CreateOrderPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-600">Loading interface...</div>}>
      <OrderForm />
    </Suspense>
  );
}