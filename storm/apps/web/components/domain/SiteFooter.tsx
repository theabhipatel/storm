import { Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";

const COLUMNS: { heading: string; links: { label: string; href: string }[] }[] = [
  {
    heading: "About",
    links: [
      { label: "About us", href: "/about" },
      { label: "Contact us", href: "/contact" },
      { label: "FAQ", href: "/faq" },
    ],
  },
  {
    heading: "Help",
    links: [
      { label: "Shipping policy", href: "/shipping-policy" },
      { label: "Returns policy", href: "/returns-policy" },
      { label: "My orders", href: "/orders" },
    ],
  },
  {
    heading: "Policy",
    links: [
      { label: "Privacy policy", href: "/privacy-policy" },
      { label: "Terms of service", href: "/terms" },
      { label: "Cookie policy", href: "/privacy-policy" },
    ],
  },
];

const PAYMENT_BADGES = ["Visa", "Mastercard", "UPI", "RuPay", "NetBanking"];

export function SiteFooter() {
  return (
    <footer className="mt-16 bg-dark text-dark-foreground">
      <div className="mx-auto max-w-page px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
          {COLUMNS.map((col) => (
            <div key={col.heading}>
              <h3 className="text-xs font-bold uppercase tracking-wider text-dark-foreground-muted">
                {col.heading}
              </h3>
              <ul className="mt-4 space-y-2.5 text-sm">
                {col.links.map((l) => (
                  <li key={`${col.heading}-${l.label}`}>
                    <Link
                      href={l.href}
                      className="text-dark-foreground transition hover:text-white"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-dark-foreground-muted">
              Reach us
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-dark-foreground">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-dark-foreground-muted" />
                Bengaluru, India
              </li>
              <li className="flex items-start gap-2">
                <Phone className="mt-0.5 h-4 w-4 flex-shrink-0 text-dark-foreground-muted" />
                <a href="tel:+911800000000" className="hover:text-white">
                  1800 000 000
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="mt-0.5 h-4 w-4 flex-shrink-0 text-dark-foreground-muted" />
                <a href="mailto:help@storm.in" className="hover:text-white">
                  help@storm.in
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-4 border-t border-dark-soft pt-6 text-xs text-dark-foreground-muted sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} Storm Commerce Pvt. Ltd. All rights reserved.</p>
          <ul className="flex flex-wrap items-center gap-2" aria-label="Accepted payments">
            {PAYMENT_BADGES.map((p) => (
              <li
                key={p}
                className="rounded border border-dark-soft bg-dark-soft px-2.5 py-1 text-[11px] font-semibold text-dark-foreground"
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
