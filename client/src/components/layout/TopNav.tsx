import { Link, useLocation } from "wouter";
import { Home, Users, Layers, Building, Bell, Settings, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const navigationItems = [
  { href: "/dashboard", label: "Dashboard", shortLabel: "Dash", icon: Home },
  { href: "/namhattas", label: "Namhattas", shortLabel: "Nam", icon: Home, badge: "24" },
  { href: "/devotees", label: "Devotees", shortLabel: "Dev", icon: Users, badge: "1,247" },
  { href: "/updates", label: "Updates", shortLabel: "Upd", icon: Bell, badge: "12" },
  { href: "/map", label: "Map View", shortLabel: "Map", icon: MapPin },
  { href: "/statuses", label: "Statuses", shortLabel: "Stat", icon: Layers },
  { href: "/shraddhakutirs", label: "Shraddhakutirs", shortLabel: "Shr", icon: Building },
];

export default function TopNav() {
  const [location] = useLocation();

  return (
    <nav className="flex justify-center px-1 overflow-x-auto">
      <div className="flex items-center space-x-0.5 min-w-fit">
        {navigationItems.map((item) => {
          const isActive = location === item.href || 
            (item.href !== "/dashboard" && location.startsWith(item.href));
          const Icon = item.icon;
          
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex items-center px-1.5 lg:px-2 xl:px-3 py-1 lg:py-1.5 text-xs lg:text-sm font-medium rounded-md lg:rounded-lg transition-all duration-200 relative whitespace-nowrap",
                  isActive
                    ? "bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-700/50 shadow-sm"
                    : "text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-slate-800/50 hover:text-gray-900 dark:hover:text-white"
                )}
              >
                <Icon className="w-3 lg:w-4 h-3 lg:h-4 mr-1 lg:mr-1.5 flex-shrink-0" />
                <span className="hidden lg:inline text-xs lg:text-sm">{item.label}</span>
                <span className="lg:hidden text-xs">{item.shortLabel}</span>
                {item.badge && (
                  <Badge
                    variant={isActive ? "default" : "secondary"}
                    className="ml-1 lg:ml-1.5 h-3 lg:h-4 text-xs flex-shrink-0 px-1 py-0"
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