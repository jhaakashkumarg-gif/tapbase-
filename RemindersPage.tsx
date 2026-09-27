import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell, BellRing, MapPin, Plus, Flame, Home, Briefcase,
  ShoppingCart, LogOut as LeaveIcon, AlertTriangle, Check, Pencil, X,
} from "lucide-react";
import { GEO_REMINDERS, type GeoReminder } from "../data/mockData";
import type { ToastMessage } from "../components/Toast";
import type { ReminderMutationInput } from "../services/api";

interface Props {
  addToast: (t: Omit<ToastMessage, "id">) => void;
  onReminderSync: (input: ReminderMutationInput) => void;
}

type ZoneKey = "all" | GeoReminder["zone"];

const ZONE_META: Record<GeoReminder["zone"], { label: string; icon: React.ElementType; color: string; bg: string }> = {
  "work":         { label: "Arriving at Work",  icon: Briefcase,  color: "text-blue-600",  bg: "rgba(37,99,235,0.07)"  },
  "leaving-work": { label: "Leaving Work",       icon: LeaveIcon,  color: "text-orange-600", bg: "rgba(234,88,12,0.07)"  },
  "home":         { label: "At Home",            icon: Home,       color: "text-violet-600", bg: "rgba(124,58,237,0.07)" },
  "market":       { label: "Near Market",        icon: ShoppingCart, color: "text-amber-700", bg: "rgba(180,83,9,0.07)"  },
};

const ZONES: ZoneKey[] = ["all", "work", "leaving-work", "home", "market"];

const stagger = { animate: { transition: { staggerChildren: 0.055 } } };
const cardAnim = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.22 } },
};

function vibrate(pattern: number[]) {
  try { navigator.vibrate?.(pattern); } catch {}
}

