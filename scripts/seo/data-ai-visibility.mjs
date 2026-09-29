import {
  AI_VISIBILITY_PATH,
  AI_VISIBILITY_UPDATED,
  AI_VISIBILITY_UPDATED_HUMAN,
  BRAND_SCAN,
  EVERY_PLAN_INCLUDES,
  FAQ,
  FINAL_CTA,
  FINE_PRINT,
  FOOTER,
  FORM,
  HERO,
  HOW,
  HOW_IT_STARTS,
  META,
  NEVER_PROMISE,
  NOT_INCLUDED,
  PLANS,
  PLANS_SECTION,
  PROMISES,
  REASONS,
  REPORT,
  REPORT_MOCK,
  RESULTS_CREDIT,
  ROLE_CHOICES,
  SERVICE_SUMMARY,
  SHIFT,
  SMS_CONSENT,
  comparisonRows,
  fmtUsd,
} from '../../shared/ai-visibility-content.js';

export const AI_VISIBILITY_ORIGIN = 'https://autolander.ai';
export const AI_VISIBILITY_CANONICAL = `${AI_VISIBILITY_ORIGIN}${AI_VISIBILITY_PATH}`;
export const AI_VISIBILITY_OG_IMAGE = `${AI_VISIBILITY_ORIGIN}/og/ai-visibility.jpg`;

// These descriptions are deliberately scene descriptions. The artwork is illustrative, so none
// of the alt text presents the people or dealership shown as an AutoLander customer.
export const AI_VISIBILITY_IMAGES = [
  {
    src: '/ai-visibility/buyer-asks-ai.webp',
    width: 1600,
    height: 893,
    alt: 'Car shopper asking an AI assistant where to buy a vehicle in their town',
  },
  {
    src: '/ai-visibility/answer-sources.webp',
    width: 1200,
    height: 896,
    alt: 'Illustrated AI Visibility report showing named dealers and cited answer sources',
  },
  {
    src: '/ai-visibility/site-crawl.webp',
    width: 1200,
    height: 896,
    alt: 'Dealership website being checked for crawler access and readable vehicle details',
  },
  {
    src: '/ai-visibility/google-profile.webp',
    width: 1200,
    height: 896,
    alt: 'Google Business Profile management shown on a tablet beside a dealership',
  },
  {
    src: '/ai-visibility/reviews.webp',
    width: 1200,
    height: 896,
    alt: 'Dealership team preparing policy-compliant customer review requests and replies',
  },
  {
    src: '/ai-visibility/report-walkthrough.webp',
    width: 1600,
    height: 893,
    alt: 'AutoLander specialist walking a dealer through an AI Visibility report',
  },
];

const escAttr = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('"', '&quot;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;');

const availabilityUrl = (availability) => (
  availability === 'open'
    ? 'https://schema.org/InStock'
    : 'https://schema.org/LimitedAvailability'
);

function offerFor(plan) {
  const url = `${AI_VISIBILITY_CANONICAL}#${plan.anchor}`;
  return {
    '@type': 'Offer',
    '@id': `${url}-offer`,
    name: plan.name,
    url,
    description: plan.summary,
    price: String(plan.monthly),
    priceCurrency: 'USD',
    availability: availabilityUrl(plan.availability),
    itemOffered: { '@id': `${AI_VISIBILITY_CANONICAL}#service` },
    seller: { '@id': `${AI_VISIBILITY_ORIGIN}/#organization` },
    priceSpecification: {
      '@type': 'CompoundPriceSpecification',
      priceComponent: [
        {
          '@type': 'UnitPriceSpecification',
          price: String(plan.monthly),
          priceCurrency: 'USD',
          unitCode: 'MON',
          referenceQuantity: {
            '@type': 'QuantitativeValue',
            value: 1,
            unitCode: 'MON',
          },
          priceComponentType: 'https://schema.org/Subscription',
        },
        {
          '@type': 'UnitPriceSpecification',
          price: String(plan.setup),
          priceCurrency: 'USD',
          priceComponentType: 'https://schema.org/ActivationFee',
        },
      ],
    },
  };
}

