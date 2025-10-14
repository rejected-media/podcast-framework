import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/commands/*.ts'],
  format: ['esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
  external: ['commander', 'chalk', 'inquirer', 'ora'],
  outDir: 'dist',
});
