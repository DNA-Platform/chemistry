const typescript = require('@rollup/plugin-typescript');
const dts = require('rollup-plugin-dts').default;

module.exports = [
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
        plugins: [
            typescript({
                tsconfig: './tsconfig.build.json'  // Use the build config!
            })
        ],
        external: ['react', 'react-dom', 'react/jsx-runtime']
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