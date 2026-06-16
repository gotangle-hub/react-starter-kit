/**
 * DEV fixtures — sample content so screens are demonstrable before the Supabase
 * backend is wired. This is NOT shipped data: per G14 the live product shows the
 * user's real data and real empty states. Lovable/Supabase replaces this file.
 */

export interface Maker {
  id: string;
  name: string;
  role: string;
  city: string;
  verified: boolean;
  initials: string;
  tint: string;
  match?: number;
  skills?: string[];
}

export const makers: Maker[] = [
  { id: "lina", name: "Lina Kassem", role: "Architecture", city: "Beirut", verified: true, initials: "LK", tint: "#A85C3A", match: 94, skills: ["Architecture", "Adaptive reuse", "Concrete"] },
  { id: "arian", name: "Arian Saghafifar", role: "Industrial design", city: "Dubai", verified: true, initials: "AS", tint: "#161514", match: 88, skills: ["Product", "Furniture", "Steel"] },
  { id: "mona", name: "Mona Rao", role: "Brand & type", city: "Abu Dhabi", verified: true, initials: "MR", tint: "#0107FF", match: 81, skills: ["Type", "Brand", "Editorial"] },
  { id: "yuki", name: "Yuki Tan", role: "Ceramics", city: "Lisbon", verified: false, initials: "YT", tint: "#6E665B", match: 76, skills: ["Ceramics", "Glaze", "Tableware"] },
  { id: "noor", name: "Noor Haddad", role: "Textiles", city: "Amman", verified: true, initials: "NH", tint: "#6B4EFF", match: 72, skills: ["Textiles", "Natural dye", "Weaving"] },
  { id: "studio", name: "Atelier Travertine", role: "Studio · 6 people", city: "Dubai", verified: true, initials: "AT", tint: "#161514", match: 90, skills: ["Architecture", "Interiors", "Exhibition"] },
];

export interface DesignerPlan {
  id: "free" | "pro";
  name: string;
  price: string;
  unit: string;
  tagline: string;
  featured?: boolean;
  annual?: string;
  features: string[];
}

