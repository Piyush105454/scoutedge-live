export type Sport = "Football" | "Cricket" | "Basketball" | "Kabaddi" | "Hockey" | "Athletics" | "Volleyball" | "Badminton" | "Tennis";
export type MatchStatus = "Processed" | "Processing" | "Queued";

export interface MatchRow {
  id: string;
  name: string;
  sport: Sport;
  date: string;
  players: number;
  status: MatchStatus;
  competition: string;
  venue: string;
  eventsTagged: number;
}

export const matches: MatchRow[] = [
  { id: "match_001", name: "U19 State Final", sport: "Football", date: "12 Apr 2025", players: 22, status: "Processed", competition: "State U19 Championship", venue: "Nehru Stadium, Mumbai", eventsTagged: 47 },
  { id: "match_002", name: "District Championship", sport: "Cricket", date: "8 Apr 2025", players: 18, status: "Processed", competition: "District Cup", venue: "Wankhede Ground", eventsTagged: 62 },
  { id: "match_003", name: "Club League Match", sport: "Basketball", date: "5 Apr 2025", players: 10, status: "Processing", competition: "Mumbai Club League", venue: "DY Patil Arena", eventsTagged: 28 },
  { id: "match_004", name: "Academy Trial", sport: "Football", date: "1 Apr 2025", players: 14, status: "Processed", competition: "Academy Selections", venue: "Cooperage Ground", eventsTagged: 31 },
  { id: "match_005", name: "Zonal Qualifier", sport: "Kabaddi", date: "28 Mar 2025", players: 12, status: "Queued", competition: "Zonal Tournament", venue: "Balewadi Stadium", eventsTagged: 0 },
  { id: "match_006", name: "Inter-School Hockey", sport: "Hockey", date: "24 Mar 2025", players: 22, status: "Processed", competition: "Inter-School Cup", venue: "Mahindra Hockey Stadium", eventsTagged: 38 },
];

export interface PlayerRow {
  id: string;
  name: string;
  jersey: number;
  sport: Sport;
  position: string;
  team: "home" | "away";
  matches: number;
  confidence: number;
}

export const players: PlayerRow[] = [
  { id: "p_001", name: "Arjun Singh", jersey: 9, sport: "Football", position: "Striker", team: "home", matches: 8, confidence: 0.94 },
  { id: "p_002", name: "Rahul Verma", jersey: 7, sport: "Cricket", position: "All-rounder", team: "home", matches: 6, confidence: 0.91 },
  { id: "p_003", name: "Priya Sharma", jersey: 12, sport: "Basketball", position: "Point Guard", team: "home", matches: 5, confidence: 0.88 },
  { id: "p_004", name: "Dev Patel", jersey: 3, sport: "Football", position: "Defender", team: "away", matches: 4, confidence: 0.86 },
  { id: "p_005", name: "Karan Mehta", jersey: 4, sport: "Football", position: "Midfielder", team: "home", matches: 7, confidence: 0.93 },
  { id: "p_006", name: "Neha Gupta", jersey: 11, sport: "Hockey", position: "Forward", team: "away", matches: 3, confidence: 0.82 },
  { id: "p_007", name: "Vikram Rao", jersey: 5, sport: "Kabaddi", position: "Raider", team: "home", matches: 4, confidence: 0.79 },
  { id: "p_008", name: "Anjali Nair", jersey: 8, sport: "Basketball", position: "Center", team: "away", matches: 3, confidence: 0.85 },
];

export const sportColors: Record<Sport, string> = {
  Football: "var(--color-primary)",
  Cricket: "var(--color-success)",
  Basketball: "var(--color-warning)",
  Kabaddi: "var(--color-destructive)",
  Hockey: "var(--color-info)",
  Athletics: "var(--color-warning)",
  Volleyball: "var(--color-success)",
  Badminton: "var(--color-info)",
  Tennis: "var(--color-primary)",
};

export interface TimelineEvent {
  time: string;
  type: "Goal" | "Pass" | "Shot" | "Tackle" | "Foul" | "Save";
  player: string;
  jersey: number;
  confidence: number;
}

export const timelineEvents: TimelineEvent[] = [
  { time: "0:04", type: "Pass", player: "Arjun Singh", jersey: 9, confidence: 0.92 },
  { time: "0:18", type: "Tackle", player: "Dev Patel", jersey: 3, confidence: 0.85 },
  { time: "0:34", type: "Pass", player: "Karan Mehta", jersey: 4, confidence: 0.89 },
  { time: "0:42", type: "Goal", player: "Arjun Singh", jersey: 9, confidence: 0.91 },
  { time: "1:02", type: "Save", player: "Rohan Iyer", jersey: 1, confidence: 0.94 },
  { time: "1:24", type: "Foul", player: "Dev Patel", jersey: 3, confidence: 0.78 },
  { time: "1:48", type: "Shot", player: "Karan Mehta", jersey: 4, confidence: 0.86 },
  { time: "2:10", type: "Pass", player: "Arjun Singh", jersey: 9, confidence: 0.93 },
  { time: "2:35", type: "Tackle", player: "Vikram Rao", jersey: 5, confidence: 0.81 },
  { time: "2:58", type: "Goal", player: "Karan Mehta", jersey: 4, confidence: 0.88 },
  { time: "3:21", type: "Save", player: "Rohan Iyer", jersey: 1, confidence: 0.9 },
  { time: "3:45", type: "Shot", player: "Arjun Singh", jersey: 9, confidence: 0.87 },
];

export const eventColors: Record<TimelineEvent["type"], string> = {
  Goal: "bg-success/15 text-success border-success/30",
  Pass: "bg-primary/15 text-primary border-primary/30",
  Shot: "bg-warning/15 text-warning border-warning/30",
  Tackle: "bg-muted-foreground/15 text-muted-foreground border-muted-foreground/30",
  Foul: "bg-destructive/15 text-destructive border-destructive/30",
  Save: "bg-info/15 text-info border-info/30",
};
