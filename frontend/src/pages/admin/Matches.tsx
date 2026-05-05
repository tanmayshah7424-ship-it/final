import { useEffect, useState } from "react";
import { matchesAPI, teamsAPI } from "@/api/endpoints";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, X, Gamepad2, Play, Pause, CheckCircle } from "lucide-react";

const MatchesAdmin = () => {
    const [matches, setMatches] = useState<any[]>([]);
    const [teams, setTeams] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const navigate = useNavigate();
    const [form, setForm] = useState({
        sport: "cricket", tournament: "", venue: "", date: "",
        teamA: "", teamB: "", status: "upcoming",
    });

    useEffect(() => {
        Promise.all([
            matchesAPI.getAll({ sport: 'cricket' }), 
            teamsAPI.getAll({ sport: 'cricket' })
        ])
            .then(([mRes, tRes]) => {
                setMatches(mRes.data);
                setTeams(tRes.data);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const fetchMatches = async () => {
        const res = await matchesAPI.getAll({ sport: 'cricket' });
        setMatches(res.data);
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await matchesAPI.create(form);
            setShowForm(false);
            fetchMatches();
        } catch (err) {
            console.error(err);
        }
    };

    const handleStatusChange = async (id: string, status: string) => {
        try {
            await matchesAPI.updateStatus(id, status);
            fetchMatches();
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this match?")) return;
        try {
            await matchesAPI.remove(id);
            fetchMatches();
        } catch (err) {
            console.error(err);
        }
    };

    const statusColors: Record<string, string> = {
        live: "text-live bg-live/10",
        upcoming: "text-blue-400 bg-blue-400/10",
        completed: "text-green-400 bg-green-400/10",
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Manage Matches</h1>
                <Button onClick={() => setShowForm(true)} className="gap-2">
                    <Plus className="w-4 h-4" /> Schedule Match
                </Button>
            </div>

            {showForm && (
                <form onSubmit={handleCreate} className="card-glass rounded-xl p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold">New Match</h2>
                        <button type="button" onClick={() => setShowForm(false)} title="Close form"><X className="w-5 h-5" /></button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Sport</Label>
                            <select value={form.sport} onChange={(e) => setForm({ ...form, sport: e.target.value })} title="Select Sport" className="w-full rounded-md bg-secondary/50 border border-input px-3 py-2 text-sm">
                                <option value="cricket">Cricket</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label>Tournament</Label>
                            <Input value={form.tournament} onChange={(e) => setForm({ ...form, tournament: e.target.value })} required className="bg-secondary/50" placeholder="IPL 2026" />
                        </div>
                        <div className="space-y-2">
                            <Label>Venue</Label>
                            <Input value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} required className="bg-secondary/50" />
                        </div>
                        <div className="space-y-2">
                            <Label>Date & Time</Label>
                            <Input type="datetime-local" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required className="bg-secondary/50" />
                        </div>
                        <div className="space-y-2">
                            <Label>Team A</Label>
                            <select value={form.teamA} onChange={(e) => setForm({ ...form, teamA: e.target.value })} title="Select Team A" required className="w-full rounded-md bg-secondary/50 border border-input px-3 py-2 text-sm">
                                <option value="">Select team</option>
                                {teams.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label>Team B</Label>
                            <select value={form.teamB} onChange={(e) => setForm({ ...form, teamB: e.target.value })} title="Select Team B" required className="w-full rounded-md bg-secondary/50 border border-input px-3 py-2 text-sm">
                                <option value="">Select team</option>
                                {teams.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <Button type="submit">Schedule Match</Button>
                </form>
            )}

            {loading ? (
                <div className="flex justify-center py-8">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
            ) : (
                <div className="space-y-3">
                    {matches.map((m) => (
                        <div key={m._id} className="card-glass rounded-xl p-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${statusColors[m.status] || ""}`}>
                                        {m.status.toUpperCase()}
                                    </span>
                                    <span className="text-sm text-muted-foreground">{m.tournament}</span>
                                </div>
                                <div className="flex gap-1">
                                    {m.status === "upcoming" && (
                                        <Button variant="ghost" size="sm" onClick={() => handleStatusChange(m._id, "live")} title="Start Match">
                                            <Play className="w-4 h-4 text-green-400" />
                                        </Button>
                                    )}
                                    {m.status === "live" && (
                                        <>
                                            <Button variant="ghost" size="sm" onClick={() => navigate(`/admin/matches/${m._id}/control`)} title="Control Room">
                                                <Gamepad2 className="w-4 h-4 text-primary" />
                                            </Button>
                                            <Button variant="ghost" size="sm" onClick={() => handleStatusChange(m._id, "completed")} title="Finish Match">
                                                <CheckCircle className="w-4 h-4 text-amber-400" />
                                            </Button>
                                        </>
                                    )}
                                    <Button variant="ghost" size="sm" onClick={() => handleDelete(m._id)} className="text-destructive hover:text-destructive">
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 flex items-center justify-center text-xl overflow-hidden">
                                        {m.teamA?.logo?.startsWith('http') ? (
                                            <img src={m.teamA.logo} alt="" className="w-full h-full object-contain" />
                                        ) : (
                                            m.teamA?.logo || "🛡️"
                                        )}
                                    </div>
                                    <span className="font-semibold">{m.teamA?.shortName}</span>
                                </div>
                                <span className="font-mono font-bold">{m.scoreA} - {m.scoreB}</span>
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold">{m.teamB?.shortName}</span>
                                    <div className="w-8 h-8 flex items-center justify-center text-xl overflow-hidden">
                                        {m.teamB?.logo?.startsWith('http') ? (
                                            <img src={m.teamB.logo} alt="" className="w-full h-full object-contain" />
                                        ) : (
                                            m.teamB?.logo || "🛡️"
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MatchesAdmin;
