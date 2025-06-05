// hooks/useNotifications.js
import { useState, useEffect, useCallback, useRef } from "react";
import { getUserData } from "@/utils/auth";
import {
  GET_UNREAD_NOTIFICATIONS,
  GET_NOTIFICATIONS_PAGINATED,
  MARK_NOTIFICATION_READ,
  MARK_ALL_NOTIFICATIONS_READ,
} from "@/utils/routes/notificationRoutes";

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isPolling, setIsPolling] = useState(false);
  const [lastNotificationCount, setLastNotificationCount] = useState(0);

  const pollIntervalRef = useRef(null);
  const POLL_INTERVAL = 5000; // 5 seconds

  // Get auth headers from localStorage
  const getAuthHeaders = useCallback(() => {
    const auth = getUserData();
    if (!auth || !auth.token) {
      throw new Error("No authentication token found");
    }

    return {
      Authorization: `Bearer ${auth.token}`,
      "Content-Type": "application/json",
    };
  }, []);

  // Show toast notification
  const showToast = useCallback((message, type = "info") => {
    const toast = document.createElement("div");
    toast.innerHTML = `
      <div style="display: flex; align-items: center; gap: 10px;">
        <span>${type === "success" ? "✅" : "🔔"}</span>
        <span>${message}</span>
      </div>
    `;

    toast.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      background: ${type === "success" ? "#4CAF50" : "#2196F3"};
      color: white;
      padding: 15px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 14px;
      max-width: 350px;
      animation: slideInRight 0.3s ease-out;
    `;

    if (!document.querySelector("#toast-styles")) {
      const style = document.createElement("style");
      style.id = "toast-styles";
      style.textContent = `
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(toast);

    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, 4000);
  }, []);

  // Fetch unread notifications - DIRECT API CALL
  const fetchUnreadNotifications = useCallback(async () => {
    try {
      const auth = getUserData();
      if (!auth || !auth.token || auth.userData?.role !== "admin") {
        return;
      }

      const response = await fetch(GET_UNREAD_NOTIFICATIONS, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        const currentCount = data.count;
        setUnreadCount(currentCount);
        setNotifications(data.data);

        // Show toast for new notifications
        if (currentCount > lastNotificationCount && lastNotificationCount > 0) {
          const newCount = currentCount - lastNotificationCount;
          showToast(
            `${newCount} new order notification${newCount > 1 ? "s" : ""}!`,
            "info"
          );
        }

        setLastNotificationCount(currentCount);
      }
    } catch (error) {
      console.error("Error fetching unread notifications:", error);
    }
  }, [lastNotificationCount, showToast, getAuthHeaders]);

  // Start polling
  const startPolling = useCallback(() => {
    if (isPolling) return;

    console.log("🔔 Starting notification polling (5-second intervals)");
    setIsPolling(true);

    fetchUnreadNotifications();
    pollIntervalRef.current = setInterval(
      fetchUnreadNotifications,
      POLL_INTERVAL
    );
  }, [isPolling, fetchUnreadNotifications]);

  // Stop polling
  const stopPolling = useCallback(() => {
    if (!isPolling) return;

    console.log("🛑 Stopping notification polling");
    setIsPolling(false);

    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, [isPolling]);

  // Mark notification as read - DIRECT API CALL
  const markAsRead = useCallback(
    async (notificationId) => {
      try {
        console.log("🔖 Marking notification as read:", notificationId);

        const response = await fetch(MARK_NOTIFICATION_READ(notificationId), {
          method: "PUT",
          headers: getAuthHeaders(),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log("✅ Mark as read response:", result);

        if (result.success) {
          // Update local notifications state immediately
          setNotifications((prev) =>
            prev.map((notif) =>
              notif.id === notificationId ? { ...notif, is_read: true } : notif
            )
          );

          // Update unread count immediately
          setUnreadCount((prev) => Math.max(0, prev - 1));

          // Refresh unread notifications to sync with server
          setTimeout(() => {
            fetchUnreadNotifications();
          }, 500);
        }
      } catch (error) {
        console.error("Error marking notification as read:", error);
        showToast("Failed to mark notification as read", "error");
      }
    },
    [getAuthHeaders, fetchUnreadNotifications, showToast]
  );

  // Mark all as read - DIRECT API CALL
  const markAllAsRead = useCallback(async () => {
    try {
      const response = await fetch(MARK_ALL_NOTIFICATIONS_READ, {
        method: "PUT",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, is_read: true }))
      );
      setUnreadCount(0);
      setLastNotificationCount(0);

      showToast("All notifications marked as read", "success");
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      showToast("Failed to mark all notifications as read", "error");
    }
  }, [getAuthHeaders, showToast]);

  // Get all notifications with pagination - DIRECT API CALL
  const getAllNotifications = useCallback(
    async (page = 1, limit = 20) => {
      try {
        const response = await fetch(GET_NOTIFICATIONS_PAGINATED(page, limit), {
          method: "GET",
          headers: getAuthHeaders(),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data.success) {
          return data.data;
        }
      } catch (error) {
        console.error("Error fetching all notifications:", error);
        throw error;
      }
    },
    [getAuthHeaders]
  );

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  return {
    notifications,
    unreadCount,
    isPolling,
    startPolling,
    stopPolling,
    markAsRead,
    markAllAsRead,
    getAllNotifications,
    fetchUnreadNotifications,
  };
};

export default useNotifications;
