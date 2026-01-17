import React, { useEffect, useState } from "react";
import axios from "axios";
import API_BASE_URL from "../config";

export default function MyUsagePanel() {
  const [usage, setUsage] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const token = localStorage.getItem("authToken");

  const headers = {
    Authorization: `Token ${token}`,
    "Content-Type": "application/json",
  };

  const fetchUsage = async () => {
    const res = await axios.get(
      `${API_BASE_URL}/api/usage-summary/`,
      { headers }
    );
    setUsage(res.data);
  };

  const syncUsage = async () => {
    try {
      setSyncing(true);
      await axios.post(
        `${API_BASE_URL}/api/usage-sync/`,
        {},
        { headers }
      );
      await fetchUsage();
    } catch (err) {
      console.error("Sync failed", err);
      alert("Sync failed. Check Meta token.");
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetchUsage();
  }, []);

  if (!usage) {
    return <div className="p-6 text-center">Loading usage…</div>;
  }

  return (
    <div className="max-h-screen p-6 bg-white rounded-xl shadow space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">📈 Monthly WhatsApp Usage</h2>
        <button
          onClick={syncUsage}
          disabled={syncing}
          className={`px-4 py-2 rounded-lg text-white ${
            syncing ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {syncing ? "Syncing…" : "Sync Latest Usage"}
        </button>
      </div>

      <div className="text-gray-600">
        Business: <strong>{usage.client_name}</strong>
      </div>

      {usage.monthly_breakdown.map((month, idx) => (
        <div key={idx} className="border rounded-lg p-4 shadow-sm">
          <div className="flex justify-between mb-2">
            <div className="text-lg font-semibold">{month.month}</div>
            <div className="text-green-600 font-medium">
              {month.total_conversations} chats | ₹
              {month.total_spent.toFixed(2)}
            </div>
          </div>

          <div className="pl-4 space-y-1 text-sm text-gray-700">
            {month.types.map((t, i) => (
              <div key={i} className="flex justify-between">
                <div className="capitalize">
                  {t.conversation_type.replace("_", " ")}
                </div>
                <div>
                  {t.total_conversations} | ₹
                  {t.total_spent.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
