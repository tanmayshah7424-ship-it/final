import { useState, useEffect } from "react";
import { authAPI } from "@/api/endpoints";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
    Shield, UserX, UserCheck, Trash2, Crown, Activity, 
    Users as UsersIcon, User as UserIcon, ShieldAlert 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
}

export default function ManageAdmins() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const { user: currentUser } = useAuth();
    const { toast } = useToast();

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const response = await authAPI.getUsers();
            setUsers(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to load users",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handlePromoteToAdmin = async (userId: string) => {
        try {
            await authAPI.updateUserRole(userId, "admin");
            toast({
                title: "Success",
                description: "User promoted to admin",
            });
            loadUsers();
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to promote user",
                variant: "destructive",
            });
        }
    };

    const handleDemoteToUser = async (userId: string) => {
        try {
            await authAPI.updateUserRole(userId, "user");
            toast({
                title: "Success",
                description: "Admin demoted to user",
            });
            loadUsers();
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to demote admin",
                variant: "destructive",
            });
        }
    };

    const handleDeleteUser = async (userId: string, userName: string) => {
        if (!confirm(`Are you sure you want to delete ${userName}? This action cannot be undone.`)) {
            return;
        }

        try {
            await authAPI.deleteUser(userId);
            toast({
                title: "Success",
                description: "User deleted successfully",
            });
            loadUsers();
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to delete user",
                variant: "destructive",
            });
        }
    };

    const getRoleBadge = (role: string) => {
        if (role === "superadmin") {
            return (
                <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 border-none shadow-lg shadow-orange-500/20 px-3">
                    <Crown className="w-3 h-3 mr-1.5" />
                    SUPERADMIN
                </Badge>
            );
        }
        if (role === "admin") {
            return (
                <Badge className="bg-primary hover:bg-primary border-none px-3">
                    <Shield className="w-3 h-3 mr-1.5" />
                    ADMIN
                </Badge>
            );
        }
        return <Badge variant="secondary" className="px-3">USER</Badge>;
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-muted-foreground animate-pulse font-medium">Synchronizing user data...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter flex items-center gap-3">
                        ADMIN <span className="text-primary underline decoration-primary/20">CONTROL</span>
                    </h1>
                    <p className="text-muted-foreground mt-2 font-medium">
                        Promote users, manage roles, and monitor administrative access.
                    </p>
                </div>
                <Button onClick={loadUsers} variant="outline" className="h-10 px-6 rounded-xl border-border/50 hover:bg-secondary">
                    <Activity className="w-4 h-4 mr-2" />
                    Refresh List
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                    { label: "Platform Users", value: users.length, icon: UsersIcon, color: "text-blue-500", bg: "bg-blue-500/10" },
                    { label: "Active Administrators", value: users.filter((u) => u.role === "admin").length, icon: Shield, color: "text-green-500", bg: "bg-green-500/10" },
                    { label: "Regular Base", value: users.filter((u) => u.role === "user").length, icon: UserIcon, color: "text-purple-500", bg: "bg-purple-500/10" }
                ].map((stat, i) => (
                    <div key={i} className="card-glass p-6 rounded-2xl border-border/50 shadow-xl group hover:border-primary/30 transition-all">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-xl ${stat.bg}`}>
                                <stat.icon className={`w-6 h-6 ${stat.color}`} />
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                                <p className="text-3xl font-black">{stat.value}</p>
                            </div>
                        </div>
                        <Progress 
                            value={(stat.value / (users.length || 1)) * 100} 
                            className="h-1.5" 
                        />
                    </div>
                ))}
            </div>

            {/* Users Table */}
            <div className="card-glass rounded-2xl overflow-hidden border border-border/50 shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-secondary/40 border-b border-border/50">
                                <th className="px-8 py-5 text-left text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">User Profile</th>
                                <th className="px-8 py-5 text-left text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Access Level</th>
                                <th className="px-8 py-5 text-right text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Administrative Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/30">
                            {users.map((user) => (
                                <tr key={user._id} className="hover:bg-primary/5 transition-colors group">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-secondary/50 flex items-center justify-center border border-border/50 group-hover:scale-105 transition-transform text-xl shadow-inner">
                                                {user.role === 'superadmin' ? '👑' : user.role === 'admin' ? '🛡️' : '👤'}
                                            </div>
                                            <div>
                                                <p className="font-bold text-lg leading-tight">{user.name}</p>
                                                <p className="text-sm text-muted-foreground font-mono">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">{getRoleBadge(user.role)}</td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center justify-end gap-3 opacity-80 group-hover:opacity-100 transition-opacity">
                                            {user.role === "user" && (
                                                <Button
                                                    size="sm"
                                                    onClick={() => handlePromoteToAdmin(user._id)}
                                                    className="bg-green-500 hover:bg-green-600 text-black font-bold h-9 px-4 rounded-lg shadow-lg shadow-green-500/20"
                                                >
                                                    <UserCheck className="w-4 h-4 mr-2" />
                                                    Promote
                                                </Button>
                                            )}
                                            {user.role === "admin" && (
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleDemoteToUser(user._id)}
                                                        className="h-9 px-4 rounded-lg border-border/50 bg-secondary/30"
                                                    >
                                                        <UserX className="w-4 h-4 mr-2" />
                                                        Demote
                                                    </Button>
                                                    {user._id !== currentUser?._id && (
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            onClick={() => handleDeleteUser(user._id, user.name)}
                                                            className="h-9 px-4 rounded-lg"
                                                        >
                                                            <Trash2 className="w-4 h-4 mr-2" />
                                                            Delete
                                                        </Button>
                                                    )}
                                                </div>
                                            )}
                                            {user.role === "superadmin" && (
                                                <div className="flex items-center gap-2 text-muted-foreground bg-secondary/20 px-4 py-2 rounded-lg border border-border/50">
                                                    <ShieldAlert className="w-4 h-4" />
                                                    <span className="text-[10px] font-black tracking-widest uppercase">System Protected</span>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
