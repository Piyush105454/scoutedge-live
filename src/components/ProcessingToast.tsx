import { Zap, X, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { getMatches } from "@/api";

export function ProcessingToast() {
  const [activeMatch, setActiveMatch] = useState<any>(null);
  const [visible, setVisible] = useState(true);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const matches = await getMatches();
        const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000);
        
        const processing = matches.find((m: any) => {
          const isProcessing = m.status === 'processing' || m.status === 'queued';
          const isRecent = new Date(m.created_at) > thirtyMinsAgo;
          return isProcessing && isRecent;
        });
        
        if (processing) {
          setActiveMatch(processing);
          setIsDone(false);
        } else if (activeMatch) {
          // If we had an active match and now it's gone from 'processing', it's done
          setIsDone(true);
          // Hide after 5 seconds of showing "Done"
          setTimeout(() => setVisible(false), 5000);
        } else {
          setVisible(false);
        }
      } catch (e) {
        console.error("Status check failed", e);
      }
    };

    checkStatus();
    const id = setInterval(checkStatus, 5000);
    return () => clearInterval(id);
  }, [activeMatch]);

  if (!visible || (!activeMatch && !isDone)) return null;

  return (
    <div className={`fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 w-[calc(100vw-2rem)] max-w-sm rounded-xl border border-border bg-card shadow-2xl p-4 animate-in slide-in-from-right duration-500 ${isDone ? 'border-success/30' : ''}`}>
      <div className="flex items-start gap-3">
        <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${isDone ? 'bg-success/15 text-success' : 'bg-primary/15 text-primary'}`}>
          {isDone ? <CheckCircle2 className="h-4 w-4" /> : <Zap className="h-4 w-4 fill-primary" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="text-sm font-semibold truncate">
              {isDone ? "Analysis Complete!" : `Processing: ${activeMatch?.title || "Match"}`}
            </div>
            <button
              onClick={() => setVisible(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          {!isDone && (
            <>
              <div className="mt-2 h-1.5 rounded-full bg-elevated overflow-hidden">
                <div className="h-full bg-primary progress-animated transition-all" style={{ width: '65%' }} />
              </div>
              <div className="flex justify-between items-center mt-1.5 text-xs">
                <span className="text-muted-foreground">AI is tagging events...</span>
                <span className="text-primary font-semibold">65%</span>
              </div>
            </>
          )}
          {isDone && (
            <div className="mt-1 text-xs text-muted-foreground">
              Refresh the page to see the latest stats.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
