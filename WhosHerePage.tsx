import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Coffee, Hand, UserCheck, Sparkles, Building2, Flame } from "lucide-react";
import Avatar from "../components/Avatar";
import { PRESENT_USERS, CURRENT_USER, INTENT_CONFIG, ACTIVITIES, type User } from "../data/mockData";
import type { ToastMessage } from "../components/Toast";

interface Props {
  checkedIn: boolean;
  addToast: (t: Omit<ToastMessage, "id">) => void;
}

type FilterKey = "All" | "My Company" | "Open to Coffee" | "Skills/Tags";
type PageView = "people" | "activities";

const COMPANY_FILTERS: FilterKey[] = ["All", "My Company", "Open to Coffee", "Skills/Tags"];

const stagger = { animate: { transition: { staggerChildren: 0.065 } } };
const cardAnim = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.24 } },
};

export default function WhosHerePage({ checkedIn, addToast }: Props) {
  const [view, setView] = useState<PageView>("people");
  const [filter, setFilter] = useState<FilterKey>("All");
  const [tagFilter, setTagFilter] = useState("All");
  const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());
  const [joinedActivities, setJoinedActivities] = useState<Set<string>>(new Set());

  const onlineUsers = PRESENT_USERS.filter((u) => u.checkedIn);
  const allTags = Array.from(new Set(onlineUsers.flatMap((u) => u.tags))).slice(0, 8);

  const filtered = onlineUsers.filter((u) => {
    if (filter === "My Company") return u.company === CURRENT_USER.company;
    if (filter === "Open to Coffee") return u.intentBadge.type === "coffee";
    if (filter === "Skills/Tags" && tagFilter !== "All") return u.tags.includes(tagFilter);
    return true;
  });

  const shared = (u: User) => u.tags.filter((t) => CURRENT_USER.tags.includes(t));

  const handleRequest = (user: User, type: "coffee" | "hi") => {
    setSentRequests((prev) => new Set(prev).add(user.id));
    addToast({
      type: "request",
      title: type === "coffee" ? `Chai chat with ${user.name.split(" ")[0]} ☕` : `Waved to ${user.name.split(" ")[0]}!`,
      body: type === "coffee"
        ? `${user.name.split(" ")[0]} will get your request shortly.`
        : `${user.name.split(" ")[0]} can see you're nearby.`,
    });
  };

  const handleJoin = (activity: typeof ACTIVITIES[0]) => {
    setJoinedActivities((prev) => {
      const next = new Set(prev);
      if (next.has(activity.id)) {
        next.delete(activity.id);
        addToast({ type: "info", title: `Left ${activity.label}`, body: "You're no longer listed for this activity." });
      } else {
        next.add(activity.id);
        addToast({ type: "request", title: `Joined ${activity.label} ${activity.emoji}`, body: "Others with this interest can see you're in!" });
      }
      return next;
    });
  };

  const activityMemberCount = (tag: string) =>
    PRESENT_USERS.filter((u) => u.checkedIn && u.tags.includes(tag)).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-4 pb-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-extrabold text-[var(--foreground)]">Who's Here Now</h2>
          <p className="text-xs text-[var(--muted-foreground)]">
            {onlineUsers.length + (checkedIn ? 1 : 0)} people on campus right now
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[rgba(16,185,129,0.08)] border border-[rgba(16,185,129,0.2)] rounded-xl">
          <motion.div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]"
            animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 2 }} />
          <span className="text-[10px] mono font-bold text-[var(--accent)]">LIVE</span>
        </div>
      </div>

      {/* View toggle: People / Activities */}
      <div className="flex gap-px border-b border-[var(--border)]">
        {([
          { id: "people" as PageView, label: "People" },
          { id: "activities" as PageView, label: "Connect on Activities" },
        ]).map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setView(id)}
            className={`tab-btn flex-1 text-sm font-semibold ${view === id ? "active" : ""}`}
          >
            {id === "activities" && <Flame size={13} />}
            {label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* ── People view ── */}
        {view === "people" && (
          <motion.div key="people" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }} className="flex flex-col gap-4">

            {/* My presence card */}
            <AnimatePresence>
              {checkedIn && (
                <motion.div
                  key="me"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="card p-3 flex items-center gap-3 border-[var(--primary)] overflow-hidden"
                  style={{ borderColor: "rgba(22,163,74,0.3)" }}
                >
                  <Avatar initials={CURRENT_USER.avatar} gradientClass={CURRENT_USER.avatarColor} size="md" online />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-[var(--foreground)] flex items-center gap-1.5">
                      {CURRENT_USER.name}
                      <span className="badge badge-indigo">YOU</span>
                    </p>
                    <p className="text-xs text-[var(--muted-foreground)] truncate">{CURRENT_USER.role} · {CURRENT_USER.department}</p>
                  </div>
                  <div className="flex flex-wrap gap-1 justify-end max-w-[100px]">
                    {CURRENT_USER.tags.slice(0, 2).map((t) => (
                      <span key={t} className="tag-pill selected text-[10px]">{t}</span>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Primary filter bar */}
            <div className="flex gap-1.5 overflow-x-auto pb-0.5" style={{ scrollbarWidth: "none" }}>
              {COMPANY_FILTERS.map((f) => (
                <motion.button
                  key={f}
                  whileTap={{ scale: 0.93 }}
                  onClick={() => setFilter(f)}
                  className={`tag-pill flex-shrink-0 text-xs ${filter === f ? "selected" : ""}`}
                >
                  {f === "My Company" && <Building2 size={10} />}
                  {f === "Open to Coffee" && <Coffee size={10} />}
                  {f}
                </motion.button>
              ))}
            </div>

            {/* Tag sub-filter */}
            <AnimatePresence>
              {filter === "Skills/Tags" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex gap-1.5 overflow-x-auto pb-0.5" style={{ scrollbarWidth: "none" }}>
                    {["All", ...allTags].map((t) => (
                      <motion.button key={t} whileTap={{ scale: 0.92 }}
                        onClick={() => setTagFilter(t)}
                        className={`tag-pill flex-shrink-0 text-[10px] ${tagFilter === t ? "selected" : ""}`}>
                        {t}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* User grid */}
            <AnimatePresence mode="wait">
              {filtered.length === 0 ? (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="card p-10 text-center">
                    <motion.div
                      className="w-12 h-12 rounded-2xl bg-[rgba(22,163,74,0.08)] border border-[rgba(22,163,74,0.18)] flex items-center justify-center mx-auto mb-4"
                      animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 3 }}
                    >
                      <Sparkles size={20} className="text-[var(--primary)]" />
                    </motion.div>
                    <p className="text-sm font-semibold text-[var(--foreground)] mb-1">No one matches this filter</p>
                    <p className="text-xs text-[var(--muted-foreground)]">Try a different filter or check back later.</p>
                  </div>
                </motion.div>
              ) : (
                <motion.div key={`${filter}-${tagFilter}`} variants={stagger} initial="initial" animate="animate" className="space-y-2">
                  {filtered.map((user) => {
                    const sharedTags = shared(user);
                    const hasSent = sentRequests.has(user.id);
                    const intent = INTENT_CONFIG[user.intentBadge.type];

                    return (
                      <motion.div key={user.id} variants={cardAnim} className="profile-card">
                        <div className="flex items-start gap-3">
                          <Avatar initials={user.avatar} gradientClass={user.avatarColor} size="md" online={user.checkedIn} />

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="text-sm font-bold text-[var(--foreground)] truncate">{user.name}</p>
                                <p className="text-xs text-[var(--muted-foreground)] truncate">{user.role}</p>
                                <p className="text-[10px] text-[var(--muted-foreground)] truncate flex items-center gap-1 mt-0.5">
                                  <Building2 size={9} /> {user.company} · {user.department}
                                </p>
                              </div>
                              <span className="text-[10px] mono text-[var(--muted-foreground)] flex-shrink-0 mt-0.5">
                                {user.checkInTime}
                              </span>
                            </div>

                            {/* Intent badge */}
                            <div className={`inline-flex items-center gap-1.5 mt-2 px-2 py-1 rounded-lg text-[11px] font-medium border ${intent.className}`}>
                              <span>{intent.emoji}</span>
                              <span>{user.intentBadge.label}</span>
                            </div>

                            {/* Skill tags */}
                            <div className="flex flex-wrap gap-1 mt-2">
                              {user.tags.map((t) => (
                                <span key={t} className={`tag-pill text-[10px] ${sharedTags.includes(t) ? "selected" : ""}`}>
                                  {t}
                                </span>
                              ))}
                            </div>

                            {sharedTags.length > 0 && (
                              <div className="flex items-center gap-1 mt-1.5">
                                <Sparkles size={10} className="text-[var(--primary)]" />
                                <span className="text-[10px] text-[var(--primary)] font-medium">
                                  {sharedTags.length} shared interest{sharedTags.length > 1 ? "s" : ""}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="mt-3 pt-3 border-t border-[var(--border)] flex gap-2">
                          {checkedIn ? (
                            hasSent ? (
                              <div className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs text-[var(--accent)] bg-[rgba(16,185,129,0.08)] border border-[rgba(16,185,129,0.2)] rounded-xl font-semibold">
                                <UserCheck size={13} /> Request sent
                              </div>
                            ) : (
                              <>
                                <motion.button
                                  whileTap={{ scale: 0.95 }}
                                  className="flex-1 btn-ghost text-xs py-2"
                                  onClick={() => handleRequest(user, "coffee")}
                                >
                                  <Coffee size={12} /> Send Chai Chat
                                </motion.button>
                                <motion.button
                                  whileTap={{ scale: 0.95 }}
                                  className="btn-ghost text-xs py-2 px-4"
                                  onClick={() => handleRequest(user, "hi")}
                                >
                                  <Hand size={12} /> Say Hi
                                </motion.button>
                              </>
                            )
                          ) : (
                            <p className="flex-1 text-xs text-[var(--muted-foreground)] text-center py-1">
                              Check in to connect with {user.name.split(" ")[0]}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ── Activities view ── */}
        {view === "activities" && (
          <motion.div key="activities" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }} className="flex flex-col gap-3">

            <div className="card p-3 flex items-start gap-2.5">
              <Flame size={14} className="text-[var(--primary)] mt-0.5 flex-shrink-0" />
              <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                Join activities to let colleagues with the same interest know you're around. Toggle on to appear in their matches.
              </p>
            </div>

            <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-2">
              {ACTIVITIES.map((activity) => {
                const joined = joinedActivities.has(activity.id);
                const membersOnCampus = activityMemberCount(activity.tag);
                const sharedActivity = CURRENT_USER.tags.includes(activity.tag);

                return (
                  <motion.div key={activity.id} variants={cardAnim}>
                    <div className={`profile-card transition-all ${joined ? "border-[rgba(22,163,74,0.3)]" : ""}`}
                      style={joined ? { borderColor: "rgba(22,163,74,0.25)", background: "rgba(22,163,74,0.03)" } : {}}>
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 transition-all ${
                          joined
                            ? "bg-[rgba(22,163,74,0.12)] border border-[rgba(22,163,74,0.25)]"
                            : "bg-[var(--muted)] border border-[var(--border)]"
                        }`}>
                          {activity.emoji}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <p className="text-sm font-bold text-[var(--foreground)]">{activity.label}</p>
                            {sharedActivity && !joined && (
                              <span className="badge badge-amber text-[9px]">YOUR INTEREST</span>
                            )}
                            {joined && (
                              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="badge badge-green text-[9px]">
                                JOINED
                              </motion.span>
                            )}
                          </div>
                          <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{activity.desc}</p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-[10px] mono text-[var(--muted-foreground)]">{activity.tag}</span>
                            {membersOnCampus > 0 && (
                              <span className="text-[10px] mono text-[var(--accent)] flex items-center gap-1">
                                · {membersOnCampus} on campus now
                              </span>
                            )}
                          </div>
                        </div>
                        <motion.button
                          whileTap={{ scale: 0.93 }}
                          onClick={() => handleJoin(activity)}
                          className={`flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all ${
                            joined
                              ? "bg-[rgba(22,163,74,0.1)] border-[rgba(22,163,74,0.3)] text-[var(--primary)]"
                              : "border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--foreground)] hover:text-[var(--foreground)]"
                          }`}
                        >
                          {joined ? "Leave" : "Join"}
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
