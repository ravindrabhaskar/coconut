import Link from "next/link";
import type { ReactNode } from "react";
import { Container, cx } from "@/components/ui/primitives";
import { Logo } from "./header";
import { PalmFrond } from "@/components/ui/decor";
import { repo } from "@/services/repository";
import { NAV_STATIC, type NavGroup } from "./nav-data";
import { Header } from "./header";

/** Server component: assembles navigation from the database and renders the client header. */
export async function SiteHeader() {
  const [components, products, categories, processes, states] = await Promise.all([repo.components(), repo.products(), repo.categories(), repo.processes(), repo.states()]);
  const nav: NavGroup[] = NAV_STATIC.map((g) => ({ ...g, columns: g.columns.map((c) => ({ ...c, items: [...c.items] })) }));
  const by = (label: string) => nav.find((g) => g.label === label)!;
  const explore = by("Explore");
  explore.columns[1].items = components.filter((c) => c.origin === "fruit").map((c) => ({ label: c.name.replace(/ (.*)/, ""), href: `/explore/${c.slug}` }));
  explore.columns[2].items = components.filter((c) => c.origin === "palm").map((c) => ({ label: c.name, href: `/explore/${c.slug}` }));
  const prod = by("Products");
  prod.columns[0].items = categories.map((c) => ({ label: c.name, href: `/products/category/${c.slug}` }));
  prod.columns[1].items = products.slice(0, 9).map((p) => ({ label: p.name, href: `/products/${p.slug}` }));
  by("Processing").columns[1].items = processes.slice(0, 8).map((p) => ({ label: p.name, href: `/processing/${p.slug}` }));
  by("Locations").columns[1].items = states.map((s) => ({ label: s.name, href: `/india/${s.slug}` }));
  return <Header nav={nav} />;
}

export async function SiteFooter() {
  const [components, products] = await Promise.all([repo.components(), repo.products()]);
  return (
    <footer className="surface-charcoal mt-0">
      <div aria-hidden="true" className="h-1 w-full bg-accent" />
      <Container className="relative z-[1] py-16">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-3 text-ivory-50"><Logo className="h-8 w-8" /><span className="t-display text-xl">COCONUT</span></div>
            <p className="mt-5 max-w-[42ch] text-ivory-100/70 text-[0.95rem] leading-relaxed">A database-driven operating system for understanding and building the coconut industry — every component, material stream, product, process, machine, factory, customer, market, business model, opportunity and risk.</p>
            <p className="mt-6 max-w-[42ch] rounded-[var(--radius-card)] border border-white/10 bg-white/5 px-4 py-3 t-caption text-ivory-100/60">Every number carries an evidence label. Missing data is shown as RESEARCH REQUIRED — never invented. Planning outputs are conceptual and require professional validation. Nothing here is investment advice.</p>
          </div>
          <FooterCol title="Components" items={components.map((c) => ({ label: c.name, href: `/explore/${c.slug}` }))} />
          <FooterCol title="Products" items={products.slice(0, 12).map((p) => ({ label: p.name, href: `/products/${p.slug}` }))} />
          <FooterCol title="Platform" items={[{ label: "Processing", href: "/processing" }, { label: "Machinery", href: "/machinery" }, { label: "Factory", href: "/factory" }, { label: "Business", href: "/business" }, { label: "Markets", href: "/markets" }, { label: "Locations", href: "/locations" }, { label: "Research", href: "/research" }, { label: "Tools", href: "/tools" }, { label: "Methodology", href: "/methodology" }, { label: "Admin", href: "/admin" }]} />
        </div>
        <div className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-ivory-100/10 pt-6 t-caption text-ivory-100/50">
          <span>THE FUTURE OF COCONUT IS NOT ONE PRODUCT. IT IS THE ENTIRE ECOSYSTEM.</span>
          <span>© {new Date().getFullYear()} COCONUT platform</span>
        </div>
      </Container>
    </footer>
  );
}

function FooterCol({ title, items }: { title: string; items: { label: string; href: string }[] }) {
  return (
    <div>
      <p className="t-overline text-lime-400">{title}</p>
      <ul className="mt-4 space-y-2">{items.map((i) => <li key={i.href}><Link href={i.href} className="text-[0.9rem] text-ivory-100/75 hover:text-ivory-50">{i.label}</Link></li>)}</ul>
    </div>
  );
}

export function Breadcrumbs({ items, dark, className }: { items: { label: string; href?: string }[]; dark?: boolean; className?: string }) {
  return (
    <nav aria-label="Breadcrumb" className={cx("t-caption", dark && "text-ivory-100/70", className)}>
      <ol className={cx("inline-flex flex-wrap items-center gap-1.5 rounded-full border px-3 py-1.5", dark ? "border-white/15 bg-white/5" : "border-neutral-200 bg-cocos")}>
        <li><Link href="/" className="hover:underline">Home</Link></li>
        {items.map((it, i) => (
          <li key={i} className="flex items-center gap-1.5">
            <span aria-hidden="true" className="opacity-50">→</span>
            {it.href ? <Link href={it.href} className="hover:underline">{it.label}</Link> : <span aria-current="page" className={dark ? "text-ivory-50" : "text-neutral-900"}>{it.label}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function PrevNext({ prev, next, label }: { prev?: { name: string; href: string }; next?: { name: string; href: string }; label: string }) {
  if (!prev && !next) return null;
  return (
    <nav aria-label={`${label} navigation`} className="grid gap-4 sm:grid-cols-2">
      {prev ? <Link href={prev.href} className="group card card-hover p-5"><span className="t-overline text-neutral-500">← Previous {label}</span><span className="t-h4 mt-1 block group-hover:underline">{prev.name}</span></Link> : <span />}
      {next && <Link href={next.href} className="group card card-hover p-5 text-right"><span className="t-overline text-neutral-500">Next {label} →</span><span className="t-h4 mt-1 block group-hover:underline">{next.name}</span></Link>}
    </nav>
  );
}

export function PageIntro({ overline, title, lede, breadcrumbs, children, dark = true }: { overline?: string; title: ReactNode; lede?: ReactNode; breadcrumbs?: { label: string; href?: string }[]; children?: ReactNode; dark?: boolean }) {
  return (
    <div className={cx(dark ? "surface-hero" : "surface-tropical", "pt-8 pb-14 md:pt-10 md:pb-20 overflow-hidden")}>
      {dark ? <div aria-hidden="true" className="pattern-dots absolute inset-0 opacity-60 [mask-image:radial-gradient(70%_60%_at_80%_20%,#000,transparent)]" /> : <PalmFrond flip className="-right-24 -top-16 h-[420px] w-[420px] opacity-[0.14]" />}
      <Container className="relative z-[1]">
        {breadcrumbs && <Breadcrumbs items={breadcrumbs} dark={dark} className="mb-8" />}
        {overline && <p className={cx("t-overline mb-4 flex items-center gap-3", dark ? "text-lime-400" : "text-leaf-500")}><span className="h-px w-6 bg-accent" aria-hidden="true" />{overline}</p>}
        <h1 className={cx("t-h1 max-w-[18ch]", dark && "text-ivory-50")}>{title}</h1>
        <span className="rule-accent mt-6" aria-hidden="true" />
        {lede && <p className={cx("t-body-lg mt-6 max-w-[62ch]", dark ? "text-ivory-100/75" : "text-neutral-700")}>{lede}</p>}
        {children}
      </Container>
    </div>
  );
}
