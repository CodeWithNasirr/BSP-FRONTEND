// ─────────────────────────────────────────────────────────────────────────────
// Campaigns.jsx — Premium UI replacement
// All existing API calls, state, routing, pagination preserved
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../../config";
import { toast } from 'react-toastify';
import RequireSubscription from "../Subscriptions/RequireSubscription";
import { Megaphone, Plus, ChevronLeft, ChevronRight, TrendingUp, CheckCircle, Clock, Search } from "lucide-react";
import { Card, Button, Badge, EmptyState, Skeleton } from "../ui";

function Campaigns() {
  const navigate = useNavigate();
  const token = localStorage.getItem("authToken");
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ next: null, previous: null, count: 0 });

  const fetchCampaigns = async (pageNum) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/campaigns/?page=${pageNum}`, {
        headers: { Authorization: `Token ${token}`, 'Content-Type': 'application/json' },
      });
      const { results, next, previous, count } = response.data;
      console.log("Fetched campaigns:", results);
      setCampaigns(results);
      setPagination({ next, previous, count });
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to fetch campaigns");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCampaigns(page); }, [page, token]);

  const filtered = campaigns.filter(c =>
    c.campaigns_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.template_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <RequireSubscription>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-24 lg:pb-6">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="text-base font-semibold text-gray-900 dark:text-white">Campaigns</h1>
              <p className="text-xs text-gray-500 mt-0.5">{pagination.count} total campaigns</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative hidden sm:block">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search campaigns..."
                  className="pl-8 pr-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 w-48"
                />
              </div>
              <Button variant="primary" size="sm" icon={<Plus size={15} />} onClick={() => navigate("/campaigns/create")}>
                New Campaign
              </Button>
            </div>
          </div>
        </div>

        <div className="px-4 lg:px-6 py-5 space-y-3">
          {/* Loading state */}
          {loading && (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Card key={i} className="p-4">
                  <div className="animate-pulse flex items-center gap-4">
                    <div className="w-9 h-9 rounded-xl bg-gray-200 dark:bg-gray-700 shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                      <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/2" />
                    </div>
                    <div className="hidden sm:flex gap-3">
                      {[...Array(3)].map((_, j) => <div key={j} className="h-10 w-20 bg-gray-100 dark:bg-gray-800 rounded-xl" />)}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && filtered.length === 0 && (
            <Card>
              <EmptyState
                icon={<Megaphone size={28} />}
                title="No campaigns yet"
                description="Create your first WhatsApp campaign to start reaching your contacts."
                action={<Button variant="primary" icon={<Plus size={15} />} onClick={() => navigate("/campaigns/create")}>Create Campaign</Button>}
              />
            </Card>
          )}

          {/* Campaign rows */}
          {!loading && filtered.map((campaign) => (
            <Link key={campaign.campaign_id} to={`/campaigns/${campaign.campaign_id}`} className="block group">
              <Card className="p-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/30 flex items-center justify-center shrink-0">
                    <Megaphone size={16} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate group-hover:text-green-600 transition-colors">
                      {campaign.campaigns_name}
                    </p>
                    <p className="text-xs text-gray-500 truncate mt-0.5">Template: {campaign.template_name}</p>
                  </div>

                  {/* Stats — hidden on mobile */}
                  <div className="hidden sm:flex items-center gap-3">
                    <div className="text-center px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 min-w-[72px]">
                      <p className="text-xs font-bold text-gray-900 dark:text-white tabular-nums">{campaign.delivery_rate ?? 0}%</p>
                      <p className="text-[10px] text-gray-400">Delivery</p>
                    </div>
                    <div className="text-center px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 min-w-[72px]">
                      <p className="text-xs font-bold text-gray-900 dark:text-white tabular-nums">{campaign.read_rate ?? 0}%</p>
                      <p className="text-[10px] text-gray-400">Read</p>
                    </div>
                    <div className="text-center px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 min-w-[60px]">
                      <p className="text-xs font-bold text-gray-900 dark:text-white tabular-nums">{campaign.total_message ?? 0}</p>
                      <p className="text-[10px] text-gray-400">Messages</p>
                    </div>
                  </div>

                  <Badge color={campaign.is_sent ? "green" : "amber"}>
                    {campaign.is_sent ? "Completed" : "Pending"}
                  </Badge>

                  <svg className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-green-500 group-hover:translate-x-0.5 transition-all shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </div>

                {/* Mobile stats bar */}
                <div className="sm:hidden mt-3 flex items-center gap-2 text-xs text-gray-500">
                  <span>{campaign.delivery_rate ?? 0}% delivered</span>
                  <span className="text-gray-300">·</span>
                  <span>{campaign.read_rate ?? 0}% read</span>
                  <span className="text-gray-300">·</span>
                  <span>{campaign.total_message ?? 0} msgs</span>
                </div>
              </Card>
            </Link>
          ))}

          {/* Pagination */}
          {pagination.count > 10 && (
            <div className="flex items-center justify-between pt-2">
              <Button
                variant="secondary"
                size="sm"
                icon={<ChevronLeft size={14} />}
                onClick={() => setPage(p => Math.max(p - 1, 1))}
                disabled={!pagination.previous}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-500">
                Page {page} of {Math.ceil(pagination.count / 10)}
              </span>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage(p => p + 1)}
                disabled={!pagination.next}
              >
                Next
                <ChevronRight size={14} className="ml-1" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </RequireSubscription>
  );
}

export default Campaigns;