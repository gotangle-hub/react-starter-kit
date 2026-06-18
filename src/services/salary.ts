import { getSupabase } from "@/lib/supabase";
import type { SalaryEntry, SalarySubmission } from "@/lib/types";

/**
 * Salary database (G14 / G54).
 * Empty at launch — grows ONLY from anonymous community submissions. Entries
 * are never linked to a user account (no user_id column exists). No placeholder
 * data is ever seeded.
 */
export const salaryService = {
  async list(filters?: {
    location?: string;
    title?: string;
    field?: string;
  }): Promise<SalaryEntry[]> {
    let query = getSupabase()
      .from("salary_entries")
      .select("id, field, title, pay_per_month, currency, location, created_at")
      .order("created_at", { ascending: false });

    if (filters?.location) query = query.ilike("location", `%${filters.location}%`);
    if (filters?.title) query = query.ilike("title", `%${filters.title}%`);
    if (filters?.field) query = query.ilike("field", `%${filters.field}%`);

    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []).map((r: {
      id: string;
      field: string;
      title: string;
      pay_per_month: number | string;
      currency: string;
      location: string;
      created_at: string;
    }) => ({
      id: r.id,
      field: r.field,
      title: r.title,
      payPerMonth: Number(r.pay_per_month),
      currency: r.currency,
      location: r.location,
      createdAt: r.created_at,
    }));
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
