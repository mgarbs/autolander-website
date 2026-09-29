import manifest from './responsive-image-manifest.json' with { type: 'json' };
import { ILLUSTRATION_SLOTS, WHERE_BUYERS_ASK, RESULTS_VIEW } from './ai-visibility-content.js';

const image = (slot) => ({ ...manifest[slot.image], slug: slot.image, alt: slot.alt });
export const AI_VISIBILITY_IMAGES = [
  image(ILLUSTRATION_SLOTS.hero),
  ...WHERE_BUYERS_ASK.cards.map(image),
  ...RESULTS_VIEW.panels.map(image),
  image(ILLUSTRATION_SLOTS.report),
  image(ILLUSTRATION_SLOTS.vehicle),
];
export const aiImage = (slug) => AI_VISIBILITY_IMAGES.find((item) => item.slug === slug);
export const TEAM_IMAGES = {
  hero: image({ image: 'sales-hub', alt: 'AutoLander Sales Hub showing vehicle inventory and Marketplace posting tools' }),
  dashboard: image({ image: 'dashboard', alt: 'AutoLander Manager Dashboard showing team posts, active listings and sold vehicles' }),
  access: image({ image: 'team-access', alt: 'AutoLander Team Access screen with posting seats and Manager Dashboard access set per person, with names hidden' }),
  autopilot: image({ image: 'autopilot', alt: 'AutoLander AutoPilot controls for scheduling Marketplace vehicle posts' }),
};
