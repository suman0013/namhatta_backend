import { Menu, Moon, Sun, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const { user, logout, isAuthEnabled } = useAuth();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="flex items-center space-x-2">
      {/* Theme Toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="glass rounded-xl"
        onClick={toggleTheme}
      >
        {theme === "dark" ? (
          <Sun className="h-5 w-5 text-yellow-400" />
        ) : (
          <Moon className="h-5 w-5" />
        )}
      </Button>

      {/* User Menu - only show if auth is enabled */}
      {isAuthEnabled && user && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="glass rounded-xl">
              <User className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="glass-card border-white/20 w-56">
            <div className="px-2 py-1.5 text-sm">
              <div className="font-medium">{user.username}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                {user.role.toLowerCase().replace('_', ' ')}
              </div>
              
              {/* Show districts for District Supervisors */}
              {user.role === 'DISTRICT_SUPERVISOR' && user.districts && user.districts.length > 0 && (
                <div className="mt-2 pt-2 border-t border-white/20">
                  <div className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                    Assigned Districts:
                  </div>
                  <div className="space-y-1">
                    {user.districts.map((district, index) => (
                      <div key={index} className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
                        {typeof district === 'string' ? district : district.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <DropdownMenuSeparator className="bg-white/20" />
            <DropdownMenuItem 
              onClick={handleLogout}
              className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
