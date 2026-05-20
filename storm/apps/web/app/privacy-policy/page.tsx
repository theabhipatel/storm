import type { Metadata } from "next";

import {
  PlaceholderNotice,
  StaticPage,
} from "../../components/domain/StaticPage";

export const metadata: Metadata = {
  title: "Privacy Policy — Storm",
};

export default function PrivacyPolicyPage() {
  return (
    <StaticPage title="Privacy Policy" intro="Last updated: May 2026.">
      <PlaceholderNotice>
        Placeholder draft — to be reviewed by legal counsel before launch.
        This text is not yet binding.
      </PlaceholderNotice>
      <h2>What we collect</h2>
      <p>
        Account details (name, email, mobile), addresses, order history, and
        payment metadata (tokenised via Razorpay). We never store full card
        numbers or CVVs.
      </p>
      <h2>How we use it</h2>
      <p>
        To fulfil your orders, send transactional messages, prevent fraud, and
        improve the product. We do not sell your data.
      </p>
      <h2>Cookies</h2>
      <p>
        We use essential cookies for sign-in and your cart. Optional analytics
        cookies will be introduced in a future release with separate consent
        controls.
      </p>
      <h2>Your rights</h2>
      <p>
        You may request access, correction, or deletion of your data at any
        time by emailing privacy@storm.example. We respond within 30 days.
      </p>
    </StaticPage>
  );
}
