import { URL, fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import wasm from 'vite-plugin-wasm';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import markdown from 'unplugin-vue-markdown/vite';
import svgLoader from 'vite-svg-loader';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers';
import Unocss from 'unocss/vite';
import Icons from 'unplugin-icons/vite';
import IconsResolver from 'unplugin-icons/resolver';
import VueI18n from '@intlify/unplugin-vue-i18n/vite';

const baseUrl = process.env.BASE_URL || '/';

let includeLocales = [
  resolve(__dirname, 'locales/en.yml'),
  resolve(__dirname, 'locales/zh.yml'),
];

export default defineConfig({
  plugins: [
    VueI18n({
      runtimeOnly: true,
      compositionOnly: true,
      fullInstall: true,
      include: includeLocales,
      strictMessage: false,
      escapeHtml: true,
    }),
    AutoImport({
      imports: [
        'vue',
        'vue-router',
        '@vueuse/core',
        'vue-i18n',
        {
          'naive-ui': ['useDialog', 'useMessage', 'useNotification', 'useLoadingBar'],
        },
      ],
      vueTemplate: true,
      eslintrc: {
        enabled: false,
      },
    }),
    Icons({ compiler: 'vue3' }),
    vue({
      include: [/\.vue$/, /\.md$/],
    }),
    vueJsx(),
    markdown(),
    svgLoader(),
    Components({
      dirs: ['src/'],
      extensions: ['vue', 'md'],
      include: [/\.vue$/, /\.vue\?vue/, /\.md$/],
      resolvers: [NaiveUiResolver(), IconsResolver({ prefix: 'icon' })],
    }),
    Unocss(),
    nodePolyfills(),
    wasm(),
  ],
  base: baseUrl,
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      'node:fs/promises': fileURLToPath(new URL('./src/_empty.ts', import.meta.url)),
      'node:fs': fileURLToPath(new URL('./src/_empty.ts', import.meta.url)),
      'fs': fileURLToPath(new URL('./src/_empty.ts', import.meta.url)),
      '@babel/core': fileURLToPath(new URL('./src/_empty.ts', import.meta.url)),
      'isolated-vm': fileURLToPath(new URL('./src/_empty.ts', import.meta.url)),
      'onnxruntime-node': fileURLToPath(new URL('./src/_empty.ts', import.meta.url)),
      'onnxruntime-web': fileURLToPath(new URL('./src/_empty.ts', import.meta.url)),
      'unpdf/pdfjs': fileURLToPath(new URL('./src/_empty.ts', import.meta.url)),
      'webcrypto-liner-shim': fileURLToPath(new URL('./src/_empty.ts', import.meta.url)),
    },
  },
  define: {
    'import.meta.env.PACKAGE_VERSION': JSON.stringify(process.env.npm_package_version),
  },
  build: {
    target: 'esnext',
    reportCompressedSize: true,
    rollupOptions: {
      external: [
        'regex',
        './out/isolated_vm',
        'isolated-vm',
        'onnxruntime-node',
        'onnxruntime-web',
        'unpdf/pdfjs',
        '@huggingface/transformers',
        '@ffmpeg/ffmpeg',
        'tesseract.js',
        'epubjs',
        'mermaid',
      ],
      output: {
        format: 'es',
        manualChunks: (id) => {
          // Bundle heavy dependencies separately
          if (id.includes('node_modules/monaco-editor')) return 'monaco';
          if (id.includes('node_modules/shiki')) return 'shiki';
          if (id.includes('node_modules/pdfjs')) return 'pdfjs';
          if (id.includes('node_modules/@tiptap')) return 'tiptap';
          if (id.includes('node_modules/mermaid')) return 'mermaid';
          if (id.includes('node_modules/huggingface')) return 'huggingface';
          if (id.includes('node_modules/@ffmpeg')) return 'ffmpeg';
          if (id.includes('node_modules/tesseract.js')) return 'tesseract';
          if (id.includes('node_modules/epubjs')) return 'epubjs';
          if (id.includes('node_modules/@tiptap')) return 'tiptap';
          if (id.includes('node_modules/chart.js')) return 'chart';
          if (id.includes('node_modules/xlsx')) return 'xlsx';
          if (id.includes('node_modules/konva')) return 'konva';
        },
      },
      cache: false,
    },
  },
  optimizeDeps: {
    exclude: [
      'isolated-vm',
      'pdfjs-dist',
      'onnxruntime-node',
      'onnxruntime-web',
      'unpdf',
      'unpdf/pdfjs',
      '@huggingface/transformers',
      '@ffmpeg/ffmpeg',
      'tesseract.js',
      'epubjs',
      'mermaid',
    ],
    esbuildOptions: {
      supported: {
        'top-level-await': true,
      },
    },
  },
});
