"use client";

import { useEffect, useState } from "react";

interface Log {
  _id: string;
  reasonCode: string;
  agentNotes?: string;
  createdAt: string;
  // Updated interface to handle populated agent structure safely
  agentId?: {
    name?: string;
  };
}

interface VisitLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
  storeId: string;
  storeName: string;
}

export default function VisitLogsModal({ isOpen, onClose, storeId, storeName }: VisitLogsModalProps) {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !storeId) return;

    const fetchLogs = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/agent/store-visit?storeId=${storeId}`);
        const data = await res.json();
        if (data.success) {
          setLogs(data.logs || []);
        }
      } catch (err) {
        console.error("Failed to fetch visit logs", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [isOpen, storeId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-xl rounded-xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[85vh]">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Store Visit Logs</h3>
            <p className="text-base font-bold  text-red-900 mt-0.5">{storeName}</p>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition p-1.5 rounded-lg hover:bg-gray-100"
          >
            ✕
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs text-gray-500">Retrieving logs...</p>
            </div>
          ) : logs.length > 0 ? (
            logs.map((log) => (
              <div key={log._id} className="p-4 rounded-lg bg-gray-50 border border-gray-200/60">
                <div className="flex justify-between items-center gap-4 mb-2">
                  <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100 tracking-wide uppercase">
                    {log.reasonCode.replace("_", " ")}
                  </span>
                  
                  {/* --- DISPLAYS AGENT NAME & DATE SIDE-BY-SIDE --- */}
                  <div className="text-right flex flex-col items-end sm:flex-row sm:items-center sm:gap-2">
                    <span className="text-[11px] font-semibold text-gray-600 bg-gray-200/60 px-1.5 py-0.5 rounded">
                      Agent: {log.agentId?.name || "Unknown"}
                    </span>
                    <span className="text-[11px] text-gray-800 font-medium">
                      {new Date(log.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
                
                {log.agentNotes ? (
                  <p className="text-sm text-gray-700 italic border-l-2 border-amber-400 pl-2.5 bg-amber-50/40 py-1 rounded-r mt-2">
                    "{log.agentNotes}"
                  </p>
                ) : (
                  <p className="text-xs text-gray-400 italic mt-2">No notes provided by agent.</p>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-200">
              <p className="text-sm text-gray-500">No agent check-in history found for this store.</p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg text-sm transition"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
}