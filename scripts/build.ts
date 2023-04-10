import { build } from 'tsup';

async function main() {
  await build({
    entry: ['./src/index.ts'],
    outDir: './dist',
    clean: true,
    dts: false,
    sourcemap: 'inline',
    splitting: false,
  });
  await build({
    entry: ['./src/monitor/index.ts'],
    outDir: './dist/monitor',
    clean: false,
    dts: false,
    sourcemap: 'inline',
    splitting: false,
  });
}

main();
