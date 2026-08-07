import { ShopClient } from "./ShopClient";

export default async function ShopPage({ searchParams }: { searchParams: Promise<{ category?: string; filter?: string; sort?: string; q?: string }> }) {
  const params = await searchParams;
  return <ShopClient initialParams={params} />;
}
