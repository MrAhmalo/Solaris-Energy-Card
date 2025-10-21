import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';

export default {
  input: 'src/solaris-card.ts',
  output: {
    file: 'dist/solaris-card.js',
    format: 'es',
    sourcemap: true,
  },
  plugins: [
    resolve(),
    typescript(),
    terser({
      ecma: 2021,
      module: true,
      warnings: true,
    }),
  ],
};