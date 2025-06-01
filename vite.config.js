import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    allowedHosts: [
      'e14c7735-d696-4ace-9bd8-abcfa1bb44f8-00-24eekv32wz76m.janeway.replit.dev'
    ]
  },
  build: {
    outDir: 'dist',
  },
});
