// AEO and GEO for car dealers (silo `aeoGeo`, 2026-09-30): the 50-article drip library under
// /aeo-geo/<slug>/, breadcrumbed and isPartOf'd under the money page /aeo-geo-for-car-dealers/.
//
// The articles live in ten batch files (pure data, no imports). This index is the ONLY place
// that imports them; every aggregator reaches them through drip-articles.mjs.
//
// Publish numbers: every article carries `publishOrder` (1 to 50). SUGGESTED_ORDER in
// article-system.mjs lists the 50 slugs in exactly that order, and the admin shows the number.
// In-body sibling links use the publish-aware token [anchor](@slug) and only ever point to a
// LOWER publish number, so publishing in order never creates a dead link (the builder also
// renders any token or internal href to an unpublished target as plain text).
// test/aeo-geo-silo.test.js pins all of this.

import { ARTICLES as BATCH_01 } from './data-articles-aeo-geo-01.mjs';
import { ARTICLES as BATCH_02 } from './data-articles-aeo-geo-02.mjs';
import { ARTICLES as BATCH_03 } from './data-articles-aeo-geo-03.mjs';
import { ARTICLES as BATCH_04 } from './data-articles-aeo-geo-04.mjs';
import { ARTICLES as BATCH_05 } from './data-articles-aeo-geo-05.mjs';
import { ARTICLES as BATCH_06 } from './data-articles-aeo-geo-06.mjs';
import { ARTICLES as BATCH_07 } from './data-articles-aeo-geo-07.mjs';
import { ARTICLES as BATCH_08 } from './data-articles-aeo-geo-08.mjs';
import { ARTICLES as BATCH_09 } from './data-articles-aeo-geo-09.mjs';
import { ARTICLES as BATCH_10 } from './data-articles-aeo-geo-10.mjs';

// Sorted by publish number so every consumer that iterates this list sees the drip order.
export const ARTICLES = [
  ...BATCH_01, ...BATCH_02, ...BATCH_03, ...BATCH_04, ...BATCH_05,
  ...BATCH_06, ...BATCH_07, ...BATCH_08, ...BATCH_09, ...BATCH_10,
].sort((a, b) => a.publishOrder - b.publishOrder);
