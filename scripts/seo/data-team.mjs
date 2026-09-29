import { TEAM_IMAGES } from '../../shared/page-images.js';
import { imagePreloadHtml, IMAGE_SIZES } from '../../shared/responsive-images.js';
import { TEAM_META } from '../../shared/team-content.js';

export const TEAM_CANONICAL = 'https://autolander.ai/team/';
export const TEAM_OG_IMAGE = 'https://autolander.ai/og/team.jpg';

const escAttr = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('"', '&quot;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;');

export function teamGraph() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${TEAM_CANONICAL}#webpage`,
        url: TEAM_CANONICAL,
        name: TEAM_META.title,
        description: TEAM_META.description,
        inLanguage: 'en-US',
        isPartOf: { '@id': 'https://autolander.ai/#website' },
        publisher: { '@id': 'https://autolander.ai/#organization' },
        primaryImageOfPage: {
          '@type': 'ImageObject',
          url: TEAM_OG_IMAGE,
          width: 1200,
          height: 630,
        },
      },
    ],
  };
}

export function teamHead({ preview = false } = {}) {
  const json = JSON.stringify(teamGraph()).replaceAll('<', '\\u003c');
  return `    ${imagePreloadHtml(TEAM_IMAGES.hero, IMAGE_SIZES.teamHero)}
    <meta name="description" content="${escAttr(TEAM_META.description)}" />
${preview ? '' : '    <meta name="robots" content="noindex, follow" />\n'}    <link rel="canonical" href="${TEAM_CANONICAL}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${TEAM_CANONICAL}" />
    <meta property="og:site_name" content="AutoLander" />
    <meta property="og:title" content="${escAttr(TEAM_META.title)}" />
    <meta property="og:description" content="${escAttr(TEAM_META.description)}" />
    <meta property="og:image" content="${TEAM_OG_IMAGE}" />
    <meta property="og:image:secure_url" content="${TEAM_OG_IMAGE}" />
    <meta property="og:image:type" content="image/jpeg" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${escAttr(TEAM_META.ogCardTitle)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escAttr(TEAM_META.title)}" />
    <meta name="twitter:description" content="${escAttr(TEAM_META.description)}" />
    <meta name="twitter:image" content="${TEAM_OG_IMAGE}" />
    <meta name="twitter:image:alt" content="${escAttr(TEAM_META.ogCardTitle)}" />
    <script type="application/ld+json">${json}</script>`;
}
