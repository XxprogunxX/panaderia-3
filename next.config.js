/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['vvtqfedsnthxeqaejhzg.supabase.co'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'vvtqfedsnthxeqaejhzg.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
}

module.exports = nextConfig 