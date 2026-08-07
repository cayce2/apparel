import Link from "next/link";
import { Instagram, Twitter, Facebook } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-24 border-t">
      <div className="container-page grid gap-12 py-16 md:grid-cols-4">
        <div>
          <div className="font-display text-xl tracking-[0.2em]">ATELIER</div>
          <p className="mt-4 text-sm text-muted-foreground">Considered essentials. Made to last, designed to fit your life.</p>
        </div>
        {[
          { title: "Shop", links: [["New Arrivals", "/shop?filter=new"], ["Best Sellers", "/shop?sort=popular"], ["Sale", "/shop?filter=sale"], ["Collections", "/collections"]] },
          { title: "Help", links: [["Shipping", "/shipping"], ["Returns", "/returns"], ["Size Guide", "/size-guide"], ["Contact", "/contact"]] },
          { title: "Company", links: [["About", "/about"], ["FAQ", "/faq"], ["Privacy", "/privacy"], ["Terms", "/terms"]] },
          { title: "Account", links: [["My account", "/account"], ["Admin", "/admin"], ["Help", "/contact"]] },
        ].map((col) => (
          <div key={col.title}>
            <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{col.title}</h3>
            <ul className="mt-4 space-y-2">
              {col.links.map(([label, href]) => (
                <li key={href}><Link href={href} className="text-sm text-foreground/80 hover:text-foreground">{label}</Link></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="container-page flex items-center justify-between border-t py-6 text-xs text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Atelier. All rights reserved.</p>
        <div className="flex gap-4"><Instagram size={16} /><Twitter size={16} /><Facebook size={16} /></div>
      </div>
    </footer>
  );
}
