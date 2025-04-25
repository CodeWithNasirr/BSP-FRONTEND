import React, { useEffect, useState } from "react";
import axios from "axios";
import API_BASE_URL from "../config";
export default function MyUsagePanel() {
  const [usage, setUsage] = useState(null);
  const token = localStorage.getItem("authToken")
  useEffect(() => {
    const fetchUsage = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/my-usage-summary/`,{
          headers: {
            Authorization: `Token ${token}`,
            'Content-Type': 'application/json',
          },
        })
        setUsage(res.data);
      } catch (err) {
        console.error("Usage load failed", err);
      } 
    };
    fetchUsage();
  }, []);

  if (!usage) return <div className="p-4 text-center">Loading usage...</div>;

  return (
    <div className="p-6 bg-white rounded-xl shadow space-y-4">
      <h2 className="text-2xl font-bold text-center">📈 My WhatsApp Usage</h2>

      <div className="text-gray-600 text-center">Business: <strong>{usage.client_name}</strong></div>
      <div className="text-lg font-semibold text-green-600">
        💰 Total Spent: ₹{usage.total_spent}
      </div>

      <div className="border-t pt-4 space-y-2">
        {usage.breakdown.map((item, idx) => (
          <div key={idx} className="flex justify-between border-b pb-2">
            <div className="capitalize">{item.conversation_type} Conversations</div>
            <div>
              {item.total_conversations} total | ₹{item.total_cost}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
