import type { School } from "@/lib/fixtures";

/** Institution monogram tile, tinted per school. */
export function InstLogo({ school, size = 42 }: { school: Pick<School, "tint" | "initials">; size?: number }) {
  return (
    <span
      className="inline-flex flex-none items-center justify-center rounded-md font-display font-bold text-white"
      style={{ width: size, height: size, background: school.tint, fontSize: Math.round(size * 0.34), letterSpacing: "0.02em" }}
    >
      {school.initials}
    </span>
  );
}