export default function RemindersPage({ addToast, onReminderSync }: Props) {
  const [reminders, setReminders] = useState<GeoReminder[]>(GEO_REMINDERS);
  const [zone, setZone] = useState<ZoneKey>("all");
  const [triggered, setTriggered] = useState<Set<string>>(new Set(["gr9", "gr12"]));
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newEmoji, setNewEmoji] = useState("📌");
  const [newZone, setNewZone] = useState<GeoReminder["zone"]>("work");

  /* Simulate a new trigger every 20s for demo */
  useEffect(() => {
    const candidates = ["gr5", "gr7", "gr10"];
    let idx = 0;
    const iv = setInterval(() => {
      const id = candidates[idx % candidates.length];
      setTriggered((prev) => new Set(prev).add(id));
      const r = GEO_REMINDERS.find((x) => x.id === id);
      if (r) {
        vibrate([250, 70, 250, 70, 450, 70, 450]);
        addToast({
          type: "reminder",
          title: `${r.emoji} ${r.title}`,
          body: `📍 ${r.locationLabel} — Kripya is reminder par dhyan dein.`,
          urgent: true,
        });
      }
      idx++;
    }, 20000);
    return () => clearInterval(iv);
  }, [addToast]);

  const toggle = (id: string) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    );
    const r = reminders.find((x) => x.id === id);
    onReminderSync({ reminderId: id, action: "updated" });
    if (r && !r.enabled) {
      vibrate([100, 40, 100]);
      addToast({
        type: "info",
        title: `${r.emoji} Reminder ON`,
        body: `"${r.title}" is now active.`,
      });
    }
  };

  const dismissTrigger = (id: string) => {
    setTriggered((prev) => { const n = new Set(prev); n.delete(id); return n; });
    onReminderSync({ reminderId: id, action: "completed" });
    vibrate([60]);
    addToast({ type: "info", title: "Reminder completed ✓", body: "This reminder has been marked as complete." });
  };

  const addReminder = () => {
    if (!newTitle.trim()) return;
    const nr: GeoReminder = {
      id: `gr-custom-${Date.now()}`,
      emoji: newEmoji,
      title: newTitle.trim(),
      zone: newZone,
      triggerType: newZone === "leaving-work" || newZone === "home" ? "leave" : "arrive",
      locationLabel: newZone === "home" ? "Sector 14, Gurugram" : newZone === "market" ? "Local Market" : "Mindspace Tech Park",
      enabled: true,
      urgency: "normal",
    };
    setReminders((prev) => [nr, ...prev]);
    onReminderSync({ reminderId: nr.id, action: "created" });
    setShowAdd(false);
    setNewTitle("");
    vibrate([100, 40, 100]);
    addToast({ type: "info", title: `${newEmoji} Reminder added!`, body: `"${newTitle.trim()}" — ${ZONE_META[newZone].label}` });
  };

  const activeTriggered = reminders.filter((r) => triggered.has(r.id) && r.enabled);
  const filtered = reminders.filter((r) => zone === "all" || r.zone === zone);
  const enabledCount = reminders.filter((r) => r.enabled).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-4 pb-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-extrabold text-[var(--foreground)]">GeoFenced Reminders</h2>
          <p className="text-xs text-[var(--muted-foreground)]">
            {enabledCount} active · triggers on location entry/exit
          </p>
        </div>
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={() => setShowAdd((v) => !v)}
          className="w-9 h-9 rounded-xl bg-[var(--primary)] text-white flex items-center justify-center shadow-md"
        >
          {showAdd ? <X size={16} /> : <Plus size={16} />}
        </motion.button>
      </div>

      {/* Add reminder form */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="card p-4 flex flex-col gap-3 border-[var(--primary)]" style={{ borderColor: "rgba(22,163,74,0.3)" }}>
              <p className="text-xs mono text-[var(--muted-foreground)] uppercase tracking-wider flex items-center gap-1.5">
                <Plus size={10} /> New Reminder
              </p>
              <div className="flex gap-2">
                <input
                  className="input-field text-sm py-2.5 w-14 text-center text-xl"
                  value={newEmoji}
                  onChange={(e) => setNewEmoji(e.target.value.slice(-2) || "📌")}
                  maxLength={2}
                />
                <input
                  className="input-field text-sm py-2.5 flex-1"
                  placeholder="Reminder title..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addReminder()}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(ZONE_META) as GeoReminder["zone"][]).map((z) => {
                  const { label, icon: Icon, color } = ZONE_META[z];
                  return (
                    <motion.button
                      key={z}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => setNewZone(z)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                        newZone === z
                          ? "bg-[rgba(22,163,74,0.1)] border-[rgba(22,163,74,0.3)] text-[var(--primary)]"
                          : "border-[var(--border)] text-[var(--muted-foreground)]"
                      }`}
                    >
                      <Icon size={12} className={newZone === z ? "text-[var(--primary)]" : color} />
                      {label}
                    </motion.button>
                  );
                })}
              </div>
              <motion.button
                className={`btn-primary w-full ${!newTitle.trim() ? "opacity-40 cursor-not-allowed" : ""}`}
                disabled={!newTitle.trim()}
                whileTap={{ scale: 0.97 }}
                onClick={addReminder}
              >
                <Bell size={14} /> Add Reminder
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Triggered NOW banner ── */}
      <AnimatePresence>
        {activeTriggered.length > 0 && (
          <motion.div
            key="triggered"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="flex flex-col gap-2"
          >
            <div className="flex items-center gap-2">
              <div className="relative">
                <BellRing size={13} className="text-red-500" />
                <motion.span
                  className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-red-500"
                  animate={{ scale: [1, 1.6, 1] }}
                  transition={{ repeat: Infinity, duration: 1.2 }}
                />
              </div>
              <p className="text-[10px] mono font-bold text-red-500 uppercase tracking-wider">
                Reminder due now — Please review
              </p>
            </div>

            {activeTriggered.map((r) => (
              <motion.div
                key={r.id}
                layout
                className="profile-card reminder-triggered reminder-triggered-bg"
              >
                <div className="flex items-start gap-3">
                  <motion.div
                    className="w-11 h-11 rounded-xl bg-red-500/10 border border-red-400/30 flex items-center justify-center text-xl flex-shrink-0"
                    animate={{ scale: [1, 1.08, 1] }}
                    transition={{ repeat: Infinity, duration: 1.0 }}
                  >
                    {r.emoji}
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <AlertTriangle size={10} className="text-red-500 flex-shrink-0" />
                      <span className="text-[9px] mono font-bold text-red-500 uppercase tracking-wide">
                        {ZONE_META[r.zone].label}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-[var(--foreground)] leading-tight">{r.title}</p>
                    {r.subtitle && (
                      <p className="text-[11px] text-[var(--muted-foreground)] mt-0.5">{r.subtitle}</p>
                    )}
                    <div className="flex items-center gap-1 mt-1.5">
                      <MapPin size={9} className="text-[var(--muted-foreground)]" />
                      <span className="text-[10px] mono text-[var(--muted-foreground)]">{r.locationLabel}</span>
                    </div>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.88 }}
                    onClick={() => dismissTrigger(r.id)}
                    className="flex-shrink-0 w-9 h-9 rounded-xl bg-[var(--primary)] text-white flex items-center justify-center"
                  >
                    <Check size={15} />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Zone filter tabs ── */}
      <div className="flex gap-1.5 overflow-x-auto pb-0.5" style={{ scrollbarWidth: "none" }}>
        <motion.button
          whileTap={{ scale: 0.93 }}
          onClick={() => setZone("all")}
          className={`tag-pill flex-shrink-0 text-xs flex items-center gap-1 ${zone === "all" ? "selected" : ""}`}
        >
          <Bell size={10} /> All
        </motion.button>
        {(Object.keys(ZONE_META) as GeoReminder["zone"][]).map((z) => {
          const { label, icon: Icon } = ZONE_META[z];
          return (
            <motion.button
              key={z}
              whileTap={{ scale: 0.93 }}
              onClick={() => setZone(z)}
              className={`tag-pill flex-shrink-0 text-xs flex items-center gap-1 ${zone === z ? "selected" : ""}`}
            >
              <Icon size={10} /> {label}
            </motion.button>
          );
        })}
      </div>

      {/* ── Reminder cards ── */}
      <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-2">
        {filtered.map((r) => {
          const meta = ZONE_META[r.zone];
          const isTrig = triggered.has(r.id) && r.enabled;

          return (
            <motion.div key={r.id} variants={cardAnim} layout>
              <div className={`profile-card transition-all ${isTrig ? "reminder-triggered" : ""}`}>
                <div className="flex items-start gap-3">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0 border"
                    style={{ background: r.enabled ? meta.bg : "var(--muted)", borderColor: r.enabled ? "transparent" : "var(--border)" }}
                  >
                    {r.emoji}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                      <meta.icon size={9} className={meta.color} />
                      <span className="text-[9px] mono text-[var(--muted-foreground)] uppercase tracking-wide">
                        {meta.label}
                      </span>
                      {r.urgency === "high" && (
                        <span className="badge badge-rose text-[8px]">URGENT</span>
                      )}
                      {isTrig && (
                        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="badge badge-rose text-[8px]">
                          🔔 NOW
                        </motion.span>
                      )}
                    </div>
                    <p className={`text-sm font-bold leading-tight ${r.enabled ? "text-[var(--foreground)]" : "text-[var(--muted-foreground)]"}`}>
                      {r.title}
                    </p>
                    {r.subtitle && (
                      <p className="text-[11px] text-[var(--muted-foreground)] mt-0.5">{r.subtitle}</p>
                    )}
                    <div className="flex items-center gap-1 mt-1.5">
                      <MapPin size={9} className="text-[var(--muted-foreground)]" />
                      <span className="text-[10px] mono text-[var(--muted-foreground)]">
                        {r.triggerType === "arrive" ? "On arrive · " : "On leave · "}
                        {r.locationLabel}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => toggle(r.id)}
                    className={`toggle-track flex-shrink-0 mt-1 ${r.enabled ? "on" : "off"}`}
                  >
                    <span className="toggle-thumb" />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Info footer */}
      <div className="card p-3 flex items-start gap-2.5">
        <MapPin size={13} className="text-[var(--primary)] mt-0.5 flex-shrink-0" />
        <p className="text-[11px] text-[var(--muted-foreground)] leading-relaxed">
          Reminders are sent automatically when your GPS enters or exits the selected zone. A vibration alert may be used even when your phone is in silent mode.
        </p>
      </div>
    </motion.div>
  );
}
