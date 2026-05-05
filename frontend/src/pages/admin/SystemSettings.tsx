import { useState, useEffect } from "react";
import { systemAPI, notificationsAPI } from "@/api/endpoints";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Settings as SettingsIcon, Radio, Bell, Zap, MousePointer2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SystemSettings() {
    const [apiMode, setApiMode] = useState("api");
    const [notificationTitle, setNotificationTitle] = useState("");
    const [notificationMessage, setNotificationMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            setLoading(true);
            const response = await systemAPI.getSettings();
            setApiMode(response.data.apiMode);
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to load settings",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSaveSettings = async () => {
        try {
            await systemAPI.updateSettings({ apiMode });
            toast({
                title: "Configuration Updated",
                description: `System data source switched to ${apiMode.toUpperCase()} mode.`,
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to save settings",
                variant: "destructive",
            });
        }
    };

    const handleBroadcastNotification = async () => {
        if (!notificationTitle.trim() || !notificationMessage.trim()) {
            toast({
                title: "Incomplete Data",
                description: "Please enter both title and message for the broadcast.",
                variant: "destructive",
            });
            return;
        }

        try {
            await notificationsAPI.sendSystem({
                title: notificationTitle,
                message: notificationMessage,
            });
            toast({
                title: "Broadcast Successful",
                description: "Your notification has been dispatched to all active users.",
            });
            setNotificationTitle("");
            setNotificationMessage("");
        } catch (error) {
            toast({
                title: "Broadcast Failed",
                description: "There was an error sending the system-wide message.",
                variant: "destructive",
            });
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-muted-foreground animate-pulse font-medium">Fetching system parameters...</p>
            </div>
        );
    }

    return (
        <div className="space-y-10 max-w-5xl mx-auto py-4">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-2xl">
                    <SettingsIcon className="w-8 h-8 text-primary" />
                </div>
                <div>
                    <h1 className="text-4xl font-black tracking-tighter">
                        SYSTEM <span className="text-primary">CORE</span>
                    </h1>
                    <p className="text-muted-foreground font-medium">
                        Configure global parameters and manage platform-wide communications.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Data Source Configuration */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="card-glass p-8 rounded-3xl border-border/50 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Radio className="w-24 h-24" />
                        </div>
                        
                        <div className="flex items-center gap-3 mb-6">
                            <Radio className="w-5 h-5 text-primary" />
                            <h2 className="text-xl font-bold uppercase tracking-tight">Data Engine</h2>
                        </div>
                        
                        <div className="space-y-4">
                            {[
                                { id: 'api', title: 'API-Sports Live', desc: 'Real-time synchronization with global cricket databases.', icon: Zap },
                                { id: 'manual', title: 'Manual Scoring', desc: 'Direct control over match states and scoring events.', icon: MousePointer2 }
                            ].map((mode) => (
                                <button
                                    key={mode.id}
                                    onClick={() => setApiMode(mode.id)}
                                    className={`w-full p-5 rounded-2xl border-2 transition-all text-left relative overflow-hidden ${
                                        apiMode === mode.id
                                            ? "border-primary bg-primary/5 shadow-inner"
                                            : "border-border/40 hover:border-primary/30 bg-secondary/20"
                                    }`}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`p-2 rounded-lg ${apiMode === mode.id ? 'bg-primary text-black' : 'bg-secondary text-muted-foreground'}`}>
                                            <mode.icon className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="font-bold">{mode.title}</p>
                                            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{mode.desc}</p>
                                        </div>
                                    </div>
                                    {apiMode === mode.id && (
                                        <div className="absolute top-2 right-2">
                                            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>

                        <Button 
                            onClick={handleSaveSettings} 
                            className="w-full mt-8 h-12 rounded-xl bg-primary hover:bg-primary/90 text-black font-black uppercase tracking-widest shadow-lg shadow-primary/20"
                        >
                            Commit Changes
                        </Button>
                    </div>
                </div>

                {/* Broadcast Hub */}
                <div className="lg:col-span-7">
                    <div className="card-glass p-8 rounded-3xl border-border/50 shadow-2xl space-y-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Bell className="w-32 h-32" />
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/10 rounded-lg">
                                <Bell className="w-5 h-5 text-blue-500" />
                            </div>
                            <h2 className="text-xl font-bold uppercase tracking-tight text-blue-400">Broadcast Center</h2>
                        </div>
                        
                        <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
                            Dispatch critical updates, emergency maintenance alerts, or match news to every connected client instantly.
                        </p>

                        <div className="space-y-6 pt-2">
                            <div className="space-y-2">
                                <Label htmlFor="notification-title" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Message Headline</Label>
                                <Input
                                    id="notification-title"
                                    value={notificationTitle}
                                    onChange={(e) => setNotificationTitle(e.target.value)}
                                    placeholder="e.g., Live IPL Stream Starting Now!"
                                    className="h-12 bg-secondary/30 border-border/50 rounded-xl focus:ring-blue-500/50"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notification-message" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Context / Details</Label>
                                <textarea
                                    id="notification-message"
                                    value={notificationMessage}
                                    onChange={(e) => setNotificationMessage(e.target.value)}
                                    placeholder="Provide more information for the users..."
                                    className="w-full min-h-[120px] p-4 bg-secondary/30 border border-border/50 rounded-xl focus:ring-blue-500/50 focus:outline-none text-sm transition-all resize-none"
                                />
                            </div>

                            <Button 
                                onClick={handleBroadcastNotification} 
                                className="w-full h-14 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 group"
                            >
                                <Radio className="w-5 h-5 mr-3 group-hover:animate-pulse" />
                                Dispatch Broadcast
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
