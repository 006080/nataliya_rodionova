import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],

  // Base URL for your project (useful for deployment to subdirectories)
  base: '/',

  // Configure server options
  server: {
    host: true, // Enable to expose the server on your local network
    port: 5173, // Change the port if needed
    open: true, // Automatically open the browser on server start

    // Setup a proxy for API requests to avoid CORS issues
    proxy: {
      '/api': {
        target: process.env.NODE_ENV === 'production' ? 'https://www.nataliyarodionova.com' : 'http://localhost:4000', // Check the environment
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''), // Removes '/api' prefix
      },
    },
  },

  // Resolve absolute imports for easier imports
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // Use '@' to refer to the 'src' folder
    },
  },

  // Configure build options
  build: {
    outDir: 'dist', // Output directory
    sourcemap: true, // Enable source maps for debugging
    chunkSizeWarningLimit: 1000, // Increase limit to avoid warnings for large chunks
  },

  // Enable CSS preprocessor options (if needed)
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/variables.scss";`, // Global SCSS variables
      },
    },
  },
});
