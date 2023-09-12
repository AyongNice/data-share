import {defineConfig} from 'vite'

const config = require("./package.json")
// https://vitejs.dev/config/
export default defineConfig({
    build: {
        minify: false,
        outDir: 'dist',
        lib: {
            entry: './index.ts',
            formats: ['es']
        },
        rollupOptions: {
            output: {
                entryFileNames: `[name].js`
            }
        }
    }
})
