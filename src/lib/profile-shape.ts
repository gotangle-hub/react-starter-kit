/**
 * The lightweight "maker card" shape that UI components consume (Avatar, NameRow).
 * Built from real Supabase `profiles` rows via `makerFromProfile()` in
 * `@/services/profile`. No fake/seed data — empty surfaces render empty states.
 */
export interface Maker {
  id: string;
  name: string;
  role: string;
  city?: string;
  verified: boolean;
  initials: string;
  tint: string;
  match?: number;
  skills?: string[];
  handle?: string | null;
  avatarUrl?: string;
}
