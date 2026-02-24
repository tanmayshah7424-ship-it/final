import { useEffect, useState } from "react";
import { teamsAPI } from "@/api/endpoints";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2, X } from "lucide-react";

const TeamsAdmin = () => {
    const [teams, setTeams] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState({ name: "", shortName: "", logo: "🏆", sport: "cricket", players: 0, matchesPlayed: 0, wins: 0 });

    const fetchTeams = async () => {
        try {
            const res = await teamsAPI.getAll();
            setTeams(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchTeams(); }, []);

    const resetForm = () => {
        setForm({ name: "", shortName: "", logo: "🏆", sport: "cricket", players: 0, matchesPlayed: 0, wins: 0 });
        setEditingId(null);
        setShowForm(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingId) {
                await teamsAPI.update(editingId, form);
            } else {
                await teamsAPI.create(form);
            }
            resetForm();
            fetchTeams();
        } catch (err) {
            console.error(err);
        }
    };

    const handleEdit = (team: any) => {
        setForm({ name: team.name, shortName: team.shortName, logo: team.logo, sport: team.sport, players: team.players || 0, matchesPlayed: team.matchesPlayed || 0, wins: team.wins || 0 });
        setEditingId(team._id);
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this team?")) return;
        try {
            await teamsAPI.remove(id);
            fetchTeams();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Manage Teams</h1>
                <Button onClick={() => { resetForm(); setShowForm(true); }} className="gap-2">
                    <Plus className="w-4 h-4" /> Add Team
                </Button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="card-glass rounded-xl p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold">{editingId ? "Edit Team" : "New Team"}</h2>
                        <button type="button" onClick={resetForm}><X className="w-5 h-5" /></button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Name</Label>
                            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="bg-secondary/50" />
                        </div>
                        <div className="space-y-2">
                            <Label>Short Name</Label>
                            <Input value={form.shortName} onChange={(e) => setForm({ ...form, shortName: e.target.value })} required className="bg-secondary/50" />
                        </div>
                        <div className="space-y-2">
                            <Label>Logo (emoji or URL)</Label>
                            <Input value={form.logo} onChange={(e) => setForm({ ...form, logo: e.target.value })} className="bg-secondary/50" placeholder="🏆 or https://..." />
                        </div>
                        <div className="space-y-2">
                            <Label>Sport</Label>
                            <select value={form.sport} onChange={(e) => setForm({ ...form, sport: e.target.value })} className="w-full rounded-md bg-secondary/50 border border-input px-3 py-2 text-sm">
                                <option value="cricket">Cricket</option>
                                <option value="football">Football</option>
                                <option value="basketball">Basketball</option>
                                <option value="tennis">Tennis</option>
                            </select>
                        </div>
                    </div>
                    <Button type="submit">{editingId ? "Update" : "Create"} Team</Button>
                </form>
            )}

            {loading ? (
                <div className="flex justify-center py-8">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
            ) : (
                <div className="space-y-2">
                    {teams.map((team) => (
                        <div key={team._id} className="card-glass rounded-lg p-4 flex items-center gap-4">
                            <div className="w-10 h-10 flex items-center justify-center text-2xl overflow-hidden shrink-0">
                                {team.logo?.startsWith('http') ? (
                                    <img src={team.logo} alt="" className="w-full h-full object-contain" />
                                ) : (
                                    team.logo || "🛡️"
                                )}
                            </div>
                            <div className="flex-1">
                                <p className="font-semibold">{team.name}</p>
                                <p className="text-xs text-muted-foreground">{team.shortName} • {team.sport}</p>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="ghost" size="sm" onClick={() => handleEdit(team)}>
                                    <Pencil className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleDelete(team._id)} className="text-destructive hover:text-destructive">
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

export default TeamsAdmin;
