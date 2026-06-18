import { Fragment } from "react";
import { Link } from "react-router-dom";

const MENTION_RE = /@([a-z0-9_.]{3,20})/g;

/** Render a body string with `@handle` mentions turned into profile links. */
export function renderWithMentions(body: string) {
  const out: React.ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  MENTION_RE.lastIndex = 0;
  while ((m = MENTION_RE.exec(body)) !== null) {
    if (m.index > last) out.push(body.slice(last, m.index));
    const handle = m[1];
    out.push(
      <Link
        key={`${m.index}-${handle}`}
        to={`/u/${handle}`}
        className="font-semibold text-tg-blue-accent hover:underline"
      >
        @{handle}
      </Link>,
    );
    last = m.index + m[0].length;
  }
  if (last < body.length) out.push(body.slice(last));
  return out.map((node, i) => <Fragment key={i}>{node}</Fragment>);
}
