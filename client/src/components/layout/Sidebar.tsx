import { Link, useLocation } from "wouter";
import { X, Home, Users, Layers, Building, Bell, Settings, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface SidebarProps {
  onClose?: () => void;
}

const navigationItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home, active: true },
  { href: "/namhattas", label: "Namhattas", icon: Home },
  { href: "/devotees", label: "Devotees", icon: Users },
  { href: "/updates", label: "Updates", icon: Bell },
  { href: "/map", label: "Map View", icon: MapPin },
  { href: "/statuses", label: "Statuses", icon: Layers },
  { href: "/shraddhakutirs", label: "Shraddhakutirs", icon: Building },
];

export default function Sidebar({ onClose }: SidebarProps) {
  const [location] = useLocation();

  return (
    <div className="flex-1 flex flex-col min-h-0 glass-card border-0 border-r border-white/20 dark:border-slate-700/50">
      {/* Logo Section */}
      <div className="flex items-center h-20 flex-shrink-0 px-6 border-b border-white/20 dark:border-slate-700/50">
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="mr-2 lg:hidden"
          >
            <X className="h-5 w-5" />
          </Button>
        )}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
            <span className="text-white text-lg font-bold">ॐ</span>
          </div>
          <div>
            <h1 className="text-xl font-bold gradient-text">Namhatta</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Management System</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {navigationItems.map((item) => {
          const isActive = location === item.href || (location === "/" && item.href === "/dashboard");
          const Icon = item.icon;
          
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "nav-item group cursor-pointer",
                  isActive ? "nav-item-active" : "nav-item-inactive"
                )}
                onClick={onClose}
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.label}
                {item.badge && (
                  <Badge
                    variant="secondary"
                    className="ml-auto bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300"
                  >
                    {item.badge}
                  </Badge>
                )}
                {item.notification && (
                  <div className="ml-auto w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* User Profile Section */}
      <div className="flex-shrink-0 p-4 border-t border-white/20 dark:border-slate-700/50">
        <div className="flex items-center space-x-3 p-3 rounded-xl bg-white/50 dark:bg-slate-700/50">
          <Avatar>
            <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-teal-500 text-white">
              AD
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              Admin User
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              System Administrator
            </p>
          </div>
          <Button variant="ghost" size="icon" className="flex-shrink-0">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
