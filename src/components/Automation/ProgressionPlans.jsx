import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { TrendingUp, Plus, RefreshCw, ArrowLeft, ChevronRight } from "lucide-react";
import { progressionApi } from "./api";
import CreateProgressionPlan from "./CreateProgressionPlan";

const stateBadge = (s) => ({
  ACTIVE: "bg-green-500/15 text-green-500",
  PAUSED: "bg-amber-500/15 text-amber-500",
  COMPLETED: "bg-blue-500/15 text-blue-500",
  EXPIRED: "bg-red-500/15 text-red-500",
  CANCELLED: "bg-gray-500/15 text-gray-400",
  DRAFT: "bg-gray-500/15 text-gray-400",
}[s] || "bg-gray-500/15 text-gray-400");

/**
 * List of Progression Plans (Quality Conversation Planner). Create new plans and
 * open any plan's live progress view.
 */
export default function ProgressionPlans() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await progressionApi.list();
      setPlans(res.data?.data || []);
    } catch (e) {
      toast.error("Failed to load progression plans");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0b1120] p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <button onClick={() => navigate("/automation")}
              className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 mb-1">
              <ArrowLeft size={13} /> Automation
            </button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="text-green-500" size={24} /> Growth Plans
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Quality-conversation plans toward a higher messaging limit.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={load}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
              <RefreshCw size={15} /> Refresh
            </button>
            <button onClick={() => setCreating(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-green-600 text-white hover:bg-green-700">
              <Plus size={16} /> New plan
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-10 text-center text-gray-400">Loading…</div>
        ) : plans.length === 0 ? (
          <div className="rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-10 text-center">
            <TrendingUp className="mx-auto text-gray-300 dark:text-gray-700 mb-3" size={32} />
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
              No growth plans yet. Create one to hold a controlled number of quality
              conversations over several days toward your target limit.
            </p>
            <button onClick={() => setCreating(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-green-600 text-white hover:bg-green-700">
              <Plus size={16} /> Create your first plan
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {plans.map((p) => (
              <button key={p.id} onClick={() => navigate(`/automation/progression/${p.id}`)}
                className="w-full text-left rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 hover:border-green-500/40 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-semibold text-gray-900 dark:text-white truncate">
                      {p.name || `${p.current_limit.toLocaleString()} → ${p.target_limit.toLocaleString()}`}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${stateBadge(p.state)}`}>
                      {p.state}
                    </span>
                  </div>
                  <ChevronRight size={16} className="text-gray-400 shrink-0" />
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-1.5">
                  <span>{p.current_limit.toLocaleString()} → {p.target_limit.toLocaleString()} · {p.planning_days} days</span>
                  <span>{p.completed_conversations} / {p.quality_conversations_needed} conversations</span>
                </div>
                <Progress value={(p.progress_pct || 0) / 100} />
              </button>
            ))}
          </div>
        )}
      </div>

      {creating && (
        <CreateProgressionPlan
          onClose={() => setCreating(false)}
          onCreated={(plan) => {
            setCreating(false);
            if (plan?.id) navigate(`/automation/progression/${plan.id}`);
            else load();
          }}
        />
      )}
    </div>
  );
}

function Progress({ value = 0 }) {
  const w = Math.max(0, Math.min(100, Math.round((value || 0) * 100)));
  return (
    <div className="h-1.5 w-full rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
      <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${w}%` }} />
    </div>
  );
}
