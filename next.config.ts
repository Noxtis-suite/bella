import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      // Allow images from the Supabase storage
      "aylbdzyhadioauxeptum.supabase.co",
    ],
  },
};

export default nextConfig;
