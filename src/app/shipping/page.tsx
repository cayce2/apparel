import { StaticPage } from "@/components/StaticPage";

export default function Page() {
  return (<StaticPage title="Shipping Policy" sections={[{ heading: "Processing", body: "Orders are processed within 1-2 business days. You will receive a tracking number by email once your order ships." },{ heading: "Domestic", body: "Free standard shipping on orders over . Flat  below. Express ." },{ heading: "International", body: "Calculated at checkout. Delivery 7-14 business days. Customs duties may apply." },]} />);
}
