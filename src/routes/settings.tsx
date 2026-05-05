import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — ScoutEdge" },
      { name: "description", content: "Configure your ScoutEdge preferences." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const [notif, setNotif] = useState(true);
  const [auto, setAuto] = useState(true);
  const [hd, setHd] = useState(false);
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold">Settings</h2>
        <p className="text-sm text-muted-foreground mt-1">Manage your account and preferences</p>
      </div>

      <section className="rounded-xl border border-border bg-card p-6">
        <h3 className="font-semibold mb-4">Profile</h3>
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center text-xl font-bold">PK</div>
          <div>
            <div className="font-semibold">Priya Kapoor</div>
            <div className="text-sm text-muted-foreground">priya.kapoor@scoutedge.demo</div>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-3 mt-5">
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Display name</label>
            <input className="w-full bg-elevated border border-border rounded-md px-3 py-2 text-sm" defaultValue="Priya Kapoor" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Organization</label>
            <input className="w-full bg-elevated border border-border rounded-md px-3 py-2 text-sm" defaultValue="Mumbai Sports Academy" />
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-6">
        <h3 className="font-semibold mb-4">Preferences</h3>
        <div className="space-y-3">
          {[
            { key: "notif", label: "Email notifications when analysis completes", v: notif, set: setNotif },
            { key: "auto", label: "Auto-tag events after upload", v: auto, set: setAuto },
            { key: "hd", label: "Always process at HD frame rate", v: hd, set: setHd },
          ].map((t) => (
            <div key={t.key} className="flex items-center justify-between p-3 rounded-lg bg-elevated/40 border border-border">
              <span className="text-sm">{t.label}</span>
              <button
                onClick={() => t.set(!t.v)}
                className={`relative h-6 w-11 rounded-full transition-colors ${t.v ? "bg-primary" : "bg-muted-foreground/40"}`}
              >
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${t.v ? "translate-x-5" : "translate-x-0.5"}`} />
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-destructive/30 bg-destructive/5 p-6">
        <h3 className="font-semibold text-destructive mb-1">Danger Zone</h3>
        <p className="text-xs text-muted-foreground mb-4">Permanently delete all match data.</p>
        <button className="bg-destructive text-destructive-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-destructive/90">
          Delete all data
        </button>
      </section>
    </div>
  );
}
