import { StaticPage } from "@/components/StaticPage";

export default function Page() {
  return (<StaticPage title="About Us" subtitle="Atelier was founded on a single principle: make fewer, better things. Each piece is designed in-house and made in small batches by partners we visit every year." sections={[{ heading: "Our story", body: "We started in a tiny studio in 2018, frustrated by fast fashion and the throwaway culture it created. We wanted clothes that felt like they belonged to a wardrobe for ten years, not ten weeks." },{ heading: "Our standards", body: "Natural fibers first. Recycled where possible. Every garment is pre-washed, thread-checked, and stress-tested before it ships." },{ heading: "Our makers", body: "We work with family-run workshops in Portugal, India, and Japan, paying fair wages above the local living wage and supporting apprenticeship programs." },]} />);
}
