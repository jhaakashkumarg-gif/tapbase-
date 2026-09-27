export interface User {
  id: string;
  name: string;
  role: string;
  department: string;
  company: string;
  avatar: string;
  avatarColor: string;
  tags: string[];
  checkedIn: boolean;
  checkInTime?: string;
  homeLocation: { label: string };
  commuteTime: string;
  intentBadge: IntentBadge;
}

export type IntentBadge =
  | { type: "coffee"; label: string }
  | { type: "focus"; label: string }
  | { type: "lunch"; label: string }
  | { type: "open"; label: string }
  | { type: "busy"; label: string };

export interface CheckInRecord {
  id: string;
  date: string;
  checkIn: string;
  checkOut: string | null;
  duration: string | null;
  location: string;
}

export interface RideMatch {
  id: string;
  user: User;
  role: "driver" | "passenger";
  departure: string;
  distanceKm: number;
  distanceLabel: string;
  neighborhood: string;
  matchScore: number;
  seats?: number;
  route: string;
}

export interface Perk {
  id: string;
  name: string;
  category: string;
  description: string;
  discount: string;
  image: string;
  location: string;
  requiresCheckIn: boolean;
  expiresAt?: string;
  redemptionCode?: string;
  partnerColor: string;
}

export const CURRENT_USER = {
  id: "u0",
  name: "Arjun Mehta",
  role: "Product Designer",
  department: "Design Systems",
  company: "Acme Corp",
  avatar: "AM",
  avatarColor: "from-violet-500 to-indigo-600",
  tags: ["#Design", "#AI", "#Trekking", "#Dineout"],
  homeLocation: { label: "Sector 14, Gurugram" },
  commuteTime: "08:45",
};

export const CAMPUS_NAME = "Mindspace Tech Park";
export const CAMPUS_ADDRESS = "DLF Phase 2, Gurugram, Haryana";

export const NCR_LOCATIONS = [
  "Sector 14, Gurugram",
  "Sector 29, Gurugram",
  "Sector 50, Gurugram",
  "Sushant Lok, Gurugram",
  "Golf Course Road, Gurugram",
  "DLF Phase 1, Gurugram",
  "DLF Phase 3, Gurugram",
  "South Extension, Delhi",
  "Saket, Delhi",
  "Vasant Kunj, Delhi",
  "Dwarka Sector 10, Delhi",
  "Greater Kailash, Delhi",
  "Lajpat Nagar, Delhi",
  "Noida Sector 62",
  "Noida Sector 18",
  "Faridabad Sector 15",
  "Mindspace Tech Park",
];

export const PRESENT_USERS: User[] = [
  {
    id: "u1",
    name: "Priya Nair",
    role: "ML Engineer",
    department: "AI Research",
    company: "Acme Corp",
    avatar: "PN",
    avatarColor: "from-pink-500 to-rose-500",
    tags: ["#AI", "#Python", "#Bhajan", "#Yoga"],
    checkedIn: true,
    checkInTime: "08:31",
    homeLocation: { label: "South Extension, Delhi" },
    commuteTime: "08:30",
    intentBadge: { type: "coffee", label: "Free for chai at 2 PM" },
  },
  {
    id: "u2",
    name: "Rahul Verma",
    role: "Senior Engineer",
    department: "Platform",
    company: "Vertex Labs",
    avatar: "RV",
    avatarColor: "from-blue-500 to-sky-500",
    tags: ["#Backend", "#Cricket", "#TypeScript"],
    checkedIn: true,
    checkInTime: "09:02",
    homeLocation: { label: "Sushant Lok, Gurugram" },
    commuteTime: "09:00",
    intentBadge: { type: "focus", label: "Focus Mode — do not disturb" },
  },
  {
    id: "u3",
    name: "Sneha Kapoor",
    role: "Product Manager",
    department: "Growth",
    company: "Acme Corp",
    avatar: "SK",
    avatarColor: "from-amber-500 to-orange-500",
    tags: ["#Product", "#AI", "#Dineout", "#StartupEvents"],
    checkedIn: true,
    checkInTime: "08:55",
    homeLocation: { label: "Sector 50, Gurugram" },
    commuteTime: "08:50",
    intentBadge: { type: "open", label: "Open to connect" },
  },
  {
    id: "u4",
    name: "Karan Malhotra",
    role: "Data Scientist",
    department: "Analytics",
    company: "Vertex Labs",
    avatar: "KM",
    avatarColor: "from-emerald-500 to-teal-500",
    tags: ["#Python", "#Data", "#Trekking", "#Photography"],
    checkedIn: true,
    checkInTime: "08:20",
    homeLocation: { label: "Noida Sector 62" },
    commuteTime: "08:15",
    intentBadge: { type: "lunch", label: "Looking for lunch crew at 1 PM" },
  },
  {
    id: "u5",
    name: "Ananya Singh",
    role: "DevRel Engineer",
    department: "Developer Experience",
    company: "Acme Corp",
    avatar: "AS",
    avatarColor: "from-purple-500 to-violet-500",
    tags: ["#Community", "#TypeScript", "#Badminton", "#BookClub"],
    checkedIn: true,
    checkInTime: "09:18",
    homeLocation: { label: "Golf Course Road, Gurugram" },
    commuteTime: "09:15",
    intentBadge: { type: "coffee", label: "Grabbing chai now — join?" },
  },
  {
    id: "u6",
    name: "Vikram Sharma",
    role: "UX Researcher",
    department: "Design Systems",
    company: "Acme Corp",
    avatar: "VS",
    avatarColor: "from-cyan-500 to-sky-500",
    tags: ["#Design", "#Research", "#Cycling", "#Running"],
    checkedIn: true,
    checkInTime: "08:48",
    homeLocation: { label: "Dwarka Sector 10, Delhi" },
    commuteTime: "08:45",
    intentBadge: { type: "busy", label: "In meetings until 3 PM" },
  },
  {
    id: "u7",
    name: "Pooja Iyer",
    role: "Security Engineer",
    department: "Infrastructure",
    company: "Vertex Labs",
    avatar: "PI",
    avatarColor: "from-red-500 to-rose-500",
    tags: ["#Security", "#Backend", "#BoardGames", "#Bhajan"],
    checkedIn: false,
    homeLocation: { label: "Vasant Kunj, Delhi" },
    commuteTime: "10:00",
    intentBadge: { type: "open", label: "Open to connect" },
  },
];

