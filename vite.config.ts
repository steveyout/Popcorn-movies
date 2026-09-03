import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
      dedupe: [
        'firebase',
        'firebase/app',
        'firebase/auth',
        'firebase/firestore',
        'firebase/analytics',
        '@firebase/app',
        '@firebase/auth',
        '@firebase/firestore',
        '@firebase/analytics',
        '@firebase/component',
        '@firebase/util',
      ],
    },
    optimizeDeps: {
      include: [
        'firebase/app',
        'firebase/auth',
        'firebase/firestore',
        'firebase/analytics',
      ],
    },
    server: {
      allowedHosts: [
        'popcornmovies.online',
        '.popcornmovies.online',
        'bingebox.work',
        '.bingebox.work',
        'cinejoy.online',
        '.cinejoy.online',
        'Cinejoy.online',
        '.Cinejoy.online',
        'flixhq.ink',
        '.flixhq.ink',
        'localhost',
        '127.0.0.1',
      ],
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
