// G13 · Institution directory + role detection.
import { supabase } from "@/integrations/supabase/client";

export interface Institution {
  id: string;
  slug: string;
  name: string;
  city: string;
  country: string | null;
  domain: string;
  alt_domains: string[];
  sso_provider: "google" | "microsoft" | "email";
  faculty_email_regex: string | null;
  student_email_regex: string | null;
  tint: string | null;
  initials: string | null;
}

const SELECTED_KEY = "tangle.selectedInstitution";

export async function searchInstitutions(q: string, limit = 8): Promise<Institution[]> {
  let req = supabase.from("institutions").select("*").order("name").limit(limit);
  if (q.trim()) {
    const term = `%${q.trim()}%`;
    req = req.or(`name.ilike.${term},city.ilike.${term},domain.ilike.${term}`);
  }
  const { data, error } = await req;
  if (error) {
    console.error("[institutions] search failed", error);
    return [];
  }
  return (data ?? []) as Institution[];
}

export function rememberInstitution(inst: Institution): void {
  try { sessionStorage.setItem(SELECTED_KEY, JSON.stringify(inst)); } catch { /* ignore */ }
}

export function recallInstitution(): Institution | null {
  try {
    const raw = sessionStorage.getItem(SELECTED_KEY);
    return raw ? (JSON.parse(raw) as Institution) : null;
  } catch {
    return null;
  }
}

/** Returns "faculty" | "student" based on the institution's regex hints. */
export function detectRole(email: string, inst: Institution | null): "faculty" | "student" {
  if (!email || !inst) return "student";
  const local = email.split("@")[0]?.toLowerCase() ?? "";
  const compile = (re: string | null) => {
    if (!re) return null;
    try { return new RegExp(re, "i"); } catch { return null; }
  };
  const fac = compile(inst.faculty_email_regex);
  const stu = compile(inst.student_email_regex);
  if (fac && fac.test(local)) return "faculty";
  if (stu && stu.test(local)) return "student";
  // Default heuristic: 6+ digits in local part = student id; else faculty.
  return /\d{6,}/.test(local) ? "student" : "faculty";
}

export function emailMatchesInstitution(email: string, inst: Institution): boolean {
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) return false;
  if (domain === inst.domain.toLowerCase()) return true;
  return inst.alt_domains.some((d) => d.toLowerCase() === domain);
}

export async function submitRegistrationRequest(payload: {
  institution_name: string;
  location?: string;
  contact_name?: string;
  contact_email: string;
  role?: string;
  approx_students?: number;
  notes?: string;
}) {
  return supabase.functions.invoke("register-institution", { body: payload });
}

export type LinkMembershipResult =
  | { ok: true; institution_id: string; institution_name: string; email: string; role: "faculty" | "student" | null; ambiguous: boolean }
  | { ok: false; reason: "domain_mismatch"; expected_domain: string; email: string };

/** Server-verified G13 link: matches the caller's auth email to the chosen
 * institution's domain and persists the link + detected role. */
export async function linkMembership(institutionId: string): Promise<LinkMembershipResult | { ok: false; reason: "error"; message: string }> {
  // @ts-expect-error — RPC name not yet in generated types until next codegen.
  const { data, error } = await supabase.rpc("link_institution_membership", { _institution_id: institutionId });
  if (error) return { ok: false, reason: "error", message: error.message };
  return data as LinkMembershipResult;
}

export async function setInstitutionRole(role: "faculty" | "student"): Promise<{ error: string | null }> {
  // @ts-expect-error — RPC name not yet in generated types until next codegen.
  const { error } = await supabase.rpc("set_institution_role", { _role: role });
  return { error: error?.message ?? null };
}
