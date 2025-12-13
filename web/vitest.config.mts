import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: 'jsdom',
    env: {
      NEXT_PUBLIC_FIREBASE_API_KEY: 'mock-api-key',
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: 'mock-auth-domain',
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: 'mock-project-id',
      NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: 'mock-storage-bucket',
      NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: 'mock-sender-id',
      NEXT_PUBLIC_FIREBASE_APP_ID: 'mock-app-id',
    },
  },
});
