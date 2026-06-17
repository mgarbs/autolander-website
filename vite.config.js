import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import process from 'node:process'

function htmlTransformPlugin(pixelId, isPreview) {
  return {
    name: 'al-html-transform',
    transformIndexHtml(html) {
      // Preview build: strip the hardcoded Meta Pixel (+ noscript) so internal
      // review traffic never reaches Meta, and mark the page noindex so it
      // never competes with the production site in search.
      if (isPreview) {
        return html
          .replace(/\n?[ \t]*<!-- Meta Pixel Code -->[\s\S]*?<!-- End Meta Pixel Code -->/, '')
          .replace(/\n?[ \t]*<noscript>[\s\S]*?facebook\.com\/tr[\s\S]*?<\/noscript>/, '')
          .replace('  </head>', '    <meta name="robots" content="noindex, nofollow" />\n  </head>')
      }

      if (!pixelId) return html

      const pixelIdJs = String(pixelId)
        .replace(/\\/g, '\\\\')
        .replace(/'/g, "\\'")
        .replace(/\r/g, '\\r')
        .replace(/\n/g, '\\n')
      const pixelIdParam = encodeURIComponent(pixelId)
      const script = `    <!-- Meta Pixel Code -->
    <script>
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '${pixelIdJs}');
      fbq('track', 'PageView');
    </script>
    <!-- End Meta Pixel Code -->`
      const noscript = `    <noscript><img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${pixelIdParam}&ev=PageView&noscript=1" /></noscript>`

      return html
        .replace('    <title>', `${script}\n    <title>`)
        .replace('  <body>', `  <body>\n${noscript}`)
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const metaPixelId = env.VITE_META_PIXEL_ID || ''
  const isPreview = mode === 'preview' || env.VITE_DEPLOY_TARGET === 'preview'

  return {
    plugins: [
      react(),
      tailwindcss(),
      htmlTransformPlugin(metaPixelId, isPreview),
    ],
  }
})
