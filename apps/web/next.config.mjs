const apiUrl = process.env.API_URL || 'http://localhost:4000';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Web y API en el mismo dominio: /api/* se reenvía a Express.
  // Así la cookie de sesión es de primera parte y no hace falta CORS (docs/arquitectura.md).
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
