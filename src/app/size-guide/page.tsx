import { StaticPage } from "@/components/StaticPage";

export default function Page() {
  return (<StaticPage title="Size Guide" subtitle="Measurements are in inches and refer to body, not garment." sections={[{ heading: "Tops", body: "XS: 31-33 chest / S: 34-36 / M: 38-40 / L: 42-44 / XL: 46-48." },{ heading: "Bottoms (waist)", body: "28 / 30 / 32 / 34 / 36 correspond to natural waist measurements." },{ heading: "Shoes", body: "Sizes are US. EU: 7=40, 8=41, 9=42, 10=43, 11=44, 12=45." },{ heading: "How to measure", body: "Chest: measure around the fullest part. Waist: around the natural waistline. Inseam: from crotch to ankle." },]} />);
}
