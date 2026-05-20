import type { Metadata } from "next";

import {
  PlaceholderNotice,
  StaticPage,
} from "../../components/domain/StaticPage";

export const metadata: Metadata = {
  title: "Shipping Policy — Storm",
};

export default function ShippingPolicyPage() {
  return (
    <StaticPage title="Shipping Policy" intro="Indicative timelines and fees.">
      <PlaceholderNotice>
        Placeholder — final logistics terms will be confirmed with delivery
        partners before launch.
      </PlaceholderNotice>
      <h2>Delivery charges</h2>
      <ul>
        <li>Flat ₹50 per order.</li>
        <li>Free delivery on orders above ₹500.</li>
      </ul>
      <h2>Timelines</h2>
      <ul>
        <li>Metros: 3–5 business days.</li>
        <li>Other pin codes: 5–7 business days.</li>
        <li>Remote pin codes: up to 10 business days.</li>
      </ul>
      <h2>Tracking</h2>
      <p>
        You will receive shipping updates by email and SMS as your order moves
        through processing, shipping, and delivery.
      </p>
    </StaticPage>
  );
}
