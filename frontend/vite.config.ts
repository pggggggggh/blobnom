import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react-swc'
import {TanStackRouterVite} from '@tanstack/router-plugin/vite'

// https://vite.dev/config/
export default defineConfig({
    esbuild: {
        drop: ['console', 'debugger'],
    },
    plugins: [
        react(),
        TanStackRouterVite(),
    ],
    optimizeDeps: {
        include: ['zustand'],
    },
    resolve: {
        alias: {
            '@tabler/icons-react': '@tabler/icons-react/dist/esm/icons/index.mjs',
        }
    }
})
