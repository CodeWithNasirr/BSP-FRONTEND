// // src/components/ClientManagementModal.jsx
// import React, { useState, useEffect } from "react";
// import { adminApi } from "../utils/api";
// import { 
//   Zap, 
//   X, 
//   Settings, 
//   AlertCircle, 
//   CheckCircle2, 
//   Smartphone,
//   Globe,
//   Key,
//   Building2,
//   ToggleLeft,
//   CreditCard
// } from "lucide-react";

// const PLANS = [
//   { value: "BASIC", label: "Basic", price: "₹499/mo", messages: "" },
//   { value: "GROWTH", label: "Growth", price: "₹799/mo", messages: "" },
//   { value: "BUSINESS PRO", label: "Business Pro", price: "₹1999/mo", messages: "" },
// ];

// // Tab configuration for mobile and desktop
// const TABS = [
//   { id: 'subscription', label: 'Subscription', icon: Zap, mobileLabel: 'Sub' },
//   { id: 'settings', label: 'API Settings', icon: Settings, mobileLabel: 'API' },
// ];

// export default function ClientManagementModal({ client, open, onClose, onSuccess, userRole = false }) {
//   // Tab state
//   const [activeTab, setActiveTab] = useState('subscription');
  
//   // Subscription form state
//   const [plan, setPlan] = useState("BASIC");
//   const [expiryDays, setExpiryDays] = useState(30);
//   const [action, setAction] = useState("ACTIVE");
  
//   // Settings form state
//   const [settingsForm, setSettingsForm] = useState({
//     business_id: "",
//     waba_id: "",
//     business_name: "",
//     display_phone_number: "",
//     webhook_subscribed: false,
//     phone_id: "",
//     access_token: "",
//     coexistence_enabled: false,
//   });
  
//   // UI state
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [successMessage, setSuccessMessage] = useState("");

//   const isSuperAdmin = userRole === true;


//   // Initialize form data when client changes
//   useEffect(() => {
//     if (client) {
//       setSettingsForm({
//         business_id: client.business_id || "",
//         waba_id: client.waba_id || "",
//         business_name: client.business_name || "",
//         display_phone_number: client.display_phone_number || "",
//         webhook_subscribed: client.webhook_subscribed || false,
//         phone_id: client.phone_id || "",
//         access_token: client.access_token || "",
//         coexistence_enabled: client.coexistence_enabled || false,
//       });
//       setPlan(client.subscription_plan || "BASIC");
//       setAction(client.subscription_status || "INACTIVE");
//     }
//   }, [client]);

//   if (!open || !client) return null;

//   const handleSettingsChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setSettingsForm(prev => ({
//       ...prev,
//       [name]: type === 'checkbox' ? checked : value
//     }));
//   };

//   const handleSubscriptionSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError("");
//     setSuccessMessage("");

//     try {
//       await adminApi.post("/workflow/activate/", {
//         client_id: client.id,
//         subscription_plan: plan,
//         subscription_status: action,
//         expiry_days: parseInt(expiryDays, 10),
//       });
//       setSuccessMessage("Subscription updated successfully!");
//       onSuccess?.();
//       setTimeout(() => onClose(), 1500);
//     } catch (err) {
//       const msg =
//         err.response?.data?.error ||
//         err.response?.data?.detail ||
//         Object.values(err.response?.data || {}).flat().join(", ") ||
//         "Failed to update subscription.";
//       setError(msg);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSettingsSubmit = async (e) => {
//     e.preventDefault();
//     if (!isSuperAdmin) {
//       setError("Only SuperAdmin can update these settings.");
//       return;
//     }
    
//     setLoading(true);
//     setError("");
//     setSuccessMessage("");

