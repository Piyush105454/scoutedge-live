import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Video, Users, Activity, Clock, ArrowUpRight, Eye, Trash2, Loader2,
} from "lucide-react";
import { getMatches, getPlayers, deleteMatch, type Match, type Player } from "@/api";
import { StatusBadge } from "@/components/StatusBadge";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — ScoutEdge" },
      { name: "description", content: "Overview of your match analyses, player detections, and processing queue." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [m, p] = await Promise.all([getMatches(), getPlayers()]);
      setMatches(m);
      setPlayers(p);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this match?")) {
      await deleteMatch(id);
      fetchData();
    }
  };

  const stats = [
    { label: "Total Videos", value: matches.length, icon: Video, trend: "+0 this week" },
    { label: "Players Identified", value: players.filter((p: any) => p.jersey_number).length, icon: Users, trend: "+0 this week" },
    { label: "Matches Analyzed", value: matches.filter((m: Match) => m.status === 'completed').length, icon: Activity, trend: "+0 this week" },
    { label: "Frames Analyzed", value: matches.reduce((acc: number, m: Match) => acc + (m.frames_analyzed || 0), 0), icon: Clock, trend: "Live" },
  ];

  const queue = matches.filter((m: Match) => m.status !== 'completed').map((m: Match) => ({
    name: m.title,
    progress: m.status === 'processing' ? 50 : 0,
    status: m.status === 'processing' ? "Analyzing frames..." : "Queued",
    queued: m.status === 'queued'
  }));


  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      {/* Stats */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="rounded-xl border border-border bg-card p-5 hover:border-primary/40 transition-colors">
              <div className="flex items-start justify-between">
                <div className="h-10 w-10 rounded-lg bg-primary/15 text-primary flex items-center justify-center">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4 text-3xl font-bold text-primary tabular-nums">{s.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
              <div className="mt-3 inline-flex items-center gap-1 text-[11px] font-medium bg-success/15 text-success px-2 py-0.5 rounded-full">
                <ArrowUpRight className="h-3 w-3" /> {s.trend}
              </div>
            </div>
          );
        })}
      </section>

      {/* Recent Matches */}
      <section className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="font-semibold text-base">Recent Matches</h2>
          <Link to="/matches" className="text-sm text-primary hover:underline">View All →</Link>
        </div>
        <div className="overflow-x-auto scrollbar-thin">
          {loading ? (
            <div className="p-10 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-elevated/40 text-muted-foreground text-xs uppercase tracking-wider">
                <tr>
                  <th className="text-left font-medium px-5 py-3">Match Name</th>
                  <th className="text-left font-medium px-5 py-3">Sport</th>
                  <th className="text-left font-medium px-5 py-3">Date</th>
                  <th className="text-left font-medium px-5 py-3">Players</th>
                  <th className="text-left font-medium px-5 py-3">Status</th>
                  <th className="text-right font-medium px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {matches.slice(0, 5).map((m: Match) => (
                  <tr key={m.id} className="hover:bg-elevated/30 transition-colors">
                    <td className="px-5 py-4 font-medium">{m.title}</td>
                    <td className="px-5 py-4 text-muted-foreground">{m.sport}</td>
                    <td className="px-5 py-4 text-muted-foreground">{new Date(m.created_at).toLocaleDateString()}</td>
                    <td className="px-5 py-4 tabular-nums">
                      {players.filter(p => p.match_id === m.id && p.jersey_number).length}
                    </td>
                    <td className="px-5 py-4"><StatusBadge status={m.status} /></td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-1">
                        <Link
                          to="/matches/$matchId"
                          params={{ matchId: m.id }}
                          className="p-2 rounded-md hover:bg-elevated text-muted-foreground hover:text-primary"
                          aria-label="View"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <button 
                          onClick={() => handleDelete(m.id)}
                          className="p-2 rounded-md hover:bg-elevated text-muted-foreground hover:text-destructive" 
                          aria-label="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* Bottom grid */}
      <section className="grid lg:grid-cols-2 gap-6">
        {/* Top players */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="p-5 border-b border-border">
            <h2 className="font-semibold text-base">Top Players Detected</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Across recent matches</p>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-elevated/40 text-muted-foreground text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left font-medium px-5 py-2.5">Rank</th>
                <th className="text-left font-medium px-5 py-2.5">Player</th>
                <th className="text-left font-medium px-5 py-2.5">Sport</th>
                <th className="text-left font-medium px-5 py-2.5">Matches</th>
                <th className="text-left font-medium px-5 py-2.5">Jersey</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {players.filter(p => p.jersey_number).slice(0, 4).map((p: Player, i: number) => (
                <tr key={p.id} className="hover:bg-elevated/30">
                  <td className="px-5 py-3 font-bold text-primary">#{i + 1}</td>
                  <td className="px-5 py-3 font-medium">{p.name || "Unknown"}</td>
                  <td className="px-5 py-3 text-muted-foreground">{p.sport || "General"}</td>
                  <td className="px-5 py-3 tabular-nums">{p.appearances}</td>
                  <td className="px-5 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-primary/15 text-primary text-xs font-semibold">
                      #{p.jersey_number || (p.name?.startsWith("Player T") ? p.name.replace("Player ", "") : i + 1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>


        {/* Queue */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-base">Processing Queue</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Live updates</p>
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs text-success">
              <span className="h-1.5 w-1.5 rounded-full bg-success pulse-dot" />
              Live
            </span>
          </div>
          <div className="p-5 space-y-4">
            {queue.map((q: any) => (
              <div key={q.name}>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <div className="flex items-center gap-2 font-medium">
                    {q.queued ? (
                      <span className="h-2 w-2 rounded-full bg-muted-foreground" />
                    ) : (
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                    )}
                    {q.name}
                  </div>
                  <span className={`tabular-nums text-xs font-semibold ${q.queued ? "text-muted-foreground" : "text-primary"}`}>
                    {q.queued ? "Queued" : `${q.progress}%`}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-elevated overflow-hidden">
                  <div
                    className={`h-full transition-all ${q.queued ? "bg-muted-foreground/40" : "bg-primary progress-animated"}`}
                    style={{ width: `${q.queued ? 100 : q.progress}%`, opacity: q.queued ? 0.4 : 1 }}
                  />
                </div>
                <div className="text-xs text-muted-foreground mt-1">{q.status}</div>
              </div>
            ))}
          </div>
        </div>

      </section>
    </div>
  );
}
