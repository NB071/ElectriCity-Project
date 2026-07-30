import path from "path";
import { fileURLToPath } from "url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
// ref: https://stackoverflow.com/questions/79838167/laravel-and-vite-within-a-docker-container
export default defineConfig({
    server: {
        host: "0.0.0.0",
        port: 3000,
        allowedHosts: ["project-electricity.app", "www.project-electricity.app", "localhost"],
        watch: {
            usePolling: true,
            interval: 300,
        },
        hmr: {
            clientPort: 3000,
        },
    },

    build: {
        outDir: "dist",
        emptyOutDir: true,
    },

    envPrefix: ["VITE_"],

    plugins: [
        tanstackRouter({
            target: "react",
            autoCodeSplitting: true,
        }),
        react(),
        tailwindcss(),
    ],

    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
});
