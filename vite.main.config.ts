import { defineConfig, loadEnv } from 'vite';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory
  const env = loadEnv(mode, process.cwd(), '');
  const isDev = mode === 'development';

  return {
    // Vite configuration
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
      },
    },
    build: {
      outDir: '.vite/build',
      minify: isDev ? false : 'esbuild', // Não minificar em dev para acelerar
      sourcemap: isDev ? 'inline' : false, // Sourcemap inline em dev
      lib: {
        entry: 'src/main.ts',
        formats: ['cjs'],
      },
      rollupOptions: {
        external: ['electron', 'electron-updater', '@prisma/client', '.prisma/client'],
        output: {
          entryFileNames: '[name].js',
          chunkFileNames: '[name].js',
          assetFileNames: '[name][extname]',
        },
      },
    },
    esbuild: {
      target: 'node18', // Target específico para acelerar
    },
    define: {
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
      'process.env.ELECTRON_RENDERER_URL': JSON.stringify(process.env.ELECTRON_RENDERER_URL || ''),
    },
  };
});