//     try {
//       await adminApi.patch(`/workflow/update-client/${client.id}/`, settingsForm);
//       setSuccessMessage("Client settings updated successfully!");
//       onSuccess?.();
//       setTimeout(() => onClose(), 1500);
//     } catch (err) {
//       const msg =
//         err.response?.data?.error ||
//         err.response?.data?.detail ||
//         "Failed to update client settings.";
//       setError(msg);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Mobile-optimized header with tab navigation
//   const renderHeader = () => (
//     <div className="flex flex-col border-b border-slate-800/50">
//       <div className="flex items-center justify-between px-4 py-3 md:px-6 md:py-4">
//         <div className="flex items-center gap-2 md:gap-3 min-w-0">
//           <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-amber-400/10 flex items-center justify-center flex-shrink-0">
//             <Zap size={14} className="text-amber-400 md:size-16" />
//           </div>
//           <div className="min-w-0">
//             <h3 className="text-sm font-semibold text-white truncate">
//               Manage Client
//             </h3>
//             <p className="text-[10px] md:text-[11px] text-slate-500 truncate">
//               {client.username} — {client.business_name || "No business"}
//             </p>
//           </div>
//         </div>
//         <button 
//           onClick={onClose} 
//           className="text-slate-500 hover:text-white transition-colors p-1 md:p-0"
//         >
//           <X size={18} />
//         </button>
//       </div>
      
//       {/* Tab Navigation - Mobile Optimized */}
//       <div className="flex border-t border-slate-800/50 overflow-x-auto scrollbar-hide">
//         {TABS.map((tab) => {
//           const Icon = tab.icon;
//           const isActive = activeTab === tab.id;
//           const canAccess = tab.id === 'settings' ? isSuperAdmin : true;
          
//           return (
//             <button
//               key={tab.id}
//               onClick={() => canAccess && setActiveTab(tab.id)}
//               disabled={!canAccess}
//               className={`flex items-center justify-center gap-1.5 md:gap-2 px-3 py-2.5 md:px-4 md:py-3 text-xs md:text-sm font-medium transition-all flex-1 min-w-[80px] md:min-w-0 whitespace-nowrap ${
//                 isActive 
//                   ? "text-amber-400 border-b-2 border-amber-400 bg-amber-400/5" 
//                   : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/30"
//               } ${!canAccess ? 'opacity-50 cursor-not-allowed' : ''}`}
//             >
//               <Icon size={14} className="md:size-16" />
//               <span className="hidden sm:inline">{tab.label}</span>
//               <span className="sm:hidden">{tab.mobileLabel}</span>
//               {tab.id === 'settings' && !isSuperAdmin && (
//                 <span className="text-[9px] bg-slate-700 px-1 rounded">Admin</span>
//               )}
//             </button>
//           );
//         })}
//       </div>
//     </div>
//   );

//   // Current status display component
//   const StatusDisplay = () => (
//     <div className="flex flex-wrap items-center gap-2 md:gap-3 px-3 py-2 md:px-3 md:py-2.5 rounded-lg bg-slate-800/50 border border-slate-700/30 text-xs">
//       <span className="text-[10px] md:text-[11px] text-slate-500 uppercase tracking-wider">Current</span>
//       <span className={`font-medium ${client.subscription_status === "ACTIVE" ? "text-emerald-400" : "text-red-400"}`}>
//         {client.subscription_status}
//       </span>
//       {client.subscription_plan && (
//         <span className="text-slate-400">/ {client.subscription_plan}</span>
//       )}
//       {client.payment_status === "UNPAID" && (
//         <span className="text-orange-400">/ UNPAID</span>
//       )}
//     </div>
//   );

//   // Subscription Tab Content
//   const SubscriptionTab = () => (
//     <form onSubmit={handleSubscriptionSubmit} className="space-y-4 md:space-y-5">
//       <StatusDisplay />

//       {/* Action Selection */}
//       <div>
//         <label className="block text-xs font-medium text-slate-400 mb-2">Action</label>
//         <div className="grid grid-cols-2 gap-2">
//           <button
//             type="button"
//             onClick={() => setAction("ACTIVE")}
//             className={`py-2 md:py-2.5 rounded-lg text-xs md:text-sm font-medium transition-all border ${
//               action === "ACTIVE"
//                 ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
//                 : "bg-slate-800/50 text-slate-400 border-slate-700/30 hover:border-slate-600/50"
//             }`}
//           >
//             Activate
//           </button>
//           <button
//             type="button"
//             onClick={() => setAction("INACTIVE")}
//             className={`py-2 md:py-2.5 rounded-lg text-xs md:text-sm font-medium transition-all border ${
//               action === "INACTIVE"
//                 ? "bg-red-500/10 text-red-400 border-red-500/30"
//                 : "bg-slate-800/50 text-slate-400 border-slate-700/30 hover:border-slate-600/50"
//             }`}
//           >
//             Deactivate
//           </button>
//         </div>
//       </div>

