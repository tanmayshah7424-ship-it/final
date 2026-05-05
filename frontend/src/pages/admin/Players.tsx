import { useEffect, useState } from "react";
import { playersAPI, teamsAPI } from "@/api/endpoints";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2, X, Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const PlayersAdmin = () => {
    const [players, setPlayers] = useState<any[]>([]);
    const [teams, setTeams] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState({
        name: "", teamId: "", role: "", sport: "cricket",
        description: "", short_description: "", image_url: ""
    });
    const [submitting, setSubmitting] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        Promise.all([
            playersAPI.getAll({ sport: 'cricket' }), 
            teamsAPI.getAll({ sport: 'cricket' })
        ])
            .then(([pRes, tRes]) => {
                setPlayers(pRes.data);
                setTeams(tRes.data);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const fetchPlayers = async () => {
        const res = await playersAPI.getAll({ sport: 'cricket' });
        setPlayers(res.data);
    };

    const resetForm = () => {
        setForm({
            name: "", teamId: "", role: "", sport: "cricket",
            description: "", short_description: "", image_url: ""
        });
        setEditingId(null);
        setShowForm(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this player?")) return;
        try {
            await playersAPI.remove(id);
            fetchPlayers();
        } catch (err) {
            console.error(err);
        }
    };

    // ... handle handleSubmit and handleEdit ...
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            let playerId = editingId;
            if (editingId) {
                await playersAPI.update(editingId, form);
            } else {
                const res = await playersAPI.create(form);
                playerId = res.data._id;
            }

            // Sync to Supabase (Non-blocking)
            if (playerId) {
                try {
                    const { error: sbError } = await supabase
                        .from("players")
                        .upsert({
                            id: playerId as any,
                            name: form.name,
                            description: form.description,
                            short_description: form.short_description,
                            image_url: form.image_url,
                            sport: form.sport,
                            updated_at: new Date().toISOString()
                        } as any);

                    if (sbError) {
                        console.warn("Supabase sync failed:", sbError);
                        toast({
                            variant: "destructive",
                            title: "Sync Warning",
                            description: "Primary database updated, but Supabase sync failed. Bio and media might be outdated."
                        });
                    }
                } catch (sbErr: any) {
                    console.error("Supabase network error:", sbErr);
                    toast({
                        variant: "destructive",
                        title: "Sync Error",
                        description: "Could not connect to Supabase for enrichment sync. check your connection."
                    });
                }
            }

            toast({ title: "Success", description: "Player saved successfully." });
            resetForm();
            fetchPlayers();
        } catch (err: any) {
            console.error(err);
            toast({ variant: "destructive", title: "Error", description: err.message });
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = async (p: any) => {
        setLoading(true);
        try {
            const { data: sbData } = await supabase
                .from("players")
                .select("description, short_description, image_url, sport")
                .eq("id", p._id)
                .single();

            setForm({
                name: p.name,
                teamId: p.teamId?._id || p.teamId,
                role: p.role,
                sport: p.sport || (sbData as any)?.sport || "cricket",
                description: (sbData as any)?.description || "",
                short_description: (sbData as any)?.short_description || "",
                image_url: (sbData as any)?.image_url || ""
            });
            setEditingId(p._id);
            setShowForm(true);
        } catch (err) {
            console.error(err);
            setForm({
                name: p.name, teamId: p.teamId?._id || p.teamId, role: p.role, sport: p.sport,
                description: "", short_description: "", image_url: ""
            });
            setEditingId(p._id);
            setShowForm(true);
        } finally {
            setLoading(false);
        }
    };

    // UI render part
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Manage Players</h1>
                <Button onClick={() => { resetForm(); setShowForm(true); }} className="gap-2">
                    <Plus className="w-4 h-4" /> Add Player
                </Button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="card-glass rounded-xl p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold">{editingId ? "Edit Player" : "New Player"}</h2>
                        <button type="button" onClick={resetForm} title="Close form"><X className="w-5 h-5" /></button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Name</Label>
                            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="bg-secondary/50" />
                        </div>
                        <div className="space-y-2">
                            <Label>Team</Label>
                            <select value={form.teamId} onChange={(e) => setForm({ ...form, teamId: e.target.value })} title="Select Team" required className="w-full rounded-md bg-secondary/50 border border-input px-3 py-2 text-sm">
                                <option value="">Select team</option>
                                {teams.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label>Role</Label>
                            <Input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} required placeholder="Forward, Batsman, Guard..." className="bg-secondary/50" />
                        </div>
                        <div className="space-y-2">
                            <Label>Sport</Label>
                            <select value={form.sport} onChange={(e) => setForm({ ...form, sport: e.target.value })} title="Select Sport" className="w-full rounded-md bg-secondary/50 border border-input px-3 py-2 text-sm">
                                <option value="cricket">Cricket</option>
                            </select>
                        </div>

                        <div className="space-y-2 sm:col-span-2">
                            <Label>Short Description (Wiki)</Label>
                            <Input value={form.short_description} onChange={(e) => setForm({ ...form, short_description: e.target.value })} placeholder="e.g. Indian cricketer (born 1988)" className="bg-secondary/50" />
                        </div>

                        <div className="space-y-2 sm:col-span-2">
                            <Label>Profile Image URL (Wiki)</Label>
                            <Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." className="bg-secondary/50" />
                        </div>

                        <div className="space-y-2 sm:col-span-2">
                            <div className="flex items-center justify-between">
                                <Label>Full Biography (Wiki)</Label>
                                {editingId && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={async () => {
                                            setSyncing(true);
                                            try {
                                                const { data, error } = await supabase.functions.invoke('fetch-wikipedia-bio', {
                                                    body: { playerId: editingId, playerName: form.name }
                                                });
                                                if (error) throw error;
                                                setForm({
                                                    ...form,
                                                    description: data.description,
                                                    short_description: data.shortDescription || form.short_description,
                                                    image_url: data.imageUrl || form.image_url
                                                });
                                                toast({ title: "Synced", description: "Enriched data fetched from Wikipedia." });
                                            } catch (err: any) {
                                                console.error(err);
                                                toast({ variant: "destructive", title: "Sync failed", description: err.message });
                                            } finally {
                                                setSyncing(false);
                                            }
                                        }}
                                        disabled={syncing}
                                        className="h-7 text-[10px] gap-1 px-2"
                                    >
                                        {syncing ? <Loader2 className="w-3 h-3 animate-spin" /> : "🌐"}
                                        Sync Wikipedia
                                    </Button>
                                )}
                            </div>
                            <Textarea
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                placeholder="Enter player biography..."
                                className="bg-secondary/50 min-h-[120px]"
                            />
                        </div>
                    </div>
                    <Button type="submit" disabled={submitting} className="gap-2">
                        {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                        {editingId ? "Update" : "Create"} Player
                    </Button>
                </form>
            )}

            {loading ? (
                <div className="flex justify-center py-8">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
            ) : (
                <div className="space-y-2">
                    {players.map((p) => (
                        <div key={p._id} className="card-glass rounded-lg p-4 flex items-center gap-4">
                            <div className="flex-1">
                                <p className="font-semibold">{p.name}</p>
                                <p className="text-xs text-muted-foreground">{p.role} • {p.teamId?.name || "No team"} • {p.sport}</p>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="ghost" size="sm" onClick={() => handleEdit(p)}>
                                    <Pencil className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleDelete(p._id)} className="text-destructive hover:text-destructive">
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PlayersAdmin;
