import { Link, useLocation } from "wouter";
import { Home, Users, Layers, Building, Bell, Settings, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const navigationItems = [
  { href: "/dashboard", label: "Dashboard", shortLabel: "Dash", icon: Home },
  { href: "/namhattas", label: "Namhattas", shortLabel: "Nam", icon: Home },
  { href: "/devotees", label: "Devotees", shortLabel: "Dev", icon: Users },
  { href: "/updates", label: "Updates", shortLabel: "Upd", icon: Bell },
  { href: "/map", label: "Map View", shortLabel: "Map", icon: MapPin },
  { href: "/statuses", label: "Statuses", shortLabel: "Stat", icon: Layers },
  { href: "/shraddhakutirs", label: "Shraddhakutirs", shortLabel: "Shr", icon: Building },
];

export default function TopNav() {
  const [location] = useLocation();

  return (
    <nav className="flex justify-center px-1 overflow-hidden">
      <div className="flex items-center space-x-1 justify-center min-w-0">
        {navigationItems.map((item) => {
          const isActive = location === item.href || 
            (item.href !== "/dashboard" && location.startsWith(item.href));
          const Icon = item.icon;
          
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 relative whitespace-nowrap",
                  isActive
                    ? "bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-700/50 shadow-sm"
                    : "text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-slate-800/50 hover:text-gray-900 dark:hover:text-white"
                )}
              >
                <Icon className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="hidden md:inline text-sm">{item.label}</span>
                <span className="md:hidden text-xs">{item.shortLabel}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}