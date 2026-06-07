import { buildRecommendations } from './recommendations.js';

const AI_SUMMARY_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: [
    'headline',
    'executiveSummary',
    'whatIsWorking',
    'interestingSignals',
    'risks',
    'recommendedActions',
    'trackingNotes',
  ],
  properties: {
    headline: {
      type: 'string',
      description: 'One short sentence that names the main story in the data.',
    },
    executiveSummary: {
      type: 'string',
      description: 'A simple 2-4 sentence explanation of what the selected date range means.',
    },
    whatIsWorking: {
      type: 'array',
      items: insightItemSchema('A positive signal in the data.'),
    },
    interestingSignals: {
      type: 'array',
      items: insightItemSchema('A useful pattern worth knowing.'),
    },
    risks: {
      type: 'array',
      items: insightItemSchema('A problem, gap, or uncertainty.'),
    },
    recommendedActions: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['priority', 'title', 'why', 'nextStep'],
        properties: {
          priority: {
            type: 'string',
            enum: ['high', 'medium', 'low'],
          },
          title: {
            type: 'string',
          },
          why: {
            type: 'string',
          },
          nextStep: {
            type: 'string',
          },
        },
      },
    },
    trackingNotes: {
      type: 'array',
      items: insightItemSchema('A tracking or attribution note.'),
    },
  },
};

function insightItemSchema(description) {
  return {
    type: 'object',
    additionalProperties: false,
    required: ['title', 'meaning'],
    description,
    properties: {
      title: {
        type: 'string',
      },
      meaning: {
        type: 'string',
      },
    },
  };
}

export async function buildAiSummaryPayload(env, days, insights) {
  if (!env.OPENAI_API_KEY) {
    return {
      ok: false,
      reason: 'openai_not_configured',
      message: 'AI Summary needs the OPENAI_API_KEY worker secret before it can run.',
    };
  }

  const model = env.ADMIN_AI_MODEL || env.OPENAI_MODEL || 'gpt-5.4-mini';
  const snapshot = compactInsights(insights);
  const deterministicRecommendations = buildRecommendations({
    insights: {
      campaigns: insights.byCampaign || [],
      ads: insights.byAd || [],
      adsPrior: [],
    },
    health: insights.health,
    setup: insights.setup,
  }).slice(0, 8);

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      instructions: buildInstructions(days),
      input: [
        {
          role: 'user',
          content: JSON.stringify({
            selectedRangeDays: days,
            reportSnapshot: snapshot,
            ruleBasedRecommendations: deterministicRecommendations,
          }),
        },
      ],
      max_output_tokens: positiveNumber(env.ADMIN_AI_MAX_OUTPUT_TOKENS, 8000),
      ...reasoningOptions(env, model),
      store: false,
      text: {
        format: {
          type: 'json_schema',
          name: 'autolander_admin_ai_summary',
          strict: true,
          schema: AI_SUMMARY_SCHEMA,
        },
      },
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    console.error('Admin AI summary request failed', response.status, detail.slice(0, 500));
    return {
      ok: false,
      reason: 'ai_summary_failed',
      message: 'AI Summary could not run right now. Check the OpenAI key, model, and worker logs.',
    };
  }

  const data = await response.json();
  const responseError = modelResponseError(data);
  if (responseError) {
    console.error('Admin AI summary response did not complete', JSON.stringify(responseError).slice(0, 500));
    return {
      ok: false,
      reason: responseError.reason,
      message: responseError.message,
    };
  }

  const summary = parseStructuredResponse(data);
  if (!summary) {
    console.error('Admin AI summary response could not be parsed', JSON.stringify(responsePreview(data)).slice(0, 500));
    return {
      ok: false,
      reason: 'ai_summary_parse_failed',
      message: 'AI Summary returned an unreadable response. Try again in a moment.',
    };
  }

  return {
    ok: true,
    generatedAt: new Date().toISOString(),
    model,
    range: insights.range,
    summary,
  };
}

function reasoningOptions(env, model) {
  if (env.ADMIN_AI_REASONING_EFFORT === 'off') return {};
  if (!isReasoningModel(model)) return {};
  return {
    reasoning: {
      effort: env.ADMIN_AI_REASONING_EFFORT || 'high',
    },
  };
}

function isReasoningModel(model) {
  return /^(gpt-5|o[1-9]|o\d-|o\d\b)/i.test(String(model || ''));
}

