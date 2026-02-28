import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ContextProvider from './components/context/Context.jsx'
import { ChatProvider } from './components/Chat/context/ChatContext.jsx'
createRoot(document.getElementById('root')).render(
  // <StrictMode>
    <ContextProvider>
    <ChatProvider>
    <App />
    </ChatProvider>
    </ContextProvider>
  // </StrictMode>,
)


// 🔥 REGISTER SERVICE WORKER FOR PWA NOTIFICATIONS
if ("serviceWorker" in navigator && "PushManager" in window) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/service-worker.js").then((reg) => {
      console.log("Service Worker Registered");
    }).catch((err) => {
      console.error("Service Worker registration failed:", err);
    });
  });
}