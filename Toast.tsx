import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, LogOut, Radio, Mail, Info, X, BellRing, AlertTriangle } from "lucide-react";

export interface ToastMessage {
  id: string;
  type: "checkin" | "checkout" | "geofence" | "request" | "info" | "reminder";
  title: string;
  body: string;
  urgent?: boolean;
}

interface Props {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

const ICONS = {
  checkin:  CheckCircle2,
  checkout: LogOut,
  geofence: Radio,
  request:  Mail,
  info:     Info,
  reminder: BellRing,
};

const COLORS: Record<ToastMessage["type"], string> = {
  checkin:  "text-emerald-600 bg-emerald-500/10 border-emerald-500/25",
  checkout: "text-slate-500 bg-slate-500/10 border-slate-500/20",
  geofence: "text-amber-700 bg-amber-400/15 border-amber-400/35",
  request:  "text-green-700 bg-green-500/10 border-green-500/20",
  info:     "text-violet-500 bg-violet-500/10 border-violet-500/20",
  reminder: "text-red-600 bg-red-500/10 border-red-500/30",
};

const URGENT_PATTERNS: Record<string, number[]> = {
  reminder: [200, 60, 200, 60, 400, 60, 400],
  geofence: [300, 80, 300, 80, 600],
  checkin:  [100, 50, 100],
  checkout: [80],
  request:  [120, 60, 120],
  info:     [80],
};

function vibrate(pattern: number[]) {
  try {
    navigator.vibrate?.(pattern);
  } catch {}
}

function ToastItem({ toast, onDismiss }: { toast: ToastMessage; onDismiss: () => void }) {
  const Icon = ICONS[toast.type];
  const isUrgent = toast.urgent || toast.type === "reminder" || (toast.type === "geofence" && toast.urgent !== false);
  const timeout = isUrgent ? 6000 : 4200;
  const shakeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    vibrate(URGENT_PATTERNS[toast.type] ?? [100]);

    if (isUrgent && shakeRef.current) {
      shakeRef.current.classList.add("shake");
      const clear = setTimeout(() => shakeRef.current?.classList.remove("shake"), 600);
      return () => clearTimeout(clear);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(onDismiss, timeout);
    return () => clearTimeout(t);
  }, [onDismiss, timeout]);

  return (
    <motion.div
      ref={shakeRef}
      initial={{ opacity: 0, y: 44, scale: 0.88 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 24, scale: 0.93 }}
      transition={{ type: "spring", stiffness: 420, damping: 26 }}
      className={`flex items-start gap-3 px-4 py-3 rounded-xl border glass-strong min-w-[288px] max-w-[344px] shadow-xl ${
        isUrgent ? "border-red-400/40" : ""
      }`}
    >
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border ${COLORS[toast.type]} ${isUrgent ? "relative" : ""}`}>
        <Icon size={15} />
        {isUrgent && (
          <span className="absolute inset-0 rounded-lg border border-red-400/60 pulse-ring-el opacity-40" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-foreground leading-snug">{toast.title}</p>
        <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{toast.body}</p>
        {isUrgent && (
          <div className="mt-1.5 flex items-center gap-1">
            <AlertTriangle size={9} className="text-red-500 flex-shrink-0" />
            <span className="text-[10px] text-red-500 font-semibold mono">ACTION REQUIRED</span>
          </div>
        )}
      </div>
      <button onClick={onDismiss} className="text-muted-foreground hover:text-foreground transition-colors mt-0.5 flex-shrink-0">
        <X size={13} />
      </button>
    </motion.div>
  );
}

export default function ToastContainer({ toasts, onDismiss }: Props) {
  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 items-center pointer-events-none">
      <AnimatePresence mode="sync">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem toast={t} onDismiss={() => onDismiss(t.id)} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
