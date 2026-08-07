const fs = require("fs");
const t = fs.readFileSync("supabase/seed.sql", "utf8");
// Look for unescaped apostrophe patterns: '', which is the SQL escape.
// Real unescaped apostrophes would be a single ' not preceded by another '.
// We check string literals inside the products insert values block.
// Quick smoke: count apostrophes per line and warn on suspicious patterns.
const lines = t.split("\n");
let problems = 0;
for (const ln of lines) {
  // Heuristic: any single apostrophe (not part of '') inside a quoted SQL string literal.
  // This is hard to check precisely without a SQL parser; instead look for triple-single-quote or
  // a quote followed by spaces/letters that suggests we escaped wrongly.
  if (/{''}''/.test(ln) || /'''/.test(ln)) {
    console.log("SUSPECT:", ln);
    problems++;
  }
}
console.log("Suspicious patterns:", problems);
// Verify the do/end balance and count of all "insert into" statements
const inserts = (t.match(/insert into public\./g) || []).length;
console.log("Total 'insert into public.' statements:", inserts);
// Should equal: 1 (brands) + 1 (categories) + 1 (collections) + 1 (warehouses) +
//               26 products + 114 colors + 114 sizes + 26 product_collections + 26 product_warehouses +
//               2 reviews + 4 orders + 4 order_items (multi-row but counts as 1 each? no - multi-values
//               count as 1 insert statement) + 4 order_items inserts +
//               1 coupons + 2 flash_sales + 1 bundles + 1 gift_cards + 1 affiliates + 1 email_campaigns +
//               2 inventory_adjustments = ~228
// (Some inserts have multi-value rows but each `insert into` keyword counts as 1.)
