
import { Home, Calendar, ClipboardList, BarChart } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const Navigation = () => {
  const location = useLocation();
  
  const links = [
    { to: "/", label: "Home", icon: Home },
    { to: "/today", label: "Today's Routine", icon: ClipboardList },
    { to: "/manage", label: "Manage Routines", icon: Calendar },
    { to: "/stats", label: "Stats", icon: BarChart },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 sm:relative sm:border-t-0">
      <div className="max-w-screen-xl mx-auto">
        <div className="flex justify-around sm:justify-center sm:gap-8">
          {links.map(({ to, label, icon: Icon }) => {
            const isActive = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`flex flex-col items-center gap-1 transition-all duration-200 ${
                  isActive
                    ? "text-primary"
                    : "text-gray-500 hover:text-primary"
                }`}
              >
                <Icon size={24} />
                <span className="text-sm font-medium">{label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