export function aiVisibilityGraph() {
  const webpageId = `${AI_VISIBILITY_CANONICAL}#webpage`;
  const serviceId = `${AI_VISIBILITY_CANONICAL}#service`;
  const breadcrumbId = `${AI_VISIBILITY_CANONICAL}#breadcrumb`;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': webpageId,
        url: AI_VISIBILITY_CANONICAL,
        name: META.title,
        description: META.description,
        dateModified: AI_VISIBILITY_UPDATED,
        inLanguage: 'en-US',
        isPartOf: { '@id': `${AI_VISIBILITY_ORIGIN}/#website` },
        about: { '@id': serviceId },
        mainEntity: { '@id': serviceId },
        publisher: { '@id': `${AI_VISIBILITY_ORIGIN}/#organization` },
        breadcrumb: { '@id': breadcrumbId },
        primaryImageOfPage: {
          '@type': 'ImageObject',
          url: AI_VISIBILITY_OG_IMAGE,
          width: 1200,
          height: 630,
        },
        speakable: {
          '@type': 'SpeakableSpecification',
          cssSelector: ['.al-ai-summary', '.al-faq-a'],
        },
      },
      {
        '@type': 'Service',
        '@id': serviceId,
        name: 'AutoLander AI Visibility for Car Dealers',
        description: SERVICE_SUMMARY,
        provider: { '@id': `${AI_VISIBILITY_ORIGIN}/#organization` },
        areaServed: { '@type': 'Country', name: 'United States' },
        audience: { '@type': 'BusinessAudience', name: 'Car dealerships' },
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          '@id': `${AI_VISIBILITY_CANONICAL}#plans`,
          name: PLANS_SECTION.eyebrow,
          itemListElement: PLANS.map(offerFor),
        },
      },
      {
        '@type': 'FAQPage',
        '@id': `${AI_VISIBILITY_CANONICAL}#faq`,
        mainEntity: FAQ.map(({ q, a }) => ({
          '@type': 'Question',
          name: q,
          acceptedAnswer: { '@type': 'Answer', text: a },
        })),
      },
      {
        '@type': 'BreadcrumbList',
        '@id': breadcrumbId,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: `${AI_VISIBILITY_ORIGIN}/`,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: META.breadcrumb,
            item: AI_VISIBILITY_CANONICAL,
          },
        ],
      },
    ],
  };
}

export function aiVisibilityHead({ preview = false } = {}) {
  const json = JSON.stringify(aiVisibilityGraph()).replaceAll('<', '\\u003c');
  return `    <meta name="description" content="${escAttr(META.description)}" />
${preview ? '' : '    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />\n'}    <link rel="canonical" href="${AI_VISIBILITY_CANONICAL}" />
    <link rel="alternate" type="text/markdown" href="/ai-visibility.md" />
    <link rel="describedby" href="/llms.txt" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${AI_VISIBILITY_CANONICAL}" />
    <meta property="og:site_name" content="AutoLander" />
    <meta property="og:title" content="${escAttr(META.title)}" />
    <meta property="og:description" content="${escAttr(META.description)}" />
    <meta property="og:image" content="${AI_VISIBILITY_OG_IMAGE}" />
    <meta property="og:image:secure_url" content="${AI_VISIBILITY_OG_IMAGE}" />
    <meta property="og:image:type" content="image/jpeg" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${escAttr(META.ogImageAlt)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escAttr(META.title)}" />
    <meta name="twitter:description" content="${escAttr(META.description)}" />
    <meta name="twitter:image" content="${AI_VISIBILITY_OG_IMAGE}" />
    <meta name="twitter:image:alt" content="${escAttr(META.ogImageAlt)}" />
    <script type="application/ld+json">${json}</script>`;
}

