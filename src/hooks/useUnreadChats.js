import { useEffect, useState } from "react";
import axios from "axios";
import API_BASE_URL from "../config";

export default function useUnreadChats() {
  const [unreadChats, setUnreadChats] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("authToken");

    if (!token) return;

    let mounted = true;

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

        if (mounted) {
          setUnreadChats((prev) =>
            prev !== total ? total : prev
          );
        }

      } catch (err) {
        console.error(err);
      }
    };

    fetchUnreadChats();

    const interval = setInterval(() => {
      if (!document.hidden) {
        fetchUnreadChats();
      }
    }, 10000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };

  }, []);

  return unreadChats;
}