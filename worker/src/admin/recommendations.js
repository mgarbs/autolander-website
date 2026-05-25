const CONVERSION_THRESHOLDS = {
  pauseSpendNoConversion: 50,
  scaleMinConversions: 5,
  scaleCplPercentileMax: 0.75,
  fatigueCtrDropPercent: 30,
  highFrequency: 3.5,
  pixelHealthMinDedupe: 0.7,
  pixelHealthMinServerShare: 0.4,
  fbclidCaptureMin: 0.8,
};

const URL_PARAM_TEMPLATE =
  'utm_source=meta&utm_medium=cpc&utm_campaign={{campaign.name}}&utm_content={{ad.name}}&utm_term={{adset.name}}';

export function buildRecommendations({ insights, health, setup }) {
  const recs = [];

  recs.push(...buildSetupRecommendations(setup));
  recs.push(...buildPauseRecommendations(insights));
  recs.push(...buildScaleRecommendations(insights));
  recs.push(...buildFatigueRecommendations(insights));
  recs.push(...buildFrequencyRecommendations(insights));
  recs.push(...buildPixelHealthRecommendations(health));

  return recs.sort((a, b) => severityOrder(a.severity) - severityOrder(b.severity));
}

function severityOrder(s) {
  return { urgent: 0, warn: 1, info: 2 }[s] ?? 3;
}

function buildSetupRecommendations(setup) {
  const recs = [];
  if (!setup) return recs;

  if (!setup.hasPixelId) {
    recs.push({
      severity: 'urgent',
      title: 'Meta Pixel ID is not configured',
      body: 'Set META_PIXEL_ID in the worker secrets so events can reach Meta.',
      action: { type: 'env', name: 'META_PIXEL_ID' },
    });
  }
  if (!setup.hasCapiToken) {
    recs.push({
      severity: 'urgent',
      title: 'Conversions API access token is missing',
      body: 'Generate a CAPI token in Events Manager and set META_CAPI_ACCESS_TOKEN.',
      action: { type: 'env', name: 'META_CAPI_ACCESS_TOKEN' },
    });
  }
  if (!setup.hasCalendlySigningKey) {
    recs.push({
      severity: 'warn',
      title: 'Calendly webhook is not signed',
      body: 'Create a Calendly webhook subscription pointing at /capi/calendly and store the signing key.',
      action: { type: 'env', name: 'CALENDLY_SIGNING_KEY' },
    });
  }
  if (!setup.hasMetaMarketingToken || !setup.hasAdAccountId) {
    recs.push({
      severity: 'warn',
      title: 'Ad spend data is unavailable',
      body: 'Set META_AD_ACCOUNT_ID and META_MARKETING_ACCESS_TOKEN so the dashboard can pull spend.',
      action: { type: 'env', name: 'META_AD_ACCOUNT_ID' },
    });
  }
  if (setup.testEventCode) {
    recs.push({
      severity: 'info',
      title: 'Test Event mode is active',
      body: `META_TEST_EVENT_CODE=${setup.testEventCode}. Events flow to Test Events only — unset to go live.`,
      action: { type: 'env', name: 'META_TEST_EVENT_CODE' },
    });
  }

  return recs;
}

function buildPauseRecommendations({ ads }) {
  if (!Array.isArray(ads)) return [];
  return ads
    .filter((ad) => ad.spend >= CONVERSION_THRESHOLDS.pauseSpendNoConversion && (ad.schedules || 0) === 0)
    .slice(0, 5)
    .map((ad) => ({
      severity: 'urgent',
      title: `Pause "${ad.ad_name || ad.ad_id}" — $${ad.spend.toFixed(0)} spent, 0 demos`,
      body: `Campaign: ${ad.campaign_name || '—'}. Over the selected window this ad has spent $${ad.spend.toFixed(2)} with no booked demos. Pause or replace creative.`,
      action: { type: 'pause_ad', adId: ad.ad_id, adName: ad.ad_name },
    }));
}

function buildScaleRecommendations({ campaigns }) {
  if (!Array.isArray(campaigns)) return [];
  const eligible = campaigns.filter(
    (c) => (c.schedules || 0) >= CONVERSION_THRESHOLDS.scaleMinConversions && c.cps !== null && c.spend > 0,
  );
  if (eligible.length === 0) return [];

  const sorted = [...eligible].sort((a, b) => a.cps - b.cps);
  const median = sorted[Math.floor(sorted.length / 2)].cps;
  return sorted
    .filter((c) => c.cps <= median * CONVERSION_THRESHOLDS.scaleCplPercentileMax)
    .slice(0, 3)
    .map((c) => ({
      severity: 'info',
      title: `Scale "${c.name}" — $${c.cps.toFixed(2)} cost per demo`,
      body: `Best-performing campaign in this window. Cost per booked demo is ${(((median - c.cps) / median) * 100).toFixed(0)}% below your median. Consider scaling budget 20%.`,
      action: { type: 'scale_campaign', campaign: c.name },
    }));
}

