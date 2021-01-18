import typescript from 'rollup-plugin-typescript2'

export default [
  {
    input: './src/index.ts',
    output: {
      file: './out/index.esm.js',
      format: 'esm',
      exports: 'named'
    },
    plugins: [typescript()],
  },
  {
    input: './src/index.ts',
    output: {
      file: './out/index.js',
      format: 'cjs',
      exports: 'named'
    },
    plugins: [typescript()],
  },
]