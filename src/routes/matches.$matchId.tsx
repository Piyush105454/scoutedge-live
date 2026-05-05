import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { 
  ArrowLeft, 
  Download, 
  Share2, 
  Calendar, 
  MapPin, 
  Trophy, 
  ChevronRight, 
  FastForward, 
  Activity, 
  Users, 
  FileJson, 
  PlayCircle,
  Play,
  Map as MapIcon,
  Zap,
  BarChart3,
  Layers,
  GitCompare,
  Video,
  Target,
  Loader2,
  Film,
  Clock,
  Copy,
  CheckCircle2,
  Eye
} from "lucide-react";
import { eventColors } from "@/lib/data";
import { SportBadge } from "@/components/StatusBadge";
import { getMatch, type Match, type Player, BACKEND_BASE_URL } from "@/api";

export const Route = createFileRoute("/matches/$matchId")({
  loader: async ({ params }) => {
    try {
      const data = await getMatch(params.matchId);
      if (!data || !data.match) throw notFound();
      return data;
    } catch (err) {
      console.error(err);
      throw notFound();
    }
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.match.title ?? "Match"} — ScoutEdge` },
      { name: "description", content: `AI analysis results for ${loaderData?.match.title ?? "this match"}.` },
    ],
  }),
  component: MatchAnalysis,
  errorComponent: ({ error, reset }: { error: Error; reset: () => void }) => {
    const router = useRouter();
    return (
      <div className="text-center py-20">
        <p className="text-destructive">{error.message}</p>
        <button onClick={() => { router.invalidate(); reset(); }} className="mt-4 bg-primary text-primary-foreground px-4 py-2 rounded-md">Retry</button>
      </div>
    );
  },
  notFoundComponent: () => (
    <div className="text-center py-20">
      <h2 className="text-2xl font-bold">Match not found</h2>
      <Link to="/matches" className="mt-4 inline-block text-primary hover:underline">← Back to Matches</Link>
    </div>
  ),
});


const tabs = ["Players", "Timeline", "AI Insights (Demo)", "JSON Output", "Video Clips"] as const;
type Tab = typeof tabs[number];

function MatchAnalysis() {
  const { match, players, events } = Route.useLoaderData();
  const [tab, setTab] = useState<Tab>("Players");
  const videoRef = useRef<HTMLVideoElement>(null);

  const seekTo = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = seconds;
      videoRef.current.play();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-foreground">Dashboard</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link to="/matches" className="hover:text-foreground">Matches</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground">{match.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Video Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl bg-black border border-border overflow-hidden aspect-video relative group shadow-2xl">
            <video 
              ref={videoRef}
              src={match.video_url} 
              className="w-full h-full" 
              controls
              poster={`${BACKEND_BASE_URL}${match.metadata?.clips?.[0]?.thumbnail || ""}`}
            />
          </div>

          {/* Quick stats inside main area */}
          <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <QuickStat icon={Users} label="Players" value={String(match.players_detected)} />
            <QuickStat icon={Activity} label="Events" value={String(match.events_tagged)} />
            <QuickStat icon={Film} label="Frames" value={String(match.frames_analyzed)} />
            <QuickStat icon={Clock} label="Time" value={match.processing_time || "N/A"} />
          </section>
        </div>

        {/* Info & Metadata Section */}
        <div className="space-y-6">
          <section className="rounded-xl border border-border bg-card p-6 h-full flex flex-col">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-xl font-bold">{match.title}</h2>
                <SportBadge sport={match.sport} />
              </div>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2"><Calendar className="h-4 w-4" /> {new Date(match.created_at).toLocaleDateString()}</div>
                <div className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {match.venue || "Global"}</div>
                <div className="flex items-center gap-2"><Trophy className="h-4 w-4" /> {match.competition || "N/A"}</div>
              </div>
              <div className={`mt-4 inline-flex items-center gap-1.5 text-sm font-medium ${match.status === 'completed' || match.status === 'Processed' ? 'text-success' : 'text-warning'}`}>
                {match.status === 'completed' || match.status === 'Processed' ? <CheckCircle2 className="h-4 w-4" /> : <Loader2 className="h-4 w-4 animate-spin" />}
                {match.status === 'completed' || match.status === 'Processed' ? 'Analysis Complete' : 'Processing...'}
              </div>
            </div>
            <div className="flex gap-2 mt-8">
              <button className="flex-1 inline-flex items-center justify-center gap-1.5 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-bold hover:bg-primary/90 transition-all">
                <Download className="h-4 w-4" /> Export Report
              </button>
              <button className="inline-flex items-center justify-center bg-elevated border border-border px-4 py-2 rounded-lg hover:border-primary/40 transition-all">
                <Share2 className="h-4 w-4" />
              </button>
            </div>
          </section>
        </div>
      </div>

      {/* Tabs section */}
      <div className="mt-8 space-y-6">
        <div className="border-b border-border flex gap-1 overflow-x-auto scrollbar-thin">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2.5 text-sm font-bold border-b-2 -mb-px whitespace-nowrap transition-all ${
                tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="min-h-[400px]">
          {tab === "Players" && <PlayersTab players={players} />}
          {tab === "Timeline" && <TimelineTab events={events} onSeek={seekTo} />}
          {tab === "AI Insights (Demo)" && <AIInsightsTab />}
          {tab === "JSON Output" && <JsonTab data={{ match, players, events }} />}
          {tab === "Video Clips" && <ClipsTab match={match} onSeek={seekTo} />}
        </div>
      </div>
    </div>
  );
}

function AIInsightsTab() {
  const insights = [
    {
      title: "1. Player Detection + Tracking",
      desc: "Every player detected in each frame with bounding boxes and field position tracking.",
      status: "Live Now",
      icon: Eye,
      founderTip: "System finds every player automatically in every frame — no human needed",
    },
    {
      title: "2. Jersey Number Recognition (OCR)",
      desc: "Automated identification of players via jersey numbers with confidence scoring.",
      status: "Live Now",
      icon: Zap,
      founderTip: "We identify WHO is doing WHAT just from their jersey number. No biometrics. No expensive chips.",
    },
    {
      title: "3. Player Heatmap",
      desc: "Visual movement patterns showing 'hot zones' where players spent most of their time.",
      status: "Live Now",
      icon: MapIcon,
      image: "C:\\Users\\piyus\\.gemini\antigravity\brain\a47e573b-8770-4fa3-b27e-d16885e90c87\player_heatmap_mockup_1777869096148.png",
      founderTip: "Coach sees exactly where Player #7 spent the entire match in one image",
    },
    {
      title: "4. Event Detection + Tagging",
      desc: "Automatic tagging of key moments like shots, boundaries, wickets, and goals.",
      status: "Live Now",
      icon: Activity,
      founderTip: "Every key moment automatically tagged — no video analyst needed",
    },
    {
      title: "5. Performance Metrics",
      desc: "Detailed scorecards including shots taken, strike rates, and active time.",
      status: "Live Now",
      icon: BarChart3,
      founderTip: "Every player gets a performance scorecard from just one video upload",
    },
    {
      title: "6. Speed and Movement Analysis",
      desc: "Estimated distance covered, sprint speeds, and acceleration zones from footage.",
      status: "Live Now",
      icon: FastForward,
      founderTip: "We can estimate how fast a player moved across the field using just standard camera footage",
    },
    {
      title: "7. Team Formation Analysis",
      desc: "Tactical analysis of team shape, gaps in defense, and attacking patterns.",
      status: "Coming Soon (Week 3)",
      icon: Layers,
      founderTip: "Coaches get tactical analysis that previously required a full analyst team",
    },
    {
      title: "8. Player Comparison",
      desc: "Track performance across multiple matches and see improvement or consistency.",
      status: "Coming Soon (Week 3)",
      icon: GitCompare,
      founderTip: "Scouts can track a player across 10 matches and see their growth curve. This is what clubs pay millions for",
    },
    {
      title: "9. Highlight Reel Generation",
      desc: "Auto-generated clips of best moments ready for recruitment and social sharing.",
      status: "Coming Soon (Week 4)",
      icon: Video,
      founderTip: "Platform automatically creates player highlight reels for recruitment and scouting",
    },
    {
      title: "10. Talent Scoring (Future AI)",
      desc: "AI-driven talent score (0-100) compared against age group averages.",
      status: "Month 2",
      icon: Target,
      founderTip: "One video upload gives a player their AI talent score. We become the credit score for sports talent in India.",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {insights.map((item, i) => (
          <div key={i} className="group relative rounded-2xl border border-border bg-card/50 overflow-hidden hover:border-primary/50 transition-all hover:shadow-xl hover:shadow-primary/5">
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <item.icon className="h-5 w-5" />
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  item.status === 'Live Now' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                }`}>
                  {item.status}
                </span>
              </div>
              
              <div>
                <h4 className="text-lg font-bold">{item.title}</h4>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                  {item.desc}
                </p>
              </div>

              {item.image && (
                <div className="rounded-xl overflow-hidden border border-border mt-4 aspect-[2/1] relative">
                   <img src={`file:///${item.image.replace(/\\/g, '/')}`} alt="Heatmap" className="w-full h-full object-cover" />
                </div>
              )}

              <div className="pt-4 mt-4 border-t border-border/50">
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Demo Pitch</div>
                <p className="text-sm italic text-foreground/80 leading-snug">
                  "{item.founderTip}"
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}


