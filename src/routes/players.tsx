import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { type PlayerRow } from "@/lib/data";
import { getPlayers, type Player } from "@/api";

export const Route = createFileRoute("/players")({
  head: () => ({
    meta: [
      { title: "Players Database — ScoutEdge" },
      { name: "description", content: "All players identified across matches." },
    ],
  }),
  component: PlayersPage,
});

const colorPalette = [
  "bg-primary/20 text-primary",
  "bg-success/20 text-success",
  "bg-warning/20 text-warning",
  "bg-destructive/20 text-destructive",
  "bg-info/20 text-info",
];

function initials(name: string) {
  if (!name) return "??";
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

function PlayersPage() {
  const [q, setQ] = useState("");
  const [sport, setSport] = useState("All");
  const [team, setTeam] = useState("All");
  const [position, setPosition] = useState("All");
  const [selected, setSelected] = useState<Player | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPlayers().then(data => {
      setPlayers(data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const sports = ["All", ...Array.from(new Set(players.map((p: Player) => p.sport)))];
  const positions = ["All", ...Array.from(new Set(players.map((p: Player) => p.position)))];

  const filtered = players.filter((p: Player) => {
    const okQ = !q || (p.name && p.name.toLowerCase().includes(q.toLowerCase())) || String(p.jersey_number).includes(q);
    const okS = sport === "All" || p.sport === sport;
    const okT = team === "All" || p.team === team;
    const okP = position === "All" || p.position === position;
    return okQ && okS && okT && okP;
  });



  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div>
        <h2 className="text-2xl font-bold">Players Database</h2>
        <p className="text-sm text-muted-foreground mt-1">All players identified across matches</p>
      </div>

      <div className="space-y-3">
        <div className="relative">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name or jersey number..."
            className="w-full bg-card border border-border rounded-md pl-10 pr-3 py-2.5 text-sm focus:border-primary outline-none"
          />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <select value={sport} onChange={(e) => setSport(e.target.value)} className="bg-card border border-border rounded-md px-3 py-2 text-sm focus:border-primary outline-none">
            {sports.map((s) => <option key={s}>{s}</option>)}
          </select>
          <select value={team} onChange={(e) => setTeam(e.target.value)} className="bg-card border border-border rounded-md px-3 py-2 text-sm focus:border-primary outline-none">
            <option>All</option><option>Home</option><option>Away</option>
          </select>
          <select value={position} onChange={(e) => setPosition(e.target.value)} className="bg-card border border-border rounded-md px-3 py-2 text-sm focus:border-primary outline-none">
            {positions.map((p) => <option key={p}>{p}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
          <p className="text-muted-foreground text-sm font-medium">Fetching player roster...</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((p: Player, i: number) => (
            <div key={p.id} className="rounded-xl border border-border bg-card p-5 hover:border-primary/40 transition-colors">
              <div className={`h-14 w-14 rounded-full flex items-center justify-center text-lg font-bold ${colorPalette[i % colorPalette.length]}`}>
                {initials(p.name)}
              </div>
              <div className="mt-3 flex items-center gap-2">
                <h3 className="font-semibold truncate">{p.name || "Unknown"}</h3>
                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-primary/15 text-primary text-xs font-bold">#{p.jersey_number}</span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">{p.sport || "General"} · {p.position || "N/A"}</div>
              <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                <div className="rounded-md bg-elevated/50 p-2">
                  <div className="text-muted-foreground">Appearances</div>
                  <div className="font-bold text-base">{p.appearances}</div>
                </div>
                <div className="rounded-md bg-elevated/50 p-2">
                  <div className="text-muted-foreground">Confidence</div>
                  <div className="font-bold text-base text-success">{Math.round((p.detection_confidence || 0) * 100)}%</div>
                </div>
              </div>
              <button
                onClick={() => setSelected(p)}
                className="mt-3 w-full text-sm text-primary border border-primary/30 hover:bg-primary hover:text-primary-foreground rounded-md py-1.5 transition-colors"
              >
                View Profile
              </button>
            </div>
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center text-muted-foreground">
          No players match those filters.
        </div>
      )}


      {/* Drawer */}
      {selected && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60 fade-in" onClick={() => setSelected(null)} />
          <aside className="absolute right-0 top-0 bottom-0 w-full sm:w-[420px] bg-card border-l border-border overflow-y-auto scrollbar-thin fade-in">
            <div className="p-6">
              <div className="flex justify-end">
                <button onClick={() => setSelected(null)} className="p-2 rounded-md hover:bg-elevated text-muted-foreground hover:text-foreground" aria-label="Close">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className={`h-24 w-24 rounded-full flex items-center justify-center text-3xl font-bold ${colorPalette[0]}`}>
                  {initials(selected.name)}
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <h2 className="text-xl font-bold">{selected.name}</h2>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-primary/15 text-primary text-sm font-bold">#{selected.jersey}</span>
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {selected.sport} · {selected.position} · {selected.team === "home" ? "Home" : "Away"}
                </div>
              </div>

              <h3 className="font-semibold mt-8 mb-3 text-sm">Match History</h3>
              <div className="rounded-lg border border-border overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-elevated/40 text-muted-foreground uppercase">
                    <tr>
                      <th className="text-left font-medium px-3 py-2">Match</th>
                      <th className="text-left font-medium px-3 py-2">Date</th>
                      <th className="text-left font-medium px-3 py-2">Events</th>
                      <th className="text-left font-medium px-3 py-2">Conf.</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {[
                      { m: "U19 Final", d: "12 Apr", e: 6, c: 94 },
                      { m: "Trial", d: "1 Apr", e: 4, c: 89 },
                      { m: "League", d: "24 Mar", e: 5, c: 91 },
                    ].map((row) => (
                      <tr key={row.m}>
                        <td className="px-3 py-2 font-medium">{row.m}</td>
                        <td className="px-3 py-2 text-muted-foreground">{row.d}</td>
                        <td className="px-3 py-2">{row.e}</td>
                        <td className="px-3 py-2 text-success font-semibold">{row.c}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <h3 className="font-semibold mt-6 mb-3 text-sm">Detection Count — Last 5 Matches</h3>
              <div className="flex items-end justify-between gap-2 h-32 px-1">
                {[28, 42, 35, 51, 47].map((v, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1.5">
                    <div className="w-full rounded-t bg-primary/80 hover:bg-primary transition-colors" style={{ height: `${(v / 60) * 100}%` }} />
                    <span className="text-[10px] text-muted-foreground tabular-nums">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
