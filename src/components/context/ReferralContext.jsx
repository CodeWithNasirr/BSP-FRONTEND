import React, { createContext, useContext } from "react";
import useReferral from "../../utils/useReferral";

// ═══════════════════════════════════════════════════════════════════════════════
// ReferralContext
// ═══════════════════════════════════════════════════════════════════════════════
//
// Wrap your <App /> (or router) with <ReferralProvider> so every component
// can access referral data without prop-drilling.
//
// SETUP (in App.jsx or main.jsx):
//
//   import { ReferralProvider } from "./components/referral/ReferralContext";
//
//   <BrowserRouter>
//     <ReferralProvider>
//       <Routes>
//         ...
//       </Routes>
//     </ReferralProvider>
//   </BrowserRouter>
//
// USAGE (in any component):
//
//   import { useReferralContext } from "./components/referral/ReferralContext";
//
//   const { client, refCode, isReferred } = useReferralContext();
//
//   // Dynamic WhatsApp link
//   const waLink = client?.phone
//     ? `https://wa.me/${client.phone}`
//     : "https://alvo.chat/6l4J";
//
//   // Dynamic logo
//   <img src={client?.logo || assest.logo} />
//
//   // Dynamic name
//   <span>{client?.name || "Numlockitsolutions"}</span>
//
// ═══════════════════════════════════════════════════════════════════════════════

const ReferralContext = createContext({
  client: null,
  refCode: null,
  isLoading: false,
  isReferred: false,
  clearRef: () => {},
});

export const ReferralProvider = ({ children }) => {
  const referral = useReferral();

  return (
    <ReferralContext.Provider value={referral}>
      {children}
    </ReferralContext.Provider>
  );
};

export const useReferralContext = () => {
  const ctx = useContext(ReferralContext);
  if (!ctx) {
    throw new Error("useReferralContext must be used within <ReferralProvider>");
  }
  return ctx;
};

export default ReferralContext;