import type { Metadata } from "next";

import { StaticPage } from "../../components/domain/StaticPage";

export const metadata: Metadata = {
  title: "FAQ — Storm",
};

const faqs: { q: string; a: string }[] = [
  {
    q: "How do I create an account?",
    a: "Click Sign up, enter your name, email and mobile number, set a password, and verify the email link we send you.",
  },
  {
    q: "Which payment methods do you support?",
    a: "UPI, debit and credit cards, and netbanking via Razorpay. We do not store your card details.",
  },
  {
    q: "Where do you deliver?",
    a: "We deliver to 18,000+ pin codes across India. Enter your pin code at checkout to confirm availability.",
  },
  {
    q: "How long does delivery take?",
    a: "3–5 business days for metros, 5–7 for other pin codes, and up to 10 for remote pin codes.",
  },
  {
    q: "What are the delivery charges?",
    a: "Flat ₹50 per order. Free delivery on orders above ₹500.",
  },
  {
    q: "Can I cancel my order?",
    a: "Yes, any time before it enters processing. After that, please contact support.",
  },
  {
    q: "Can I return an item?",
    a: "Returns will be available in an upcoming release. In the meantime, reach support@storm.example for help.",
  },
  {
    q: "How do I track my order?",
    a: "Open Orders from your account, or follow the link in the order confirmation email.",
  },
  {
    q: "How do I change my saved addresses?",
    a: "Go to Account → Addresses to add, edit, or remove addresses.",
  },
  {
    q: "How do I contact support?",
    a: "Email support@storm.example or call +91 80 0000 0000, Mon–Sat, 9am–7pm IST.",
  },
];

export default function FaqPage() {
  return (
    <StaticPage title="Frequently asked questions">
      <ol>
        {faqs.map((f) => (
          <li key={f.q}>
            <h3 className="mb-1 text-base font-semibold text-neutral-900">
              {f.q}
            </h3>
            <p>{f.a}</p>
          </li>
        ))}
      </ol>
    </StaticPage>
  );
}
