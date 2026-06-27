import { defineConfig } from "vite";
import checker from "vite-plugin-checker";

export default defineConfig({
  base: '/physique/',
  plugins: [
    checker({
      typescript: true,
      eslint: {
        lintCommand: 'eslint "./src/**/*.ts"',
      },
    }),
  ],
});
