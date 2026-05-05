import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Search, Calendar, MapPin, Users, Activity, Plus, Loader2 } from "lucide-react";
import { type Sport } from "@/lib/data";
import { StatusBadge, SportBadge } from "@/components/StatusBadge";
import { getMatches, type Match } from "@/api";

export const Route = createFileRoute("/matches/")({
  head: () => ({
    meta: [
      { title: "Matches — ScoutEdge" },
      { name: "description", content: "Browse all analyzed matches across all sports." },
    ],
  }),
  component: MatchesPage,
});

const filters: ("All" | Sport)[] = ["All", "Football", "Cricket", "Basketball", "Kabaddi", "Hockey"];

const accentMap: Record<string, string> = {
  Football: "border-l-primary",
  Cricket: "border-l-success",
  Basketball: "border-l-warning",
  Kabaddi: "border-l-destructive",
  Hockey: "border-l-info",
};

function MatchesPage() {
  const [filter, setFilter] = useState<"All" | Sport>("All");
  const [q, setQ] = useState("");
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMatches().then(data => {
      setMatches(data);
      setLoading(false);
    }).catch(err => {
      console.error("Failed to fetch matches", err);
      setLoading(false);
    });
  }, []);

  const filtered = matches.filter((m: Match) => {
    const matchesSport = filter === "All" || m.sport === filter;
    const matchesQ = !q || m.title.toLowerCase().includes(q.toLowerCase()) || (m.competition && m.competition.toLowerCase().includes(q.toLowerCase()));
    return matchesSport && matchesQ;
  });



  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold">All Matches</h2>
        <Link to="/upload" className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90">
          <Plus className="h-4 w-4" /> Upload New Match
        </Link>
      </div>

      <div className="space-y-3">
        <div className="relative">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search matches..."
            className="w-full bg-card border border-border rounded-md pl-10 pr-3 py-2.5 text-sm focus:border-primary outline-none"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                filter === f
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-primary/40"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
          <p className="text-muted-foreground text-sm font-medium">Fetching match data...</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map((m: Match) => (
            <div key={m.id} className={`rounded-xl border border-border border-l-4 ${accentMap[m.sport] ?? "border-l-primary"} bg-card p-5 hover:border-primary/40 transition-colors`}>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="min-w-0">
                  <h3 className="font-semibold text-base truncate">{m.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{m.competition || "Uncategorized Competition"}</p>
                </div>
                <SportBadge sport={m.sport} />
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mt-3">
                <span className="inline-flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {new Date(m.created_at).toLocaleDateString()}</span>
                <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {m.venue || "Global"}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="rounded-lg bg-elevated/50 p-3">
                  <div className="text-[11px] text-muted-foreground inline-flex items-center gap-1"><Users className="h-3 w-3" /> Players</div>
                  <div className="text-lg font-bold tabular-nums mt-0.5">{m.players_detected}</div>
                </div>
                <div className="rounded-lg bg-elevated/50 p-3">
                  <div className="text-[11px] text-muted-foreground inline-flex items-center gap-1"><Activity className="h-3 w-3" /> Events</div>
                  <div className="text-lg font-bold tabular-nums mt-0.5">{m.events_tagged}</div>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between gap-3">
                <StatusBadge status={m.status} />
                <Link
                  to="/matches/$matchId"
                  params={{ matchId: m.id }}
                  className="flex-1 text-center bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground border border-primary/30 hover:border-primary px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  View Analysis
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
          <div className="text-muted-foreground">No matches found.</div>
        </div>
      )}

    </div>
  );
}
