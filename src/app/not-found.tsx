import Link from "next/link";
import { Container, LinkButton } from "@/components/ui/primitives";
import { SearchBox } from "@/components/features/search-box";

export default function NotFound() {
  return (
    <section className="surface-ivory py-[var(--spacing-section)]">
      <Container>
        <p className="t-overline text-leaf-500">404</p>
        <h1 className="t-h1 mt-3 max-w-[16ch]">This page is not in the knowledge graph.</h1>
        <p className="mt-5 max-w-[52ch] text-neutral-700">The entity may have been renamed, unpublished, or never existed. Search the platform or start from a component.</p>
        <div className="mt-8 max-w-2xl"><SearchBox /></div>
        <div className="mt-8 flex flex-wrap gap-3"><LinkButton href="/explore">Explore the coconut</LinkButton><LinkButton href="/products" variant="ghost">All products</LinkButton><Link href="/" className="t-cta self-center px-2">Home</Link></div>
      </Container>
    </section>
  );
}
