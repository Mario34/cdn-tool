import { defineConfig } from 'rollup'
import tsPlugin from '@rollup/plugin-typescript'

export default defineConfig({
  input: 'src/index.ts',
  output: {
    format: 'module',
    file: 'lib/esm/index.js',
  },
  strictDeprecations: true,
  watch: {
    include: './src/**/*.ts',
  },
  plugins: [
    tsPlugin({
      tsconfig: './tsconfig.json',
    }),
  ],
})