function QuickStat({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5" /> {label}
      </div>
      <div className="text-2xl font-bold mt-1.5 tabular-nums">{value}</div>
    </div>
  );
}

function PlayersTab({ players }: { players: any[] }) {
  if (!players || players.length === 0) {
    return <div className="text-center py-10 text-muted-foreground">No players detected yet.</div>;
  }
  return (
    <div className="space-y-8">
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {players.map((p) => {
          const teamName = p.team || "Unknown";
          const isIndia = teamName.toLowerCase() === "india" || teamName.toLowerCase() === "home";
          const isAustralia = teamName.toLowerCase() === "australia" || teamName.toLowerCase() === "away";
          
          // Use AI detected colors: India (Blue) vs Australia (Yellow)
          // Removing hardcoded red (destructive) as per user request
          let colorClasses = "bg-primary/15 text-primary border-2 border-primary/40";
          let badgeClasses = "bg-primary/15 text-primary";
          
          if (isIndia) {
            colorClasses = "bg-[#00529B]/15 text-[#00529B] border-2 border-[#00529B]/40";
            badgeClasses = "bg-[#00529B]/15 text-[#00529B]";
          } else if (isAustralia) {
            colorClasses = "bg-[#FFCD00]/15 text-[#FFCD00] border-2 border-[#FFCD00]/40";
            badgeClasses = "bg-[#FFCD00]/15 text-[#FFCD00]";
          }

          const meta = p.metadata || {};
          return (
            <div key={p.id} className="rounded-xl border border-border bg-card p-5 hover:border-primary/40 transition-colors">
              <div className="flex items-start gap-4">
                <div className={`h-16 w-16 rounded-full flex items-center justify-center text-xl font-bold shrink-0 ${colorClasses}`}>
                  #{p.jersey_number}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold truncate">{p.name || "Unknown Player"}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{p.position || "Field Player"}</div>
                  <div className={`mt-1.5 inline-block text-[11px] font-medium px-2 py-0.5 rounded-full ${badgeClasses}`}>
                    {teamName}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="bg-elevated/40 p-2 rounded-lg text-center">
                  <div className="text-[10px] text-muted-foreground uppercase">Top Speed</div>
                  <div className="text-sm font-bold text-primary">{meta.top_speed || 0} <span className="text-[10px] font-normal">km/h</span></div>
                </div>
                <div className="bg-elevated/40 p-2 rounded-lg text-center">
                  <div className="text-[10px] text-muted-foreground uppercase">Distance</div>
                  <div className="text-sm font-bold text-success">{meta.total_distance || 0} <span className="text-[10px] font-normal">m</span></div>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">AI Confidence</span>
                  <span className="text-success font-semibold tabular-nums">{Math.round((p.detection_confidence || 0.85) * 100)}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-elevated overflow-hidden">
                  <div className="h-full bg-success" style={{ width: `${(p.detection_confidence || 0.85) * 100}%` }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Player Movement Summary */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><MapIcon className="h-5 w-5 text-primary" /> Player Position Analytics</h3>
        <div className="aspect-[21/9] bg-[#0a0a0a] rounded-lg border border-border/50 relative overflow-hidden flex items-center justify-center">
           {/* Mock field with real points overlaid */}
           <div className="absolute inset-4 border border-white/10 rounded pointer-events-none">
              <div className="absolute top-1/2 left-0 w-full h-px bg-white/10" />
              <div className="absolute top-0 left-1/2 w-px h-full bg-white/10" />
           </div>
           {players.map((p, idx) => {
             const points = p.metadata?.heat_points || [];
             const isIndia = p.team === "India" || p.team === "india";
             const colorClass = isIndia ? "bg-[#00529B]" : "bg-[#FFCD00]";
             const textColor = isIndia ? "text-white" : "text-black";
             
             return points.map((pt: any, i: number) => (
               <div 
                 key={`${idx}-${i}`}
                 className={`absolute h-3.5 w-3.5 rounded-full ${colorClass} ${textColor} flex items-center justify-center text-[7px] font-black border border-black/30 shadow-sm opacity-80 hover:opacity-100 transition-opacity`}
                 style={{ 
                   left: `${(pt.x / 1280) * 100}%`, 
                   top: `${(pt.y / 720) * 100}%`,
                   transform: 'translate(-50%, -50%)'
                 }}
               >
                 {p.jersey_number || p.display_number?.replace('T', '')}
               </div>
             ))
           })}
           <div className="z-10 text-xs font-bold text-white/50 uppercase tracking-widest">AI Tracked Movement Heatmap</div>
        </div>
      </div>
    </div>
  );
}

function TimelineTab({ events, onSeek }: { events: any[], onSeek?: (s: number) => void }) {
  if (!events || events.length === 0) {
    return <div className="text-center py-10 text-muted-foreground">No events recorded yet.</div>;
  }
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="divide-y divide-border">
        {events.map((e: any, i: number) => {
          const meta = e.metadata || {};
          return (
            <div 
              key={i} 
              onClick={() => onSeek?.(Number(e.timestamp))}
              className={`flex items-center gap-4 px-5 py-3.5 cursor-pointer hover:bg-primary/5 transition-colors ${i % 2 === 1 ? "bg-elevated/30" : ""}`}
            >
              <span className="font-mono text-sm font-bold text-foreground w-12 shrink-0">{e.timestamp}s</span>
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight border ${eventColors[e.event_type as keyof typeof eventColors] || "border-border"}`}>
                {e.event_type.replace('_', ' ')}
              </span>
              <div className="flex-1 flex items-center gap-3 min-w-0">
                <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-elevated text-xs font-mono text-muted-foreground font-bold">
                  #{e.player_jersey}
                </span>
                <span className="text-sm font-medium truncate">{e.player_name || "Detected Player"}</span>
                {meta.speed > 0 && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-success bg-success/10 px-2 py-0.5 rounded-full font-bold">
                    <Zap className="h-3 w-3" /> {meta.speed} km/h
                  </span>
                )}
              </div>
              <div className="hidden sm:block text-[10px] text-muted-foreground tabular-nums">
                Pos: {Math.round(meta.x || 0)}, {Math.round(meta.y || 0)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function JsonTab({ data }: { data: any }) {
  const [copied, setCopied] = useState(false);
  const jsonString = JSON.stringify(data, null, 2);
  const onCopy = () => {
    navigator.clipboard?.writeText(jsonString).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };
  return (
    <div className="rounded-xl border border-border bg-[#0d1117] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-card/40">
        <span className="text-xs font-mono text-muted-foreground">analysis.json</span>
        <div className="flex gap-1.5">
          <button onClick={onCopy} className="inline-flex items-center gap-1.5 text-xs bg-elevated hover:bg-elevated/80 px-2.5 py-1.5 rounded-md">
            <Copy className="h-3.5 w-3.5" /> {copied ? "Copied!" : "Copy"}
          </button>
          <button className="inline-flex items-center gap-1.5 text-xs bg-primary text-primary-foreground hover:bg-primary/90 px-2.5 py-1.5 rounded-md">
            <Download className="h-3.5 w-3.5" /> JSON
          </button>
          <button className="inline-flex items-center gap-1.5 text-xs bg-elevated hover:bg-elevated/80 px-2.5 py-1.5 rounded-md">
            <Download className="h-3.5 w-3.5" /> CSV
          </button>
        </div>
      </div>
      <pre className="text-xs leading-relaxed p-5 overflow-x-auto scrollbar-thin font-mono">
        <code dangerouslySetInnerHTML={{ __html: highlightJson(jsonString) }} />
      </pre>
    </div>
  );
}

function highlightJson(s: string) {
  return s
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/("(?:\\.|[^"\\])*")(\s*:)/g, '<span style="color:#7dd3fc">$1</span>$2')
    .replace(/:\s*("(?:\\.|[^"\\])*")/g, ': <span style="color:#86efac">$1</span>')
    .replace(/\b(true|false|null)\b/g, '<span style="color:#fca5a5">$1</span>')
    .replace(/\b(-?\d+\.?\d*)\b/g, '<span style="color:#fdba74">$1</span>');
}

function ClipsTab({ match, onSeek }: { match: any, onSeek?: (s: number) => void }) {
  const clips = match?.metadata?.clips || [];
  
  if (!clips || clips.length === 0) {
    return (
      <div className="text-center py-20 bg-card rounded-xl border border-dashed border-border">
        <PlayCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">AI is still generating key event clips...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {clips.map((clip: any, i: number) => (
        <div 
          key={i} 
          onClick={() => onSeek?.(clip.timestamp)}
          className="group rounded-xl border border-border bg-card overflow-hidden hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5 cursor-pointer"
        >
          <div className="aspect-video bg-black relative">
            <img 
              src={`${BACKEND_BASE_URL}${clip.thumbnail}`} 
              alt={clip.title} 
              className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" 
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-xl">
                <Play className="h-6 w-6 fill-current" />
              </div>
            </div>
            <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-bold text-white font-mono">
              {clip.timestamp}s
            </div>
          </div>
          <div className="p-4">
            <div className="font-semibold text-sm mb-1 group-hover:text-primary transition-colors">{clip.title}</div>
            <div className="text-xs text-muted-foreground">Action Tag: Player Detection</div>
          </div>
        </div>
      ))}
    </div>
  );
}
