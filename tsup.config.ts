import axios from 'axios';

import { defineConfig } from 'tsup-preset-solid';

let timeout: NodeJS.Timeout | null = null;

export default defineConfig(
  {
    entry: 'src/index.tsx',
  },
  {
    tsupOptions(options) {
      return {
        ...options,
        async onSuccess() {
          if (timeout) {
            clearTimeout(timeout);
            timeout = null;
          }
          timeout = setTimeout(async () => {
            try {
              const res = await axios.get('http://127.0.0.1:3000/');
              console.log(res.status);
            } catch {}
          }, 1000);
        },
        sourcemap: false,
        clean: true,
        format: ['iife'],
        dts: false,
        minify: true,
        outDir: './public/script',
      };
    },
  }
);