function modelResponseError(data) {
  if (data?.status === 'incomplete') {
    const detail = data?.incomplete_details?.reason || 'incomplete';
    return {
      reason: detail === 'max_output_tokens' ? 'ai_summary_token_limit' : 'ai_summary_incomplete',
      message:
        detail === 'max_output_tokens'
          ? 'AI Summary ran out of response space. Try again in a moment.'
          : 'AI Summary could not finish. Try again in a moment.',
    };
  }

  if (data?.status === 'failed' || data?.error) {
    return {
      reason: 'ai_summary_failed',
      message: 'AI Summary could not run right now. Check the OpenAI key, model, and worker logs.',
    };
  }

  const refusal = extractRefusal(data);
  if (refusal) {
    return {
      reason: 'ai_summary_refused',
      message: 'AI Summary could not analyze this report safely. Try again with a different date range.',
    };
  }

  return null;
}

function extractRefusal(data) {
  for (const item of data?.output || []) {
    for (const content of item?.content || []) {
      if (content?.type === 'refusal' && typeof content.refusal === 'string') {
        return content.refusal;
      }
    }
  }
  return '';
}

function responsePreview(data) {
  return {
    id: data?.id,
    status: data?.status,
    incomplete_details: data?.incomplete_details,
    error: data?.error,
    output_types: (data?.output || []).map((item) => ({
      type: item?.type,
      status: item?.status,
      content: (item?.content || []).map((content) => content?.type),
    })),
    output_text_preview: typeof data?.output_text === 'string' ? data.output_text.slice(0, 180) : '',
  };
}

function buildInstructions(days) {
  return `
You are a senior Meta Ads analyst reviewing AutoLander's paid traffic, funnel, and attribution data.
Explain the meaning in simple language for a business owner who wants to know what is working and what to change.
Use concrete numbers from the report whenever they are available.
Prioritize useful Meta Ads actions: budget shifts, pausing waste, creative testing, placement/device observations, landing page friction, retargeting ideas, and tracking gaps.
Give practical do/don't guidance. If the data is weak, say what not to change yet and what evidence would justify the next move.
Avoid generic advice. Every recommendation should tie back to a metric, a missing-data gap, or a named campaign/ad when available.
Use the rule-based recommendations as a safety baseline, but improve the prioritization and explain the business reasoning behind each action.
Call out when the data is thin, missing spend, missing campaign/ad IDs, or not statistically strong enough for a confident call.
Do not claim to identify exact people, raw IP addresses, demographics, income, intent, or identities. This report uses privacy-safe traffic signals.
Do not invent data that is not in the JSON. If something is unknown, say it is unknown.
Keep the tone direct, practical, and expert. The selected reporting range is ${days} days.
`;
}

