import {
  SILOS, SUGGESTED_ORDER, articlePath, isBlog, isPublished, modifiedDate,
} from './articles/article-system.mjs';
import { NAV, SITE } from './registry.mjs';

const BLOG_ID = `${SITE.origin}/blog/#blog`;
const FEED_URL = `${SITE.origin}/blog/feed.xml`;
const HUB_URL = 'https://pubsubhubbub.appspot.com/';

const xml = (value) => String(value ?? '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&apos;');

const humanDate = (iso) => new Date(`${iso}T00:00:00Z`)
  .toLocaleDateString('en-US', { timeZone: 'UTC', year: 'numeric', month: 'long', day: 'numeric' });

export const publishedBlogPosts = (articles, state) => articles
  .filter((article) => isBlog(article) && isPublished(state, article.slug))
  .sort((a, b) => String(state[b.slug].publishedAt || '').localeCompare(String(state[a.slug].publishedAt || ''))
    || a.slug.localeCompare(b.slug));

const publishedGuides = (articles, state) => {
  const order = new Map(SUGGESTED_ORDER.map((slug, index) => [slug, index]));
  return articles
    .filter((article) => !isBlog(article) && isPublished(state, article.slug))
    .sort((a, b) => (order.get(a.slug) ?? 99) - (order.get(b.slug) ?? 99) || a.slug.localeCompare(b.slug));
};

export function blogLd(articles, state) {
  const posts = publishedBlogPosts(articles, state);
  return {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    '@id': BLOG_ID,
    name: 'The AutoLander blog',
    url: `${SITE.origin}/blog/`,
    description: 'Practical Facebook Marketplace playbooks for car dealers, dealership marketers, and vehicle merchandisers.',
    publisher: { '@id': `${SITE.origin}/#organization` },
    blogPost: posts.map((post) => ({
      '@type': 'BlogPosting',
      headline: post.h1 || post.title,
      url: SITE.origin + articlePath(post),
      datePublished: state[post.slug].publishedAt,
    })),
  };
}

export function blogIndexPage(articles, state) {
  const posts = publishedBlogPosts(articles, state);
  const guides = publishedGuides(articles, state);
  const guidesBySilo = Object.keys(SILOS)
    .filter((silo) => silo !== 'blog')
    .map((silo) => [silo, guides.filter((article) => article.silo === silo)])
    .filter(([, rows]) => rows.length);
  const itemList = [...posts, ...guides].map((article) => ({
    name: article.h1 || article.title,
    url: SITE.origin + articlePath(article),
  }));
  // Every article the page lists (posts and guides), so the page's dateModified, byline and twin match
  // the /blog/ sitemap lastmod (build-seo-pages BLOG_LASTMOD uses the same rule).
  const newestDate = [...posts, ...guides]
    .map((article) => modifiedDate(article, state, state[article.slug]?.publishedAt))
    .filter(Boolean)
    .sort()
    .at(-1) || SITE.updated;

  return {
    key: 'blog',
    path: NAV.blog.path,
    title: 'AutoLander Blog | Facebook Marketplace Playbooks',
    description: 'Practical Facebook Marketplace playbooks for car dealers, plus every AutoLander guide on vehicle merchandising, dealership growth, and listing operations.',
    eyebrow: 'AutoLander blog',
    h1: 'The AutoLander blog',
    bylineUpdated: true,
    updated: newestDate,
    breadcrumbs: [
      { name: 'Home', url: `${SITE.origin}/` },
      { name: 'Blog', url: `${SITE.origin}/blog/` },
    ],
    sections: [
      {
        type: 'prose',
        paras: [
          'Practical guidance for dealership teams that publish, merchandise, and market vehicle inventory. Start with the latest posts, or browse every published guide by topic.',
        ],
      },
      {
        type: 'bullets',
        id: 'latest',
        h2: 'Latest posts',
        items: posts.length
          ? posts.map((post) => `[${post.title}](${articlePath(post)}) | ${humanDate(state[post.slug].publishedAt)}. ${post.description}`)
          : ['No posts yet. Published posts will appear here.'],
      },
      ...guidesBySilo.map(([silo, rows], index) => ({
        type: 'bullets',
        ...(index === 0 ? { id: 'guides' } : {}),
        h2: `Guides and playbooks: ${SILOS[silo].label}`,
        items: rows.map((article) => `[${article.title}](${articlePath(article)})`),
      })),
      ...(!guidesBySilo.length ? [{
        type: 'bullets', id: 'guides', h2: 'Guides and playbooks', items: ['No guides are published yet.'],
      }] : []),
      {
        type: 'bullets',
        h2: 'Evergreen hubs',
        items: [
          `[Facebook Marketplace for car dealers](${NAV.dealers.path})`,
          `[Facebook Marketplace auto poster](${NAV.category.path})`,
          `[Car dealership marketing](${NAV.mktgHub.path})`,
          `[AI car photo editor](${NAV.photoEditor.path})`,
          `[AutoLander pricing](${NAV.pricing.path})`,
        ],
      },
    ],
    cta: {
      heading: 'Put your dealership publishing workflow in one place',
      sub: 'See AutoLander plans for dealership teams and individual sales representatives.',
    },
    related: [],
    schema: { blog: blogLd(articles, state), itemList },
  };
}

export function blogRss(articles, state, { now = new Date() } = {}) {
  const items = publishedBlogPosts(articles, state).slice(0, 50).map((post) => {
    const url = SITE.origin + articlePath(post);
    const date = new Date(`${state[post.slug].publishedAt}T00:00:00Z`).toUTCString();
    return `    <item>
      <title>${xml(post.title)}</title>
      <link>${xml(url)}</link>
      <guid isPermaLink="true">${xml(url)}</guid>
      <pubDate>${xml(date)}</pubDate>
      <description>${xml(post.description)}</description>
    </item>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>AutoLander blog</title>
    <link>${SITE.origin}/blog/</link>
    <description>Facebook Marketplace playbooks for car dealers.</description>
    <language>en-us</language>
    <lastBuildDate>${xml(now.toUTCString())}</lastBuildDate>
    <atom:link rel="self" href="${FEED_URL}" type="application/rss+xml" />
    <atom:link rel="hub" href="${HUB_URL}" />${items ? `
${items}` : ''}
  </channel>
</rss>
`;
}
