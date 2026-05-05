import { useEffect, useState } from "react";
import { matchesAPI, teamsAPI } from "@/api/endpoints";
import { Activity, Users, Trophy, Calendar, TrendingUp, Shield } from "lucide-react";

const AdminDashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    matchesAPI.getStats()
      .then((res) => setStats(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const cards = [
    { label: "Total Matches", value: stats?.total || 0, icon: Trophy, color: "text-primary" },
    { label: "Live Now", value: stats?.live || 0, icon: Activity, color: "text-live" },
    { label: "Upcoming", value: stats?.upcoming || 0, icon: Calendar, color: "text-blue-400" },
    { label: "Total Teams", value: stats?.teamCount || 0, icon: Shield, color: "text-amber-400" },
    { label: "Registered Users", value: stats?.userCount || 0, icon: Users, color: "text-purple-400" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your sports platform</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="card-glass rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              <card.icon className={`w-5 h-5 ${card.color}`} />
              <p className="text-sm text-muted-foreground">{card.label}</p>
            </div>
            <p className="text-3xl font-bold font-mono">{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
