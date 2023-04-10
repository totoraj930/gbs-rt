import { build } from 'tsup';

async function main() {
  await build({
    entry: ['./src-server/index.ts'],
    outDir: './dist',
    clean: true,
    dts: false,
    sourcemap: 'inline',
    splitting: false,
  });
  await build({
    entry: ['./src-server/cache/index.ts'],
    outDir: './dist/cache',
    clean: false,
    dts: false,
    sourcemap: 'inline',
    splitting: false,
  });
}

main();
