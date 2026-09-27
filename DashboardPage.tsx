import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, Clock, Users, TrendingUp, History, X,
  Timer, LogOut, Radio, AlertTriangle, ArrowRight, Flame,
} from "lucide-react";
import Avatar from "../components/Avatar";
import { CHECK_IN_HISTORY, CURRENT_USER, PRESENT_USERS, CAMPUS_NAME } from "../data/mockData";
import type { ToastMessage } from "../components/Toast";
import type { AttendanceInput } from "../services/api";

interface Props {
  checkedIn: boolean;
  onCheckInChange: (val: boolean) => void;
  onAttendanceSync: (input: AttendanceInput) => void;
  addToast: (t: Omit<ToastMessage, "id">) => void;
  onNavigate: (tab: string) => void;
}

const now = new Date();
const fmt = (d: Date) => d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

export default function DashboardPage({ checkedIn, onCheckInChange, onAttendanceSync, addToast, onNavigate }: Props) {
  const [autoDetect, setAutoDetect] = useState(false);
  const [simProgress, setSimProgress] = useState(0);
  const [simRunning, setSimRunning] = useState(false);
  const [nudgeDismissed, setNudgeDismissed] = useState(false);
  const [checkInTime] = useState(fmt(now));
  const [elapsed, setElapsed] = useState(0);
  const [nudgeShake, setNudgeShake] = useState(0);
  const nudgeRef = useRef<HTMLDivElement>(null);

  /* Running timer */
  useEffect(() => {
    if (!checkedIn) { setElapsed(0); return; }
    const t = setInterval(() => setElapsed((s) => s + 1), 60000);
    return () => clearInterval(t);
  }, [checkedIn]);

  const elapsedLabel = () => {
    const h = Math.floor(elapsed / 60);
    const m = elapsed % 60;
    if (h === 0) return `${m}m`;
    return `${h}h ${m}m`;
  };

  /* Nudge re-shake every 8s if still showing */
  useEffect(() => {
    if (nudgeDismissed || checkedIn) return;
    const iv = setInterval(() => {
      setNudgeShake((s) => s + 1);
      try { navigator.vibrate?.([180, 60, 180, 60, 350]); } catch {}
    }, 8000);
    return () => clearInterval(iv);
  }, [nudgeDismissed, checkedIn]);

  /* Auto-detect sim */
  useEffect(() => {
    if (!autoDetect || simRunning || checkedIn) return;
    setSimRunning(true);
    setSimProgress(0);
    let p = 0;
    const iv = setInterval(() => {
      p += 3;
      setSimProgress(p);
      if (p >= 100) {
        clearInterval(iv);
        setSimRunning(false);
        onCheckInChange(true);
        onAttendanceSync({ status: "checked_in", campusName: CAMPUS_NAME, occurredAt: new Date().toISOString() });
        addToast({ type: "geofence", title: "Campus location detected", body: `${CAMPUS_NAME} is nearby. Your check-in has been completed.`, urgent: true });
      }
    }, 80);
    return () => clearInterval(iv);
  }, [autoDetect]);

  const handleCheckIn = useCallback(() => {
    const next = !checkedIn;
    onCheckInChange(next);
    onAttendanceSync({ status: next ? "checked_in" : "checked_out", campusName: CAMPUS_NAME, occurredAt: new Date().toISOString() });
    setNudgeDismissed(true);
    addToast(
      next
        ? { type: "checkin", title: `Namaskar, ${CURRENT_USER.name.split(" ")[0]} ✓`, body: "Your campus check-in is complete. Available perks are now unlocked." }
        : { type: "checkout", title: "Check-out complete", body: `Session: ${checkInTime} — ${fmt(new Date())} · ${elapsedLabel()}` }
    );
  }, [checkedIn, onCheckInChange, onAttendanceSync, addToast, checkInTime]);

  const totalHrs = CHECK_IN_HISTORY.filter((r) => r.duration).reduce((acc, r) => {
    const m = r.duration!.match(/(\d+)h\s(\d+)m/);
    return acc + (m ? +m[1] + +m[2] / 60 : 0);
  }, 0);

  const onlineCount = PRESENT_USERS.filter((u) => u.checkedIn).length + (checkedIn ? 1 : 0);
  const showNudge = !nudgeDismissed && !checkedIn;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="flex flex-col gap-4 pb-6"
    >
      {/* ── URGENT Nudge Banner ── */}
      <AnimatePresence>
        {showNudge && (
          <motion.div
            key="nudge"
            ref={nudgeRef}
            initial={{ opacity: 0, y: -10, height: 0, scale: 0.97 }}
            animate={{
              opacity: 1, y: 0, height: "auto", scale: 1,
              x: nudgeShake > 0 ? [0, -5, 5, -5, 5, -3, 3, 0] : 0,
            }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            transition={{ duration: 0.28, x: { duration: 0.55 } }}
            className="nudge-alert flex items-start gap-3 overflow-hidden"
            onAnimationComplete={() => {
              try { navigator.vibrate?.([200, 60, 200, 60, 400]); } catch {}
            }}
          >
            {/* Pulsing warning icon */}
            <div className="w-9 h-9 rounded-xl bg-red-500/12 border border-red-400/35 flex items-center justify-center flex-shrink-0 mt-0.5 relative">
              <AlertTriangle size={16} className="text-red-500" />
              <span className="absolute inset-0 rounded-xl border border-red-400/50 pulse-ring-el opacity-50" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <Flame size={11} className="text-red-500 flex-shrink-0" />
                <p className="text-[10px] mono font-bold text-red-500 uppercase tracking-wider">Campus Zone Detected!</p>
              </div>
              <p className="text-sm font-bold text-[var(--foreground)] leading-snug">
                Arjun, aap {CAMPUS_NAME} ke nazdik hain. Kripya check in kar lein.
              </p>
              <p className="text-[11px] text-[var(--muted-foreground)] mt-0.5 leading-relaxed">
                Aaj ke <span className="font-semibold text-[var(--foreground)]">6 perks worth ₹500+</span> aaj ke liye available hain. Check in karke inka labh uthaiye.
              </p>
              <motion.button
                className="mt-2.5 flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-500 text-white text-[11px] font-bold uppercase tracking-wide"
                whileTap={{ scale: 0.95 }}
                onClick={handleCheckIn}
                animate={{ scale: [1, 1.03, 1] }}
                transition={{ repeat: Infinity, duration: 1.8 }}
              >
                CHECK IN NOW <ArrowRight size={12} />
              </motion.button>
            </div>

            <button
              onClick={() => setNudgeDismissed(true)}
              className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors flex-shrink-0 mt-0.5"
            >
              <X size={15} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-3 gap-2.5">
        <StatTile icon={Clock}      label="CHECK-IN"   value={checkedIn ? checkInTime : "--:--"}          accent={checkedIn ? "green" : undefined} />
        <StatTile icon={TrendingUp} label="THIS WEEK"  value={`${totalHrs.toFixed(0)}h`} />
        <StatTile icon={Users}      label="HERE NOW"   value={`${onlineCount}`} accent="indigo" />
      </div>

      {/* ── Hero Check-In Card ── */}
      <div className={`checkin-card ${checkedIn ? "active checkin-active" : "inactive"}`}>
        {/* Glow overlay when active */}
        {checkedIn && (
          <div className="absolute inset-0 rounded-[var(--radius)] pointer-events-none"
            style={{ background: "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(16,185,129,0.06), transparent)" }} />
        )}

        <div className="relative flex items-center gap-4">
          {/* Avatar ring */}
          <div className={`relative flex-shrink-0 ${checkedIn ? "ring-2 ring-[var(--accent)] ring-offset-2 ring-offset-white dark:ring-offset-[#0D1F12] rounded-full" : ""}`}>
            <Avatar
              initials={CURRENT_USER.avatar}
              gradientClass={CURRENT_USER.avatarColor}
              size="xl"
              online={checkedIn}
            />
            {checkedIn && (
              <>
                <span className="absolute inset-0 rounded-full border-2 border-[var(--accent)] pulse-ring-el opacity-60" />
                <span className="absolute inset-0 rounded-full border-2 border-[var(--accent)] pulse-ring-el2 opacity-40" />
              </>
            )}
          </div>

          {/* Status info */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              {checkedIn ? (
                <motion.div key="in" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.2 }}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="badge badge-green">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] dot-pulse" />
                      CHECKED IN
                    </span>
                  </div>
                  <p className="text-base font-bold text-[var(--foreground)]">{CAMPUS_NAME}</p>
                  <p className="text-xs text-[var(--muted-foreground)] flex items-center gap-1 mt-0.5">
                    <Timer size={11} className="timer-anim text-[var(--accent)]" />
                    <span className="text-[var(--accent)] font-semibold">
                      {elapsed > 0 ? `Checked in for ${elapsedLabel()}` : `Checked in at ${checkInTime}`}
                    </span>
                  </p>
                </motion.div>
              ) : (
                <motion.div key="out" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.2 }}>
                  <p className="text-sm font-medium text-[var(--muted-foreground)] mb-0.5">Not checked in</p>
                  <p className="text-base font-bold text-[var(--foreground)]">{CAMPUS_NAME}</p>
                  <p className="text-xs text-[var(--muted-foreground)] flex items-center gap-1 mt-0.5">
                    <MapPin size={11} /> You are ~50m away
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-4 flex items-center gap-3">
          <motion.button
            className={`flex-1 ${checkedIn ? "btn-ghost flex items-center justify-center gap-2" : "btn-accent"}`}
            onClick={handleCheckIn}
            whileTap={{ scale: 0.97 }}
          >
            {checkedIn ? (
              <><LogOut size={15} /> Check out</>
            ) : (
              "Check In Now"
            )}
          </motion.button>

          <div className="flex items-center gap-2">
            <Radio size={12} className={autoDetect ? "text-[var(--primary)]" : "text-[var(--muted-foreground)]"} />
            <span className="text-[11px] text-[var(--muted-foreground)] whitespace-nowrap">Auto</span>
            <button
              onClick={() => setAutoDetect((v) => !v)}
              className={`toggle-track ${autoDetect ? "on" : "off"}`}
            >
              <span className="toggle-thumb" />
            </button>
          </div>
        </div>

        {/* Sim progress */}
        <AnimatePresence>
          {simRunning && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 pt-3 border-t border-[var(--border)] overflow-hidden"
            >
              <div className="flex justify-between mb-1.5">
                <span className="text-[10px] text-[var(--primary)] mono uppercase tracking-wider">Simulating approach…</span>
                <span className="text-[10px] mono text-[var(--muted-foreground)]">{simProgress}m away</span>
              </div>
              <div className="match-bar-track">
                <motion.div className="match-bar-fill" animate={{ width: `${simProgress}%` }} transition={{ duration: 0.08 }} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Quick links ── */}
      <div className="grid grid-cols-3 gap-2.5">
        <QuickLink
          icon="👥"
          label="Who's Here"
          sub={`${onlineCount} on-site`}
          color="rgba(22,163,74,0.06)"
          iconBg="rgba(22,163,74,0.10)"
          onClick={() => onNavigate("network")}
        />
        <QuickLink
          icon="🚗"
          label="Ride Pools"
          sub="4 matches"
          color="rgba(6,182,212,0.06)"
          iconBg="rgba(6,182,212,0.12)"
          onClick={() => onNavigate("rides")}
        />
        <QuickLink
          icon="🎁"
          label="Perks"
          sub={checkedIn ? "6 active" : "Check in"}
          color={checkedIn ? "rgba(16,185,129,0.06)" : undefined}
          iconBg="rgba(16,185,129,0.12)"
          onClick={() => onNavigate("perks")}
        />
      </div>

      {/* ── Check-in history ── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <History size={13} className="text-[var(--muted-foreground)]" />
          <span className="text-xs mono text-[var(--muted-foreground)] uppercase tracking-wider">Check-in history</span>
        </div>
        <div className="space-y-2">
          {CHECK_IN_HISTORY.map((r, i) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.055, duration: 0.22 }}
              className="card px-4 py-3 flex items-center gap-3"
            >
              <motion.div
                className={`w-2 h-2 rounded-full flex-shrink-0 ${r.checkOut === null ? "bg-[var(--accent)]" : "bg-[var(--border)]"}`}
                animate={r.checkOut === null ? { scale: [1, 1.5, 1] } : {}}
                transition={{ repeat: Infinity, duration: 2 }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-[var(--foreground)]">{r.date}</p>
                  {r.checkOut === null && <span className="badge badge-green">LIVE</span>}
                </div>
                <p className="text-[11px] text-[var(--muted-foreground)] mono mt-0.5">
                  {r.checkIn}{r.checkOut ? ` → ${r.checkOut}` : " → now"}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs font-bold mono text-[var(--foreground)]">{r.duration ?? "—"}</p>
                <p className="text-[10px] text-[var(--muted-foreground)] mt-0.5">{r.location.split(" · ")[1]}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function StatTile({ icon: Icon, label, value, accent }: {
  icon: React.ElementType; label: string; value: string; accent?: "green" | "indigo";
}) {
  const color = accent === "green" ? "text-[var(--accent)]" : accent === "indigo" ? "text-[var(--primary)]" : "text-[var(--foreground)]";
  return (
    <div className="stat-tile flex flex-col gap-0.5">
      <div className="flex items-center gap-1 mb-0.5">
        <Icon size={10} className="text-[var(--muted-foreground)]" />
        <p className="text-[9px] mono text-[var(--muted-foreground)] uppercase tracking-wider truncate">{label}</p>
      </div>
      <p className={`text-xl font-extrabold mono ${color}`}>{value}</p>
    </div>
  );
}

function QuickLink({ icon, label, sub, color, iconBg, onClick }: {
  icon: string; label: string; sub: string; color?: string; iconBg: string; onClick?: () => void;
}) {
  return (
    <motion.button
      className="quick-link text-left w-full"
      style={{ background: color ?? "var(--card)" }}
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
    >
      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
        style={{ background: iconBg }}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-[var(--foreground)] truncate">{label}</p>
        <p className="text-[10px] text-[var(--muted-foreground)] truncate">{sub}</p>
      </div>
    </motion.button>
  );
}
