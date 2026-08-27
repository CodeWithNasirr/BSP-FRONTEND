import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import API_BASE_URL from "../../config";
import { toast } from "react-toastify";

// Meta WhatsApp usage & reference-cost report. Reads the pre-aggregated
// MetaUsageDaily rollup via GET /api/usage/meta/. Reference cost is Meta's
// CONFIGURED rate — for MANUAL_META customers it is informational only (they settle
// with Meta directly), so this screen never shows a GPTX wallet deduction for them.

const CATEGORY_OPTIONS = [
  { value: "", label: "All categories" },
  { value: "marketing", label: "Marketing" },
  { value: "utility", label: "Utility" },
  { value: "authentication", label: "Authentication" },
  { value: "service", label: "Service" },
];

const BILLABLE_OPTIONS = [
  { value: "", label: "Billable + Free" },
  { value: "true", label: "Billable only" },
  { value: "false", label: "Free only" },
];

const fmtMoney = (value) => {
  const n = Number(value || 0);
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};
const fmtInt = (value) => Number(value || 0).toLocaleString();
const todayISO = () => new Date().toISOString().slice(0, 10);
const daysAgoISO = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
};

const MetaUsageReport = () => {
  const token = localStorage.getItem("authToken");
  const [start, setStart] = useState(daysAgoISO(29));
  const [end, setEnd] = useState(todayISO());
  const [category, setCategory] = useState("");
  const [billable, setBillable] = useState("");
  const [currency, setCurrency] = useState("");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);

  const fetchReport = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const params = { start, end, group_by: "day,category,currency,billable" };
      if (category) params.category = category;
      if (billable) params.billable = billable;
      if (currency) params.currency = currency;
      const res = await axios.get(`${API_BASE_URL}/api/usage/meta/`, {
        headers: { Authorization: `Token ${token}`, "Content-Type": "application/json" },
        params,
      });
      setReport(res.data || null);
    } catch (error) {
      const msg = error?.response?.data?.error || "Failed to load Meta usage report";
      toast.error(msg);
      setReport(null);
    } finally {
      setLoading(false);
    }
  }, [token, start, end, category, billable, currency]);

  // Initial load only; filters apply via the Apply button (avoids a request per keystroke).
  useEffect(() => { fetchReport(); /* eslint-disable-next-line */ }, []);

  const totals = report?.totals || {};
  const refByCurrency = totals.reference_cost_by_currency || {};
  const isManualMeta = (report?.billing_mode || "MANUAL_META") === "MANUAL_META";
  const breakdown = report?.breakdown || [];

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">📊 Meta WhatsApp Usage</h2>
          <p className="text-xs sm:text-sm text-gray-500">
            Message volume &amp; configured Meta reference cost{" "}
            {report && (
              <span className="text-gray-400">
                · {report.range?.start} → {report.range?.end}
              </span>
            )}
          </p>
        </div>
        {report && (
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
              isManualMeta
                ? "bg-emerald-100 text-emerald-700"
                : "bg-blue-100 text-blue-700"
            }`}
          >
            Billing mode: {report.billing_mode}
          </span>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 sm:p-4 mb-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <label className="flex flex-col text-xs text-gray-600">
            From
            <input type="date" value={start} max={end} onChange={(e) => setStart(e.target.value)}
              className="mt-1 p-1.5 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </label>
          <label className="flex flex-col text-xs text-gray-600">
            To
            <input type="date" value={end} min={start} max={todayISO()} onChange={(e) => setEnd(e.target.value)}
              className="mt-1 p-1.5 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </label>
          <label className="flex flex-col text-xs text-gray-600">
            Category
            <select value={category} onChange={(e) => setCategory(e.target.value)}
              className="mt-1 p-1.5 border rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              {CATEGORY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </label>
          <label className="flex flex-col text-xs text-gray-600">
            Type
            <select value={billable} onChange={(e) => setBillable(e.target.value)}
              className="mt-1 p-1.5 border rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              {BILLABLE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </label>
          <label className="flex flex-col text-xs text-gray-600">
            Currency
            <input type="text" value={currency} placeholder="e.g. INR"
              onChange={(e) => setCurrency(e.target.value.toUpperCase())}
              className="mt-1 p-1.5 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </label>
          <div className="flex items-end">
            <button onClick={fetchReport} disabled={loading}
              className="w-full px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm font-medium">
              {loading ? "Loading…" : "Apply"}
            </button>
          </div>
        </div>
      </div>

      {loading && !report ? (
        <div className="p-8 text-center text-gray-500 text-sm">Loading usage…</div>
      ) : !report ? (
        <div className="p-8 text-center text-gray-500 text-sm">No usage data available.</div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
              <p className="text-xs text-gray-500">Total messages</p>
              <p className="text-2xl font-bold text-gray-800">{fmtInt(totals.message_count)}</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
              <p className="text-xs text-gray-500">Billable</p>
              <p className="text-2xl font-bold text-blue-600">{fmtInt(totals.billable_count)}</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
              <p className="text-xs text-gray-500">Free</p>
              <p className="text-2xl font-bold text-emerald-600">{fmtInt(totals.free_count)}</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
              <p className="text-xs text-gray-500">Reference Meta cost</p>
              {Object.keys(refByCurrency).length === 0 ? (
                <p className="text-2xl font-bold text-gray-400">—</p>
              ) : (
                <div className="space-y-0.5">
                  {Object.entries(refByCurrency).map(([cur, amt]) => (
                    <p key={cur} className="text-xl font-bold text-gray-800">
                      {cur} {fmtMoney(amt)}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Reference-cost disclaimer */}
          <div
            className={`rounded-lg p-3 mb-4 text-xs sm:text-sm border ${
              totals.wallet_charged
                ? "bg-blue-50 border-blue-200 text-blue-700"
                : "bg-amber-50 border-amber-200 text-amber-800"
            }`}
          >
            {totals.wallet_charged
              ? "Wallet billing is active for this account — the reference cost above reflects charges applied to your GPTX wallet."
              : "Reference cost is Meta's configured rate and is informational only. It is NOT charged to your GPTX wallet — you settle these Meta charges directly on your Meta WhatsApp Business account."}
          </div>

          {/* Per-currency breakdown */}
          {report.by_currency?.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">By currency</h3>
              <div className="flex flex-wrap gap-4">
                {report.by_currency.map((c) => (
                  <div key={c.currency} className="text-sm">
                    <span className="font-medium text-gray-800">{c.currency || "—"}</span>
                    <span className="text-gray-500"> · {fmtInt(c.message_count)} msgs · </span>
                    <span className="font-semibold">{c.currency} {fmtMoney(c.total_reference_cost)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Detailed breakdown table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Daily breakdown</h3>
            {breakdown.length === 0 ? (
              <p className="text-center text-sm text-gray-500 py-4">No usage in this range.</p>
            ) : (
              <div className="overflow-x-auto max-h-[480px] overflow-y-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead className="sticky top-0 bg-gray-50">
                    <tr>
                      <th className="p-2 font-medium text-gray-600">Day</th>
                      <th className="p-2 font-medium text-gray-600">Category</th>
                      <th className="p-2 font-medium text-gray-600">Type</th>
                      <th className="p-2 font-medium text-gray-600">Currency</th>
                      <th className="p-2 font-medium text-gray-600 text-right">Messages</th>
                      <th className="p-2 font-medium text-gray-600 text-right">Reference cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {breakdown.map((row, idx) => (
                      <tr key={idx} className="border-b hover:bg-gray-50">
                        <td className="p-2 text-gray-700">{row.day || "—"}</td>
                        <td className="p-2 text-gray-700 capitalize">{row.category || "—"}</td>
                        <td className="p-2">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs ${
                              row.billable
                                ? "bg-blue-100 text-blue-700"
                                : "bg-emerald-100 text-emerald-700"
                            }`}
                          >
                            {row.billable ? "Billable" : "Free"}
                          </span>
                        </td>
                        <td className="p-2 text-gray-700">{row.currency || "—"}</td>
                        <td className="p-2 text-gray-700 text-right">{fmtInt(row.message_count)}</td>
                        <td className="p-2 text-gray-800 text-right font-medium">
                          {row.currency} {fmtMoney(row.total_reference_cost)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default MetaUsageReport;