export const designerPlans: DesignerPlan[] = [
  {
    id: "free",
    name: "Free",
    price: "0",
    unit: "AED",
    tagline: "Find your footing.",
    features: [
      "Personal profile + work",
      "Browse projects, creators & call outs",
      "15 swipes per day",
      "1 call out interest per day",
      "2 active collaborations",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: "60",
    unit: "AED / month",
    tagline: "Work without limits.",
    featured: true,
    annual: "690 AED / year",
    features: [
      "Everything in Free",
      "Unlimited active collaborations",
      "Advanced + visual search",
      "Higher visibility in Match",
      "See who's interested in pinned competitions",
      "Advanced filters & priority matching",
    ],
  },
];

/** All design fields (G07) — selectable disciplines, plus "Other" handled in UI. */
export const disciplines: string[] = [
  "Architecture",
  "Interior",
  "Product",
  "Graphic",
  "Type & lettering",
  "Branding",
  "Illustration",
  "Photography",
  "Film & motion",
  "UX / UI",
  "Game design",
  "Fashion",
  "Textiles",
  "Jewellery",
  "Ceramics",
  "Furniture",
  "Industrial",
  "Set & exhibition",
  "Landscape",
  "Art direction",
  "3D & visualisation",
];

/** Asset path helper — feed imagery lives in /public/feed. */
export const feed = (name: string) => `/feed/${name}`;

/** Look up a maker by id; falls back to the first maker for safety in dev. */
export const makerById = (id: string): Maker =>
  makers.find((m) => m.id === id) ?? makers[0];

export interface Work {
  id: string;
  maker: string;
  img?: string;
  swatch?: string;
  fg?: string;
  h: number;
  cat: string;
  title: string;
  likes: number;
}

export const works: Work[] = [
  { id: "w1", maker: "lina", img: "spec-full.jpg", h: 300, cat: "Architecture", title: "Stair, in section", likes: 412 },
  { id: "w2", maker: "mona", swatch: "#161514", fg: "#FAF1E0", h: 210, cat: "Type", title: "Wordmark study / 04", likes: 233 },
  { id: "w3", maker: "arian", img: "spec-blades.jpg", h: 220, cat: "Product", title: "Shears, edge detail", likes: 198 },
  { id: "w4", maker: "noor", swatch: "#A85C3A", fg: "#FAF1E0", h: 260, cat: "Textiles", title: "Madder dyed silk", likes: 301 },
  { id: "w5", maker: "yuki", img: "spec-handles.jpg", h: 250, cat: "Ceramics", title: "Thrown, trimmed, dried", likes: 156 },
  { id: "w6", maker: "studio", swatch: "#3A5A40", fg: "#FAF1E0", h: 200, cat: "Exhibition", title: "Pavilion, plan", likes: 142 },
  { id: "w7", maker: "mona", img: "spec-negative.jpg", h: 320, cat: "Type", title: "One line, drawn blue", likes: 521 },
  { id: "w8", maker: "studio", swatch: "#EEE6D6", fg: "#161514", h: 190, cat: "Exhibition", title: "Pavilion, plan", likes: 188 },
];

export interface Post {
  id: string;
  maker: string;
  img: string;
  title: string;
  cat: string;
  year: number;
  place: string;
  likes: number;
  comments: number;
  saves: number;
  usedIn: string;
  promoted?: boolean;
}

export const posts: Post[] = [
  { id: "e1", maker: "lina", img: "spec-full.jpg", title: "A house that listens", cat: "Architecture", year: 2026, place: "Dubai", likes: 1240, comments: 86, saves: 410, usedIn: "Open call · Al Barsha residence" },
  { id: "e2", maker: "arian", img: "spec-blades.jpg", title: "Tools, documented", cat: "Product", year: 2025, place: "Dubai", likes: 880, comments: 41, saves: 233, usedIn: "Self initiated", promoted: true },
  { id: "e3", maker: "mona", img: "spec-negative.jpg", title: "One line, drawn blue", cat: "Type", year: 2026, place: "Abu Dhabi", likes: 1530, comments: 122, saves: 640, usedIn: "Tangle wordmark study" },
  { id: "e4", maker: "yuki", img: "spec-handles.jpg", title: "Thrown, trimmed, dried", cat: "Ceramics", year: 2026, place: "Lisbon", likes: 540, comments: 33, saves: 180, usedIn: "Tableware series" },
];

export interface Comment {
  id: string;
  maker: string;
  text: string;
  time: string;
  likes: number;
}

export const comments: Comment[] = [
  { id: "cm1", maker: "arian", text: "The section drawing does all the work here. Restraint.", time: "12m", likes: 8 },
  { id: "cm2", maker: "mona", text: "That stair detail — is the handrail the same stone?", time: "40m", likes: 3 },
  { id: "cm3", maker: "noor", text: "Warm light, no spectacle. This is the brief done right.", time: "2h", likes: 14 },
];

export interface CallOut {
  id: string;
  title: string;
  by: string;
  kind: string;
  city: string;
  budget: string;
  timeline: string;
  type: string;
  skills: string[];
  interested: number;
  body: string;
  promoted?: boolean;
}

export const callOuts: CallOut[] = [
  { id: "c1", title: "Looking for an interior designer", by: "A private client", kind: "Client", city: "Dubai · on site", budget: "18,000–24,000 AED", timeline: "10 weeks", type: "Interior · Architecture", skills: ["Interiors", "Lighting", "Materials"], interested: 12, body: "A family home in Al Barsha seeks an interior designer and a lighting specialist to rework two living floors. Warm materials, restraint, natural light over spectacle." },
  { id: "c2", title: "Competition partner — pavilion", by: "Lina Kassem", kind: "Designer", city: "Remote", budget: "Prize split", timeline: "6 weeks", type: "Architecture · Competition", skills: ["Modelling", "Concept", "Boards"], interested: 7, body: "Forming a two person team for the Desert Pavilion open competition. I cover concept + drawings; looking for someone strong on physical modelling and visualisation." },
  { id: "c3", title: "Looking for a visualizer", by: "Atelier Travertine", kind: "Studio", city: "Dubai", budget: "4,500 AED", timeline: "3 weeks", type: "Visualisation", skills: ["3D", "Render", "Lighting"], interested: 21, body: "Studio needs a visualiser for an exhibition proposal. Warm, filmic renders — no glossy CGI. Three hero images plus a short fly through.", promoted: true },
];

export interface Competition {
  id: string;
  name: string;
  org: string;
  place: string;
  deadline: string;
  prize: string;
  cat: string;
  pinned: boolean;
  interestedPeople: number;
  link: string;
}

export const competitions: Competition[] = [
  { id: "k1", name: "Desert Pavilion 2026", org: "Tashkeel", place: "UAE", deadline: "Aug 30", prize: "120,000 AED", cat: "Architecture", pinned: true, interestedPeople: 34, link: "tashkeel.org" },
  { id: "k2", name: "Soft Brutalism Open", org: "A+ Awards", place: "Global", deadline: "Sep 15", prize: "Publication + €5,000", cat: "Interiors", pinned: false, interestedPeople: 58, link: "architizer.com" },
  { id: "k3", name: "Adaptive Reuse Prize", org: "RIBA", place: "Global", deadline: "Oct 02", prize: "£8,000", cat: "Architecture", pinned: false, interestedPeople: 41, link: "riba.org" },
];

export const tangleComps = [
  { id: "t1", title: "Weekly render challenge", deadline: "4 days left", prize: "Featured + badge", participants: 212, brief: "One room, one light source, one material. Render it warm." },
  { id: "t2", title: "Furniture in 100 hours", deadline: "12 days left", prize: "5,000 AED", participants: 88, brief: "Design and document a single piece of furniture, start to finish, in 100 logged hours." },
];

export interface Notification {
  id: string;
  type: "connect" | "collab" | "interest" | "deadline" | "message" | "like";
  who: string;
  text: string;
  time: string;
  unread: boolean;
}

export const notifications: Notification[] = [
  { id: "n1", type: "connect", who: "Lina Kassem", text: "wants to connect", time: "2m", unread: true },
  { id: "n2", type: "collab", who: "Atelier Travertine", text: "invited you to collaborate on Desert Pavilion", time: "18m", unread: true },
  { id: "n3", type: "interest", who: "Mona Rao", text: "is interested in your pinned competition", time: "1h", unread: true },
  { id: "n4", type: "deadline", who: "Desert Pavilion 2026", text: "closes in 6 days", time: "3h", unread: false },
  { id: "n5", type: "message", who: "Yuki Tan", text: "sent you a message", time: "1d", unread: false },
];

export interface CommunityPost {
  id: string;
  maker: string;
  time: string;
  text: string;
  likes: number;
  replies: number;
  reposts: number;
  img?: string;
}

export const community: CommunityPost[] = [
  { id: "p1", maker: "mona", time: "12m", text: "Spent the morning redrawing a wordmark for the fourth time. The version that works is always the one that looks like you didn't try.", likes: 64, replies: 11, reposts: 8, img: "spec-negative.jpg" },
  { id: "p2", maker: "lina", time: "1h", text: "How are people pricing competition collaborations? Flat split, or weighted by hours? Genuinely unsure what's fair for a 3 person team.", likes: 38, replies: 27, reposts: 3 },
  { id: "p3", maker: "arian", time: "3h", text: "Reminder that the brief is allowed to be one sentence. Most of mine are.", likes: 121, replies: 14, reposts: 19 },
  { id: "p4", maker: "noor", time: "5h", text: "Dyed a full batch with madder root today. The colour on week old cloth is nothing like the swatch. Patience is a material.", likes: 52, replies: 6, reposts: 4 },
];

export interface Chat {
  id: string;
  kind: "competition" | "client" | "regular";
  title: string;
  who: string;
  last: string;
  time: string;
  unread: number;
  members: string[];
}

export const chats: Chat[] = [
  { id: "ch1", kind: "competition", title: "Desert Pavilion Competition", who: "Lina Kassem, you", last: "Lina: I'll start the concept diagrams tonight.", time: "2m", unread: 2, members: ["lina", "mona"] },
  { id: "ch2", kind: "client", title: "Al Barsha residence", who: "A private client, you", last: "Client: The mood images are perfect, thank you.", time: "40m", unread: 0, members: ["studio"] },
  { id: "ch3", kind: "regular", title: "Mona Rao", who: "Mona Rao", last: "You: Let's grab coffee when you're back in Dubai.", time: "2h", unread: 0, members: ["mona"] },
  { id: "ch4", kind: "competition", title: "Future Museum Competition", who: "Noor Haddad, Sami Okonkwo, you", last: "Noor: Uploaded the references to files.", time: "1d", unread: 0, members: ["noor", "yuki"] },
];

export const pinBoards = [
  { id: "pb1", name: "Warm concrete", count: 24, cover: "spec-full.jpg" },
  { id: "pb2", name: "Type that breathes", count: 18, cover: "spec-negative.jpg" },
  { id: "pb3", name: "Tools & making", count: 31, cover: "spec-blades.jpg" },
  { id: "pb4", name: "Glaze & clay", count: 12, cover: "spec-handles.jpg" },
];

/** Studio plan ladder — identical full feature set on every tier; the ONLY
 * difference is studio size (G PlansCombined). */
const STUDIO_FEATURES = [
  "Verified Studio badge & profile page",
  "Studio branded posts",
  "Unlimited project uploads & open calls",
  "Hiring & recruitment tools",
  "Featured studio placement",
  "Advanced analytics",
  "Multiple administrators",
  "Priority support",
];

export interface TierPlan {
  id: string;
  name: string;
  price: string;
  unit: string;
  tagline: string;
  meta?: string;
  featured?: boolean;
  features: string[];
}

export const studioPlans: TierPlan[] = [
  { id: "studio-free", name: "Studio Free", price: "0", unit: "AED", tagline: "For a small team finding its feet.", meta: "1–5 team members", features: STUDIO_FEATURES },
  { id: "studio-lite", name: "Studio Lite", price: "199", unit: "AED / month", tagline: "A growing studio.", meta: "Up to 15 team members", features: STUDIO_FEATURES },
  { id: "studio", name: "Studio", price: "399", unit: "AED / month", tagline: "An established studio.", meta: "Up to 30 team members", featured: true, features: STUDIO_FEATURES },
  { id: "studio-plus", name: "Studio Plus", price: "699", unit: "AED / month", tagline: "A large studio or agency.", meta: "Up to 100 team members", features: STUDIO_FEATURES },
  { id: "enterprise", name: "Enterprise", price: "Custom", unit: "talk to us", tagline: "Universities, festivals, brands and institutions.", meta: "Unlimited team members", features: STUDIO_FEATURES },
];

export const clientPlans: TierPlan[] = [
  { id: "cfree", name: "Client Free", price: "0", unit: "AED", tagline: "Post and look around.", features: ["1 active project brief", "Browse creators & studios", "Talent search", "3 talent saves"] },
  { id: "cpro", name: "Client Pro", price: "120", unit: "AED / month", tagline: "Hire with intent.", featured: true, features: ["Everything in Free", "10 active project briefs", "Unlimited talent pool & folders", "Advanced + visual talent search", "Priority in creator inboxes", "Salary database"] },
  { id: "business", name: "Business", price: "320", unit: "AED / month", tagline: "A team that hires often.", features: ["Everything in Pro", "Unlimited briefs", "5 team seats", "Studio page + open roles", "Shared talent pipelines"] },
];

/** The signed-in studio (dev). */
export const studio = {
  name: "Oblique Studio",
  initials: "OS",
  tint: "#161514",
  discipline: "Architecture & spatial · Dubai",
  about: "A ten person studio working across exhibition, retail and residential. We build slow, detail-obsessed spaces.",
  seatsUsed: 8,
  seatsTotal: 30,
};

/** Institutions for the predictive school finder (G13). `provider` drives the
 * login routing (Google Workspace, Microsoft, etc.). */
export interface School {
  name: string;
  city: string;
  domain: string;
  provider: "Google" | "Microsoft";
  tint: string;
  initials: string;
}

export const schools: School[] = [
  { name: "Royal College of Art", city: "London, UK", domain: "rca.ac.uk", provider: "Google", tint: "#0107FF", initials: "RC" },
  { name: "Royal Academy of Art", city: "The Hague, NL", domain: "kabk.nl", provider: "Google", tint: "#161514", initials: "RA" },
  { name: "Rhode Island School of Design", city: "Providence, US", domain: "risd.edu", provider: "Microsoft", tint: "#A85C3A", initials: "RI" },
  { name: "Dubai Institute of Design", city: "Dubai, UAE", domain: "didi.ac.ae", provider: "Microsoft", tint: "#6B4EFF", initials: "DI" },
];

/** A student's enrolled courses. */
export const studentCourses = [
  { id: "sc1", name: "Spatial Studio", prof: "Prof. Rakan Lee", term: "Year 2 · Term 2", unread: 3, last: "New brief · Studio brief — Term 2.pdf", tint: "#0107FF" },
  { id: "sc2", name: "Type & Systems", prof: "Prof. Mira Haddad", term: "Year 2", unread: 0, last: "Mona shared a pin from Explore", tint: "#161514" },
  { id: "sc3", name: "Material Research", prof: "Prof. Omar Saleh", term: "Year 2 · Elective", unread: 1, last: "New message in the group chat", tint: "#A85C3A" },
];

/** A professor's classes. */
export const professorClasses = [
  { id: "pc1", name: "Spatial Studio", tag: "Year 2", students: 24, last: "Brief added · 2h", tint: "#0107FF", kind: "studio" as const },
  { id: "pc2", name: "Type & Systems", tag: "Year 3", students: 18, last: "Mona shared a pin · 1d", tint: "#161514", kind: "theoretical" as const },
  { id: "pc3", name: "Material Research", tag: "Year 1", students: 31, last: "New message · 3d", tint: "#A85C3A", kind: "studio" as const },
];

export const classDocs = [
  { name: "Studio brief — Term 2.pdf", meta: "PDF · 2.4 MB · shared by faculty", icon: "file" as const },
  { name: "Reading list", meta: "Link · risd.edu/reading", icon: "link" as const },
  { name: "Site references", meta: "12 images · added 2d", icon: "image" as const },
];

export interface PromoProduct {
  id: string;
  name: string;
  desc: string;
  price: string;
  unit: string;
}

export const promoProducts: PromoProduct[] = [
  { id: "pr1", name: "Profile boost", desc: "Surface higher in Match & search for 7 days.", price: "40 AED", unit: "/ 7 days" },
  { id: "pr2", name: "Featured creator", desc: "A spot on the curated creators rail.", price: "90 AED", unit: "/ week" },
  { id: "pr3", name: "Featured project", desc: "Pin a project to the top of Explore.", price: "75 AED", unit: "/ week" },
  { id: "pr4", name: "Featured open call", desc: "Push a call out to the right designers.", price: "120 AED", unit: "/ run" },
  { id: "pr6", name: "Boost a post", desc: "More reach on one community post.", price: "25 AED", unit: "/ run" },
];

export const billingHistory = [
  { id: "b1", label: "Pro — monthly", date: "Jul 1, 2026", amount: "60 AED", status: "Paid" },
  { id: "b2", label: "Profile boost", date: "Jun 18, 2026", amount: "40 AED", status: "Paid" },
  { id: "b3", label: "Pro — monthly", date: "Jun 1, 2026", amount: "60 AED", status: "Paid" },
];

/** The signed-in designer (dev). Real profile comes from Supabase. */
export const me = {
  id: "muna",
  name: "Muna Abbas",
  role: "Architecture · Type",
  city: "Dubai, UAE",
  initials: "MA",
  tint: "#161514",
  verified: false,
  disciplines: ["Architecture", "Type & lettering", "Editorial"],
  connections: 168,
  collaborations: 7,
  bio: "Architect and type designer. Warm materials, quiet drawings, the long way round.",
};

/** Predictive city list for the location picker. */
export const cities: string[] = [
  "Dubai, UAE", "Abu Dhabi, UAE", "Sharjah, UAE", "Riyadh, Saudi Arabia",
  "Doha, Qatar", "Manama, Bahrain", "Kuwait City, Kuwait", "Beirut, Lebanon",
  "Amman, Jordan", "Cairo, Egypt", "Istanbul, Türkiye", "London, UK",
  "Manchester, UK", "Paris, France", "Berlin, Germany", "Amsterdam, Netherlands",
  "Milan, Italy", "Barcelona, Spain", "Lisbon, Portugal", "Copenhagen, Denmark",
  "New York, USA", "Los Angeles, USA", "Providence, USA", "Toronto, Canada",
  "Mumbai, India", "Singapore", "Tokyo, Japan", "Seoul, South Korea",
];
