const fs = require("fs");
const t = fs.readFileSync("supabase/seed.sql", "utf8");
const slugs = [];
const re = /values\s*\n\s*\('[^']*','([a-z0-9-]+)'/g;
let m;
while ((m = re.exec(t)) !== null) slugs.push(m[1]);
console.log("Slugs found in insert values:", slugs.length);
const uniq = [...new Set(slugs)];
console.log("Unique slugs:", uniq.length);
const dupes = slugs.filter((s, i) => slugs.indexOf(s) !== i);
console.log("Duplicate slugs:", dupes);
const src = fs.readFileSync("src/data/products.ts", "utf8");
const srcSlugs = [...src.matchAll(/slug:\s*"([a-z0-9-]+)"/g)].map((m) => m[1]);
console.log("Source slugs:", srcSlugs.length, "unique:", new Set(srcSlugs).size);
const missing = srcSlugs.filter((s) => !uniq.includes(s));
console.log("Missing from seed:", missing);
console.log("Extra in seed  :", uniq.filter((s) => !srcSlugs.includes(s)));
// Per-product tag/category sanity: count insert into public.product_colors rows vs source variants
const colors = (t.match(/insert into public\.product_colors\b/g) || []).length;
const sizes = (t.match(/insert into public\.product_sizes\b/g) || []).length;
const pc = (t.match(/insert into public\.product_collections\b/g) || []).length;
const pw = (t.match(/insert into public\.product_warehouses\b/g) || []).length;
console.log("product_colors inserts:", colors);
console.log("product_sizes  inserts:", sizes);
console.log("product_collections inserts:", pc);
console.log("product_warehouses      inserts:", pw);
// Should match: 26 product_warehouses (one per product); pc = sum of collections referenced

// Tail/marketing sanity
console.log("---- tail/marketing presence ----");
console.log("WELCOME10 coupon:", t.includes("'WELCOME10'"));
console.log("ASC-7QX2K9FP order:", t.includes("ASC-7QX2K9FP"));
console.log("Mid-season polo markdown flash sale:", t.includes("Mid-season polo markdown"));
console.log("Tee + Polo starter bundle:", t.includes("Tee + Polo starter"));
console.log("GIFT-AB12CD gift card:", t.includes("GIFT-AB12CD"));
console.log("admin promo footer:", t.includes("update public.profiles set role"));
console.log("Antonios brand inserted:", t.includes("('Antonios','antonios')"));
