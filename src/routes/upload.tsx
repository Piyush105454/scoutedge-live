import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { UploadCloud, Plus, X, CheckCircle2, ArrowRight, Loader2 } from "lucide-react";
import { uploadMatch, getPresignedUrl, uploadToS3 } from "@/api";

export const Route = createFileRoute("/upload")({
  head: () => ({
    meta: [
      { title: "Upload Match — ScoutEdge" },
      { name: "description", content: "Upload match footage for AI-powered player detection and event tagging." },
    ],
  }),
  component: UploadPage,
});

const sports = ["Cricket", "Football", "Basketball", "Kabaddi", "Hockey", "Athletics", "Volleyball", "Badminton", "Tennis"];
const levels = ["Local", "District", "State", "National", "International"];

interface PlayerRow { name: string; jersey: string; position: string; team: "Home" | "Away" }

function UploadPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    match_title: "",
    sport: "Cricket",
    match_date: "",
    venue: "",
    competition: "",
    level: "Local",
    home_team: "Mumbai Strikers",
    away_team: "Delhi Titans",
  });

  const [roster, setRoster] = useState<PlayerRow[]>([
    { name: "Arjun Singh", jersey: "9", position: "Striker", team: "Home" },
    { name: "Rahul Verma", jersey: "4", position: "Midfielder", team: "Home" },
    { name: "Dev Patel", jersey: "11", position: "Forward", team: "Away" },
  ]);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [fileInfo, setFileInfo] = useState<{ name: string; size: string } | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [toggles, setToggles] = useState({ detection: true, ocr: true, pose: false, events: true });
  const [fps, setFps] = useState(2);
  const [format, setFormat] = useState<"JSON" | "CSV" | "Both">("Both");
  const [home, setHome] = useState("#2563eb");
  const [away, setAway] = useState("#ef4444");

  const onFiles = (f: File | null | undefined) => {
    if (!f) return;
    // Enforce 50MB limit
    if (f.size > 50 * 1024 * 1024) {
      alert("Video file is too large. Please upload a video under 50MB.");
      return;
    }
    setVideoFile(f);
    setFileInfo({ name: f.name, size: `${(f.size / (1024 * 1024)).toFixed(1)} MB` });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!videoFile || !formData.match_title) {
      alert("Please provide a match title and video file.");
      return;
    }

    setLoading(true);
    const data = new FormData();
    data.append("video", videoFile);
    Object.entries(formData).forEach(([key, value]) => data.append(key, value));
    data.append("roster", JSON.stringify(roster));
    data.append("settings", JSON.stringify({ toggles, fps, format, colors: { home, away } }));

    try {
      const res = await uploadMatch(data);
      if (res.success) {
        navigate({ to: "/matches" });
      } else {
        alert("Upload failed: " + res.error);
      }
    } catch (err: any) {
      console.error(err);
      alert(`Upload Failed: ${err.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold">Upload Match Video</h2>
        <p className="text-sm text-muted-foreground mt-1">Add match footage for AI-powered player analysis</p>
      </div>

      {/* Section 1 */}
      <Section title="Match Information" step={1}>
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="Match Title" required>
            <input name="match_title" value={formData.match_title} onChange={handleInputChange} className="input" placeholder="e.g. U19 Final — Mumbai vs Delhi" />
          </Field>
          <Field label="Sport Type" required>
            <select name="sport" value={formData.sport} onChange={handleInputChange} className="input">
              {sports.map((s: string) => <option key={s}>{s}</option>)}
            </select>
          </Field>

          <Field label="Match Date" required>
            <input name="match_date" type="date" value={formData.match_date} onChange={handleInputChange} className="input" />
          </Field>
          <Field label="Match Venue">
            <input name="venue" value={formData.venue} onChange={handleInputChange} className="input" placeholder="Stadium or ground name" />
          </Field>
          <Field label="Competition Name">
            <input name="competition" value={formData.competition} onChange={handleInputChange} className="input" placeholder="e.g. State U19 Championship" />
          </Field>
          <Field label="Match Level">
            <select name="level" value={formData.level} onChange={handleInputChange} className="input">
              {levels.map((l: string) => <option key={l}>{l}</option>)}
            </select>
          </Field>
        </div>
      </Section>

      {/* Section 2 */}
      <Section title="Team Information" step={2}>
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="Home Team Name"><input name="home_team" value={formData.home_team} onChange={handleInputChange} className="input" placeholder="Team A" /></Field>
          <Field label="Away Team Name"><input name="away_team" value={formData.away_team} onChange={handleInputChange} className="input" placeholder="Team B" /></Field>
          <Field label="Home Team Jersey Color">
            <div className="flex gap-2">
              <input type="color" value={home} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setHome(e.target.value)} className="h-10 w-14 rounded-md border border-border bg-elevated cursor-pointer" />
              <input className="input flex-1 font-mono uppercase" value={home} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setHome(e.target.value)} />
            </div>
          </Field>
          <Field label="Away Team Jersey Color">
            <div className="flex gap-2">
              <input type="color" value={away} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAway(e.target.value)} className="h-10 w-14 rounded-md border border-border bg-elevated cursor-pointer" />
              <input className="input flex-1 font-mono uppercase" value={away} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAway(e.target.value)} />
            </div>
          </Field>
        </div>
      </Section>

      {/* Section 3 */}
      <Section title="Player Details" step={3}>
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-medium">Player Roster</div>
          <button
            onClick={() => setRoster([...roster, { name: "", jersey: "", position: "", team: "Home" }])}
            className="inline-flex items-center gap-1.5 text-sm bg-primary text-primary-foreground px-3 py-1.5 rounded-md hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" /> Add Player
          </button>
        </div>
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm min-w-[640px]">
            <thead className="text-muted-foreground text-xs uppercase">
              <tr>
                <th className="text-left font-medium pb-2">Name</th>
                <th className="text-left font-medium pb-2 w-24">Jersey #</th>
                <th className="text-left font-medium pb-2">Position</th>
                <th className="text-left font-medium pb-2 w-32">Team</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody className="space-y-2">
              {roster.map((p: PlayerRow, i: number) => (
                <tr key={i}>
                  <td className="pr-2 py-1"><input className="input" value={p.name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const c = [...roster]; c[i].name = e.target.value; setRoster(c);
                  }} placeholder="Player name" /></td>
                  <td className="pr-2 py-1"><input type="number" min={1} max={99} className="input" value={p.jersey} onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const c = [...roster]; c[i].jersey = e.target.value; setRoster(c);
                  }} /></td>
                  <td className="pr-2 py-1"><input className="input" value={p.position} onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const c = [...roster]; c[i].position = e.target.value; setRoster(c);
                  }} placeholder="e.g. Striker" /></td>
                  <td className="pr-2 py-1"><select className="input" value={p.team} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                    const c = [...roster]; c[i].team = e.target.value as "Home" | "Away"; setRoster(c);
                  }}>
                    <option>Home</option><option>Away</option>
                  </select></td>
                  <td className="py-1">
                    <button onClick={() => setRoster(roster.filter((_: PlayerRow, j: number) => j !== i))} className="p-2 text-muted-foreground hover:text-destructive">
                      <X className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button
          onClick={() => setRoster([...roster, { name: "", jersey: "", position: "", team: "Home" }])}
          className="mt-3 text-sm text-primary hover:underline"
        >
          + Add Another Player
        </button>
      </Section>

      {/* Section 4 */}
      <Section title="Video Upload" step={4}>
        {!fileInfo ? (
          <label
            onDragOver={(e: React.DragEvent) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e: React.DragEvent) => { e.preventDefault(); setDragOver(false); onFiles(e.dataTransfer.files?.[0]); }}
            className={`flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed py-14 px-6 cursor-pointer transition-colors ${
              dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-elevated/30"
            }`}
          >
            <div className="h-16 w-16 rounded-full bg-primary/15 text-primary flex items-center justify-center">
              <UploadCloud className="h-8 w-8" />
            </div>
            <div className="text-center">
              <div className="font-semibold">Drag & drop your match video here</div>
              <div className="text-xs text-muted-foreground mt-1">Supports MP4, MOV, AVI — Max file size 50MB</div>
            </div>
            <span className="mt-2 inline-flex items-center bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90">
              Browse Files
            </span>
            <input type="file" accept="video/*" className="hidden" onChange={(e: React.ChangeEvent<HTMLInputElement>) => onFiles(e.target.files?.[0])} />
          </label>
        ) : (
          <div className="flex items-center gap-3 rounded-xl border border-success/30 bg-success/5 p-4">
            <CheckCircle2 className="h-6 w-6 text-success shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{fileInfo.name}</div>
              <div className="text-xs text-muted-foreground">{fileInfo.size}</div>
            </div>
            <button onClick={() => { setVideoFile(null); setFileInfo(null); }} className="p-2 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </Section>

      {/* Section 5 */}
      <Section title="Analysis Settings" step={5}>
        <div className="space-y-3">
          {[
            { key: "detection", label: "Enable Player Detection" },
            { key: "ocr", label: "Enable Jersey Number OCR" },
            { key: "pose", label: "Enable Pose Estimation" },
            { key: "events", label: "Enable Event Tagging" },
          ].map((t: { key: string; label: string }) => {
            const on = toggles[t.key as keyof typeof toggles];
            return (
              <div key={t.key} className="flex items-center justify-between p-3 rounded-lg bg-elevated/40 border border-border">
                <span className="text-sm">{t.label}</span>
                <button
                  onClick={() => setToggles({ ...toggles, [t.key]: !on })}
                  className={`relative h-6 w-11 rounded-full transition-colors ${on ? "bg-primary" : "bg-muted-foreground/40"}`}
                  aria-pressed={on}
                >
                  <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${on ? "translate-x-5" : "translate-x-0.5"}`} />
                </button>
              </div>
            );
          })}
        </div>

        <div className="mt-5 grid md:grid-cols-2 gap-5">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Analysis Speed (Frame Rate)</label>
              <span className={`text-sm font-bold tabular-nums ${fps < 1 ? "text-success" : fps > 2 ? "text-warning" : "text-primary"}`}>
                {fps === 0.5 ? "FAST (0.5 fps)" : `${fps} fps`}
              </span>
            </div>
            <input
              type="range" min={0.5} max={10} step={0.5} value={fps}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFps(Number(e.target.value))}
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
              <span>0.5 (Fast)</span><span>5 (Detailed)</span><span>10 (Ultra)</span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-2 italic">
              * Lower FPS = Faster analysis. Higher FPS = Better tracking but slower.
            </p>
          </div>
          <div>
            <div className="text-sm font-medium mb-2">Output Format</div>
            <div className="flex gap-2">
              {(["JSON", "CSV", "Both"] as const).map((f: "JSON" | "CSV" | "Both") => (
                <button
                  key={f}
                  onClick={() => setFormat(f)}
                  className={`px-3 py-2 rounded-md text-sm border transition-colors flex-1 ${
                    format === f ? "bg-primary text-primary-foreground border-primary" : "border-border bg-elevated/40 hover:border-primary/50"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Section>


      <button 
        disabled={loading}
        onClick={handleSubmit}
        className={`w-full inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3.5 rounded-xl font-semibold text-base hover:bg-primary/90 transition-colors ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
      >
        {loading ? <><Loader2 className="h-5 w-5 animate-spin" /> Uploading Video...</> : <>Start Analysis <ArrowRight className="h-5 w-5" /></>}
      </button>
      <p className="text-center text-xs text-muted-foreground -mt-2">Estimated processing time: ~4 mins per 60 seconds of video</p>


      <style>{`
        .input {
          width: 100%;
          background: var(--color-elevated);
          border: 1px solid var(--color-border);
          border-radius: 8px;
          padding: 9px 12px;
          font-size: 14px;
          color: var(--color-foreground);
          outline: none;
          transition: border-color 0.15s;
        }
        .input:focus { border-color: var(--color-primary); }
        .input::placeholder { color: var(--color-muted-foreground); }
      `}</style>
    </div>
  );
}

function Section({ title, step, children }: { title: string; step: number; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-border bg-card p-5 md:p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="h-7 w-7 rounded-md bg-primary/15 text-primary text-xs font-bold flex items-center justify-center">
          {step}
        </div>
        <h3 className="font-semibold">{title}</h3>
      </div>
      {children}
    </section>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-medium block mb-1.5">
        {label} {required && <span className="text-destructive">*</span>}
      </span>
      {children}
    </label>
  );
}
