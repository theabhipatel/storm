import type { Metadata } from "next";

import {
  PlaceholderNotice,
  StaticPage,
} from "../../components/domain/StaticPage";

export const metadata: Metadata = {
  title: "Terms of Service — Storm",
};

export default function TermsPage() {
  return (
    <StaticPage title="Terms of Service" intro="Last updated: May 2026.">
      <PlaceholderNotice>
        Placeholder draft — to be reviewed by legal counsel before launch.
        This text is not yet binding.
      </PlaceholderNotice>
      <h2>Use of the platform</h2>
      <p>
        By using Storm you agree to provide accurate information, pay for the
        items you order, and use the service only for lawful personal purposes.
      </p>
      <h2>Pricing and taxes</h2>
      <p>
        All prices are in Indian rupees and inclusive of applicable taxes
        unless otherwise stated. We reserve the right to correct typographical
        errors before dispatch.
      </p>
      <h2>Cancellations</h2>
      <p>
        You can cancel an order any time before it enters processing. After
        processing, contact support for assistance.
      </p>
      <h2>Limitation of liability</h2>
      <p>
        Our liability is limited to the value of the order in question. We are
        not responsible for indirect or consequential losses.
      </p>
    </StaticPage>
  );
}
