import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { compression } from 'vite-plugin-compression2';
import path from 'path';

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    tailwindcss(),
    // Brotli compression for modern browsers
    compression({
      algorithm: 'brotliCompress',
      exclude: [/\.(br)$/, /\.(gz)$/],
      threshold: 1024,
    }),
    // Gzip compression fallback
    compression({
      algorithm: 'gzip',
      exclude: [/\.(br)$/, /\.(gz)$/],
      threshold: 1024,
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  esbuild: {
    drop: mode === 'production' ? ['console', 'debugger'] : [],
  },
  build: {
    cssCodeSplit: true,
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return 'assets/css/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('@videosdk.live')) {
              return 'vendor-videosdk';
            }
            if (id.includes('@mui') || id.includes('@emotion')) {
              return 'vendor-mui';
            }
            if (id.includes('recharts') || id.includes('d3-')) {
              return 'vendor-charts';
            }
            // Keep react and its core ecosystem together to prevent circular dependency execution order issues
            if (
              id.includes('react') ||
              id.includes('react-dom') ||
              id.includes('scheduler') ||
              id.includes('framer-motion') ||
              id.includes('lottie-') ||
              id.includes('@radix-ui') ||
              id.includes('cmdk') ||
              id.includes('vaul') ||
              id.includes('lucide-react') ||
              id.includes('@remix-run')
            ) {
              return 'vendor-react';
            }
          }
        },
      },
    },
  },
}));

