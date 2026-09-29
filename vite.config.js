import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import process from 'node:process'
import { proofBuildPlugin } from './scripts/proof-build-plugin.mjs'

function htmlTransformPlugin(isPreview) {
  return {
    name: 'al-html-transform',
    transformIndexHtml(html) {
      if (!isPreview) return html;
      return html
        .replaceAll('https://autolander.ai', 'https://autolander-preview.pages.dev')
        .replace('  </head>', '    <meta name="robots" content="noindex, nofollow" />\n  </head>');
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const isPreview = mode === 'preview' || env.VITE_DEPLOY_TARGET === 'preview'

  return {
    plugins: [
      proofBuildPlugin(),
      react(),
      tailwindcss(),
      htmlTransformPlugin(isPreview),
    ],
  }
})
