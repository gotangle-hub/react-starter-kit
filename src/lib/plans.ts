/** Pricing tiers shown on the plan pickers. Real config, not fixtures. */

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