const imageSections = AI_VISIBILITY_IMAGES.map((image) => ({ type: 'image', ...image }));

// This page object registers the SPA with the existing SEO graph. Its Markdown is rendered by the
// purpose-built function below because this page has plan cards, nested promises and credit terms
// that the generic article renderer cannot represent without losing content.
export const AI_VISIBILITY = {
  key: 'aiVisibility',
  path: AI_VISIBILITY_PATH,
  spa: true,
  title: META.title,
  description: META.description,
  h1: `${HERO.h1Lead} ${HERO.h1Grad}`,
  tldr: HERO.summary,
  updated: AI_VISIBILITY_UPDATED,
  faq: FAQ.map(({ q, a }) => [q, a]),
  sections: imageSections,
  images: AI_VISIBILITY_IMAGES,
};

const line = (out, value = '') => out.push(value);
const paragraph = (out, value) => { line(out, value); line(out); };
const bullets = (out, values) => { values.forEach((value) => line(out, `- ${value}`)); line(out); };
const heading = (out, level, value) => { line(out, `${'#'.repeat(level)} ${value}`); line(out); };

export function renderAiVisibilityMarkdown() {
  const out = [];
  heading(out, 1, `${HERO.h1Lead} ${HERO.h1Grad}`);
  paragraph(out, `> ${META.description}`);
  line(out, `Source: ${AI_VISIBILITY_CANONICAL}`);
  line(out, 'Author: The AutoLander team');
  line(out, `Updated: ${AI_VISIBILITY_UPDATED_HUMAN}`);
  line(out);
  paragraph(out, `**Short answer:** ${HERO.summary}`);
  bullets(out, HERO.chips);
  paragraph(out, HERO.trustLine);

  heading(out, 2, `${SHIFT.h2Lead} ${SHIFT.h2Grad}`);
  paragraph(out, SHIFT.body);
  paragraph(out, `${SHIFT.stat.value} ${SHIFT.stat.text} [${SHIFT.stat.source}](${SHIFT.stat.sourceUrl})`);

  heading(out, 2, `${REPORT.h2Lead} ${REPORT.h2Grad}`);
  REPORT.parts.forEach(({ title, body }) => {
    heading(out, 3, title);
    paragraph(out, body);
  });

  heading(out, 3, REPORT_MOCK.caption);
  paragraph(out, `${REPORT_MOCK.score}/100. ${REPORT_MOCK.scoreNote}`);
  const reportHead = ['Buyer question', ...REPORT_MOCK.columns];
  line(out, `| ${reportHead.join(' | ')} |`);
  line(out, `| ${reportHead.map(() => '---').join(' | ')} |`);
  REPORT_MOCK.rows.forEach(([question, ...cells]) => {
    line(out, `| ${question} | ${cells.map((cell) => REPORT_MOCK.cellLabel[cell]).join(' | ')} |`);
  });
  line(out);
  bullets(out, REPORT_MOCK.fixes);

  heading(out, 2, `${REASONS.h2Lead} ${REASONS.h2Grad}`);
  REASONS.items.forEach(({ title, body }) => {
    heading(out, 3, title);
    paragraph(out, body);
  });

  heading(out, 2, `${HOW.h2Lead} ${HOW.h2Grad}`);
  HOW.steps.forEach(({ title, body }, index) => line(out, `${index + 1}. **${title}:** ${body}`));
  line(out);

  heading(out, 2, FORM.title);
  paragraph(out, FORM.intro);
  paragraph(out, FORM.requiredNote);
  Object.values(FORM.fields).forEach((field) => {
    line(out, `- **${field.label}:** ${field.hint || field.note || field.agentHint}`);
  });
  line(out);
  bullets(out, ROLE_CHOICES);
  paragraph(out, FORM.useNote);
  paragraph(out, `${SMS_CONSENT.text} ${SMS_CONSENT.links.map((link) => `[${link.label}](${AI_VISIBILITY_ORIGIN}${link.href})`).join(' ')}`);
  paragraph(out, `Request the free scan at ${AI_VISIBILITY_CANONICAL}#scan-form. The dealer reviews and sends the form.`);

  heading(out, 2, `${PLANS_SECTION.h2Lead} ${PLANS_SECTION.h2Grad}`);
  paragraph(out, PLANS_SECTION.lead);
  PLANS.forEach((plan) => {
    heading(out, 3, plan.name);
    paragraph(out, `**${fmtUsd(plan.monthly)} ${PLANS_SECTION.perMonth}. ${fmtUsd(plan.setup)} ${PLANS_SECTION.setupSuffix}.**${plan.availability === 'by-application' ? ` ${PLANS_SECTION.byApplication}.` : ''}`);
    paragraph(out, plan.builtFor);
    paragraph(out, plan.summary);
    bullets(out, plan.includes);
  });
  paragraph(out, PLANS_SECTION.customerLine);

  heading(out, 3, PLANS_SECTION.tableCaption);
  const rows = comparisonRows();
  const comparisonHead = ['', ...PLANS.map((plan) => plan.name)];
  line(out, `| ${comparisonHead.join(' | ')} |`);
  line(out, `| ${comparisonHead.map(() => '---').join(' | ')} |`);
  rows.forEach((row) => line(out, `| ${row.join(' | ')} |`));
  line(out);

  heading(out, 2, PLANS_SECTION.everyPlanHeading);
  bullets(out, EVERY_PLAN_INCLUDES);

  heading(out, 2, PLANS_SECTION.promisesHeading);
  paragraph(out, PLANS_SECTION.promisesIntro);
  line(out, '| Promise | Step |');
  line(out, '| --- | --- |');
  PROMISES.forEach(({ promise, step }) => line(out, `| ${promise} | ${step} |`));
  line(out);

  heading(out, 2, RESULTS_CREDIT.heading);
  paragraph(out, RESULTS_CREDIT.intro);
  RESULTS_CREDIT.steps.forEach(({ title, body }, index) => line(out, `${index + 1}. **${title}:** ${body}`));
  line(out);
  bullets(out, RESULTS_CREDIT.conditions);
  paragraph(out, RESULTS_CREDIT.covers);

  heading(out, 2, PLANS_SECTION.neverHeading);
  bullets(out, NEVER_PROMISE);
  heading(out, 2, PLANS_SECTION.notIncludedHeading);
  bullets(out, NOT_INCLUDED);

  heading(out, 2, PLANS_SECTION.howItStartsHeading);
  HOW_IT_STARTS.forEach(({ title, body }, index) => line(out, `${index + 1}. **${title}:** ${body}`));
  line(out);

  heading(out, 2, PLANS_SECTION.finePrintHeading);
  bullets(out, FINE_PRINT);
  paragraph(out, `Prices and plans updated ${AI_VISIBILITY_UPDATED_HUMAN}.`);

  heading(out, 2, BRAND_SCAN.heading);
  paragraph(out, BRAND_SCAN.body);

  heading(out, 2, 'Frequently asked questions');
  FAQ.forEach(({ q, a }) => {
    heading(out, 3, q);
    paragraph(out, a);
  });

  heading(out, 2, `${FINAL_CTA.h2Lead} ${FINAL_CTA.h2Grad}`);
  paragraph(out, `${FINAL_CTA.cta}. ${FINAL_CTA.note}`);
  paragraph(out, SERVICE_SUMMARY);
  FOOTER.links.forEach(({ label, href }) => line(out, `- [${label}](${AI_VISIBILITY_ORIGIN}${href})`));
  line(out);
  line(out, '---');
  line(out, `${FOOTER.line} ${AI_VISIBILITY_CANONICAL}`);
  line(out);
  return out.join('\n');
}
