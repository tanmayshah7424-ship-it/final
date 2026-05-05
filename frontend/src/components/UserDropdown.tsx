import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { User, Settings, LogOut, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export const UserDropdown = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          title="User Profile"
          aria-label="Open user profile menu"
          className="relative h-10 w-10 rounded-full p-0 overflow-hidden border border-white/10 hover:border-blue-500/50 transition-colors"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600 opacity-20" />
          <User className="w-5 h-5 text-blue-400" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-[#0a0a0a]/95 backdrop-blur-xl border-white/10 text-white p-2 rounded-2xl" align="end" forceMount>
        <DropdownMenuLabel className="font-outfit">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-bold leading-none">{user?.name || "User"}</p>
            <p className="text-xs leading-none text-gray-500 capitalize">{user?.role || "Member"}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-white/5" />
        <DropdownMenuItem onClick={() => navigate("/admin")} className="focus:bg-blue-600/20 focus:text-blue-400 rounded-lg py-2.5 cursor-pointer">
          <ShieldCheck className="mr-2 h-4 w-4" />
          <span>Admin Dashboard</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate("/settings")} className="focus:bg-white/5 rounded-lg py-2.5 cursor-pointer">
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-white/5" />
        <DropdownMenuItem onClick={handleLogout} className="focus:bg-red-600/20 focus:text-red-400 text-red-400 rounded-lg py-2.5 cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
