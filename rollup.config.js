import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import url from '@rollup/plugin-url';

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
    url({ include: ['**/*.png', '**/*.jpg', '**/*.svg'], limit: Infinity }),
    terser({
      ecma: 2021,
      module: true,
      warnings: true,
    }),
  ],
};