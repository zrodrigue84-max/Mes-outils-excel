import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import devCerts from 'office-addin-dev-certs';

export default defineConfig(async () => {
  const httpsOptions = await devCerts.getHttpsServerOptions();

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
      https: httpsOptions,
    },
  };
});
