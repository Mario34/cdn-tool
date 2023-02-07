import { defineConfig } from 'rollup'
import tsPlugin from '@rollup/plugin-typescript'

export default defineConfig({
  input: 'src/index.ts',
  output: {
    format: 'module',
    file: 'lib/index.mjs',
  },
  strictDeprecations: true,
  watch: {
    include: './src/**/*.ts',
  },
  plugins: [
    tsPlugin({
      tsconfig: './tsconfig.json',
      outDir: './',
    }),
  ],
})
