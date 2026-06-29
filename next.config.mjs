// Security headers applied to every response.
const securityHeaders = [
  // Force HTTPS for two years, including subdomains.
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // Stop browsers MIME-sniffing responses away from their declared type.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Disallow the site being framed (clickjacking protection).
  { key: "X-Frame-Options", value: "DENY" },
  // Don't leak full URLs to other origins.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Lock down powerful browser features we don't use.
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
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
