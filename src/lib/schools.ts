/** Starter list for the predictive institution finder (G13).
 * `provider` drives login routing (Google Workspace, Microsoft, etc.).
 * Real institutions are merged in from the `institutions` table at runtime. */
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
