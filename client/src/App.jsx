import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { AppProvider } from "./context/AppContext";

import LoginPage       from "./pages/LoginPage";
import RegisterPage    from "./pages/RegisterPage";
import HouseholdSetup  from "./pages/HouseholdSetup";
import DashboardPage   from "./pages/DashboardPage";
import ChoresPage      from "./pages/ChoresPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import NotificationsPage from "./pages/NotificationsPage";
import Layout          from "./components/common/Layout";

// Guards
const RequireAuth = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex h-screen items-center justify-center text-purple-400">Loading…</div>;
  return user ? children : <Navigate to="/login" replace />;
};

const RequireHousehold = ({ children }) => {
  const { user } = useAuth();
  if (!user?.householdId) return <Navigate to="/setup" replace />;
  return children;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/login"    element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />

    <Route path="/setup" element={
      <RequireAuth><HouseholdSetup /></RequireAuth>
    } />

    <Route path="/" element={
      <RequireAuth>
        <RequireHousehold>
          <AppProvider>
            <Layout />
          </AppProvider>
        </RequireHousehold>
      </RequireAuth>
    }>
      <Route index         element={<DashboardPage />} />
      <Route path="chores" element={<ChoresPage />} />
      <Route path="leaderboard" element={<LeaderboardPage />} />
      <Route path="notifications" element={<NotificationsPage />} />
    </Route>

    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
