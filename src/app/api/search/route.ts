import { NextResponse } from "next/server";
import { search, autocomplete } from "@/services/search";
import type { EntityType } from "@/domain/types";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q") ?? "";
  if (url.searchParams.get("ac")) return NextResponse.json({ results: await autocomplete(q) });
  const types = url.searchParams.get("types")?.split(",").filter(Boolean) as EntityType[] | undefined;
  const limit = Number(url.searchParams.get("limit") ?? 50);
  return NextResponse.json({ query: q, results: await search(q, { types, limit }) });
}
