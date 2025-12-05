import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig({
    plugins: [viteSingleFile()],
    build: {
        minify: true,
        cssCodeSplit: false,
        assetsInlineLimit: 100000000, // Inline everything
    }
});
