const path = require('path');

module.exports = {
  test: {
    globals: true,
    environment: 'happy-dom',
    deps: {
      inline: [/chemistry/]  // This tells Vitest to inline/transform these files
    }
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js'],
    alias: {
      '@': path.resolve(__dirname, './src'),
    }
  },
  esbuild: {
    target: 'node14'  // Compile to CommonJS-compatible code
  }
}