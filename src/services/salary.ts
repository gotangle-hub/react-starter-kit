import { getSupabase } from "@/lib/supabase";
import type { SalaryEntry, SalarySubmission } from "@/lib/types";

/**
 * Salary database (G14 / G54).
 * Empty at launch — grows ONLY from anonymous community submissions. Entries
 * are never linked to a user account. No placeholder data is ever seeded.
 */
export const salaryService = {
  async list(filters?: {
    location?: string;
    title?: string;
    field?: string;
  }): Promise<SalaryEntry[]> {
    let query = getSupabase()
      .from("salary_entries")
      .select("*")
      .order("created_at", { ascending: false });

    if (filters?.location) query = query.ilike("location", `%${filters.location}%`);
    if (filters?.title) query = query.ilike("title", `%${filters.title}%`);
    if (filters?.field) query = query.ilike("field", `%${filters.field}%`);

    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []) as SalaryEntry[];
  },

  /** Insert an anonymous entry — no user id is attached, ever. */
  async submit(entry: SalarySubmission): Promise<void> {
    const { error } = await getSupabase().from("salary_entries").insert({
      field: entry.field,
      title: entry.title,
      pay_per_month: entry.payPerMonth,
      currency: entry.currency,
      location: entry.location,
    });
    if (error) throw error;
  },
};
