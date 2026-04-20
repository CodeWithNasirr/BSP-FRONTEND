// src/components/MarkAsPaidModal.jsx
import React, { useState, useEffect } from "react";
import { adminApi } from "../utils/api";
import { 
  CheckCircle2, 
  X, 
  DollarSign, 
  CreditCard, 
  User, 
  Percent,
  AlertCircle,
  FileText,
  ChevronDown,
  ChevronUp,
  Users,
  TrendingUp,
  Wallet
} from "lucide-react";

const PLAN_PRICING = {
  "BASIC": 499,
  "GROWTH": 799,
  "BUSINESS PRO": 1999
};

const DEFAULT_COMMISSION_RATES = {
  "BASIC": 20,
  "GROWTH": 25,  
  "BUSINESS PRO": 30
};

export default function MarkAsPaidModal({ 
  client, 
  open, 
  onClose, 
  onSuccess, 
  subadminCommissionRates = DEFAULT_COMMISSION_RATES 
}) {
  const [planPrice, setPlanPrice] = useState(0);
  const [commissionPercent, setCommissionPercent] = useState(20);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [isFreePayment, setIsFreePayment] = useState(false);

  // Reset form when client changes
  useEffect(() => {
    if (client) {
      const price = PLAN_PRICING[client.subscription_plan] || 499;
      setPlanPrice(price);
      
      const defaultCommission = subadminCommissionRates[client.subscription_plan] || 20;
      setCommissionPercent(defaultCommission);
      
      setNote("");
      setError("");
      setSuccessMessage("");
    }
  }, [client, subadminCommissionRates]);

  if (!open || !client) return null;

  // FIXED: Properly determine SubAdmin from client data
  // Priority: activated_by -> assigned_subadmin -> null
  const getSubadminInfo = () => {

     // Otherwise use assigned_subadmin
    if (client.assigned_subadmin) {
      return {
        id: client.assigned_subadmin,
        username: client.assigned_subadmin_name,
        name: client.assigned_subadmin_name
      };
    }
    
    // If activated_by exists, use it
    if (client.activated_by) {
      return {
        id: client.activated_by,
        username: client.activated_by_username,
        name: client.activated_by_username
      };
    }
   
    return null;
  };

  const subadmin = getSubadminInfo();

  const commissionAmount = isFreePayment ? 0 : (planPrice * commissionPercent) / 100;
  const platformRevenue = isFreePayment ? 0 : planPrice - commissionAmount;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const payload = {
        client_id: client.id,
        commission_percent: isFreePayment ? 0 : commissionPercent,
        note: note.trim(),
        is_free_payment: isFreePayment
      };

      await adminApi.post("/workflow/mark-paid/", payload);
      
      if (isFreePayment) {
        setSuccessMessage(`Payment marked as FREE successfully.`);
      } else {
        setSuccessMessage(`Payment confirmed! ${subadmin?.name || 'SubAdmin'} earns ${formatCurrency(commissionAmount)} commission.`);
      }
      onSuccess?.();
      setTimeout(() => onClose(), 2000);
    } catch (err) {
      const msg =
        err.response?.data?.error?.client_id?.[0] || 
        err.response?.data?.error || 
        err.response?.data?.detail ||
        "Failed to mark payment.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val) => {
    const num = parseFloat(val);
    return isNaN(num) ? "₹0.00" : `₹${num.toFixed(2)}`;
  };

  const handleCommissionChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 0 && value <= 100) {
      setCommissionPercent(value);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="relative bg-white w-full sm:max-w-md sm:mx-4 shadow-2xl overflow-hidden max-h-[95vh] sm:max-h-[90vh] flex flex-col rounded-t-3xl sm:rounded-2xl border-t-4 border-[#25D366]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#075E54] to-[#128C7E] px-4 py-4 sm:px-6 sm:py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                <CheckCircle2 size={20} className="text-white" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Confirm Payment
                </h3>
                <p className="text-xs sm:text-sm text-[#DCF8C6]">
                  {client.business_name || client.username}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="text-white/70 hover:text-white transition-colors p-2">
              <X size={22} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5">
          
          {/* Error/Success Messages */}
          {error && (
            <div className="px-3 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs sm:text-sm flex items-start gap-2">
              <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          
          {successMessage && (
            <div className="px-3 py-3 rounded-xl bg-[#25D366]/10 border border-[#25D366]/30 text-[#075E54] text-xs sm:text-sm flex items-center gap-2">
              <CheckCircle2 size={16} />
              <span className="font-medium">{successMessage}</span>
            </div>
          )}

          {/* Client Info Card */}
          <div className="bg-[#F0F2F5] rounded-2xl p-3 sm:p-4 space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center flex-shrink-0">
                <User size={18} className="text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-[#111B21] text-sm sm:text-base truncate">
                  {client.business_name || client.username}
                </p>
                <p className="text-xs text-[#667781] truncate">{client.username}</p>
              </div>
            </div>
            
            <div className="h-px bg-[#E9EDEF] my-2" />
            
            <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
              <div>
                <span className="text-[#667781] block mb-0.5">Plan</span>
                <span className="font-medium text-[#111B21]">{client.subscription_plan || "BASIC"}</span>
              </div>
              <div>
                <span className="text-[#667781] block mb-0.5">Price</span>
                <span className="font-bold text-[#25D366]">{formatCurrency(planPrice)}</span>
              </div>
            </div>
          </div>

          {/* Commission Configuration */}
          <div className="space-y-3">
            <label className="block text-xs sm:text-sm font-semibold text-[#111B21] uppercase tracking-wide flex items-center gap-1.5">
              <Users size={14} />
              Commission Rate
            </label>
            
            <div className="bg-[#F0F2F5] rounded-xl p-3 sm:p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#667781]">Rate</span>
                <span className="text-sm font-bold text-[#075E54]">{commissionPercent}%</span>
              </div>
              
              <input disabled={isFreePayment}
                type="range"
                min="0"
                max="50"
                step="5"
                value={commissionPercent}
                onChange={handleCommissionChange}
                className="w-full h-2 bg-[#E9EDEF] rounded-lg appearance-none cursor-pointer accent-[#25D366]"
              />
              
              <div className="flex justify-between text-[10px] text-[#667781]">
                <span>0%</span>
                <span>25%</span>
                <span>50%</span>
              </div>

              <div className="flex gap-2 pt-1">
                {[10,12.52, 20, 30, 40].map((rate) => (
                  <button
                    disabled={isFreePayment}
                    key={rate}
                    type="button"
                    onClick={() => setCommissionPercent(rate)}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium transition-all ${
                      commissionPercent === rate
                        ? "bg-[#25D366] text-white"
                        : "bg-white text-[#667781] border border-[#E9EDEF] hover:border-[#25D366]"
                    }`}
                  >
                    {rate}%
                  </button>
                ))}
              </div>
            </div>


            <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
            <input
              type="checkbox"
              checked={isFreePayment}
              onChange={(e) => setIsFreePayment(e.target.checked)}
            />
            <span className="text-xs font-medium text-yellow-700">
              Mark as FREE (No commission, No platform revenue)
            </span>
          </div>

            {/* Revenue Breakdown */}
            <div className="bg-[#075E54]/5 border border-[#075E54]/10 rounded-xl p-3 sm:p-4 space-y-2">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={14} className="text-[#075E54]" />
                <span className="text-xs font-semibold text-[#075E54] uppercase tracking-wide">
                  Revenue Split
                </span>
              </div>
              
              <div className="space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-[#667781]">Client Pays</span>
                  <span className="font-bold text-[#111B21]">{formatCurrency(planPrice)}</span>
                </div>
                
                <div className="h-px bg-[#E9EDEF]" />
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-[#34B7F1]" />
                    <span className="text-[#667781]">Platform Revenue</span>
                  </div>
                  <span className="font-bold text-[#34B7F1]">{formatCurrency(platformRevenue)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-[#25D366]" />
                    <span className="text-[#667781]">SubAdmin Commission ({commissionPercent}%)</span>
                  </div>
                  <span className="font-bold text-[#25D366]">{formatCurrency(commissionAmount)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* FIXED: SubAdmin Info - Now properly shows assigned_subadmin */}
          {subadmin && (
            <div className="flex items-center gap-3 p-3 bg-[#F0F2F5] rounded-xl">
              <div className="w-8 h-8 rounded-full bg-[#128C7E] flex items-center justify-center">
                <Users size={14} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-[#667781]">
                  {client.activated_by ? "Activated By" : "Assigned SubAdmin"}
                </p>
                <p className="text-sm font-medium text-[#111B21] truncate">
                  {subadmin.name || "Unknown"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-[#667781]">Earns</p>
                <p className="text-sm font-bold text-[#25D366]">{formatCurrency(commissionAmount)}</p>
              </div>
            </div>
          )}

          {/* Note Field */}
          <div className="space-y-2">
            <label className="block text-xs sm:text-sm font-semibold text-[#111B21] uppercase tracking-wide flex items-center gap-1.5">
              <FileText size={14} />
              Note (Optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              className="w-full px-3 py-2.5 bg-white border-2 border-[#E9EDEF] rounded-xl text-xs sm:text-sm text-[#111B21] focus:border-[#25D366] focus:outline-none transition-colors resize-none"
              placeholder="e.g., Annual discount applied, referral bonus, etc."
            />
          </div>

          {/* Submit Button */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || planPrice <= 0}
            className="w-full py-3.5 sm:py-4 rounded-xl text-sm sm:text-base font-bold text-white bg-[#25D366] hover:bg-[#128C7E] active:bg-[#075E54] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#25D366]/30 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Wallet size={18} />
                Confirm Payment
              </>
            )}
          </button>

          <p className="text-[10px] sm:text-xs text-center text-[#667781] leading-relaxed">
            {subadmin?.name || 'SubAdmin'} earns {formatCurrency(commissionAmount)} commission
          </p>
        </div>
      </div>
    </div>
  );
}