import type { NextConfig } from "next";

const config: NextConfig = {
  experimental: {
    // Las fotos llegan ya achicadas desde el celular, pero dejamos margen.
    serverActions: { bodySizeLimit: "8mb" },
  },
};

export default config;
