// shared/ai-scan-form.js  (authored by Claude)
// Form constants shared by the /ai-visibility page and the Worker's POST /api/ai-scan route.
// Frozen contract: any change is a Claude-authored change shipped with a Worker redeploy.
// A consent-text change ALWAYS bumps SMS_CONSENT.version; the retired version goes in
// SMS_CONSENT_PREVIOUS as { version, text, retiredAt: 'YYYY-MM-DD' } and stays accepted for 30 days.

export const ROLE_CHOICES = [
  'Owner / dealer principal',
  'General manager',
  'Sales or used-car manager',
  'Salesperson',
  'Marketing',
  'Other',
];

export const BRAND_ROLE_CHOICES = ['Owner or executive', 'Marketing', 'Agency or consultant', 'Other'];

// SMS consent (CTIA / 10DLC): brand, purpose, frequency, not a condition of purchase, rates, STOP/HELP,
// links. The box starts UNCHECKED and is optional.
export const SMS_CONSENT = {
  version: 'ai-scan-sms-consent-v2-2026-09-28',
  text: 'Text me about my AI Visibility Scan. I agree to receive text messages from AutoLander at the mobile number above about my scan request and walkthrough, up to 4 messages per request. Consent is not a condition of any purchase. Message and data rates may apply. Reply STOP to opt out or HELP for help.',
  links: [
    { label: 'Privacy Policy', href: '/privacy.html' },
    { label: 'Terms', href: '/terms.html' },
  ],
};

export const SMS_CONSENT_PREVIOUS = null;
