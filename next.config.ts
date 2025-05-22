import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      // Allow images from the Supabase storage
      "supabasekong-swogg0csoo4kwk8wk800woog.138.201.120.43.sslip.io",
    ],
  },
};

export default nextConfig;