function compactInsights(insights) {
  const totals = insights?.totals || {};
  const funnel = insights?.funnel || {};
  const health = insights?.health || {};
  const breakdowns = insights?.breakdowns || {};

  return {
    range: insights?.range,
    totals: {
      spend: moneyNumber(totals.spend),
      pageViews: number(totals.pageViews),
      uniqueVisitors: number(totals.uniqueVisitors),
      uniqueSessions: number(totals.uniqueSessions),
      newVisitors: number(totals.newVisitors),
      returningVisitors: number(totals.returningVisitors),
      engagedVisits: number(totals.engagedVisits),
      deepScrolls: number(totals.deepScrolls),
      leads: number(totals.leads),
      bookedDemos: number(totals.schedules),
      costPerLead: moneyNumber(totals.cpl),
      costPerDemo: moneyNumber(totals.cps),
      leadRateFromPageView: rate(totals.leads, totals.pageViews),
      demoRateFromPageView: rate(totals.schedules, totals.pageViews),
      demoRateFromLead: rate(totals.schedules, totals.leads),
      engagedShare: rate(totals.engagedVisits, totals.uniqueVisitors || totals.pageViews),
      deepScrollShare: rate(totals.deepScrolls, totals.uniqueVisitors || totals.pageViews),
      returningShare: rate(totals.returningVisitors, totals.newVisitors + totals.returningVisitors),
    },
    funnel: {
      pageView: number(funnel.pageView),
      viewContent: number(funnel.viewContent),
      lead: number(funnel.lead),
      initiateCheckout: number(funnel.initiateCheckout),
      bookedDemo: number(funnel.schedule),
      viewContentRate: rate(funnel.viewContent, funnel.pageView),
      leadRate: rate(funnel.lead, funnel.pageView),
      demoRate: rate(funnel.schedule, funnel.pageView),
      leadToDemoRate: rate(funnel.schedule, funnel.lead),
    },
    health: {
      metaVisits: number(health.metaVisits),
      fbclidCaptureRate: percentNumber(health.fbclidCaptureRate),
      campaignIdRate: percentNumber(health.campaignIdRate),
      adIdRate: percentNumber(health.adIdRate),
      dedupeRate: percentNumber(health.dedupedShare),
      browserShare: percentNumber(health.browserShare),
      serverShare: percentNumber(health.serverShare),
      capiSuccessRate: percentNumber(health.capiSuccessRate),
      missingCampaignId: number(health.missingCampaignId),
      missingAdId: number(health.missingAdId),
      unresolvedParamHits: number(health.unresolvedParamHits),
    },
    topCampaigns: compactPerformanceRows(insights?.byCampaign, 'campaign').slice(0, 8),
    topAds: compactPerformanceRows(insights?.byAd, 'ad').slice(0, 10),
    dailyTrend: compactDailyTrend(insights?.byDay),
    breakdowns: {
      trafficCategory: compactBreakdown(breakdowns.trafficCategory),
      device: compactBreakdown(breakdowns.device),
      visitorType: compactBreakdown(breakdowns.visitorType),
      intent: compactBreakdown(breakdowns.intent),
      placement: compactBreakdown(breakdowns.placement),
      siteSource: compactBreakdown(breakdowns.siteSource),
      referrerDomain: compactBreakdown(breakdowns.referrerDomain),
      landingPage: compactBreakdown(breakdowns.landingPage),
      pagePath: compactBreakdown(breakdowns.pagePath),
      browser: compactBreakdown(breakdowns.browser),
      os: compactBreakdown(breakdowns.os),
      viewport: compactBreakdown(breakdowns.viewport),
      connection: compactBreakdown(breakdowns.connection),
      country: compactBreakdown(breakdowns.country),
      region: compactBreakdown(breakdowns.region),
      network: compactBreakdown(breakdowns.network),
      networkOrg: compactBreakdown(breakdowns.networkOrg),
      weekday: compactBreakdown(breakdowns.weekday),
      scrollDepth: compactBreakdown(breakdowns.scrollDepth),
      hour: topHours(breakdowns.hour),
    },
    recentEvents: compactRecentEvents(insights?.recentEvents),
    setup: {
      metaInsightsReady: Boolean(insights?.metaInsightsReady),
      hasPixelId: Boolean(insights?.setup?.hasPixelId),
      hasCapiToken: Boolean(insights?.setup?.hasCapiToken),
      hasMetaMarketingToken: Boolean(insights?.setup?.hasMetaMarketingToken),
      hasAdAccountId: Boolean(insights?.setup?.hasAdAccountId),
      hasTrackingKv: Boolean(insights?.setup?.hasTrackingKv),
      testEventMode: Boolean(insights?.setup?.testEventCode),
    },
  };
}

function compactPerformanceRows(rows, type) {
  if (!Array.isArray(rows)) return [];
  return rows
    .filter((row) => row && (row.spend > 0 || row.leads > 0 || row.schedules > 0))
    .map((row) => ({
      type,
      name: cleanText(type === 'campaign' ? row.name : row.ad_name, 120),
      campaign: cleanText(row.campaign_name || row.name, 120),
      adset: cleanText(row.adset_name, 120),
      spend: moneyNumber(row.spend),
      impressions: number(row.impressions),
      clicks: number(row.clicks),
      ctrPercent: decimal(row.ctr),
      cpm: moneyNumber(row.cpm),
      frequency: decimal(row.frequency),
      leads: number(row.leads),
      bookedDemos: number(row.schedules),
      costPerLead: moneyNumber(row.cpl),
      costPerDemo: moneyNumber(row.cps),
      attributionStatus: row.attribution_status || '',
    }))
    .sort((a, b) => b.spend - a.spend);
}

function compactDailyTrend(rows) {
  if (!Array.isArray(rows)) return [];
  return rows.slice(-21).map((row) => ({
    date: row.date,
    pageViews: number(row.pageView),
    uniqueVisitors: number(row.uniqueVisitors),
    viewContent: number(row.viewContent),
    leads: number(row.lead),
    bookedDemos: number(row.schedule),
  }));
}

