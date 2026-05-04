import { Loader2 } from "lucide-react";
import type { MatchStatus } from "@/lib/data";

export function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase();
  if (s === "processed" || s === "completed") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-success/15 text-success border border-success/30">
        <span className="h-1.5 w-1.5 rounded-full bg-success" />
        Analysis Complete
      </span>
    );
  }
  if (s === "processing") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-warning/15 text-warning border border-warning/30">
        <Loader2 className="h-3 w-3 animate-spin" />
        Processing
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-muted-foreground/15 text-muted-foreground border border-muted-foreground/30">
      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
      Queued
    </span>
  );
}

export function SportBadge({ sport }: { sport: string }) {
  const map: Record<string, string> = {
    Football: "bg-primary/15 text-primary border-primary/30",
    Cricket: "bg-success/15 text-success border-success/30",
    Basketball: "bg-warning/15 text-warning border-warning/30",
    Kabaddi: "bg-destructive/15 text-destructive border-destructive/30",
    Hockey: "bg-info/15 text-info border-info/30",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${map[sport] ?? "bg-elevated text-foreground border-border"}`}>
      {sport}
    </span>
  );
}
