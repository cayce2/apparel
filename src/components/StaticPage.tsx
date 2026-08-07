"use client";
export function StaticPage({ title, subtitle, sections }: { title: string; subtitle?: string; sections: { heading: string; body: string }[] }) {
  return (
    <div className="container-page mt-16 max-w-3xl">
      <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Atelier</p>
      <h1 className="mt-2 font-display text-5xl">{title}</h1>
      {subtitle && <p className="mt-4 text-lg text-muted-foreground">{subtitle}</p>}
      <div className="mt-10 space-y-8">
        {sections.map((s) => (
          <section key={s.heading}>
            <h2 className="font-display text-2xl">{s.heading}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}

export function ContactPage() {
  return (
    <div className="container-page mt-16 max-w-3xl">
      <h1 className="font-display text-5xl">Contact us</h1>
      <p className="mt-4 text-muted-foreground">Questions about an order or a product? We are here to help.</p>
      <div className="mt-10 grid gap-8 md:grid-cols-2">
        <div className="space-y-4 text-sm text-muted-foreground">
          <p><strong className="block text-foreground">Email</strong> hello@atelier.example</p>
          <p><strong className="block text-foreground">Phone</strong> +1 (555) 010-2025</p>
          <p><strong className="block text-foreground">Hours</strong> Mon-Fri, 9am-6pm</p>
          <p><strong className="block text-foreground">Flagship Store</strong> 123 Mercer Street, New York</p>
        </div>
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <input className="input" placeholder="Name" />
          <input className="input" type="email" placeholder="Email" />
          <textarea className="input min-h-32" placeholder="Message" />
          <button className="btn-primary w-full">Send message</button>
        </form>
      </div>
    </div>
  );
}
