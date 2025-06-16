import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Load environment variables
const port = parseInt(process.env.VITE_FRONTEND_PORT) || 3000;

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  console.log('Loaded environment variables:', env);
  
  return {
    plugins: [react()],
    resolve: {
      extensions: ['.mjs', '.js', '.jsx', '.json'],
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@components': path.resolve(__dirname, './src/components')
      }
    },
    build: {
      sourcemap: true,
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html')
        },
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
          }
        }
      }
    },
    server: {
      port: 3000, // Frontend runs on port 3000
      host: true,
      proxy: {
        '/api': {
          target: process.env.VITE_BACKEND_URL || 'http://localhost:5000',
          changeOrigin: true,
          secure: false,
          // rewrite: (path) => path.replace(/^\/api/, '')
        }
      }
    },
    define: {
      'process.env': env,
      'import.meta.env.VITE_GROQ_API_KEY': JSON.stringify(env.VITE_GROQ_API_KEY),
      'import.meta.env.VITE_GROQ_API_URL': JSON.stringify(env.VITE_GROQ_API_URL),
      'import.meta.env.VITE_WEATHER_API_KEY': JSON.stringify(env.VITE_WEATHER_API_KEY),
      'import.meta.env.VITE_WEATHER_API_URL': JSON.stringify(env.VITE_WEATHER_API_URL),
      'import.meta.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL),
      'import.meta.env.VITE_API_TIMEOUT': JSON.stringify(env.VITE_API_TIMEOUT),
      'import.meta.env.VITE_BACKEND_URL': JSON.stringify(env.VITE_BACKEND_URL),
      'import.meta.env.VITE_DISEASE_PREDICTION_API_URL': JSON.stringify(env.VITE_DISEASE_PREDICTION_API_URL),
      'import.meta.env.VITE_RENTAL_MARKETPLACE_URL': JSON.stringify(env.VITE_RENTAL_MARKETPLACE_URL),
      'import.meta.env.VITE_POLICY_API_URL': JSON.stringify(process.env.VITE_POLICY_API_URL),
    }
  };
});