//       {action === "ACTIVE" && (
//         <>
//           {/* Plan Selection - Mobile Optimized Cards */}
//           <div>
//             <label className="block text-xs font-medium text-slate-400 mb-2">
//               Subscription Plan
//             </label>
//             <div className="space-y-2">
//               {PLANS.map((p) => (
//                 <button
//                   key={p.value}
//                   type="button"
//                   onClick={() => setPlan(p.value)}
//                   className={`w-full flex flex-col sm:flex-row sm:items-center justify-between px-3 md:px-4 py-2.5 md:py-3 rounded-xl text-xs md:text-sm transition-all border gap-1 sm:gap-0 ${
//                     plan === p.value
//                       ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
//                       : "bg-slate-800/50 text-slate-300 border-slate-700/30 hover:border-slate-600/50"
//                   }`}
//                 >
//                   <span className="font-medium">{p.label}</span>
//                   <span className="flex items-center gap-2 text-[10px] md:text-xs">
//                     <span className={plan === p.value ? "text-amber-400" : "text-slate-500"}>
//                       {p.price}
//                     </span>
//                     <span className="text-slate-600 hidden sm:inline">|</span>
//                     <span className="text-slate-500">{p.messages}</span>
//                   </span>
//                 </button>
//               ))}
//             </div>
//           </div>

//           {/* Expiry Days */}
//           <div>
//             <label className="block text-xs font-medium text-slate-400 mb-2">
//               Duration (days)
//             </label>
//             <input
//               type="number"
//               value={expiryDays}
//               onChange={(e) => setExpiryDays(e.target.value)}
//               min="1"
//               max="365"
//               className="w-full bg-slate-800/50 border border-slate-700/30 text-white text-xs md:text-sm rounded-lg px-3 md:px-4 py-2 md:py-2.5 focus:outline-none focus:border-amber-500/50 transition-colors"
//             />
//           </div>

//           {/* Warning */}
//           <div className="px-3 py-2 md:px-3 md:py-2.5 rounded-lg bg-orange-500/5 border border-orange-500/15 text-[10px] md:text-[11px] text-orange-400/80">
//             <div className="flex items-start gap-2">
//               <AlertCircle size={12} className="mt-0.5 flex-shrink-0" />
//               <span>Payment status will be set to <strong>UNPAID</strong>. SuperAdmin must confirm payment within 2 days or the subscription will auto-deactivate.</span>
//             </div>
//           </div>
//         </>
//       )}

//       {/* Submit Button */}
//       <button
//         type="submit"
//         disabled={loading}
//         className={`w-full py-2.5 md:py-3 rounded-xl text-xs md:text-sm font-semibold transition-all disabled:opacity-50 ${
//           action === "ACTIVE"
//             ? "bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 hover:from-amber-400 hover:to-orange-400"
//             : "bg-red-500/20 text-red-400 hover:bg-red-500/30"
//         }`}
//       >
//         {loading
//           ? "Processing..."
//           : action === "ACTIVE"
//           ? `Activate ${plan}`
//           : "Deactivate Subscription"}
//       </button>
//     </form>
//   );

//   // Settings Tab Content (SuperAdmin Only)
//   const SettingsTab = () => (
//     <form onSubmit={handleSettingsSubmit} className="space-y-3 md:space-y-4">
//       {!isSuperAdmin && (
//         <div className="px-3 py-2 md:px-3 md:py-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-[11px] md:text-xs text-red-400">
//           <div className="flex items-center gap-2">
//             <AlertCircle size={14} />
//             <span>Only SuperAdmin can modify these settings.</span>
//           </div>
//         </div>
//       )}

