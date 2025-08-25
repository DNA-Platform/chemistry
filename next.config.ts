import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /**
   * Static export for GitHub Pages
   */
  output: 'export',
  
  /**
   * Custom output directory
   */
  distDir: 'site',
  
  /**
   * Add trailing slash for better static file serving
   */
  trailingSlash: true,
  
  /**
   * Disable image optimization for static export
   */
  images: {
    unoptimized: true,
  },
  
  /**
   * Optional: Set base path for GitHub Pages subpath
   * Comment out for now since we're testing locally
   */
  // basePath: '/inexplicable-phenomena',
}

export default nextConfig