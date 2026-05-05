import { Zap, X } from "lucide-react";
import { useEffect, useState } from "react";

export function ProcessingToast() {
  const [progress, setProgress] = useState(34);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const id = setInterval(() => {
      setProgress((p) => (p >= 96 ? 34 : p + 1));
    }, 600);
    return () => clearInterval(id);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 w-[calc(100vw-2rem)] max-w-sm rounded-xl border border-border bg-card shadow-2xl p-4 fade-in">
      <div className="flex items-start gap-3">
        <div className="h-8 w-8 rounded-lg bg-primary/15 flex items-center justify-center text-primary shrink-0">
          <Zap className="h-4 w-4 fill-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="text-sm font-semibold truncate">Processing: Club League Match</div>
            <button
              onClick={() => setVisible(false)}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-2 h-1.5 rounded-full bg-elevated overflow-hidden">
            <div
              className="h-full bg-primary progress-animated transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between items-center mt-1.5 text-xs">
            <span className="text-muted-foreground">Jersey OCR running…</span>
            <span className="text-primary font-semibold">{progress}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