export const CHECK_IN_HISTORY: CheckInRecord[] = [
  { id: "c1", date: "Today", checkIn: "08:47", checkOut: null, duration: null, location: "Mindspace Tech Park · Tower B" },
  { id: "c2", date: "Wed, Sep 10", checkIn: "09:02", checkOut: "18:24", duration: "9h 22m", location: "Mindspace Tech Park · Tower B" },
  { id: "c3", date: "Tue, Sep 9", checkIn: "08:55", checkOut: "17:41", duration: "8h 46m", location: "Mindspace Tech Park · Tower A" },
  { id: "c4", date: "Mon, Sep 8", checkIn: "08:38", checkOut: "18:05", duration: "9h 27m", location: "Mindspace Tech Park · Tower B" },
  { id: "c5", date: "Fri, Sep 5", checkIn: "09:15", checkOut: "16:30", duration: "7h 15m", location: "Mindspace Tech Park · Tower A" },
];

export const RIDE_MATCHES: RideMatch[] = [
  {
    id: "r1",
    user: PRESENT_USERS[0],
    role: "passenger",
    departure: "08:30 AM",
    distanceKm: 0.8,
    distanceLabel: "0.8 km",
    neighborhood: "South Extension",
    matchScore: 97,
    route: "South Ext → Mindspace Tech Park",
  },
  {
    id: "r2",
    user: PRESENT_USERS[2],
    role: "passenger",
    departure: "08:50 AM",
    distanceKm: 1.2,
    distanceLabel: "1.2 km",
    neighborhood: "Sector 50",
    matchScore: 94,
    route: "Sector 50 → Mindspace Tech Park",
  },
  {
    id: "r3",
    user: PRESENT_USERS[5],
    role: "driver",
    departure: "08:45 AM",
    distanceKm: 2.4,
    distanceLabel: "2.4 km",
    neighborhood: "Dwarka",
    matchScore: 91,
    seats: 2,
    route: "Dwarka Sector 10 → Mindspace Tech Park",
  },
  {
    id: "r4",
    user: PRESENT_USERS[3],
    role: "driver",
    departure: "08:15 AM",
    distanceKm: 14.5,
    distanceLabel: "14.5 km",
    neighborhood: "Noida Sec 62",
    matchScore: 82,
    seats: 3,
    route: "Noida Sector 62 → Mindspace Tech Park",
  },
];

