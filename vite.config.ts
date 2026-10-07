import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { handleApiRequest } from './src/server/index';

function taxOsApiPlugin(): Plugin {
  return {
    name: 'tax-os-api-server',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url && req.url.startsWith('/api')) {
          const handled = handleApiRequest(req, res);
          if (handled) return;
        }
        next();
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), taxOsApiPlugin()],
  server: {
    port: 5173,
    host: true
  }
});
