import { useState, useCallback, useEffect, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Users, Car, Star, Moon, Sun, EyeOff, BellRing } from "lucide-react";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import WhosHerePage from "./pages/WhosHerePage";
import RidePoolPage from "./pages/RidePoolPage";
import PerksPage from "./pages/PerksPage";
import RemindersPage from "./pages/RemindersPage";
import ToastContainer, { type ToastMessage } from "./components/Toast";
import Avatar from "./components/Avatar";
import { CURRENT_USER, PRESENT_USERS, CAMPUS_NAME } from "./data/mockData";
import { Logo } from "./pages/AuthPage";
import { geoSyncApi, type AttendanceInput, type ReminderMutationInput, type SessionInput } from "./services/api";

type AppState = "auth" | "app";
type Tab = "dashboard" | "network" | "rides" | "perks" | "reminders";

interface NavItem { id: Tab; label: string; icon: (a: boolean) => ReactNode }

const NAV: NavItem[] = [
  { id: "dashboard", label: "Home",    icon: (a) => <Home     size={19} className={a ? "text-[var(--primary)]" : "text-[var(--muted-foreground)]"} /> },
  { id: "network",   label: "Here",    icon: (a) => <Users    size={19} className={a ? "text-[var(--primary)]" : "text-[var(--muted-foreground)]"} /> },
  { id: "rides",     label: "Rides",   icon: (a) => <Car      size={19} className={a ? "text-[var(--primary)]" : "text-[var(--muted-foreground)]"} /> },
  { id: "perks",     label: "Perks",   icon: (a) => <Star     size={19} className={a ? "text-[var(--primary)]" : "text-[var(--muted-foreground)]"} /> },
  { id: "reminders", label: "Remind",  icon: (a) => <BellRing size={19} className={a ? "text-[var(--primary)]" : "text-[var(--muted-foreground)]"} /> },
];

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -6 },
};

