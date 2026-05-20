import type { Metadata } from "next";

import { ContactForm } from "./ContactForm";
import { StaticPage } from "../../components/domain/StaticPage";

export const metadata: Metadata = {
  title: "Contact — Storm",
  description: "Get in touch with Storm support.",
};

export default function ContactPage() {
  return (
    <StaticPage
      title="Contact us"
      intro="We aim to respond within one business day."
    >
      <h2>Reach the team</h2>
      <ul>
        <li>
          Email: <a href="mailto:support@storm.example">support@storm.example</a>
        </li>
        <li>Phone: +91 80 0000 0000 (Mon–Sat, 9am–7pm IST)</li>
        <li>
          Registered office: Storm Commerce Pvt. Ltd., Bengaluru, Karnataka, India
        </li>
      </ul>
      <h2>Send a message</h2>
      <ContactForm />
    </StaticPage>
  );
}
