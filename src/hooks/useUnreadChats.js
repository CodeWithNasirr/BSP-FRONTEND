import { useEffect, useRef, useState } from "react";
import axios from "axios";
import API_BASE_URL from "../config";

let globalUnreadCount = 0;
let globalListeners = [];

const notifyListeners = (value) => {
  globalUnreadCount = value;

  globalListeners.forEach((listener) => {
    listener(value);
  });
};

let pollingStarted = false;

export default function useUnreadChats() {
  const [unreadChats, setUnreadChats] = useState(globalUnreadCount);

  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    const listener = (value) => {
      if (mountedRef.current) {
        setUnreadChats((prev) =>
          prev !== value ? value : prev
        );
      }
    };

    globalListeners.push(listener);

    const token = localStorage.getItem("authToken");

    // START ONLY ONE GLOBAL POLLING
    if (!pollingStarted && token) {
      pollingStarted = true;

      const fetchUnreadChats = async () => {
        try {
          const res = await axios.get(
            `${API_BASE_URL}/api/chats/?filter=unread`,
            {
              headers: {
                Authorization: `Token ${token}`,
              },
            }
          );

          const results = res.data.results || [];

          let total = 0;

          results.forEach((chat) => {
            total += chat.unread_count || 0;
          });

          // only notify if changed
          if (total !== globalUnreadCount) {
            notifyListeners(total);
          }

        } catch (err) {
          console.error(err);
        }
      };

      fetchUnreadChats();

      setInterval(() => {
        if (!document.hidden) {
          fetchUnreadChats();
        }
      }, 15000);
    }

    return () => {
      mountedRef.current = false;

      globalListeners = globalListeners.filter(
        (l) => l !== listener
      );
    };
  }, []);

  return unreadChats;
}