//       <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
//         {/* Business ID */}
//         <div className="sm:col-span-2">
//           <label className="block text-[11px] md:text-xs font-medium text-slate-400 mb-1.5 md:mb-2 flex items-center gap-1.5">
//             <Building2 size={12} />
//             Business ID
//           </label>
//           <input
//             type="text"
//             name="business_id"
//             value={settingsForm.business_id}
//             onChange={handleSettingsChange}
//             disabled={!isSuperAdmin}
//             className="w-full bg-slate-800/50 border border-slate-700/30 text-white text-xs md:text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500/50 transition-colors disabled:opacity-50"
//             placeholder="Enter business ID"
//           />
//         </div>

//         {/* WABA ID */}
//         <div className="sm:col-span-2">
//           <label className="block text-[11px] md:text-xs font-medium text-slate-400 mb-1.5 md:mb-2 flex items-center gap-1.5">
//             <Globe size={12} />
//             WABA ID
//           </label>
//           <input
//             type="text"
//             name="waba_id"
//             value={settingsForm.waba_id}
//             onChange={handleSettingsChange}
//             disabled={!isSuperAdmin}
//             className="w-full bg-slate-800/50 border border-slate-700/30 text-white text-xs md:text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500/50 transition-colors disabled:opacity-50"
//             placeholder="Enter WABA ID"
//           />
//         </div>

//         {/* Business Name */}
//         <div className="sm:col-span-2">
//           <label className="block text-[11px] md:text-xs font-medium text-slate-400 mb-1.5 md:mb-2 flex items-center gap-1.5">
//             <Building2 size={12} />
//             Business Name
//           </label>
//           <input
//             type="text"
//             name="business_name"
//             value={settingsForm.business_name}
//             onChange={handleSettingsChange}
//             disabled={!isSuperAdmin}
//             className="w-full bg-slate-800/50 border border-slate-700/30 text-white text-xs md:text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500/50 transition-colors disabled:opacity-50"
//             placeholder="Enter business name"
//           />
//         </div>

//         {/* Display Phone */}
//         <div>
//           <label className="block text-[11px] md:text-xs font-medium text-slate-400 mb-1.5 md:mb-2 flex items-center gap-1.5">
//             <Smartphone size={12} />
//             Display Phone
//           </label>
//           <input
//             type="text"
//             name="display_phone_number"
//             value={settingsForm.display_phone_number}
//             onChange={handleSettingsChange}
//             disabled={!isSuperAdmin}
//             className="w-full bg-slate-800/50 border border-slate-700/30 text-white text-xs md:text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500/50 transition-colors disabled:opacity-50"
//             placeholder="+1234567890"
//           />
//         </div>

//         {/* Phone ID */}
//         <div>
//           <label className="block text-[11px] md:text-xs font-medium text-slate-400 mb-1.5 md:mb-2 flex items-center gap-1.5">
//             <Smartphone size={12} />
//             Phone ID
//           </label>
//           <input
//             type="text"
//             name="phone_id"
//             value={settingsForm.phone_id}
//             onChange={handleSettingsChange}
//             disabled={!isSuperAdmin}
//             className="w-full bg-slate-800/50 border border-slate-700/30 text-white text-xs md:text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500/50 transition-colors disabled:opacity-50"
//             placeholder="Phone ID"
//           />
//         </div>

//         {/* Access Token */}
//         <div className="sm:col-span-2">
//           <label className="block text-[11px] md:text-xs font-medium text-slate-400 mb-1.5 md:mb-2 flex items-center gap-1.5">
//             <Key size={12} />
//             Access Token
//           </label>
//           <textarea
//             name="access_token"
//             value={settingsForm.access_token}
//             onChange={handleSettingsChange}
//             disabled={!isSuperAdmin}
//             rows={2}
//             className="w-full bg-slate-800/50 border border-slate-700/30 text-white text-xs md:text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500/50 transition-colors disabled:opacity-50 resize-none font-mono"
//             placeholder="Enter access token"
//           />
//         </div>

//         {/* Toggles */}
//         <div className="flex items-center justify-between p-2.5 md:p-3 rounded-lg bg-slate-800/30 border border-slate-700/30 sm:col-span-2">
//           <div className="flex items-center gap-2">
//             <ToggleLeft size={14} className="text-slate-400" />
//             <div>
//               <span className="text-xs md:text-sm font-medium text-slate-300">Webhook Subscribed</span>
//               <p className="text-[10px] text-slate-500">Enable webhook notifications</p>
//             </div>
//           </div>
//           <label className="relative inline-flex items-center cursor-pointer">
//             <input
//               type="checkbox"
//               name="webhook_subscribed"
//               checked={settingsForm.webhook_subscribed}
//               onChange={handleSettingsChange}
//               disabled={!isSuperAdmin}
//               className="sr-only peer"
//             />
//             <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-500 disabled:opacity-50"></div>
//           </label>
//         </div>

