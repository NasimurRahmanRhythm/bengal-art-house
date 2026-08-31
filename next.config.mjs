// Pictures uploaded through the admin panel are served from the Supabase
// Storage bucket, so next/image has to be told that host is allowed. It is
// derived from the environment rather than written out, because the project
// ref differs between the local, staging and production databases — hardcoding
// one means the other two throw "hostname is not configured" at render time.
const supabaseHost = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname;
  } catch {
    return null; // no credentials in this environment; nothing remote to allow
  }
})();

const nextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: supabaseHost
      ? [{ protocol: "https", hostname: supabaseHost, pathname: "/storage/v1/object/public/**" }]
      : [],
  },
};

export default nextConfig;
