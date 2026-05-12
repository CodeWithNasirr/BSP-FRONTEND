// ─────────────────────────────────────────────────────────────────────────────
// Sidebar.jsx — Drop-in replacement for src/components/Components/Sidebar.jsx
// Keeps all existing routing logic, upgrades only the UI
// ─────────────────────────────────────────────────────────────────────────────
import axios from "axios";
import API_BASE_URL from "../../config";
import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  MessagesSquare,
  ContactRound,
  MessageSquareMore,
  MessageCircleMore,
  Workflow,
  CreditCard,
  House,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu,
  X,
  Bell,
  Zap,
  User,
} from "lucide-react";
import { SiWhatsapp as SiWA } from "react-icons/si";
import { Avatar } from "../ui";
import { Context } from "../context/Context";
import useUnreadChats from "../../hooks/useUnreadChats";
const SidebarCtx = createContext({ expanded: true, mobile: false });

// ── MAIN SIDEBAR WRAPPER ──────────────────────────────────────────────────────
export default function Sidebar({ children }) {
  const [expanded, setExpanded] = useState(() => window.innerWidth >= 1024);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const { userInfo } = useContext(Context);
  const unreadChats = useUnreadChats();
  const logout = () => {
    localStorage.removeItem("authToken");
    navigate("/login");
  };

  // Close drawer on route change
  const location = useLocation();
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  // Collapse sidebar on small desktops
  useEffect(() => {
    const handler = () => {
      if (window.innerWidth < 1024) setExpanded(false);
    };
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  const SidebarInner = (
    <nav className="h-full flex flex-col bg-[#0f172a] text-white relative">
      {/* Header */}
      <div className={`flex items-center px-3 py-4 border-b border-white/5 ${expanded ? "justify-between" : "justify-center"}`}>
        {expanded && (
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shrink-0">
              <SiWA className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-sm text-white truncate">Gpx Platform</span>
          </div>
        )}
        <button
          onClick={() => setExpanded((p) => !p)}
          className="hidden lg:flex w-7 h-7 rounded-lg items-center justify-center hover:bg-white/10 text-gray-400 hover:text-white transition-colors shrink-0"
        >
          {expanded ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>

      {/* Nav items */}
      <SidebarCtx.Provider value={{ expanded, mobile: mobileOpen }}>
        <ul className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5 scrollbar-hide">
          {children}
        </ul>
      </SidebarCtx.Provider>

      {/* Divider */}
      <div className="border-t border-white/5 mx-3" />

      {/* User profile */}
      <div className={`p-3 flex items-center gap-3 ${expanded ? "" : "justify-center"}`}>
        <Avatar name={userInfo.username || "User"} size="sm" online />
        {expanded && (
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-white truncate">{userInfo.username || "User"}</p>
            <p className="text-[10px] text-gray-500 truncate">{userInfo.email || ""}</p>
          </div>
        )}
        {expanded && (
          <button
            onClick={logout}
            className="w-7 h-7 rounded-lg hover:bg-white/10 flex items-center justify-center text-gray-500 hover:text-white transition-colors"
            title="Log out"
          >
            <LogOut size={14} />
          </button>
        )}
      </div>
    </nav>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={`
          hidden lg:flex flex-col h-screen sticky top-0 transition-all duration-300 ease-in-out shrink-0
          ${expanded ? "w-56" : "w-16"}
        `}
      >
        {SidebarInner}
      </aside>

      {/* Mobile hamburger button (rendered externally, see MobileNav) */}
      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-64 h-full flex flex-col">
            {SidebarInner}
          </aside>
        </div>
      )}

      {/* Expose mobile toggle globally via context — alternative: pass prop down */}
      <SidebarMobileCtx.Provider value={{ open: mobileOpen, toggle: () => setMobileOpen((p) => !p) }}>
        {/* nothing — consumed by MobileTopbar */}
      </SidebarMobileCtx.Provider>
    </>
  );
}

export const SidebarMobileCtx = createContext({ open: false, toggle: () => {} });

// ── SIDEBAR ITEM ──────────────────────────────────────────────────────────────
export function SidebarItem({ icon, text, to, badge }) {
  const { expanded } = useContext(SidebarCtx);
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = location.pathname === to || location.pathname.startsWith(to + "/");

  return (
    <li
      onClick={() => navigate(to)}
      title={!expanded ? text : undefined}
      className={`
        relative flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer
        transition-all duration-150 group
        ${isActive
          ? "bg-gradient-to-r from-green-500/20 to-emerald-500/10 text-white"
          : "text-gray-400 hover:text-white hover:bg-white/5"
        }
      `}
    >
      {/* Active indicator */}
      {isActive && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-green-400 rounded-r-full" />
      )}

      <span className={`shrink-0 ${isActive ? "text-green-400" : ""}`}>
        {React.cloneElement(icon, { size: 18 })}
      </span>

      {expanded && (
        <span className="text-sm font-medium flex-1 truncate">{text}</span>
      )}

      {badge > 0 && (
          expanded ? (
            <span className="
              min-w-[18px] h-[18px]
              rounded-full
              bg-red-500
              text-white
              text-[10px]
              font-bold
              flex items-center
              justify-center
              px-1
              animate-pulse
            ">
              {badge > 99 ? "99+" : badge}
            </span>
          ) : (
            <span className="
              absolute top-2 right-2
              min-w-[16px] h-[16px]
              rounded-full
              bg-red-500
              text-white
              text-[9px]
              font-bold
              flex items-center
              justify-center
              animate-pulse
              ring-2 ring-[#0f172a]
            ">
              {badge > 9 ? "9+" : badge}
            </span>
          )
        )}

      {/* Tooltip for collapsed state */}
      {!expanded && (
        <div className="absolute left-full ml-3 px-2 py-1 bg-gray-800 text-white text-xs rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-lg">
          {text}
          {badge !== undefined && <span className="ml-1.5 bg-green-500 px-1 rounded">{badge}</span>}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-800 rotate-45" />
        </div>
      )}
    </li>
  );
}

// ── MOBILE BOTTOM NAV ─────────────────────────────────────────────────────────
// Place this at the bottom of AppContent, outside the sidebar condition
export function MobileBottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userInfo } = useContext(Context);
  const unreadChats = useUnreadChats();

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userInfo");
    localStorage.removeItem("waStatus");

    navigate("/login");
  };

  const items = [
    {
      to: "/dashboard",
      icon: <House size={22} />,
      label: "Home",
    },
     {
      to: "/chats",
      icon: <MessageCircleMore size={22} />,
      label: "Chats",
      badge: unreadChats,
    },

    
    {
      to: "/chat-flow",
      icon: <Workflow size={22} />,
      label: "Flows",
    },


    {
      to: "/contacts",
      icon: <ContactRound size={22} />,
      label: "Contacts",
    },

    {
      to: "/smart-contacts",
      icon: <Zap size={22} />,
      label: "Smart",
    },

      {
      to: "/whatsapp-setting",
      icon: <SiWA size={20} />,
      label: "WA",
    },

    {
      to: "/campaigns",
      icon: <MessagesSquare size={22} />,
      label: "Campaigns",
    },

    {
      to: "/templates",
      icon: <MessageSquareMore size={22} />,
      label: "Templates",
    },

   


    {
      to: "/subscriptions",
      icon: <CreditCard size={22} />,
      label: "Plans",
    },
        {
      action: "logout",
      icon: <LogOut size={20} />,
      label: "Logout",
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-[#0f172a]/95 backdrop-blur-md border-t border-white/5 safe-area-inset-bottom">
      <div className="flex items-center overflow-x-auto scrollbar-hide">
        {items.map((item) => {
          const isActive = location.pathname === item.to || location.pathname.startsWith(item.to + "/");
          return (
            <button
              key={item.to}
              onClick={() => {
                if (item.action === "logout") {
                  logout();
                } else {
                  navigate(item.to);
                }
              }}
              className={`relative min-w-[72px] flex flex-col items-center justify-center py-3 gap-0.5 transition-colors active:scale-95 ${
                isActive ? "text-green-400" : "text-gray-500"
              }`}
            >
              <div className="relative">
              {item.icon}

              {!!item.badge && item.badge > 0 && (
                <span className="
                  absolute -top-1.5 -right-2
                  min-w-[18px] h-[18px]
                  px-1 rounded-full
                  bg-red-500 text-white
                  text-[10px] font-bold
                  flex items-center justify-center
                  animate-pulse
                  shadow-lg
                ">
                  {item.badge > 99 ? "99+" : item.badge}
                </span>
              )}
            </div>
              <span className={`text-[9px] font-medium ${isActive ? "text-green-400" : "text-gray-600"}`}>
                {item.label}
              </span>
              {isActive && <span className="relative bottom-1 w-1 h-1 rounded-full bg-green-400" />}
            </button>
          );
        })}
      </div>
    </nav>
  );
}