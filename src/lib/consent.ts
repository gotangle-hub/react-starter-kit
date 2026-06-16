/**
 * Legal consent copy — the final step before an account is created. One set per
 * account type, each with exactly 3 combined checkboxes plus the universal
 * disclaimer that Tangle is not a party to payments/agreements between members.
 */
import type { AccountType } from "@/lib/types";

export const TANGLE_DISCLAIMER =
  "Tangle builds a bridge between designers and the work, clients, collaborators and opportunities they're reaching for — a clean, honest space dedicated to the quality of ideas and craft, driven by passion. Tangle is not a party to, and is not responsible for, any payment, contract, brief or deliverable agreed between clients, external competitions and designers. Those arrangements are solely between the members involved, and Tangle is not liable for them.";

export const POLICIES = ["Terms & Conditions", "Privacy Policy", "Copyright Policy"];

export interface ConsentItem {
  text: string;
  policies?: string[];
  strong?: boolean;
}

export interface ConsentCopy {
  kicker: string;
  title: string;
  items: ConsentItem[];
}

export const CONSENT: Record<AccountType, ConsentCopy> = {
  designer: {
    kicker: "Designer",
    title: "Agree, and you're in.",
    items: [
      { text: "The work I publish is my own — I will not plagiarise or misrepresent authorship, I will credit the parties involved when necessary, and I will be honest and keep the promises and commitments I make to clients and collaborators." },
      { text: "I will not copy, clone, reproduce or imitate Tangle's idea, concept, design, brand or platform, or use it to build a competing product, and I understand Tangle is not responsible for payments or agreements between members.", strong: true },
      { text: "I agree to Tangle's", policies: POLICIES },
    ],
  },
  studio: {
    kicker: "Studio",
    title: "Agree, and open the studio.",
    items: [
      { text: "On behalf of the studio, we hold the rights to everything we publish, will not plagiarise or misrepresent authorship, will credit the parties involved when necessary, and will be honest and keep the promises and commitments we make to clients and collaborators." },
      { text: "We will not copy, clone, reproduce or imitate Tangle's idea, concept, design, brand or platform, or use it to build a competing product, and we understand Tangle is not responsible for payments or agreements between members.", strong: true },
      { text: "We agree to Tangle's", policies: POLICIES },
    ],
  },
  client: {
    kicker: "Client",
    title: "Agree, and start hiring.",
    items: [
      { text: "I will deliver what I promise, honour the agreements I make with designers, give honest briefs and fair terms, pay the people I hire directly and on time, and respect the intellectual property and credit of the creatives I work with.", strong: true },
      { text: "I will not copy, clone, reproduce or imitate Tangle's idea, concept, design, brand or platform, or use it to build a competing product, and I understand Tangle is not responsible for payments or agreements between members.", strong: true },
      { text: "I agree to Tangle's", policies: POLICIES },
    ],
  },
  institution: {
    kicker: "Faculty",
    title: "Agree, and join your campus.",
    items: [
      { text: "The work I publish is my own — I will not plagiarise or misrepresent authorship, I will credit the parties involved when necessary, and I will be honest and keep the commitments I make to students and collaborators." },
      { text: "I will not copy, clone, reproduce or imitate Tangle's idea, concept, design, brand or platform, or use it to build a competing product, and I understand Tangle is not responsible for payments or agreements between members.", strong: true },
      { text: "I agree to Tangle's", policies: POLICIES },
    ],
  },
  student: {
    kicker: "Student",
    title: "Agree, and join your campus.",
    items: [
      { text: "The work I publish is my own — I will not plagiarise or misrepresent authorship, I will credit the parties involved when necessary, and I will be honest and keep the commitments I make to clients and collaborators." },
      { text: "I will not copy, clone, reproduce or imitate Tangle's idea, concept, design, brand or platform, or use it to build a competing product, and I understand Tangle is not responsible for payments or agreements between members.", strong: true },
      { text: "I agree to Tangle's", policies: POLICIES },
    ],
  },
  collector: {
    kicker: "Collector",
    title: "Agree, and start collecting.",
    items: [
      { text: "I will respect creators' copyright, and never repost work as my own." },
      { text: "I will not copy, clone, reproduce or imitate Tangle's idea, concept, design, brand or platform, or use it to build a competing product, and I understand Tangle is not responsible for payments or agreements between members.", strong: true },
      { text: "I agree to Tangle's", policies: POLICIES },
    ],
  },
};
