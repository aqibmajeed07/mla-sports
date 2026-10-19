import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';
import { spawn } from 'node:child_process';

const apiServerPlugin = () => ({
  name: 'api-server-starter',
  configureServer(server) {
    const checkAndStartApi = async () => {
      try {
        const res = await fetch('http://127.0.0.1:3001/api/health');
        if (res.ok) return;
      } catch {
        console.log('[vite] Starting MLA Sports API backend on http://127.0.0.1:3001...');
        const apiProc = spawn('node', ['--env-file=.env', 'api/index.js'], {
          stdio: 'inherit',
          shell: true,
        });
        process.on('exit', () => apiProc.kill());
        server.httpServer?.on('close', () => apiProc.kill());
      }
    };
    checkAndStartApi();
  },
});

export default defineConfig({
  plugins: [react(), tailwindcss(), apiServerPlugin()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('error', (err, _req, res) => {
            console.warn(`[vite proxy warn] /api request failed: ${err.message}`);
            if (res && !res.headersSent) {
              res.writeHead(503, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Backend API is currently starting or reconnecting.' }));
            }
          });
        },
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('chart.js') || id.includes('react-chartjs-2')) {
            return 'charts';
          }
          if (id.includes('lucide-react')) {
            return 'icons';
          }
          if (id.includes('node_modules/react') || id.includes('node_modules/react-router')) {
            return 'vendor';
          }
        },
      },
    },
  },
});
