import { StaticPage } from "@/components/StaticPage";

export default function Page() {
  return (<StaticPage title="Return Policy" sections={[{ heading: "Eligibility", body: "Items must be unworn, unwashed, and with original tags. Returns accepted within 30 days of delivery." },{ heading: "How to return", body: "Initiate a return from your account or by contacting support. We will email a prepaid label." },{ heading: "Refunds", body: "Refunds are issued to the original payment method within 5-7 business days of receipt." },]} />);
}
