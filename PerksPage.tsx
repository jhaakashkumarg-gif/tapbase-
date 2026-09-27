import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Unlock, Coffee, UtensilsCrossed, Lightbulb, Bike, Leaf, Sparkles, Timer, MapPin, Tag, Gift } from "lucide-react";
import { PERKS } from "../data/mockData";
import type { ToastMessage } from "../components/Toast";

interface Props {
  checkedIn: boolean;
  addToast: (t: Omit<ToastMessage, "id">) => void;
}

const CATEGORIES = ["All", "Coffee", "Food", "Workspace", "Transport", "Wellness"];
const CAT_ICONS: Record<string, React.ElementType> = {
  All: Sparkles, Coffee, Food: UtensilsCrossed, Workspace: Lightbulb, Transport: Bike, Wellness: Leaf,
};

const stagger = { animate: { transition: { staggerChildren: 0.07 } } };
const cardAnim = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.26 } },
};

export default function PerksPage({ checkedIn, addToast }: Props) {
  const [category, setCategory] = useState("All");
  const [revealed, setRevealed] = useState<Set<string>>(new Set());

  const filtered = category === "All" ? PERKS : PERKS.filter((p) => p.category === category);

  const handleReveal = (perkId: string, perkName: string) => {
    if (!checkedIn) {
      addToast({ type: "geofence", title: "Check in required", body: "You must be on campus to unlock perks." });
      return;
    }
    setRevealed((prev) => new Set(prev).add(perkId));
    addToast({ type: "checkin", title: "Perk unlocked! ✓", body: `Your ${perkName} code is ready. Show at the counter.` });
  };

  const unlockedCount = checkedIn ? PERKS.filter((p) => p.requiresCheckIn).length : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-4 pb-6"
    >
      {/* Header */}
      <div>
        <h2 className="text-base font-extrabold text-[var(--foreground)]">Perks Wallet</h2>
        <p className="text-xs text-[var(--muted-foreground)]">Campus rewards and partner offers</p>
      </div>

      {/* Status banner */}
      <AnimatePresence mode="wait">
        {checkedIn ? (
          <motion.div key="on" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="nudge-banner flex items-center gap-3"
          >
            <div className="w-9 h-9 rounded-xl bg-[rgba(16,185,129,0.15)] border border-[rgba(16,185,129,0.25)] flex items-center justify-center flex-shrink-0">
              <Gift size={16} className="text-[var(--accent)]" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-[var(--foreground)]">
                Perks Unlocked: You are currently on-site.
              </p>
              <p className="text-[11px] text-[var(--muted-foreground)]">
                {unlockedCount} check-in perks available · Tap to reveal codes
              </p>
            </div>
            <motion.span
              className="badge badge-green flex-shrink-0"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              LIVE
            </motion.span>
          </motion.div>
        ) : (
          <motion.div key="off" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="card p-3.5 flex items-center gap-3 border-[rgba(22,163,74,0.2)]"
          >
            <div className="w-9 h-9 rounded-xl bg-[rgba(22,163,74,0.08)] border border-[rgba(22,163,74,0.18)] flex items-center justify-center flex-shrink-0">
              <Lock size={16} className="text-[var(--primary)]" />
            </div>
            <div>
              <p className="text-xs font-semibold text-[var(--foreground)]">Perks locked — check in to unlock</p>
              <p className="text-[11px] text-[var(--muted-foreground)]">Some perks are available without check-in.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category filter */}
      <div className="flex gap-1.5 overflow-x-auto pb-0.5" style={{ scrollbarWidth: "none" }}>
        {CATEGORIES.map((cat) => {
          const Icon = CAT_ICONS[cat];
          return (
            <motion.button
              key={cat}
              whileTap={{ scale: 0.92 }}
              onClick={() => setCategory(cat)}
              className={`tag-pill flex-shrink-0 flex items-center gap-1.5 text-xs ${category === cat ? "selected" : ""}`}
            >
              <Icon size={10} />
              {cat}
            </motion.button>
          );
        })}
      </div>

      {/* Perk cards */}
      <AnimatePresence mode="wait">
        <motion.div key={category} variants={stagger} initial="initial" animate="animate" className="space-y-3">
          {filtered.map((perk) => {
            const isRevealed = revealed.has(perk.id);
            const isLocked = perk.requiresCheckIn && !checkedIn;
            const CatIcon = CAT_ICONS[perk.category] ?? Sparkles;

            return (
              <motion.div
                key={perk.id}
                variants={cardAnim}
                className={`perk-card ${isLocked ? "locked" : "active"}`}
              >
                {/* Image */}
                <div className="relative h-40 bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <img
                    src={perk.image}
                    alt={perk.name}
                    className={`w-full h-full object-cover transition-all duration-300 ${isLocked ? "" : ""}`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--card)] via-transparent to-transparent" />

                  {/* Discount badge */}
                  <div className="absolute top-3 left-3">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold mono bg-[rgba(16,185,129,0.85)] text-white backdrop-blur-sm shadow">
                      <Tag size={9} /> {perk.discount}
                    </span>
                  </div>

                  {/* Category badge */}
                  <div className="absolute top-3 right-3">
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] mono bg-black/50 text-white/80 backdrop-blur-sm border border-white/10">
                      <CatIcon size={9} /> {perk.category}
                    </span>
                  </div>

                  {/* Locked overlay */}
                  {isLocked && (
                    <div className="absolute inset-0 bg-[var(--background)]/60 backdrop-blur-[3px] flex flex-col items-center justify-center gap-2">
                      <div className="w-12 h-12 rounded-full bg-white/90 dark:bg-black/70 border border-[var(--border)] flex items-center justify-center shadow-md">
                        <Lock size={20} className="text-[var(--muted-foreground)]" />
                      </div>
                      <span className="text-xs font-semibold text-[var(--foreground)] bg-white/90 dark:bg-black/70 px-3 py-1 rounded-full border border-[var(--border)]">
                        Check in to unlock
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <h3 className="text-sm font-extrabold text-[var(--foreground)]">{perk.name}</h3>
                    {perk.requiresCheckIn && (
                      <span className="badge badge-indigo flex-shrink-0">CHECK-IN</span>
                    )}
                  </div>

                  <p className="text-xs text-[var(--muted-foreground)] leading-relaxed mb-2">{perk.description}</p>

                  <div className="flex items-center gap-3 text-[10px] mono text-[var(--muted-foreground)]">
                    <span className="flex items-center gap-1"><MapPin size={9} /> {perk.location}</span>
                    {perk.expiresAt && (
                      <span className="flex items-center gap-1 text-amber-500">
                        <Timer size={9} /> {perk.expiresAt}
                      </span>
                    )}
                  </div>

                  <div className="mt-3">
                    <AnimatePresence mode="wait">
                      {isRevealed ? (
                        <motion.div
                          key="code"
                          initial={{ opacity: 0, scale: 0.95, y: 6 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          className="bg-[rgba(16,185,129,0.06)] border border-[rgba(16,185,129,0.2)] rounded-xl p-4 text-center"
                        >
                          <p className="text-[9px] mono text-[var(--muted-foreground)] uppercase tracking-widest mb-2">Redemption Code</p>
                          <p className="text-xl font-extrabold mono text-[var(--accent)] tracking-[0.22em]">{perk.redemptionCode}</p>
                          <p className="text-[10px] text-[var(--muted-foreground)] mt-2">
                            Show this code at <span className="font-semibold">{perk.name}</span>
                          </p>
                          <div className="mt-2 flex items-center justify-center gap-1">
                            <Unlock size={10} className="text-[var(--accent)]" />
                            <span className="text-[10px] text-[var(--accent)] font-semibold">Redeemable until {perk.expiresAt ?? "end of day"}</span>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.button
                          key="unlock"
                          whileTap={{ scale: isLocked ? 1 : 0.97 }}
                          className={`w-full py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                            isLocked
                              ? "bg-[var(--muted)] text-[var(--muted-foreground)] cursor-not-allowed border border-[var(--border)]"
                              : "btn-accent"
                          }`}
                          onClick={() => handleReveal(perk.id, perk.name)}
                          disabled={isLocked}
                        >
                          {isLocked ? (
                            <><Lock size={14} /> Check in to unlock</>
                          ) : (
                            <><Unlock size={14} /> Unlock Perk</>
                          )}
                        </motion.button>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
