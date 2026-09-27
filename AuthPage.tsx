import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, Clock, Mail, Lock, ArrowRight, Check, Sparkles,
  Shield, Users, Car, Fingerprint, RadioTower,
} from "lucide-react";
import { ALL_TAGS, CAMPUS_NAME } from "../data/mockData";
import type { SessionInput } from "../services/api";

type Step = "login" | "loc" | "tags";

interface Props {
  onComplete: (input: SessionInput) => void | Promise<void>;
}

const slideTransition = { duration: 0.28, ease: "easeOut" } as const;
const slideExitTransition = { duration: 0.2 } as const;

export default function AuthPage({ onComplete }: Props) {
  const [step, setStep] = useState<Step>("login");
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>(["#Design", "#AI", "#Coffee"]);

  const toggleTag = (tag: string) =>
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : prev.length < 6 ? [...prev, tag] : prev
    );

  return (
    <div className="min-h-full flex flex-col items-center justify-center p-5 grid-bg overflow-hidden">
      <AnimatePresence mode="wait">
        {/* ── Login ── */}
        {step === "login" && (
          <motion.div key="login" initial={{ opacity: 0, x: 28 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -28 }} transition={slideTransition} className="w-full max-w-sm">
            <div className="text-center mb-8">
              <Logo large />
              <p className="text-sm text-[var(--muted-foreground)] mt-3 mb-7">
                Workplace presence, reimagined.
              </p>
              <div className="flex justify-center gap-6">
                {[
                  { icon: RadioTower, label: "Geofence" },
                  { icon: Users, label: "Networking" },
                  { icon: Car, label: "Ride pools" },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex flex-col items-center gap-2">
                    <div className="w-11 h-11 rounded-2xl bg-[rgba(22,163,74,0.08)] border border-[rgba(22,163,74,0.2)] flex items-center justify-center">
                      <Icon size={18} className="text-[var(--primary)]" />
                    </div>
                    <span className="text-[11px] text-[var(--muted-foreground)] mono">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-5">
              {/* Tab switcher */}
              <div className="flex gap-1 p-1 rounded-xl bg-[var(--muted)] mb-5">
                {["Sign in", "Create account"].map((label, i) => (
                  <button
                    key={label}
                    onClick={() => setIsLogin(i === 0)}
                    className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${(isLogin ? i === 0 : i === 1) ? "bg-white dark:bg-white/10 text-[var(--foreground)] shadow-sm" : "text-[var(--muted-foreground)]"}`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                <div className="relative">
                  <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
                  <input className="input-field pl-9" type="email" placeholder="you@company.com" value={email} onChange={(event) => setEmail(event.target.value)} />
                </div>
                <div className="relative">
                  <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
                  <input className="input-field pl-9" type="password" placeholder="••••••••" value={password} onChange={(event) => setPassword(event.target.value)} />
                </div>
              </div>

              <motion.button
                className="btn-primary w-full mt-4"
                onClick={() => setStep("loc")}
                whileTap={{ scale: 0.97 }}
              >
                {isLogin ? "Sign in" : "Create account"} <ArrowRight size={15} />
              </motion.button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[var(--border)]" />
                </div>
                <div className="relative flex justify-center">
                  <span className="px-3 text-[11px] text-[var(--muted-foreground)] bg-white dark:bg-[#0d1117]">or continue with</span>
                </div>
              </div>

              <motion.button
                className="btn-ghost w-full"
                onClick={() => setStep("loc")}
                whileTap={{ scale: 0.97 }}
              >
                <Fingerprint size={15} /> Magic Link
              </motion.button>
            </div>

            <p className="text-center text-[11px] text-[var(--muted-foreground)] mt-5">
              By continuing you agree to our{" "}
              <span className="text-[var(--primary)] cursor-pointer">Terms</span> &{" "}
              <span className="text-[var(--primary)] cursor-pointer">Privacy Policy</span>.
            </p>
          </motion.div>
        )}

        {/* ── Location ── */}
        {step === "loc" && (
          <motion.div key="loc" initial={{ opacity: 0, x: 28 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -28 }} transition={slideTransition} className="w-full max-w-sm">
            <Logo />
            <StepBar current={1} />
            <h2 className="text-2xl font-bold text-[var(--foreground)] mt-5 mb-1">Set your locations</h2>
            <p className="text-sm text-[var(--muted-foreground)] mb-6">Used for commute matching and auto check-in.</p>

            <div className="space-y-3">
              <Field icon={MapPin} label="Home Location" defaultValue="Mission District, SF" />
              <Field icon={MapPin} label="Workplace / Campus" defaultValue={CAMPUS_NAME} accent />
              <Field icon={Clock} label="Typical Arrival" type="time" defaultValue="08:45" />
            </div>

            <div className="nudge-banner mt-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[rgba(16,185,129,0.12)] border border-[rgba(16,185,129,0.25)] flex items-center justify-center flex-shrink-0">
                <Shield size={16} className="text-[var(--accent)]" />
              </div>
              <div>
                <p className="text-xs font-semibold text-[var(--foreground)]">200m geofence radius</p>
                <p className="text-[11px] text-[var(--muted-foreground)]">Auto check-in when you enter campus</p>
              </div>
            </div>

            <motion.button
              className="btn-primary w-full mt-5"
              onClick={() => setStep("tags")}
              whileTap={{ scale: 0.97 }}
            >
              Continue <ArrowRight size={15} />
            </motion.button>
          </motion.div>
        )}

        {/* ── Tags ── */}
        {step === "tags" && (
          <motion.div key="tags" initial={{ opacity: 0, x: 28 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -28 }} transition={slideTransition} className="w-full max-w-sm">
            <Logo />
            <StepBar current={2} />
            <h2 className="text-2xl font-bold text-[var(--foreground)] mt-5 mb-1">Your interests</h2>
            <p className="text-sm text-[var(--muted-foreground)] mb-5">Help colleagues find you — pick up to 6.</p>

            <div className="flex flex-wrap gap-2 mb-4">
              {ALL_TAGS.map((tag, i) => (
                <motion.button
                  key={tag}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.022, duration: 0.18 }}
                  className={`tag-pill ${selectedTags.includes(tag) ? "selected" : ""}`}
                  onClick={() => toggleTag(tag)}
                >
                  {selectedTags.includes(tag) && <Check size={10} />}
                  {tag}
                </motion.button>
              ))}
            </div>

            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 match-bar-track">
                <motion.div
                  className="match-bar-fill"
                  animate={{ width: `${(selectedTags.length / 6) * 100}%` }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              </div>
              <span className="text-xs mono text-[var(--muted-foreground)]">{selectedTags.length}/6</span>
            </div>

            <motion.button
              className={`btn-primary w-full ${selectedTags.length === 0 ? "opacity-40 cursor-not-allowed" : ""}`}
              onClick={() => void onComplete({ email, method: isLogin ? "password" : "magic_link" })}
              disabled={selectedTags.length === 0}
              whileTap={{ scale: 0.97 }}
            >
              <Sparkles size={15} /> Launch GeoSync
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StepBar({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-2 mt-5">
      {[1, 2].map((s) => (
        <div
          key={s}
          className={`h-1 rounded-full transition-all duration-300 ${s <= current ? "bg-[var(--primary)] flex-[2]" : "bg-[var(--border)] flex-1"}`}
        />
      ))}
      <span className="text-[11px] mono text-[var(--muted-foreground)] ml-1">{current}/2</span>
    </div>
  );
}

function Field({ icon: Icon, label, defaultValue, type = "text", accent }: {
  icon: React.ElementType; label: string; defaultValue?: string; type?: string; accent?: boolean;
}) {
  return (
    <div>
      <label className="text-[10px] mono text-[var(--muted-foreground)] uppercase tracking-wider block mb-1.5">{label}</label>
      <div className="relative">
        <Icon size={14} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${accent ? "text-[var(--primary)]" : "text-[var(--muted-foreground)]"}`} />
        <input className="input-field pl-9" type={type} defaultValue={defaultValue} />
      </div>
    </div>
  );
}

export function Logo({ large }: { large?: boolean }) {
  return (
    <div className={`flex items-center gap-2.5 ${large ? "justify-center" : ""}`}>
      <div className={`${large ? "w-11 h-11" : "w-8 h-8"} rounded-xl bg-gradient-to-br from-[#16A34A] to-[#EAB308] flex items-center justify-center shadow-lg shadow-green-600/20`}>
        <svg viewBox="0 0 24 24" fill="none" className={`${large ? "w-5 h-5" : "w-4 h-4"} text-white`}>
          <circle cx="12" cy="12" r="3" fill="currentColor" />
          <path d="M12 2a10 10 0 100 20A10 10 0 0012 2zm0 17a7 7 0 100-14 7 7 0 000 14z" fill="currentColor" opacity="0.22" />
          <path d="M12 5.5v1.5M12 17v1.5M5.5 12H7M17 12h1.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      </div>
      <span className={`font-extrabold tracking-tight text-[var(--foreground)] ${large ? "text-2xl" : "text-lg"}`}>
        Geo<span className="text-[var(--primary)]">Sync</span>
      </span>
    </div>
  );
}
