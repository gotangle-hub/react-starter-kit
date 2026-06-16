/**
 * Core domain types shared across the data layer.
 * Kept deliberately small for the foundation — journeys extend these.
 */

export type AccountType =
  | "designer" // individual
  | "studio"
  | "client"
  | "institution" // faculty
  | "student"
  | "collector";

export type VerificationState = "none" | "submitted" | "verified"; // G11

export interface Profile {
  id: string;
  accountType: AccountType;
  name: string;
  location: string | null;
  disciplines: string[];
  avatarUrl: string | null;
  bannerUrl: string | null; // null -> takes page bg for the mode (G15)
  verification: VerificationState;
  onboardingSeen: boolean; // G12 — welcome dialog + tour shown once
  createdAt: string;
}

/** Anonymous salary entry (G14) — never linked to a user account. */
export interface SalaryEntry {
  id: string;
  field: string;
  title: string;
  payPerMonth: number;
  currency: string;
  location: string;
  createdAt: string;
}

export type SalarySubmission = Omit<SalaryEntry, "id" | "createdAt">;
