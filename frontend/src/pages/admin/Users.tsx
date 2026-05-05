import { useState, useEffect } from "react";
import { Shield, ShieldAlert, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { authAPI } from "@/api/endpoints";
import { Button } from "@/components/ui/button";

interface UserData {
    _id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
}

const Users = () => {
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const { isSuperAdmin } = useAuth();

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await authAPI.getUsers();
            setUsers(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("Failed to fetch users:", err);
        } finally {
            setLoading(false);
        }
    };

    const updateRole = async (userId: string, newRole: string) => {
        try {
            await authAPI.updateUserRole(userId, newRole);
            fetchUsers();
        } catch (err: any) {
            console.error(err);
            alert(err.response?.data?.message || "Failed to update role");
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">User Management</h1>
                    <p className="text-muted-foreground mt-1">View and manage all registered users</p>
                </div>
                <div className="bg-primary/10 px-4 py-2 rounded-full border border-primary/20">
                    <span className="text-sm font-bold text-primary">Total: {users.length}</span>
                </div>
            </div>

            <div className="card-glass rounded-xl overflow-hidden border border-border/50">
                {loading ? (
                    <div className="p-12 flex flex-col items-center justify-center gap-4">
                        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                        <p className="text-sm text-muted-foreground animate-pulse">Loading users...</p>
                    </div>
                ) : users.length === 0 ? (
                    <div className="p-12 text-center space-y-3">
                        <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto">
                            <User className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-bold">No Users Found</h3>
                        <p className="text-sm text-muted-foreground">There are currently no registered users in the system.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-border/50">
                        {users.map((user) => (
                            <div key={user._id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-secondary/20 transition-colors group">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-secondary/50 flex items-center justify-center border border-border/50 group-hover:scale-105 transition-transform">
                                        {user.role === "superadmin" ? (
                                            <ShieldAlert className="w-6 h-6 text-yellow-500" />
                                        ) : user.role === "admin" ? (
                                            <Shield className="w-6 h-6 text-primary" />
                                        ) : (
                                            <User className="w-6 h-6 text-muted-foreground" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-bold text-lg">{user.name || "Unnamed User"}</p>
                                        <p className="text-sm text-muted-foreground font-mono">{user.email}</p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-4">
                                    <div className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest ${user.role === "superadmin"
                                        ? "bg-yellow-500 text-black"
                                        : user.role === "admin"
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-secondary text-muted-foreground"
                                        }`}>
                                        {user.role?.toUpperCase() || "USER"}
                                    </div>
                                    <span className="text-xs text-muted-foreground bg-secondary/30 px-3 py-1 rounded-md">
                                        Joined {new Date(user.createdAt).toLocaleDateString()}
                                    </span>
                                    {isSuperAdmin && user.role !== "superadmin" && (
                                        <div className="flex gap-2">
                                            {user.role === "admin" ? (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => updateRole(user._id, "user")}
                                                    className="h-8 text-xs"
                                                >
                                                    Demote
                                                </Button>
                                            ) : (
                                                <Button
                                                    size="sm"
                                                    onClick={() => updateRole(user._id, "admin")}
                                                    className="h-8 text-xs"
                                                >
                                                    Promote
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Users;
