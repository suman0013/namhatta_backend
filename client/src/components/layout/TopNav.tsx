import { Link, useLocation } from "wouter";
import { Home, Users, Layers, Building, Bell, Settings, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const navigationItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/namhattas", label: "Namhattas", icon: Home, badge: "24" },
  { href: "/devotees", label: "Devotees", icon: Users, badge: "1,247" },
  { href: "/updates", label: "Updates", icon: Bell, badge: "12" },
  { href: "/map", label: "Map View", icon: MapPin },
  { href: "/statuses", label: "Statuses", icon: Layers },
  { href: "/shraddhakutirs", label: "Shraddhakutirs", icon: Building },
];

export default function TopNav() {
  const [location] = useLocation();

  return (
    <nav className="flex justify-center px-4">
      <div className="flex items-center space-x-1">
        {navigationItems.map((item) => {
          const isActive = location === item.href || 
            (item.href !== "/dashboard" && location.startsWith(item.href));
          const Icon = item.icon;
          
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex items-center px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 relative whitespace-nowrap",
                  isActive
                    ? "bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-700/50 shadow-sm"
                    : "text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-slate-800/50 hover:text-gray-900 dark:hover:text-white"
                )}
              >
                <Icon className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="text-sm">{item.label}</span>
                {item.badge && (
                  <Badge
                    variant={isActive ? "default" : "secondary"}
                    className="ml-2 h-4 text-xs flex-shrink-0 px-1.5"
                  >
                    {item.badge}
                  </Badge>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}