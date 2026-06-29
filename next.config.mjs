/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        // Old WordPress slug → new Sponsor page. Explicit 301 to preserve SEO
        // (Next's `permanent: true` would emit 308; the brief asks for 301).
        source: "/advertise-with-us",
        destination: "/sponsor",
        statusCode: 301,
      },
    ];
  },
};

export default nextConfig;
