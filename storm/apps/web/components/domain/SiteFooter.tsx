import Link from "next/link";

const COLUMNS: { heading: string; links: { label: string; href: string }[] }[] = [
  {
    heading: "Storm",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    heading: "Help",
    links: [
      { label: "FAQ", href: "/faq" },
      { label: "Shipping policy", href: "/shipping-policy" },
      { label: "Returns policy", href: "/returns-policy" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy policy", href: "/privacy-policy" },
      { label: "Terms of service", href: "/terms" },
    ],
  },
];

const PAYMENT_BADGES = ["Visa", "Mastercard", "UPI", "RuPay"];

export function SiteFooter() {
  return (
    <footer className="mt-12 border-t border-neutral-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {COLUMNS.map((col) => (
            <div key={col.heading}>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-neutral-900">
                {col.heading}
              </h3>
              <ul className="mt-3 space-y-2 text-sm text-neutral-600">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="hover:text-neutral-900">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-neutral-900">
              Stay in touch
            </h3>
            <p className="mt-3 text-sm text-neutral-600">
              Get product news and offers.
            </p>
            <form
              action="#"
              method="post"
              className="mt-3 flex gap-2"
              aria-label="Email signup (coming soon)"
            >
              <label className="sr-only" htmlFor="footer-email">
                Email
              </label>
              <input
                id="footer-email"
                type="email"
                placeholder="you@example.com"
                disabled
                className="flex-1 rounded-md border border-neutral-300 bg-neutral-50 px-3 py-1.5 text-xs text-neutral-500"
              />
              <button
                type="button"
                disabled
                className="rounded-md bg-neutral-300 px-3 py-1.5 text-xs font-medium text-white"
              >
                Notify me
              </button>
            </form>
            <p className="mt-1 text-[11px] text-neutral-400">
              Email signup launches soon.
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-4 border-t border-neutral-100 pt-6 text-xs text-neutral-500 sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} Storm Commerce Pvt. Ltd. All rights reserved.</p>
          <ul className="flex items-center gap-2" aria-label="Accepted payments">
            {PAYMENT_BADGES.map((p) => (
              <li
                key={p}
                className="rounded border border-neutral-200 bg-neutral-50 px-2 py-1 text-[11px] font-semibold text-neutral-600"
              >
                {p}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
