import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Car, UserCheck, Navigation, Clock, MapPin, Users, ArrowRight, Search, ChevronDown, X } from "lucide-react";
import Avatar from "../components/Avatar";
import { RIDE_MATCHES, NCR_LOCATIONS, CAMPUS_NAME, CURRENT_USER } from "../data/mockData";
import type { ToastMessage } from "../components/Toast";

interface Props {
  addToast: (t: Omit<ToastMessage, "id">) => void;
}

type Tab = "find" | "offer";

const stagger = { animate: { transition: { staggerChildren: 0.07 } } };
const cardAnim = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.24 } },
};

function LocationInput({
  label, icon: Icon, value, onChange, placeholder, suggestions,
}: {
  label: string;
  icon: React.ElementType;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  suggestions: string[];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const filtered = suggestions.filter(
    (s) => s.toLowerCase().includes(value.toLowerCase()) && s !== value
  );

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <label className="text-[10px] mono text-[var(--muted-foreground)] uppercase block mb-1.5 flex items-center gap-1">
        <Icon size={9} /> {label}
      </label>
      <div className="relative">
        <input
          className="input-field text-sm py-2.5 pr-8 w-full"
          value={value}
          placeholder={placeholder}
          onChange={(e) => { onChange(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
        />
        {value ? (
          <button
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            onClick={() => { onChange(""); setOpen(false); }}
          >
            <X size={12} />
          </button>
        ) : (
          <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] pointer-events-none" />
        )}
      </div>
      <AnimatePresence>
        {open && filtered.length > 0 && (
          <motion.ul
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.14 }}
            className="absolute z-20 w-full mt-1 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-lg overflow-hidden max-h-44 overflow-y-auto"
            style={{ scrollbarWidth: "none" }}
          >
            {filtered.map((loc) => (
              <li key={loc}>
                <button
                  className="w-full text-left px-3 py-2 text-xs text-[var(--foreground)] hover:bg-[rgba(22,163,74,0.06)] flex items-center gap-2 transition-colors"
                  onMouseDown={(e) => { e.preventDefault(); onChange(loc); setOpen(false); }}
                >
                  <MapPin size={9} className="text-[var(--muted-foreground)] flex-shrink-0" />
                  {loc}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function RidePoolPage({ addToast }: Props) {
  const [tab, setTab] = useState<Tab>("find");
  const [myRole, setMyRole] = useState<"passenger" | "driver" | null>(null);
  const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());
  const [seats, setSeats] = useState(2);
  const [departure, setDeparture] = useState("08:45");
  const [listed, setListed] = useState(false);
  const [fromLocation, setFromLocation] = useState(CURRENT_USER.homeLocation.label);
  const [toLocation, setToLocation] = useState(CAMPUS_NAME);

  const handleRequest = (id: string, name: string, role: "driver" | "passenger") => {
    setSentRequests((prev) => new Set(prev).add(id));
    addToast({
      type: "request",
      title: role === "driver" ? "Ride requested 🚗" : "Pool invite sent 🚗",
      body: `${name.split(" ")[0]} will be notified. Departing ~${departure}.`,
    });
  };

  const handleList = () => {
    if (!fromLocation || !toLocation) return;
    setListed(true);
    addToast({
      type: "info",
      title: myRole === "driver" ? "Listed as driver ✓" : "Listed as passenger ✓",
      body: `${fromLocation} → ${toLocation}. You're visible to nearby matches.`,
    });
  };

  const canList = !!myRole && !!fromLocation && !!toLocation;
  const drivers = RIDE_MATCHES.filter((m) => m.role === "driver");
  const passengers = RIDE_MATCHES.filter((m) => m.role === "passenger");

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-4 pb-6"
    >
      {/* Header */}
      <div>
        <h2 className="text-base font-extrabold text-[var(--foreground)]">Commute Matching</h2>
        <p className="text-xs text-[var(--muted-foreground)]">Matched by location, route &amp; schedule</p>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-px border-b border-[var(--border)]">
        {[{ id: "find" as Tab, label: "Find a Ride", icon: Search }, { id: "offer" as Tab, label: "Offer a Ride", icon: Car }].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`tab-btn flex-1 text-sm font-semibold flex items-center justify-center gap-1.5 ${tab === id ? "active" : ""}`}
          >
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {/* ── Find a Ride ── */}
      <AnimatePresence mode="wait">
        {tab === "find" && (
          <motion.div key="find" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }} className="flex flex-col gap-4">

            {/* Route summary */}
            <div className="card p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex flex-col items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-[var(--accent)]" />
                  <div className="w-px h-8 bg-[var(--border)]" />
                  <div className="w-2 h-2 rounded-full bg-[var(--primary)]" />
                </div>
                <div className="flex-1 flex flex-col gap-2">
                  <div className="text-xs font-medium text-[var(--foreground)]">{CURRENT_USER.homeLocation.label}</div>
                  <div className="text-xs font-medium text-[var(--foreground)]">{CAMPUS_NAME}</div>
                </div>
                <div>
                  <label className="text-[10px] mono text-[var(--muted-foreground)] block mb-1">DEPARTURE</label>
                  <input
                    className="input-field text-sm py-2 w-28"
                    type="time"
                    value={departure}
                    onChange={(e) => setDeparture(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex items-center gap-1.5 pt-3 border-t border-[var(--border)]">
                <Users size={12} className="text-[var(--muted-foreground)]" />
                <span className="text-xs text-[var(--muted-foreground)]">
                  {RIDE_MATCHES.length} matches within 15 km radius
                </span>
              </div>
            </div>

            {/* Drivers */}
            {drivers.length > 0 && (
              <Section label={`Drivers (${drivers.length})`}>
                <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-2">
                  {drivers.map((m) => (
                    <motion.div key={m.id} variants={cardAnim}>
                      <RideCard match={m} sent={sentRequests.has(m.id)}
                        onRequest={() => handleRequest(m.id, m.user.name, m.role)} />
                    </motion.div>
                  ))}
                </motion.div>
              </Section>
            )}

            {/* Passengers */}
            {passengers.length > 0 && (
              <Section label={`Co-passengers (${passengers.length})`}>
                <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-2">
                  {passengers.map((m) => (
                    <motion.div key={m.id} variants={cardAnim}>
                      <RideCard match={m} sent={sentRequests.has(m.id)}
                        onRequest={() => handleRequest(m.id, m.user.name, m.role)} />
                    </motion.div>
                  ))}
                </motion.div>
              </Section>
            )}
          </motion.div>
        )}

        {/* ── Offer a Ride ── */}
        {tab === "offer" && (
          <motion.div key="offer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }} className="flex flex-col gap-4">

            <div className="card p-4 flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <Car size={14} className="text-[var(--muted-foreground)]" />
                <span className="text-xs mono text-[var(--muted-foreground)] uppercase tracking-wider">Your commute details</span>
                {listed && (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="badge badge-green ml-auto">
                    ACTIVE
                  </motion.span>
                )}
              </div>

              {/* Route: From → To */}
              <div className="relative flex flex-col gap-3">
                <LocationInput
                  label="From"
                  icon={MapPin}
                  value={fromLocation}
                  onChange={(v) => { setFromLocation(v); setListed(false); }}
                  placeholder="Enter pickup location"
                  suggestions={NCR_LOCATIONS}
                />

                {/* connecting line */}
                <div className="flex items-center gap-2 px-1">
                  <div className="w-px h-4 bg-[var(--border)] ml-1" />
                  <span className="text-[10px] mono text-[var(--muted-foreground)]">via NH-48 / Dwarka Expressway</span>
                </div>

                <LocationInput
                  label="To (Destination)"
                  icon={Navigation}
                  value={toLocation}
                  onChange={(v) => { setToLocation(v); setListed(false); }}
                  placeholder="Enter destination"
                  suggestions={NCR_LOCATIONS}
                />
              </div>

              {/* Departure */}
              <div>
                <label className="text-[10px] mono text-[var(--muted-foreground)] uppercase block mb-1.5 flex items-center gap-1">
                  <Clock size={9} /> Departure Time
                </label>
                <input className="input-field text-sm py-2.5 w-full" type="time" value={departure}
                  onChange={(e) => { setDeparture(e.target.value); setListed(false); }} />
              </div>

              {/* Role */}
              <div>
                <label className="text-[10px] mono text-[var(--muted-foreground)] uppercase block mb-2">I am a…</label>
                <div className="flex gap-2">
                  {(["driver", "passenger"] as const).map((role) => (
                    <motion.button
                      key={role}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => { setMyRole(role); setListed(false); }}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-semibold transition-all ${
                        myRole === role
                          ? "bg-[rgba(22,163,74,0.1)] border-[rgba(22,163,74,0.3)] text-[var(--primary)]"
                          : "border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--foreground)] hover:text-[var(--foreground)]"
                      }`}
                    >
                      {role === "driver" ? <Car size={16} /> : <UserCheck size={16} />}
                      <span className="capitalize">{role}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Seats (driver only) */}
              <AnimatePresence>
                {myRole === "driver" && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                    <label className="text-[10px] mono text-[var(--muted-foreground)] uppercase block mb-2 flex items-center gap-1">
                      <Users size={9} /> Available seats
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4].map((n) => (
                        <motion.button
                          key={n}
                          whileTap={{ scale: 0.92 }}
                          onClick={() => setSeats(n)}
                          className={`w-11 h-11 rounded-xl text-sm font-bold border transition-all ${
                            seats === n
                              ? "bg-[rgba(22,163,74,0.1)] border-[rgba(22,163,74,0.3)] text-[var(--primary)]"
                              : "border-[var(--border)] text-[var(--muted-foreground)]"
                          }`}
                        >
                          {n}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Route preview */}
              <AnimatePresence>
                {fromLocation && toLocation && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="flex items-center gap-2 px-3 py-2.5 bg-[rgba(22,163,74,0.05)] border border-[rgba(22,163,74,0.15)] rounded-xl">
                      <MapPin size={11} className="text-[var(--primary)] flex-shrink-0" />
                      <span className="text-xs text-[var(--foreground)]/80 truncate font-medium">
                        {fromLocation}
                      </span>
                      <ArrowRight size={11} className="text-[var(--muted-foreground)] flex-shrink-0" />
                      <span className="text-xs text-[var(--foreground)]/80 truncate font-medium">
                        {toLocation}
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                className={`btn-primary w-full ${!canList ? "opacity-40 cursor-not-allowed" : ""}`}
                disabled={!canList}
                onClick={handleList}
                whileTap={{ scale: canList ? 0.97 : 1 }}
              >
                {listed ? (
                  <><UserCheck size={15} /> Profile updated</>
                ) : myRole ? (
                  <>List as {myRole} <ArrowRight size={15} /></>
                ) : (
                  "Choose your role above"
                )}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] mono text-[var(--muted-foreground)] uppercase tracking-wider mb-2">{label}</p>
      {children}
    </div>
  );
}

function RideCard({ match, sent, onRequest }: {
  match: typeof RIDE_MATCHES[0]; sent: boolean; onRequest: () => void;
}) {
  const isDriver = match.role === "driver";
  const scoreColor =
    match.matchScore >= 90 ? "text-[var(--accent)]" :
    match.matchScore >= 80 ? "text-[var(--primary)]" : "text-amber-500";

  return (
    <div className="profile-card">
      <div className="flex items-start gap-3">
        <Avatar initials={match.user.avatar} gradientClass={match.user.avatarColor} size="md" online />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-bold text-[var(--foreground)]">{match.user.name}</p>
            <span className={`badge ${isDriver ? "badge-green" : "badge-amber"}`}>
              {isDriver ? "DRIVER" : "PASSENGER"}
            </span>
          </div>
          <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{match.user.role}</p>

          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <span className="text-[11px] mono text-[var(--foreground)]/70 flex items-center gap-1">
              <MapPin size={9} className="text-[var(--muted-foreground)]" />
              {match.neighborhood} · {match.distanceLabel} away
            </span>
          </div>

          <div className="flex items-center gap-3 mt-1">
            <span className="text-[11px] mono text-[var(--foreground)]/70 flex items-center gap-1">
              <Clock size={9} className="text-[var(--muted-foreground)]" /> {match.departure}
            </span>
            {isDriver && match.seats && (
              <span className="text-[11px] mono text-[var(--accent)] flex items-center gap-1">
                <Users size={9} /> {match.seats} seat{match.seats > 1 ? "s" : ""} free
              </span>
            )}
          </div>

          {/* Match score */}
          <div className="mt-2.5 flex items-center gap-2">
            <div className="flex-1 match-bar-track">
              <motion.div
                className="match-bar-fill"
                initial={{ width: 0 }}
                animate={{ width: `${match.matchScore}%` }}
                transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
              />
            </div>
            <span className={`text-[11px] mono font-bold flex-shrink-0 ${scoreColor}`}>
              {match.matchScore}% match
            </span>
          </div>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-[var(--border)]">
        <motion.button
          whileTap={{ scale: 0.96 }}
          className={`w-full text-sm py-2.5 px-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
            sent
              ? "bg-[rgba(16,185,129,0.08)] text-[var(--accent)] border border-[rgba(16,185,129,0.2)] cursor-default"
              : "btn-primary"
          }`}
          onClick={() => !sent && onRequest()}
        >
          {sent ? (
            <><UserCheck size={15} /> Request sent</>
          ) : isDriver ? (
            <><Car size={15} /> Request Ride Share</>
          ) : (
            <><Users size={15} /> Invite to Pool</>
          )}
        </motion.button>
      </div>
    </div>
  );
}
