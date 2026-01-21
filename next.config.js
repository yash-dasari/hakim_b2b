const withNextIntl = require('next-intl/plugin')('./i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,


    // Tell Next.js it's served under /portal
  // basePath: '/portal',
  // Enable standalone output for Docker builds (Dockerfile expects .next/standalone)
  // Always enable standalone output since Docker build requires it
  output: 'standalone', 
  images: {
    domains: ['localhost', '147.93.72.229', 'api.hakimcarservice.com', 'dev-api.hakimauto.com'],
  },

  // API routes removed - using external API instead
  // Headers configuration removed as there are no local API routes
  
  // Exclude pages/api from webpack compilation
  webpack: (config, { isServer, webpack }) => {
    // Ignore pages/api directory files completely
    // This prevents Next.js from trying to compile API route files
    config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(
        /^.*pages[\\/]api[\\/].*$/,
        (resource) => {
          // Replace API route files with an empty module
          resource.request = 'next/dist/compiled/empty-module';
        }
      )
    );
    
    // Also ignore mockData imports from pages/api
    config.plugins.push(
      new webpack.IgnorePlugin({
        checkResource(resource, context) {
          // If the context is in pages/api and trying to import mockData
          if (context && context.includes('pages/api')) {
            if (resource.includes('mockData') || resource.includes('data/mockData')) {
              return true;
            }
          }
          return false;
        }
      })
    );
    
    return config;
  },
  
  // Experimental feature to exclude pages/api
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },

  // Environment variables for different environments
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  },
};

module.exports = withNextIntl(nextConfig);