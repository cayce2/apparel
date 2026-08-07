import { supabaseServer } from "@/lib/supabase";
import { ok, serverError } from "@/lib/api/responses";

// GET /api/marketing — aggregates coupons, flash sales, bundles, gift cards, affiliates, email campaigns.
export async function GET() {
  const client = supabaseServer();
  const [coupons, flash, bundles, giftCards, affiliates, campaigns] = await Promise.all([
    client.from("coupons").select("*").order("active", { ascending: false }),
    client.from("flash_sales").select("*").order("active", { ascending: false }),
    client.from("bundles").select("*").order("active", { ascending: false }),
    client.from("gift_cards").select("*"),
    client.from("affiliates").select("*"),
    client.from("email_campaigns").select("*"),
  ]);
  if (coupons.error) return serverError(coupons.error.message);
  return ok({
    coupons: coupons.data ?? [],
    flashSales: flash.data ?? [],
    bundles: bundles.data ?? [],
    giftCards: giftCards.data ?? [],
    affiliates: affiliates.data ?? [],
    emailCampaigns: campaigns.data ?? [],
  });
}