export const PERKS: Perk[] = [
  {
    id: "p1",
    name: "Chai Point",
    category: "Beverages",
    description: "Free size upgrade on any chai or coffee + 20% off snacks for campus members",
    discount: "FREE UPGRADE",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=480&h=220&fit=crop&auto=format",
    location: "Campus Lobby · Ground Floor",
    requiresCheckIn: true,
    expiresAt: "Today, 6:00 PM",
    redemptionCode: "GSYNC-CHAI",
    partnerColor: "#78350F",
  },
  {
    id: "p2",
    name: "Haldiram's Express",
    category: "Food",
    description: "Thali combo at ₹99 for checked-in campus guests — includes dal, sabzi & roti",
    discount: "₹99 THALI",
    image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=480&h=220&fit=crop&auto=format",
    location: "Campus Food Court · Level 1",
    requiresCheckIn: true,
    expiresAt: "Today, 3:00 PM",
    redemptionCode: "GSYNC-HAL99",
    partnerColor: "#14532D",
  },
  {
    id: "p3",
    name: "Focus Pod Booking",
    category: "Workspace",
    description: "Priority booking for quiet focus pods — 2-hour session, same-day only",
    discount: "PRIORITY",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=480&h=220&fit=crop&auto=format",
    location: "Tower B · Floor 4",
    requiresCheckIn: false,
    redemptionCode: "GSYNC-POD",
    partnerColor: "#1E3A5F",
  },
  {
    id: "p4",
    name: "Yulu E-Bike",
    category: "Transport",
    description: "Unlimited 30-min Yulu e-bike rides within the campus & CyberHub zone",
    discount: "FREE ALL DAY",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=480&h=220&fit=crop&auto=format",
    location: "Campus Gate 1 & Gate 3",
    requiresCheckIn: true,
    expiresAt: "Today, 9:00 PM",
    redemptionCode: "GSYNC-YULU",
    partnerColor: "#052E16",
  },
  {
    id: "p5",
    name: "Cult.fit Studio",
    category: "Wellness",
    description: "Free yoga or HIIT class — 12pm or 6pm slots at CyberHub Cult.fit",
    discount: "FREE CLASS",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=480&h=220&fit=crop&auto=format",
    location: "CyberHub · Level 2",
    requiresCheckIn: false,
    redemptionCode: "GSYNC-CULT",
    partnerColor: "#3B0764",
  },
  {
    id: "p6",
    name: "Campus Canteen",
    category: "Food",
    description: "Chef's special today — 50% off with active campus check-in",
    discount: "50% OFF",
    image: "https://images.unsplash.com/photo-1567521464027-f127ff144326?w=480&h=220&fit=crop&auto=format",
    location: "Campus Centre · Ground Floor",
    requiresCheckIn: true,
    expiresAt: "Today, 2:30 PM",
    redemptionCode: "GSYNC-LUNCH",
    partnerColor: "#431407",
  },
];

export const ALL_TAGS = [
  // Professional
  "#AI", "#Design", "#Backend", "#Frontend", "#Product",
  "#Data", "#Security", "#DevRel", "#TypeScript", "#Python",
  "#Rust", "#Cloud", "#Infra", "#Mobile", "#Research",
  // Lifestyle & Wellness
  "#Yoga", "#Running", "#Cycling", "#Badminton", "#Cricket",
  // Culture & Social
  "#Bhajan", "#Trekking", "#Photography", "#BookClub", "#BoardGames",
  "#Dineout", "#StartupEvents", "#Community", "#Marketing",
];

export const ACTIVITIES = [
  { id: "a1", emoji: "🙏", label: "Bhajan & Kirtan", tag: "#Bhajan", desc: "Weekly devotional music circle" },
  { id: "a2", emoji: "🏔️", label: "Weekend Trekking", tag: "#Trekking", desc: "Trails in Aravalli & Himalayas" },
  { id: "a3", emoji: "🍽️", label: "Dineout Events", tag: "#Dineout", desc: "New restaurant explorations via Dineout" },
  { id: "a4", emoji: "🏸", label: "Badminton Crew", tag: "#Badminton", desc: "Morning & evening court sessions" },
  { id: "a5", emoji: "🏏", label: "Cricket Sundays", tag: "#Cricket", desc: "Weekend matches at the ground" },
  { id: "a6", emoji: "📸", label: "Photography Walks", tag: "#Photography", desc: "Explore Delhi's streets & monuments" },
  { id: "a7", emoji: "📚", label: "Book Club", tag: "#BookClub", desc: "Monthly meets, all genres welcome" },
  { id: "a8", emoji: "♟️", label: "Board Games Night", tag: "#BoardGames", desc: "Catan, Codenames, Wingspan & more" },
  { id: "a9", emoji: "🧘", label: "Yoga Sessions", tag: "#Yoga", desc: "Sunrise yoga on campus terrace" },
  { id: "a10", emoji: "🚀", label: "Startup Events", tag: "#StartupEvents", desc: "Pitch nights, talks & hackathons" },
  { id: "a11", emoji: "🚴", label: "Cycling Club", tag: "#Cycling", desc: "Early morning rides around DLF" },
  { id: "a12", emoji: "🏃", label: "Running Group", tag: "#Running", desc: "5K & 10K runs in Leisure Valley" },
];

export interface GeoReminder {
  id: string;
  emoji: string;
  title: string;
  subtitle?: string;
  zone: "work" | "home" | "leaving-work" | "market";
  triggerType: "arrive" | "leave";
  locationLabel: string;
  enabled: boolean;
  urgency: "normal" | "high";
}

