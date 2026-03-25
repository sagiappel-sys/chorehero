import { Outlet, NavLink } from "react-router-dom";
import { useApp } from "../../context/AppContext";

const tabs = [
  { to: "/",             icon: "🏠", label: "Home",    end: true },
  { to: "/chores",       icon: "📋", label: "Chores"           },
  { to: "/leaderboard",  icon: "🏆", label: "Ranks"            },
  { to: "/notifications",icon: "🔔", label: "Activity"         },
];

export default function Layout() {
  const { unreadCount } = useApp();

  return (
    <div className="flex flex-col min-h-dvh max-w-md mx-auto">
      {/* Page content */}
      <main className="flex-1 overflow-y-auto pb-24 px-4 pt-6">
        <Outlet />
      </main>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50"
           style={{ background: "rgba(15,12,26,0.95)", backdropFilter: "blur(16px)",
                    borderTop: "1px solid rgba(168,85,247,0.15)" }}>
        <div className="flex justify-around px-2 py-2">
          {tabs.map(({ to, icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `nav-tab ${isActive ? "active" : ""}`}
            >
              <span className="relative text-xl">
                {icon}
                {label === "Activity" && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-2 h-4 w-4 rounded-full bg-purple-500 text-[10px] font-bold flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </span>
              <span>{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
