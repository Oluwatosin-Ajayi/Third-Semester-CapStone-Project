import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ymlxmmbytwgtcpowbwwt.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "nextjs.org",
        port: "",
        pathname: "/icons/**",
      },
    ],
  },
};

export default nextConfig;