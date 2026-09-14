"use client";

import { Container, Button, LinkButton } from "@/components/ui/primitives";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="surface-ivory py-[var(--spacing-section)]">
      <Container>
        <p className="t-overline text-danger">Error</p>
        <h1 className="t-h1 mt-3 max-w-[16ch]">Something failed while rendering.</h1>
        <p className="mt-5 max-w-[52ch] text-neutral-700">The error has been contained to this page. You can retry, or return to a stable entry point. {error.digest && <span className="t-data block mt-2">Reference: {error.digest}</span>}</p>
        <div className="mt-8 flex flex-wrap gap-3"><Button onClick={reset}>Try again</Button><LinkButton href="/" variant="ghost">Home</LinkButton></div>
      </Container>
    </section>
  );
}
