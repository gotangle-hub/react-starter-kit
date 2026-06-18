/** Predictive institution finder (G13).
 *
 * The Tangle institutions directory starts EMPTY. Real schools are added
 * manually to the `institutions` table (via the registration flow) and read
 * from there at runtime — we intentionally ship no fixture schools so the
 * predictive search is empty until real campuses are onboarded.
 *
 * The `School` type is still exported because a few UI bits (logos, settings
 * rows) accept a small school-shaped object from the user's selected
 * institution.
 */
export interface School {
  name: string;
  city: string;
  domain: string;
  provider: "Google" | "Microsoft";
  tint: string;
  initials: string;
}

export const schools: School[] = [];