//         <div className="flex items-center justify-between p-2.5 md:p-3 rounded-lg bg-slate-800/30 border border-slate-700/30 sm:col-span-2">
//           <div className="flex items-center gap-2">
//             <CreditCard size={14} className="text-slate-400" />
//             <div>
//               <span className="text-xs md:text-sm font-medium text-slate-300">Coexistence Enabled</span>
//               <p className="text-[10px] text-slate-500">Allow multiple providers</p>
//             </div>
//           </div>
//           <label className="relative inline-flex items-center cursor-pointer">
//             <input
//               type="checkbox"
//               name="coexistence_enabled"
//               checked={settingsForm.coexistence_enabled}
//               onChange={handleSettingsChange}
//               disabled={!isSuperAdmin}
//               className="sr-only peer"
//             />
//             <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-500 disabled:opacity-50"></div>
//           </label>
//         </div>
//       </div>

//       {/* Submit Button */}
//       <button
//         type="submit"
//         disabled={loading || !isSuperAdmin}
//         className="w-full py-2.5 md:py-3 rounded-xl text-xs md:text-sm font-semibold bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-400 hover:to-indigo-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
//       >
//         {loading ? (
//           "Saving..."
//         ) : (
//           <>
//             <CheckCircle2 size={14} />
//             Save Settings
//           </>
//         )}
//       </button>
//     </form>
//   );

//   return (
//     <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4">
//       {/* Backdrop - Click to close on desktop, but not on mobile (prevent accidental closes) */}
//       <div 
//         className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
//         onClick={onClose}
//       />
      
//       {/* Modal Container - Full screen on mobile, centered on desktop */}
//       <div className="relative bg-slate-900 border border-slate-700/50 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-2xl sm:mx-4 shadow-2xl overflow-hidden max-h-[90vh] sm:max-h-[85vh] flex flex-col">
//         {renderHeader()}
        
//         {/* Scrollable Content Area */}
//         <div className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
//           {/* Error/Success Messages */}
//           {error && (
//             <div className="mb-4 px-3 py-2 md:px-3 md:py-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] md:text-xs flex items-start gap-2">
//               <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
//               <span>{error}</span>
//             </div>
//           )}
          
//           {successMessage && (
//             <div className="mb-4 px-3 py-2 md:px-3 md:py-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] md:text-xs flex items-center gap-2">
//               <CheckCircle2 size={14} />
//               <span>{successMessage}</span>
//             </div>
//           )}

//           {/* Tab Content */}
//           <div className="min-h-[200px]">
//             {activeTab === 'subscription' ? <SubscriptionTab /> : <SettingsTab />}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// src/admin/components/ClientManagementModal.jsx — Premium responsive
import React, { useState, useEffect } from "react";
import { adminApi } from "../utils/api";
import { Zap, X, Settings, AlertCircle, CheckCircle2, Smartphone, Globe, Key, Building2, ToggleLeft, CreditCard } from "lucide-react";

const PLANS = [
  { value: "BASIC", label: "Basic", price: "₹499/mo" },
  { value: "GROWTH", label: "Growth", price: "₹799/mo" },
  { value: "BUSINESS PRO", label: "Business Pro", price: "₹1999/mo" },
];
const TABS = [
  { id: "subscription", label: "Subscription", icon: Zap, short: "Sub" },
  { id: "settings", label: "API Settings", icon: Settings, short: "API" },
];

