import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  Home, Trophy, Users, History, Star, Search, Menu, X, 
  Target, Zap, Brain, Bell, User, LogIn, ChevronRight
} from "lucide-react";
import { useState, useEffect } from "react";
import { UserDropdown } from "./UserDropdown";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { NotificationPanel } from "./NotificationPanel";

const navItems = [
  { to: "/", label: "Live", icon: Home },
  { to: "/matches", label: "Matches", icon: Trophy },
  { to: "/live-cricket", label: "Cricket", icon: Trophy, isCricket: true },
  { to: "/teams", label: "Teams", icon: Users },
  { to: "/history", label: "History", icon: History },
  { to: "/favorites", label: "Favorites", icon: Star },
  { to: "/player-stats", label: "Player Stats", icon: Target },
  { to: "/gen-ai", label: "Gen AI", icon: Zap, isAi: true },
  { to: "/agentic-ai", label: "Agentic AI", icon: Brain, isAi: true },
];

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="sticky top-0 z-50 flex flex-col bg-background border-b border-border transition-colors duration-300">
      {/* Top Row: Logo, Search, Actions */}
      <div className="h-16 flex items-center justify-between px-6 lg:px-12 w-full border-b border-border">
        <Link to="/" className="flex items-center gap-3 shrink-0">
          <img src="/logo.png" alt="" className="h-10 w-auto" />
          <span className="font-outfit font-black text-2xl text-foreground tracking-tighter">
            Score<span className="text-primary">Hub</span>
          </span>
        </Link>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center relative">
            <Search className="absolute left-4 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search matches, teams, players..." 
              className="w-64 lg:w-96 bg-muted border border-input rounded-full py-2 pl-11 pr-4 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/60"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const val = (e.target as HTMLInputElement).value;
                  if (val) navigate(`/search?q=${encodeURIComponent(val)}`);
                }
              }}
            />
          </div>

          <div className="flex items-center gap-4">
             <ThemeToggle />
             <NotificationPanel />
             
             <button className="xl:hidden p-2 text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
               {mobileOpen ? <X /> : <Menu />}
             </button>

             {user ? (
               <UserDropdown />
             ) : (
               <Link to="/login">
                 <button className="hidden md:flex items-center gap-2 bg-green-500 hover:bg-green-600 text-black font-bold px-5 py-2 rounded-lg transition-all shadow-[0_0_20px_rgba(34,197,94,0.2)]">
                   <LogIn className="w-4 h-4" />
                   <span>Login</span>
                 </button>
               </Link>
             )}
          </div>
        </div>
      </div>

      {/* Bottom Row: Navigation */}
      <div className={cn(
        "hidden xl:flex items-center px-12 h-14 transition-all duration-300",
        scrolled ? "bg-black/80 backdrop-blur-md" : "bg-transparent"
      )}>
        <nav className="flex items-center gap-8 h-full">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to;
            
            if (item.label === "Agentic AI") {
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold border transition-all",
                    isActive 
                      ? "bg-green-500/20 border-green-500 text-green-400" 
                      : "bg-green-500/5 border-green-500/30 text-green-500 hover:bg-green-500/10"
                  )}
                >
                  <Brain className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            }

            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-2 text-sm font-bold transition-all group relative h-full",
                  isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {item.isCricket ? (
                  <span className="text-sm">🏏</span>
                ) : (
                  <Icon className={cn(
                    "w-4 h-4",
                    isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                  )} />
                )}
                <span>{item.label}</span>
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary rounded-t-full" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileOpen && (
        <div className="xl:hidden fixed inset-0 top-16 bg-background z-40 p-4 overflow-y-auto animate-in slide-in-from-top duration-300">
          <div className="flex flex-col gap-2">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center justify-between p-4 rounded-xl border transition-all",
                  location.pathname === item.to 
                    ? "bg-white/10 border-white/20 text-white" 
                    : "bg-white/5 border-white/5 text-gray-400"
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-5 h-5" />
                  <span className="font-bold">{item.label}</span>
                </div>
                <ChevronRight className="w-4 h-4" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};