function buildFatigueRecommendations({ ads, adsPrior }) {
  if (!Array.isArray(ads) || !Array.isArray(adsPrior)) return [];
  const priorById = new Map(adsPrior.map((row) => [row.ad_id || row.ad_name, row]));

  return ads
    .filter((ad) => {
      const prior = priorById.get(ad.ad_id || ad.ad_name);
      if (!prior || !prior.ctr || prior.ctr <= 0) return false;
      const drop = ((prior.ctr - ad.ctr) / prior.ctr) * 100;
      return drop >= CONVERSION_THRESHOLDS.fatigueCtrDropPercent;
    })
    .slice(0, 5)
    .map((ad) => {
      const prior = priorById.get(ad.ad_id || ad.ad_name);
      const drop = ((prior.ctr - ad.ctr) / prior.ctr) * 100;
      return {
        severity: 'warn',
        title: `Creative fatigue: "${ad.ad_name || ad.ad_id}" CTR dropped ${drop.toFixed(0)}%`,
        body: `CTR fell from ${(prior.ctr * 1).toFixed(2)}% to ${(ad.ctr * 1).toFixed(2)}% week-over-week. Refresh the creative or rotate to a new angle.`,
        action: { type: 'refresh_creative', adName: ad.ad_name },
      };
    });
}

function buildFrequencyRecommendations({ ads }) {
  if (!Array.isArray(ads)) return [];
  return ads
    .filter((ad) => ad.frequency >= CONVERSION_THRESHOLDS.highFrequency)
    .slice(0, 5)
    .map((ad) => ({
      severity: 'warn',
      title: `Audience burnout: "${ad.ad_name || ad.ad_id}" frequency ${ad.frequency.toFixed(1)}`,
      body: `Each user is seeing this ad ${ad.frequency.toFixed(1)} times on average. Refresh creative or widen the audience.`,
      action: { type: 'refresh_creative', adName: ad.ad_name },
    }));
}

function buildPixelHealthRecommendations(health) {
  if (!health) return [];
  const recs = [];

  if (health.dedupedShare !== null && health.dedupedShare < CONVERSION_THRESHOLDS.pixelHealthMinDedupe) {
    recs.push({
      severity: 'warn',
      title: `Browser/server dedupe is low (${(health.dedupedShare * 100).toFixed(0)}%)`,
      body: 'Most events should have matching browser + server hits with the same event_id. Check tracker.js and that the Pixel + CAPI use the same Pixel ID.',
      action: { type: 'check_dedupe' },
    });
  }

  if (
    health.serverShare !== null &&
    health.serverShare < CONVERSION_THRESHOLDS.pixelHealthMinServerShare
  ) {
    recs.push({
      severity: 'warn',
      title: `Server-side share is low (${(health.serverShare * 100).toFixed(0)}%)`,
      body: 'Conversions API is underfiring. Verify the worker is reachable from the browser and that META_CAPI_ACCESS_TOKEN is valid.',
      action: { type: 'check_capi' },
    });
  }

  if (
    health.fbclidCaptureRate !== null &&
    health.fbclidCaptureRate < CONVERSION_THRESHOLDS.fbclidCaptureMin &&
    health.metaVisits > 20
  ) {
    recs.push({
      severity: 'warn',
      title: `fbclid capture rate is low (${(health.fbclidCaptureRate * 100).toFixed(0)}%)`,
      body: 'Meta-sourced visits should arrive with fbclid in the URL. Confirm "Pass URL parameters" is enabled in your campaigns and the auto-tagging is active.',
      action: { type: 'check_fbclid' },
    });
  }

  if (health.campaignsMissingUtm > 0) {
    recs.push({
      severity: 'warn',
      title: `${health.campaignsMissingUtm} campaign(s) missing UTM parameters`,
      body: 'Without utm_campaign/utm_content the dashboard cannot join your Meta spend to your conversions. Set the ad URL parameters below on each affected campaign.',
      action: { type: 'copy', payload: URL_PARAM_TEMPLATE },
    });
  }

  return recs;
}

export const META_URL_PARAM_TEMPLATE = URL_PARAM_TEMPLATE;