export default function ClientManagementModal({ client, open, onClose, onSuccess, userRole = false }) {
  const [activeTab, setActiveTab] = useState("subscription");
  const [plan, setPlan] = useState("BASIC");
  const [expiryDays, setExpiryDays] = useState(30);
  const [action, setAction] = useState("ACTIVE");
  const [settingsForm, setSettingsForm] = useState({ business_id: "", waba_id: "", business_name: "", display_phone_number: "", webhook_subscribed: false, phone_id: "", access_token: "", coexistence_enabled: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const isSuperAdmin = userRole === true;

  useEffect(() => {
    if (client) {
      setSettingsForm({ business_id: client.business_id || "", waba_id: client.waba_id || "", business_name: client.business_name || "", display_phone_number: client.display_phone_number || "", webhook_subscribed: client.webhook_subscribed || false, phone_id: client.phone_id || "", access_token: client.access_token || "", coexistence_enabled: client.coexistence_enabled || false });
      setPlan(client.subscription_plan || "BASIC");
      setAction(client.subscription_status || "INACTIVE");
    }
  }, [client]);

  if (!open || !client) return null;

  const handleSettingsChange = (e) => { const { name, value, type, checked } = e.target; setSettingsForm(p => ({ ...p, [name]: type === "checkbox" ? checked : value })); };

  const handleSubscriptionSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setError(""); setSuccessMessage("");
    try {
      await adminApi.post("/workflow/activate/", { client_id: client.id, subscription_plan: plan, subscription_status: action, expiry_days: parseInt(expiryDays, 10) });
      setSuccessMessage("Subscription updated!"); onSuccess?.(); setTimeout(() => onClose(), 1500);
    } catch (err) { setError(err.response?.data?.error || err.response?.data?.detail || Object.values(err.response?.data || {}).flat().join(", ") || "Failed."); }
    finally { setLoading(false); }
  };

  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    if (!isSuperAdmin) { setError("Only SuperAdmin can update these settings."); return; }
    setLoading(true); setError(""); setSuccessMessage("");
    try {
      await adminApi.patch(`/workflow/update-client/${client.id}/`, settingsForm);
      setSuccessMessage("Settings updated!"); onSuccess?.(); setTimeout(() => onClose(), 1500);
    } catch (err) { setError(err.response?.data?.error || "Failed."); }
    finally { setLoading(false); }
  };

  const inputCls = "w-full bg-white/[0.03] border border-white/[0.06] text-white text-xs sm:text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-400/30 transition-colors disabled:opacity-40 placeholder:text-slate-600";

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#0d1120] border border-white/[0.06] rounded-t-3xl sm:rounded-2xl w-full sm:max-w-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">

        {/* Header + Tabs */}
        <div className="border-b border-white/[0.04] shrink-0">
          <div className="flex items-center justify-between px-4 py-3 sm:px-5 sm:py-4">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-amber-400/10 flex items-center justify-center shrink-0"><Zap size={14} className="text-amber-400" /></div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-white truncate">Manage Client</h3>
                <p className="text-[10px] text-slate-500 truncate">{client.username} — {client.business_name || "No business"}</p>
              </div>
            </div>
            <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors p-1"><X size={18} /></button>
          </div>
          <div className="flex border-t border-white/[0.04]">
            {TABS.map(t => {
              const Icon = t.icon; const isActive = activeTab === t.id;
              const canAccess = t.id === "settings" ? isSuperAdmin : true;
              return (
                <button key={t.id} onClick={() => canAccess && setActiveTab(t.id)} disabled={!canAccess}
                  className={`flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-semibold transition-all flex-1 whitespace-nowrap ${
                    isActive ? "text-amber-400 border-b-2 border-amber-400 bg-amber-400/[0.03]" : "text-slate-500 hover:text-slate-300"
                  } ${!canAccess ? "opacity-40 cursor-not-allowed" : ""}`}>
                  <Icon size={13} />
                  <span className="hidden sm:inline">{t.label}</span>
                  <span className="sm:hidden">{t.short}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {error && <div className="px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/15 text-red-400 text-[11px] flex items-start gap-2"><AlertCircle size={13} className="mt-0.5 shrink-0" />{error}</div>}
          {successMessage && <div className="px-3 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/15 text-emerald-400 text-[11px] flex items-center gap-2"><CheckCircle2 size={13} />{successMessage}</div>}

          {activeTab === "subscription" ? (
            <form onSubmit={handleSubscriptionSubmit} className="space-y-4">
              <div className="flex flex-wrap items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.02] border border-white/[0.04] text-[11px]">
                <span className="text-[9px] text-slate-500 uppercase tracking-wider">Current</span>
                <span className={client.subscription_status === "ACTIVE" ? "text-emerald-400 font-semibold" : "text-red-400 font-semibold"}>{client.subscription_status}</span>
                {client.subscription_plan && <span className="text-slate-400">/ {client.subscription_plan}</span>}
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-wider">Action</label>
                <div className="grid grid-cols-2 gap-2">
                  {[["ACTIVE", "Activate", "emerald"], ["INACTIVE", "Deactivate", "red"]].map(([val, lbl, c]) => (
                    <button key={val} type="button" onClick={() => setAction(val)}
                      className={`py-2.5 rounded-xl text-xs font-semibold border transition-all ${action === val ? `bg-${c}-500/10 text-${c}-400 border-${c}-500/20` : "bg-white/[0.02] text-slate-400 border-white/[0.06]"}`}>{lbl}</button>
                  ))}
                </div>
              </div>
              {action === "ACTIVE" && (
                <>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-wider">Plan</label>
                    <div className="space-y-1.5">
                      {PLANS.map(p => (
                        <button key={p.value} type="button" onClick={() => setPlan(p.value)}
                          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-all border ${plan === p.value ? "bg-amber-500/10 text-amber-400 border-amber-500/20" : "bg-white/[0.02] text-slate-300 border-white/[0.06]"}`}>
                          <span className="font-semibold">{p.label}</span>
                          <span className={plan === p.value ? "text-amber-400" : "text-slate-500"}>{p.price}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-wider">Duration (days)</label>
                    <input type="number" value={expiryDays} onChange={e => setExpiryDays(e.target.value)} min="1" max="365" className={inputCls} />
                  </div>
                  <div className="px-3 py-2 rounded-xl bg-orange-500/5 border border-orange-500/10 text-[10px] text-orange-400/80 flex items-start gap-2">
                    <AlertCircle size={11} className="mt-0.5 shrink-0" />
                    <span>Payment will be <strong>UNPAID</strong>. SuperAdmin must confirm within 2 days.</span>
                  </div>
                </>
              )}
              <button type="submit" disabled={loading}
                className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all disabled:opacity-50 ${
                  action === "ACTIVE" ? "bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950" : "bg-red-500/15 text-red-400"
                }`}>
                {loading ? "Processing..." : action === "ACTIVE" ? `Activate ${plan}` : "Deactivate"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSettingsSubmit} className="space-y-3">
              {!isSuperAdmin && <div className="px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/15 text-[11px] text-red-400 flex items-center gap-2"><AlertCircle size={13} />Only SuperAdmin can modify settings.</div>}
              {[
                ["business_id", "Business ID", Building2], ["waba_id", "WABA ID", Globe], ["business_name", "Business Name", Building2],
                ["display_phone_number", "Display Phone", Smartphone], ["phone_id", "Phone ID", Smartphone],
              ].map(([name, label, Icon]) => (
                <div key={name}>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider flex items-center gap-1"><Icon size={10} />{label}</label>
                  <input type="text" name={name} value={settingsForm[name]} onChange={handleSettingsChange} disabled={!isSuperAdmin} className={inputCls} />
                </div>
              ))}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider flex items-center gap-1"><Key size={10} />Access Token</label>
                <textarea name="access_token" value={settingsForm.access_token} onChange={handleSettingsChange} disabled={!isSuperAdmin} rows={2} className={`${inputCls} resize-none font-mono`} />
              </div>
              {[["webhook_subscribed", "Webhook Subscribed"], ["coexistence_enabled", "Coexistence"]].map(([name, label]) => (
                <div key={name} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <span className="text-xs text-slate-300 font-medium">{label}</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" name={name} checked={settingsForm[name]} onChange={handleSettingsChange} disabled={!isSuperAdmin} className="sr-only peer" />
                    <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500 disabled:opacity-40" />
                  </label>
                </div>
              ))}
              <button type="submit" disabled={loading || !isSuperAdmin}
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-500 to-indigo-500 text-white disabled:opacity-40 transition-all flex items-center justify-center gap-1.5">
                {loading ? "Saving..." : <><CheckCircle2 size={13} />Save Settings</>}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}