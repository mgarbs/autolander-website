import { AI_VISIBILITY_UPDATED } from '../../shared/ai-visibility-content.js';
// Namespace import: a generated module from before AEO_GEO_GUIDES_UPDATED existed reads as undefined
// instead of failing the build that is about to regenerate it.
import * as GUIDES from '../generated/aeo-geo-guides.js';

// The money page changes every time an AEO and GEO article is published (its guides block grows), so
// its visible "Updated" date, WebPage dateModified, twin and sitemap lastmod all use the later of the
// copy date (AI_VISIBILITY_UPDATED) and the newest article publish or edit.
export const latestDate = (...dates) => dates.filter(Boolean).sort().at(-1);
export const humanDay = (iso) => new Date(`${iso}T00:00:00Z`)
  .toLocaleDateString('en-US', { timeZone: 'UTC', year: 'numeric', month: 'long', day: 'numeric' });

export const PAGE_UPDATED = latestDate(AI_VISIBILITY_UPDATED, GUIDES.AEO_GEO_GUIDES_UPDATED);
export const PAGE_UPDATED_HUMAN = humanDay(PAGE_UPDATED);
