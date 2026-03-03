
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  base: '/nihongo-go/', // 👈 这一行最关键，必须和你的 GitHub 仓库名一致
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    port: 3000,
  }
});
