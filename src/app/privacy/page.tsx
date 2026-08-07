import { StaticPage } from "@/components/StaticPage";

export default function Page() {
  return (<StaticPage title="Privacy Policy" sections={[{ heading: "What we collect", body: "Name, email, shipping address, and order history. Payment data is handled entirely by our payment processors." },{ heading: "How we use it", body: "To fulfill orders, prevent fraud, and send transactional emails. Marketing emails require opt-in." },{ heading: "Your rights", body: "You may request access, correction, or deletion of your data at any time." },]} />);
}
