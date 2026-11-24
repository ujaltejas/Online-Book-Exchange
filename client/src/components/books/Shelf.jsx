import { Link } from "react-router-dom";
import { categoryStyle } from "../../lib/constants";

// width = share of the shelf, height in the same units. Sizes scale with the container (cqw), so the shelf fits any screen.
const SPINES = [
  { c: "Engineering", w: 64, h: 250 },
  { c: "Medical", w: 52, h: 205 },
  { c: "Fiction", w: 70, h: 282 },
  { c: "Science", w: 58, h: 228 },
  { c: "Arts", w: 48, h: 196 },
  { c: "Commerce", w: 66, h: 266 },
  { c: "Law", w: 56, h: 218 },
  { c: "Other", w: 60, h: 240 },
];
const BASE = 506;

const bands = "linear-gradient(to bottom, transparent 0 7%, rgba(255,255,255,.38) 7% 8.2%, transparent 8.2% 91.8%, rgba(255,255,255,.38) 91.8% 93%, transparent 93%)";

/** Each spine is a link that filters the catalogue by that category. */
export default function Shelf() {
  return (
    <div className="w-full" style={{ containerType: "inline-size" }}>
      <ul className="flex items-end gap-[0.8cqw] px-[1.5cqw]" aria-label="Browse by category">
        {SPINES.map(({ c, w, h }, i) => {
          const { bg, fg } = categoryStyle(c);
          return (
            <li key={c} className="spine min-w-0" style={{ flex: `${w} 1 0`, "--i": i }}>
              <Link
                to={`/books?category=${encodeURIComponent(c)}`}
                className="spine-pull flex w-full items-center justify-center rounded-t-[3px] font-extrabold tracking-tight shadow-[inset_-3px_0_0_rgba(0,0,0,.14)]"
                style={{
                  height: `${(h / BASE) * 100}cqw`,
                  background: `${bands}, ${bg}`,
                  color: fg,
                  writingMode: "vertical-rl",
                  fontSize: "clamp(11px, 3.4cqw, 18px)",
                }}
                aria-label={`Browse ${c} books`}
              >
                {c}
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="h-[2.2cqw] min-h-2.5 rounded-sm bg-brass shadow-[0_6px_0_var(--color-lamp-deep)]" aria-hidden="true" />
    </div>
  );
}
