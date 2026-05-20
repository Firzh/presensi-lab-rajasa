import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import preact from '@preact/preset-vite';

export default defineConfig({
  plugins: [preact(), tailwindcss()],
  server: {
    host: true,
    port: 3000,
    strictPort: true,
    allowedHosts: true, // hanya untuk kebutuhan demo dev scanner
    proxy: {
      '/api': {
        target: 'http://nginx:80',
        changeOrigin: true,
      },
    },
  },
});
