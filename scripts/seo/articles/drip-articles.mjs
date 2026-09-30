// Every drip-published (Avalanche) article module, in one list. The single aggregator the
// builders, the publisher, the Blog Studio context/validator and the tests import, so a new
// content module is registered in exactly one place instead of nine.
//
// Blog Studio posts are NOT here: they are JSON files loaded at runtime by blog-loader.mjs.

import { ARTICLES as MARKETPLACE_A } from './data-articles-marketplace-a.mjs';
import { ARTICLES as MARKETPLACE_B } from './data-articles-marketplace-b.mjs';
import { ARTICLES as PHOTOS } from './data-articles-photos.mjs';
import { ARTICLES as GROWTH } from './data-articles-growth.mjs';
import { ARTICLES as META_TOOLS } from './data-articles-meta-tools.mjs';
import { ARTICLES as COMPARE } from './data-articles-compare.mjs';
import { ARTICLES as AEO_GEO } from './data-articles-aeo-geo.mjs';

export {
  MARKETPLACE_A, MARKETPLACE_B, PHOTOS, GROWTH, META_TOOLS, COMPARE, AEO_GEO,
};

export const DRIP_ARTICLES = [
  ...MARKETPLACE_A, ...MARKETPLACE_B, ...PHOTOS, ...GROWTH, ...META_TOOLS, ...COMPARE, ...AEO_GEO,
];
