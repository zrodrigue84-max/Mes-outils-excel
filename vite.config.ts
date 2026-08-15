import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig(async ({ command }) => {
  // Certificats HTTPS locaux uniquement pour le serveur de dev Excel.
  // Sur Vercel (vite build), office-addin-dev-certs tente sudo → échec du build.
  let httpsOptions: Awaited<
    ReturnType<
      typeof import('office-addin-dev-certs').default.getHttpsServerOptions
    >
  > | undefined;

  if (command === 'serve') {
    const devCerts = await import('office-addin-dev-certs');
    httpsOptions = await devCerts.default.getHttpsServerOptions();
  }

  return {
    plugins: [react()],
    root: 'src/taskpane',
    publicDir: resolve(__dirname, 'public'),
    build: {
      outDir: resolve(__dirname, 'dist'),
      emptyOutDir: true,
      rollupOptions: {
        input: {
          taskpane: resolve(__dirname, 'src/taskpane/taskpane.html'),
        },
      },
    },
    server: {
      port: 3000,
      strictPort: true,
      ...(httpsOptions ? { https: httpsOptions } : {}),
    },
  };
});
