import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets the ngrok tunnel load dev-only resources (hot reload). Has no effect on `next build`/`next start`.
  allowedDevOrigins: ['uncaressed-bully-onita.ngrok-free.dev'],
};

export default nextConfig;
