import { StaticPage } from "@/components/StaticPage";

export default function Page() {
  return (<StaticPage title="Frequently Asked Questions" sections={[{ heading: "How long does shipping take?", body: "Standard orders ship in 1-2 business days and arrive within 3-5 business days. Express options are available at checkout." },{ heading: "What is your return policy?", body: "We accept unworn items with tags within 30 days of delivery for a full refund. Final sale items are not eligible." },{ heading: "How do I find my size?", body: "See our Size Guide page for full measurements. If you are between sizes, size up for relaxed fits and size down for tailored ones." },{ heading: "Do you ship internationally?", body: "Yes, we ship to over 60 countries. Duties may apply and are calculated at checkout." },]} />);
}
