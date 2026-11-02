import type { NextConfig } from "next";

const repo = process.env.GITHUB_REPOSITORY?.split("/")[1];

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath: repo && !repo.endsWith(".github.io") ? `/${repo}` : "",
  images: { unoptimized: true },
  turbopack: { root: process.cwd() },
};

export default nextConfig;
