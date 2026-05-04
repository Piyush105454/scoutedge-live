import { createFileRoute } from "@tanstack/react-router";
import { TrendingUp, Activity, Users, Trophy } from "lucide-react";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — ScoutEdge" },
      { name: "description", content: "Aggregate analytics across all matches and players." },
    ],
  }),
  component: AnalyticsPage,
});

const sportBreakdown = [
  { sport: "Football", count: 8, color: "bg-primary" },
  { sport: "Cricket", count: 4, color: "bg-success" },
  { sport: "Basketball", count: 3, color: "bg-warning" },
  { sport: "Hockey", count: 2, color: "bg-info" },
  { sport: "Kabaddi", count: 1, color: "bg-destructive" },
];

const weekly = [12, 18, 14, 22, 28, 24, 31];

function AnalyticsPage() {
  const total = sportBreakdown.reduce((a, b) => a + b.count, 0);
  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div>
        <h2 className="text-2xl font-bold">Analytics Overview</h2>
        <p className="text-sm text-muted-foreground mt-1">Performance metrics across all matches</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: TrendingUp, label: "Detection Accuracy", value: "92.4%", trend: "+1.8%" },
          { icon: Activity, label: "Events / Match", value: "38.2", trend: "+4.1" },
          { icon: Users, label: "Avg Players / Frame", value: "8.4", trend: "+0.6" },
          { icon: Trophy, label: "Top Sport", value: "Football", trend: "8 matches" },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="rounded-xl border border-border bg-card p-5">
              <Icon className="h-5 w-5 text-primary" />
              <div className="text-2xl font-bold mt-3">{s.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
              <div className="mt-2 text-[11px] text-success font-medium">{s.trend}</div>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="font-semibold mb-1">Matches by Sport</h3>
          <p className="text-xs text-muted-foreground mb-5">Total: {total} matches</p>
          <div className="space-y-3">
            {sportBreakdown.map((s) => (
              <div key={s.sport}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span>{s.sport}</span>
                  <span className="text-muted-foreground tabular-nums">{s.count}</span>
                </div>
                <div className="h-2 rounded-full bg-elevated overflow-hidden">
                  <div className={`h-full ${s.color} transition-all`} style={{ width: `${(s.count / total) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="font-semibold mb-1">Weekly Detections</h3>
          <p className="text-xs text-muted-foreground mb-5">Last 7 days</p>
          <div className="flex items-end gap-3 h-44">
            {weekly.map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full rounded-t-md bg-primary/80 hover:bg-primary transition-colors" style={{ height: `${(v / 35) * 100}%` }} />
                <span className="text-[10px] text-muted-foreground">{["M", "T", "W", "T", "F", "S", "S"][i]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