export const GEO_REMINDERS: GeoReminder[] = [
  /* ── On arriving at work ── */
  { id: "gr1", emoji: "📋", title: "Check today's stand-up notes", subtitle: "Confluence & Jira board", zone: "work", triggerType: "arrive", locationLabel: "Mindspace Tech Park", enabled: true, urgency: "normal" },
  { id: "gr2", emoji: "🍱", title: "Order dabba / plan lunch early", subtitle: "Swiggy or canteen token", zone: "work", triggerType: "arrive", locationLabel: "Mindspace Tech Park", enabled: true, urgency: "normal" },
  { id: "gr3", emoji: "💊", title: "Morning medicines lena mat bhulo!", subtitle: "Bag ke side pocket mein hai", zone: "work", triggerType: "arrive", locationLabel: "Mindspace Tech Park", enabled: false, urgency: "high" },
  { id: "gr4", emoji: "💳", title: "Log attendance on HRMS portal", subtitle: "HR deadline is 10 AM", zone: "work", triggerType: "arrive", locationLabel: "Mindspace Tech Park", enabled: false, urgency: "normal" },

  /* ── On leaving work ── */
  { id: "gr5", emoji: "🛒", title: "Groceries from D-Mart near DLF Phase 1", subtitle: "Atta, dal, cooking oil, sabzi", zone: "leaving-work", triggerType: "leave", locationLabel: "Leaving Mindspace", enabled: true, urgency: "normal" },
  { id: "gr6", emoji: "⛽", title: "Petrol refill — HP Pump, Sohna Road", subtitle: "Tank below half — do it today!", zone: "leaving-work", triggerType: "leave", locationLabel: "Leaving Mindspace", enabled: false, urgency: "high" },
  { id: "gr7", emoji: "🏧", title: "ATM cash withdrawal", subtitle: "Need cash for weekend", zone: "leaving-work", triggerType: "leave", locationLabel: "Leaving Mindspace", enabled: true, urgency: "normal" },
  { id: "gr8", emoji: "👔", title: "Pick up dry cleaning from shop", subtitle: "Sector 14 market, near Axis Bank", zone: "leaving-work", triggerType: "leave", locationLabel: "Leaving Mindspace", enabled: false, urgency: "normal" },

  /* ── At home ── */
  { id: "gr9",  emoji: "🔥", title: "Check gas knob — band hai ki nahi?!", subtitle: "Kitchen mein check karo PEHLE", zone: "home", triggerType: "arrive", locationLabel: "Sector 14, Gurugram", enabled: true, urgency: "high" },
  { id: "gr10", emoji: "💡", title: "Switch off unnecessary lights & fans", subtitle: "Bijli bachao — save electricity", zone: "home", triggerType: "arrive", locationLabel: "Sector 14, Gurugram", enabled: true, urgency: "normal" },
  { id: "gr11", emoji: "🚿", title: "Geyser band karo after 15 mins!", subtitle: "Don't leave it on — it trips the MCB", zone: "home", triggerType: "arrive", locationLabel: "Sector 14, Gurugram", enabled: false, urgency: "high" },
  { id: "gr12", emoji: "❄️", title: "Switch off AC before leaving home", subtitle: "Set timer on remote if forgetting", zone: "home", triggerType: "leave", locationLabel: "Sector 14, Gurugram", enabled: true, urgency: "high" },
  { id: "gr13", emoji: "🔒", title: "Lock the main door properly", subtitle: "Check handle + deadbolt both", zone: "home", triggerType: "leave", locationLabel: "Sector 14, Gurugram", enabled: false, urgency: "high" },

  /* ── Near market ── */
  { id: "gr14", emoji: "🥦", title: "Sabzi from sabziwala", subtitle: "Aloo, pyaaz, tamatar, dhaniya", zone: "market", triggerType: "arrive", locationLabel: "Sector 14 Subzi Mandi", enabled: true, urgency: "normal" },
  { id: "gr15", emoji: "🍚", title: "Atta, dal, chawal from kirana store", subtitle: "Monthly restock — all running low", zone: "market", triggerType: "arrive", locationLabel: "Local Kirana Store", enabled: false, urgency: "normal" },
  { id: "gr16", emoji: "💈", title: "Haircut is overdue!", subtitle: "Bhai, kab se keh raha hai", zone: "market", triggerType: "arrive", locationLabel: "Sector 14 Market", enabled: false, urgency: "normal" },
];

export const INTENT_CONFIG: Record<string, { emoji: string; className: string }> = {
  coffee: { emoji: "☕", className: "badge-amber" },
  focus:  { emoji: "💻", className: "badge-slate" },
  lunch:  { emoji: "🍜", className: "badge-green" },
  open:   { emoji: "👋", className: "badge-indigo" },
  busy:   { emoji: "🔴", className: "badge-rose" },
};
