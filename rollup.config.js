// rollup.config.js
import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';
import multi from '@rollup/plugin-multi-entry';

export default [
  {
    input: 'src/**/*.ts',  // ALL .ts files in src
    output: [
      { file: 'dist/chemistry.js', format: 'es' },
      { file: 'dist/chemistry.cjs', format: 'cjs' }
    ],
    external: ['react', 'react-dom', 'fast-safe-stringify'],
    plugins: [
      multi(),  // Allows glob patterns
      typescript({ tsconfig: './tsconfig.chemistry.json' })
    ]
  },
  {
    input: 'src/**/*.ts',
    output: { file: 'dist/chemistry.d.ts', format: 'es' },
    plugins: [
      multi(),
      dts({ tsconfig: './tsconfig.chemistry.json' })
    ]
  }
];