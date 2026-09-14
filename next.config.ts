import type { NextConfig } from "next";

/**
 * Permanent redirects preserve every pre-IA-v2 URL (see docs/07-audit-and-ia-v2.md).
 * Old: /manufacturing/* (processes + calculators), /compare, /opportunities/{finder,business-builder}.
 */
const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/manufacturing", destination: "/factory", permanent: true },
      { source: "/manufacturing/processes", destination: "/processing", permanent: true },
      { source: "/manufacturing/processes/:slug", destination: "/processing/:slug", permanent: true },
      { source: "/manufacturing/factory-planner", destination: "/tools/factory-planner", permanent: true },
      { source: "/manufacturing/mass-balance", destination: "/tools/mass-balance", permanent: true },
      { source: "/manufacturing/financial-model", destination: "/tools/financial-model", permanent: true },
      { source: "/manufacturing/land-calculator", destination: "/tools/land-calculator", permanent: true },
      { source: "/manufacturing/manpower", destination: "/tools/manpower", permanent: true },
      { source: "/compare", destination: "/tools/compare", permanent: true },
      { source: "/opportunities/finder", destination: "/tools/opportunity-finder", permanent: true },
      { source: "/opportunities/business-builder", destination: "/tools/business-builder", permanent: true },
      { source: "/components/:slug", destination: "/explore/:slug", permanent: true },
    ];
  },
};

export default nextConfig;
