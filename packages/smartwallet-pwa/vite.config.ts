import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const config = {
    build: {
      outDir: 'build',
    },
    plugins: [react()],
    define: {} as any,
  };

  if (mode === "development") {
    config.define.global = {};
  }

  return config;
});
