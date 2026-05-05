import { Link, Outlet, useLocation } from "react-router-dom";
import Header from "@/components/Header";
import { cn } from "@/lib/utils";
import { Users, Trophy, Shield, UserCog, LayoutDashboard, Crown, Settings as SettingsIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/badge";

export const AdminLayout = () => {
    const location = useLocation();
    const { user, isSuperAdmin } = useAuth();

    // Content management - visible to all admins
    const contentItems = [
        { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
        { to: "/admin/teams", label: "Teams", icon: Shield },
        { to: "/admin/players", label: "Players", icon: Users },
        { to: "/admin/matches", label: "Matches", icon: Trophy },
        { to: "/admin/users", label: "Users", icon: Users },
    ];

    // Administration - only for superadmin
    const administrationItems = [
        { to: "/admin/manage-admins", label: "Manage Admins", icon: UserCog },
        { to: "/admin/system-settings", label: "System Settings", icon: SettingsIcon },
    ];

    // Get role badge
    const getRoleBadge = () => {
        if (user?.role === "superadmin") {
            return (
                <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-xs">
                    <Crown className="w-3 h-3 mr-1" />
                    SUPERADMIN
                </Badge>
            );
        }
        return (
            <Badge className="bg-green-500 text-xs">
                <Shield className="w-3 h-3 mr-1" />
                ADMIN
            </Badge>
        );
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />
            <div className="container py-6 flex flex-col md:flex-row gap-6 flex-1">
                <aside className="w-full md:w-64 shrink-0">
                    <div className="card-glass rounded-xl p-4 space-y-4 sticky top-24">
                        {/* Admin Profile Section */}
                        <div className="pb-4 border-b border-border/50">
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                        <Shield className="w-5 h-5 text-primary" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold truncate">{user?.name}</p>
                                        <p className="text-xs text-muted-foreground truncate">
                                            {user?.email}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex justify-center">
                                    {getRoleBadge()}
                                </div>
                            </div>
                        </div>

                        {/* Content Management Section */}
                        <div className="space-y-1">
                            <h2 className="text-xs font-semibold text-muted-foreground px-3 mb-2 uppercase tracking-wider">
                                Content Management
                            </h2>
                            {contentItems.map((item) => {
                                const Icon = item.icon;
                                const active = location.pathname === item.to;
                                return (
                                    <Link
                                        key={item.to}
                                        to={item.to}
                                        className={cn(
                                            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                                            active
                                                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                                        )}
                                    >
                                        <Icon className="w-4 h-4" />
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Administration Section - Superadmin Only */}
                        {isSuperAdmin && (
                            <>
                                <div className="border-t border-border/50 pt-4">
                                    <div className="space-y-1">
                                        <h2 className="text-xs font-semibold text-muted-foreground px-3 mb-2 uppercase tracking-wider flex items-center gap-2">
                                            <Crown className="w-3 h-3 text-yellow-500" />
                                            Administration
                                        </h2>
                                        {administrationItems.map((item) => {
                                            const Icon = item.icon;
                                            const active = location.pathname === item.to;
                                            return (
                                                <Link
                                                    key={item.to}
                                                    to={item.to}
                                                    className={cn(
                                                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                                                        active
                                                            ? "bg-yellow-500/20 text-yellow-500 border border-yellow-500/50"
                                                            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                                                    )}
                                                >
                                                    <Icon className="w-4 h-4" />
                                                    {item.label}
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </aside>
                <main className="flex-1 min-w-0">
                    <Outlet />
                </main>
            </div>
            <Footer />
        </div>
    );
};
