import { Container } from "@/components/ui/primitives";
import { login } from "../actions";

export const metadata = { title: "Admin login", robots: { index: false } };

export default async function AdminLogin({ searchParams }: { searchParams: Promise<{ error?: string; next?: string }> }) {
  const sp = await searchParams;
  const configured = !!process.env.ADMIN_PASSWORD;
  return (
    <section className="surface-ivory py-[var(--spacing-section)]">
      <Container>
        <div className="max-w-md">
          <p className="t-overline text-leaf-500">Administration</p>
          <h1 className="t-h2 mt-2">Sign in.</h1>
          {!configured && <p className="mt-4 rounded border border-amber-500/50 bg-amber-500/10 p-3 text-[0.9rem]">ADMIN_PASSWORD is not set. Add it to .env to enable the admin layer.</p>}
          {sp.error && <p className="mt-4 text-[0.9rem] text-danger">Incorrect password.</p>}
          <form action={login} className="mt-6 space-y-4">
            <input type="hidden" name="next" value={sp.next ?? "/admin"} />
            <label className="block"><span className="t-overline text-neutral-500 block mb-1.5">Password</span><input name="password" type="password" required className="tap w-full rounded-[var(--radius-control)] border border-neutral-300 bg-white px-3 py-2.5" /></label>
            <button className="tap rounded-[var(--radius-control)] bg-coconut-950 px-6 py-3 text-ivory-50 t-cta text-xs" disabled={!configured}>Sign in</button>
          </form>
        </div>
      </Container>
    </section>
  );
}
