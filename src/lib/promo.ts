/** Promote/boost catalogue (G6). Real product list, not fixtures. */
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
