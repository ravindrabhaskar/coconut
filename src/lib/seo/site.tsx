import type { Metadata } from "next";

export const SITE = {
  name: "COCONUT",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  description: "A database-driven platform for the complete coconut industry — every component, material stream, product, process, machine, factory, customer, market, business model, opportunity and risk, with evidence-labelled data.",
};

export function pageMetadata(opts: { title: string; description: string; path: string; type?: "website" | "article" }): Metadata {
  const url = `${SITE.url}${opts.path}`;
  return {
    title: opts.title,
    description: opts.description,
    alternates: { canonical: url },
    openGraph: { title: opts.title, description: opts.description, url, type: opts.type ?? "website", siteName: SITE.name },
    twitter: { card: "summary_large_image", title: opts.title, description: opts.description },
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: SITE.url }, ...items.map((it, i) => ({ "@type": "ListItem", position: i + 2, name: it.name, item: `${SITE.url}${it.path}` }))],
  };
}

export function articleJsonLd(opts: { headline: string; description: string; path: string; datePublished: string; dateModified: string; about?: string[] }) {
  return {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: opts.headline,
    description: opts.description,
    url: `${SITE.url}${opts.path}`,
    datePublished: opts.datePublished,
    dateModified: opts.dateModified,
    author: { "@type": "Organization", name: SITE.name },
    publisher: { "@type": "Organization", name: SITE.name },
    about: opts.about,
  };
}

export function faqJsonLd(faqs: { q: string; a: string }[]) {
  if (!faqs.length) return null;
  return { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) };
}

export function JsonLd({ data }: { data: object | null }) {
  if (!data) return null;
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
