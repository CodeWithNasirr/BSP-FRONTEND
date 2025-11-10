import React, { useEffect, useState } from "react";
import axios from "axios";
import API_BASE_URL from "../config";

export default function MyUsagePanel() {
  const [usage, setUsage] = useState(null);
  const token = localStorage.getItem("authToken");

  useEffect(() => {
    const fetchUsage = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/usage-summary/`, {
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        });
        setUsage(res.data);
      } catch (err) {
        console.error("Usage load failed", err);
      }
    };
    fetchUsage();
  }, []);

  if (!usage) return <div className="p-4 text-center">Loading usage...</div>;

  return (
    <div className="max-h-screen p-6 bg-white rounded-xl shadow space-y-6">
      <h2 className="text-2xl font-bold text-center">📈 Monthly WhatsApp Usage</h2>

      <div className="text-gray-600 text-center">
        Business: <strong>{usage.client_name}</strong>
      </div>

      {usage.monthly_breakdown.map((month, idx) => (
        <div key={idx} className="border rounded-lg p-4 shadow-sm">
          <div className="flex justify-between mb-2">
            <div className="text-lg font-semibold">{month.month}</div>
            <div className="text-green-600 font-medium">
              {month.total_conversations} chats | ₹{month.total_spent}
            </div>
          </div>

          <div className="pl-4 space-y-1 text-sm text-gray-700">
            {month.types.map((t, tIdx) => (
              <div key={tIdx} className="flex justify-between">
                <div className="capitalize">{t.conversation_type}</div>
                <div>
                  {t.total_conversations} | ₹{t.total_spent}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
