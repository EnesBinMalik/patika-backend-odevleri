/**
 * NexusCore statik tek-dosya uygulamasinin Vite yapilandirmasi.
 * Uygulamanin kendisi index.html icinde (CSS + markup + inline module);
 * burada yalnızca gelistirme sunucusu ve dist/ cikisi tanilanir.
 *
 * SPDX-License-Identifier: Apache-2.0 · Enes Ozturk
 */
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    port: 3000,
    host: true,
    // DISABLE_HMR=true ile dosya dinleme kapatilabilir (container/CI icin).
    hmr: process.env.DISABLE_HMR !== 'true',
    watch: process.env.DISABLE_HMR === 'true' ? null : {},
  },
});