export default function App() {
  const [appState, setAppState]   = useState<AppState>("auth");
  const [tab, setTab]             = useState<Tab>("dashboard");
  const [checkedIn, setCheckedIn] = useState(false);
  const [darkMode, setDarkMode]   = useState(false);
  const [ghostMode, setGhostMode] = useState(false);
  const [toasts, setToasts]       = useState<ToastMessage[]>([]);

  /* Apply dark class */
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  const addToast = useCallback((t: Omit<ToastMessage, "id">) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev.slice(-2), { ...t, id }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toggleGhost = () => {
    const next = !ghostMode;
    setGhostMode(next);
    addToast({
      type: "info",
      title: next ? "Ghost Mode on 👻" : "Ghost Mode off",
      body: next
        ? "You're hidden from the Who's Here feed."
        : "You're now visible to campus colleagues.",
    });
  };

  const completeAuth = async (input: SessionInput) => {
    if (geoSyncApi.isConfigured) {
      try {
        await geoSyncApi.auth.createSession(input);
      } catch {
        addToast({ type: "info", title: "Test environment unavailable", body: "You can continue in local demonstration mode." });
      }
    }
    setAppState("app");
  };

  const syncAttendance = (input: AttendanceInput) => {
    if (!geoSyncApi.isConfigured) return;
    void geoSyncApi.attendance.update(input).catch(() => {
      addToast({ type: "info", title: "Attendance saved locally", body: "We will retry when the test environment is available." });
    });
  };

  const syncReminder = (input: ReminderMutationInput) => {
    if (!geoSyncApi.isConfigured) return;
    void geoSyncApi.reminders.mutate(input).catch(() => {
      addToast({ type: "info", title: "Reminder saved locally", body: "We will retry when the test environment is available." });
    });
  };

  if (appState === "auth") {
    return (
      <>
        <AuthPage onComplete={completeAuth} />
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </>
    );
  }

  const onlineCount = PRESENT_USERS.filter((u) => u.checkedIn).length + (checkedIn && !ghostMode ? 1 : 0);

  return (
    <div className="size-full flex flex-col max-w-lg mx-auto bg-[var(--background)]">
      {/* ── Top bar ── */}
      <header className="flex-shrink-0 glass-nav border-b border-[var(--border)] px-4 py-3 flex items-center gap-3 sticky top-0 z-40">
        <Logo />

        {/* Geofence location pill */}
        <motion.div
          className="geo-pill flex-1 min-w-0 max-w-[160px] overflow-hidden"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <motion.div
            className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]"
            animate={{ scale: [1, 1.4, 1] }}
            transition={{ repeat: Infinity, duration: 2.5 }}
          />
          <span className="truncate">{CAMPUS_NAME}</span>
        </motion.div>

        <div className="flex items-center gap-1.5 ml-auto">
          {/* Ghost mode */}
          <motion.button
            onClick={toggleGhost}
            whileTap={{ scale: 0.88 }}
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors border ${
              ghostMode
                ? "bg-[rgba(22,163,74,0.12)] border-[rgba(22,163,74,0.25)] text-[var(--primary)]"
                : "border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
            title="Ghost Mode"
          >
            <EyeOff size={15} />
          </motion.button>

          {/* Dark/light toggle */}
          <motion.button
            onClick={() => setDarkMode((v) => !v)}
            whileTap={{ scale: 0.88 }}
            className="w-8 h-8 rounded-xl border border-[var(--border)] flex items-center justify-center text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
          >
            {darkMode ? <Sun size={15} /> : <Moon size={15} />}
          </motion.button>

          {/* Avatar with online count */}
          <div className="relative">
            <Avatar initials={CURRENT_USER.avatar} gradientClass={CURRENT_USER.avatarColor} size="sm" online={checkedIn && !ghostMode} />
            {checkedIn && !ghostMode && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[var(--primary)] border-2 border-white dark:border-[#0D1F12] flex items-center justify-center"
              >
                <span className="text-[8px] font-bold text-white mono">{onlineCount}</span>
              </motion.span>
            )}
          </div>
        </div>
      </header>

      {/* ── Page content ── */}
      <main className="flex-1 overflow-y-auto px-4 pt-4 relative">
        <AnimatePresence mode="wait">
          <motion.div key={tab} variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.22, ease: "easeOut" }}>
            {tab === "dashboard" && (
              <DashboardPage
                checkedIn={checkedIn}
                onCheckInChange={setCheckedIn}
                onAttendanceSync={syncAttendance}
                addToast={addToast}
                onNavigate={(t) => setTab(t as Tab)}
              />
            )}
            {tab === "network" && <WhosHerePage checkedIn={checkedIn && !ghostMode} addToast={addToast} />}
            {tab === "rides" && <RidePoolPage addToast={addToast} />}
            {tab === "perks" && <PerksPage checkedIn={checkedIn} addToast={addToast} />}
            {tab === "reminders" && <RemindersPage addToast={addToast} onReminderSync={syncReminder} />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* ── Bottom nav ── */}
      <nav className="flex-shrink-0 glass-nav border-t border-[var(--border)] px-2 py-2 sticky bottom-0 z-40">
        <div className="flex items-center justify-around">
          {NAV.map((item) => {
            const isActive = tab === item.id;
            const showDot = (item.id === "network" && checkedIn && !ghostMode) || item.id === "reminders";
            return (
              <motion.button
                key={item.id}
                onClick={() => setTab(item.id)}
                className="flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl relative"
                whileTap={{ scale: 0.85 }}
              >
                {showDot && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-1 right-2.5 w-2 h-2 rounded-full bg-[var(--accent)] border-2 border-white dark:border-[#0D1F12]"
                  />
                )}

                <div className="relative">
                  {item.icon(isActive)}
                  {isActive && (
                    <motion.div
                      layoutId="nav-dot"
                      className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[var(--primary)]"
                      transition={{ type: "spring", stiffness: 600, damping: 35 }}
                    />
                  )}
                </div>

                <span className={`text-[9px] font-bold mono uppercase tracking-wider transition-colors ${isActive ? "text-[var(--primary)]" : "text-[var(--muted-foreground)]"}`}>
                  {item.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </nav>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
