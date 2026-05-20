import type { Metadata } from "next";

import { StaticPage } from "../../components/domain/StaticPage";

export const metadata: Metadata = {
  title: "About — Storm",
  description: "About Storm — India's single-seller marketplace.",
};

export default function AboutPage() {
  return (
    <StaticPage
      title="About Storm"
      intro="India's everyday-essentials marketplace, built for speed and trust."
    >
      <p>
        Storm is a single-seller e-commerce experience focused on getting
        India&rsquo;s daily essentials delivered quickly and reliably. We curate
        a tight catalogue across top categories so shopping feels effortless.
      </p>
      <h2>Our promise</h2>
      <ul>
        <li>Transparent prices in Indian rupees, with no hidden charges.</li>
        <li>Fast delivery across 18,000+ pincodes (and growing).</li>
        <li>Secure payments via UPI, cards, and netbanking.</li>
        <li>Friendly support over email and phone, in English and Hindi.</li>
      </ul>
      <h2>Built for India</h2>
      <p>
        Pricing in paise, dates in IST, addresses with PIN codes, and forms
        designed for Indian mobile numbers. We aim to feel local everywhere it
        matters.
      </p>
    </StaticPage>
  );
}
