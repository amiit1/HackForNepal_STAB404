
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'd39tecv29ke92n.cloudfront.net',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'encrypted-tbn0.gstatic.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.britannica.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.pinimg.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'thelivestocktraders.nl',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'docs.krishnayangauraksha.org',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'drive.google.com', // Added for Google Drive logo
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.facebook.com', // Added for Facebook media links
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'scontent.fktm17-1.fna.fbcdn.net', // Added for CowWeightCalculatorDialog image
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.edufarmers.org',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i0.wp.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'vossenagriculture.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'nadis.org.uk',
        port: '',
        pathname: '/**',
      }
    ],
  },
};

export default nextConfig;
