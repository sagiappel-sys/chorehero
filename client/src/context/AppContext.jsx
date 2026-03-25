import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";
import { choresAPI, householdsAPI, notificationsAPI } from "../services/api";
import toast from "react-hot-toast";

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const { user, updateUser } = useAuth();
  const [chores, setChores] = useState([]);
  const [household, setHousehold] = useState(null);
  const [members, setMembers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const socketRef = useRef(null);

  // Fetch initial data when user is logged in and has a household
  const fetchAll = useCallback(async () => {
    if (!user?.householdId) return;
    setLoadingData(true);
    try {
      const [choresRes, householdRes, notifRes] = await Promise.all([
        choresAPI.getAll(),
        householdsAPI.getMyHousehold(),
        notificationsAPI.getAll(),
      ]);
      setChores(choresRes.data);
      setHousehold(householdRes.data);
      setMembers(householdRes.data.members || []);
      setNotifications(notifRes.data);
    } catch (err) {
      console.error("Failed to fetch app data:", err);
    } finally {
      setLoadingData(false);
    }
  }, [user?.householdId]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Socket.io — real-time updates
  useEffect(() => {
    if (!user?.householdId) return;

    const socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000", {
      transports: ["websocket"],
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join:household", user.householdId);
    });

    socket.on("chore:created", (chore) => {
      setChores((prev) => [chore, ...prev]);
    });

    socket.on("chore:updated", (updated) => {
      setChores((prev) => prev.map((c) => (c._id === updated._id ? updated : c)));
    });

    socket.on("chore:deleted", ({ id }) => {
      setChores((prev) => prev.filter((c) => c._id !== id));
    });

    socket.on("chore:completed", (updated) => {
      setChores((prev) => prev.map((c) => (c._id === updated._id ? updated : c)));
    });

    socket.on("notification:new", (notif) => {
      setNotifications((prev) => [notif, ...prev].slice(0, 30));
      toast(`${notif.emoji} ${notif.message}`, { duration: 3000 });
    });

    socket.on("scores:updated", () => {
      // Re-fetch leaderboard scores
      householdsAPI.getMyHousehold().then((res) => {
        setMembers(res.data.members || []);
        const me = res.data.members?.find((m) => m._id === user._id);
        if (me) updateUser({ totalScore: me.totalScore, weeklyScore: me.weeklyScore });
      });
    });

    return () => socket.disconnect();
  }, [user?.householdId, user?._id, updateUser]);

  // Chore actions
  const addChore = useCallback(async (choreData) => {
    const { data } = await choresAPI.create(choreData);
    // Socket will handle state update for others; update local state immediately
    setChores((prev) => [data, ...prev]);
    return data;
  }, []);

  const editChore = useCallback(async (id, updates) => {
    const { data } = await choresAPI.update(id, updates);
    setChores((prev) => prev.map((c) => (c._id === id ? data : c)));
    return data;
  }, []);

  const removeChore = useCallback(async (id) => {
    await choresAPI.delete(id);
    setChores((prev) => prev.filter((c) => c._id !== id));
  }, []);

  const completeChore = useCallback(async (id) => {
    const { data } = await choresAPI.complete(id);
    setChores((prev) => prev.map((c) => (c._id === id ? data.chore : c)));
    updateUser({
      totalScore: (user?.totalScore || 0) + data.pointsEarned,
      weeklyScore: (user?.weeklyScore || 0) + data.pointsEarned,
    });
    return data;
  }, [user, updateUser]);

  const unreadCount = notifications.filter(
    (n) => !n.readBy?.includes(user?._id)
  ).length;

  return (
    <AppContext.Provider
      value={{
        chores, household, members, notifications, loadingData, unreadCount,
        addChore, editChore, removeChore, completeChore, fetchAll,
        setHousehold, setMembers,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
};
