import { StaticPage } from "@/components/StaticPage";

export default function Page() {
  return (<StaticPage title="Terms & Conditions" sections={[{ heading: "Use of site", body: "By using this site you agree to these terms. Content is for personal, non-commercial use." },{ heading: "Pricing", body: "We reserve the right to correct pricing errors. Prices are in USD unless otherwise noted." },{ heading: "Liability", body: "Atelier is not liable for indirect or consequential damages arising from use of this site." },]} />);
}
