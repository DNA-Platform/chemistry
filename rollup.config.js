import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';

export default [
    {
        input: 'src/index.ts',
        output: [
            {
                file: 'dist/chemistry.js',
                format: 'es',
                sourcemap: true
            },
            {
                file: 'dist/chemistry.cjs',
                format: 'cjs',
                sourcemap: true
            }
        ],
        plugins: [typescript()],
        external: ['react', 'react-dom']
    },
    {
        input: 'src/index.ts',
        output: {
            file: 'dist/chemistry.d.ts',
            format: 'es'
        },
        plugins: [dts()]
    }
];