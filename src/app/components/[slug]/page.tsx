import { redirect } from "next/navigation";

/** Alias: /components/[slug] -> /explore/[slug] */
export default async function ComponentAlias({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  redirect(`/explore/${slug}`);
}