function compactBreakdown(rows) {
  if (!Array.isArray(rows)) return [];
  return rows
    .filter((row) => row && row.value > 0)
    .slice(0, 8)
    .map((row) => ({
      name: cleanText(row.name, 140),
      value: number(row.value),
      share: percentNumber(row.share),
    }));
}

function topHours(rows) {
  if (!Array.isArray(rows)) return [];
  return rows
    .filter((row) => row && (row.pageViews > 0 || row.leads > 0 || row.schedules > 0))
    .sort((a, b) => b.pageViews + b.leads * 5 + b.schedules * 10 - (a.pageViews + a.leads * 5 + a.schedules * 10))
    .slice(0, 8)
    .map((row) => ({
      hour: row.label || row.hour,
      pageViews: number(row.pageViews),
      leads: number(row.leads),
      bookedDemos: number(row.schedules),
    }));
}

function compactRecentEvents(events) {
  if (!Array.isArray(events)) return [];
  return events.slice(0, 12).map((row) => ({
    event: cleanText(row.event, 80),
    at: cleanText(row.at, 40),
    source: cleanText(row.traffic_category || row.utm_source || row.site_source_name, 80),
    device: cleanText(row.device, 40),
    browser: cleanText(row.browser, 40),
    os: cleanText(row.os, 40),
    country: cleanText(row.country, 40),
    region: cleanText(row.region, 60),
    page: cleanText(row.current_path || row.landing_path, 120),
    intent: cleanText(row.intent, 80),
    campaign: cleanText(row.utm_campaign, 140),
    ad: cleanText(row.utm_content, 140),
  }));
}

function parseStructuredResponse(data) {
  const parsedContent = extractParsedContent(data);
  if (parsedContent) return sanitizeSummary(parsedContent);

  const text = extractOutputText(data);
  if (!text) return null;

  try {
    const parsed = JSON.parse(text);
    return sanitizeSummary(parsed);
  } catch {
    return null;
  }
}

function sanitizeSummary(parsed) {
  if (!parsed || typeof parsed !== 'object') return null;
  return {
    headline: cleanText(parsed.headline, 220),
    executiveSummary: cleanText(parsed.executiveSummary, 1200),
    whatIsWorking: sanitizeInsightItems(parsed.whatIsWorking),
    interestingSignals: sanitizeInsightItems(parsed.interestingSignals),
    risks: sanitizeInsightItems(parsed.risks),
    recommendedActions: sanitizeActions(parsed.recommendedActions),
    trackingNotes: sanitizeInsightItems(parsed.trackingNotes),
  };
}

function extractParsedContent(data) {
  for (const item of data?.output || []) {
    for (const content of item?.content || []) {
      if (content?.parsed && typeof content.parsed === 'object') {
        return content.parsed;
      }
    }
  }
  return null;
}

function extractOutputText(data) {
  if (typeof data?.output_text === 'string') return data.output_text;
  const parts = [];
  for (const item of data?.output || []) {
    for (const content of item?.content || []) {
      if (content?.type === 'output_text' && typeof content.text === 'string') {
        parts.push(content.text);
      }
    }
  }
  return parts.join('');
}

function sanitizeInsightItems(items) {
  if (!Array.isArray(items)) return [];
  return items.slice(0, 5).map((item) => ({
    title: cleanText(item?.title, 140),
    meaning: cleanText(item?.meaning, 500),
  }));
}

function sanitizeActions(items) {
  if (!Array.isArray(items)) return [];
  return items.slice(0, 6).map((item) => ({
    priority: ['high', 'medium', 'low'].includes(item?.priority) ? item.priority : 'medium',
    title: cleanText(item?.title, 160),
    why: cleanText(item?.why, 500),
    nextStep: cleanText(item?.nextStep, 500),
  }));
}

function cleanText(value, maxLength) {
  if (value === null || value === undefined) return '';
  return String(value).replace(/\s+/g, ' ').trim().slice(0, maxLength);
}

function number(value) {
  const parsed = Number(value || 0);
  return Number.isFinite(parsed) ? Math.round(parsed) : 0;
}

function decimal(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Number(parsed.toFixed(2)) : null;
}

function moneyNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Number(parsed.toFixed(2)) : null;
}

function percentNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Number(parsed.toFixed(4)) : null;
}

function positiveNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function rate(numerator, denominator) {
  const top = Number(numerator || 0);
  const bottom = Number(denominator || 0);
  if (!Number.isFinite(top) || !Number.isFinite(bottom) || bottom <= 0) return null;
  return Number((top / bottom).toFixed(4));
}
