import { ILLUSTRATION_SLOTS, WHERE_BUYERS_ASK, RESULTS_VIEW } from './ai-visibility-content.js';
import { imageFromSlot } from './page-images.js';

export const AI_VISIBILITY_IMAGES = [
  imageFromSlot(ILLUSTRATION_SLOTS.hero),
  ...WHERE_BUYERS_ASK.cards.map(imageFromSlot),
  ...RESULTS_VIEW.panels.map(imageFromSlot),
  imageFromSlot(ILLUSTRATION_SLOTS.report),
  imageFromSlot(ILLUSTRATION_SLOTS.vehicle),
];
export const aiImage = (slug) => AI_VISIBILITY_IMAGES.find((item) => item.slug === slug);
