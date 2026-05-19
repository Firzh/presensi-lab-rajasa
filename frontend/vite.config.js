import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite'
import preact from '@preact/preset-vite';

export default defineConfig({
  plugins: [preact(), tailwindcss()],
  server: {
    host: true, // Agar bisa diakses dari luar kontainer
    port: 3000, // PAKSA menggunakan port 3000 sesuai Nginx & Dockerfile
    strictPort: true, // Jika 3000 terpakai, langsung error (jangan pindah ke 5174)
    proxy: {
      '/api': {
        target: 'http://nginx:80',
        changeOrigin: true,
      },
    },
  },
});
