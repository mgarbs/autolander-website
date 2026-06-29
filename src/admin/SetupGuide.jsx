import { useState } from 'react';
import { CheckCircle2, ChevronDown, CircleAlert, Clipboard, Settings2 } from 'lucide-react';

const ENABLEMENT_STEPS = [
  {
    title: '1. Copy the tracking string',
    body:
      'Use the exact URL parameter string below. Do not add a question mark at the front. Meta adds it to the final URL automatically.',
    bullets: [
      'Keep your Website URL clean, like https://autolander.ai/',
      'Paste this string into the URL parameters field, not into the Website URL field.',
      'Use the double curly brackets exactly as shown because Meta fills those values in after someone clicks.',
    ],
  },
  {
    title: '2. Add it to every Meta ad',
    body:
      'Open Meta Ads Manager and work at the ad level. This is the safest place because the dashboard needs ad IDs, ad set IDs, campaign IDs, placements, and source platform.',
    bullets: [
      'Go to Ads Manager, open the campaign, then switch to the Ads tab.',
      'Select the ads you want to update. For one ad, click Edit. For many ads, select them and use bulk edit.',
      'Find the Tracking section, then open URL parameters.',
      'Paste the full parameter string into URL parameters and publish the changes.',
      'Repeat for every active ad, including retargeting, tests, duplicated ads, and Advantage+ ads if they are edited separately.',
    ],
  },
  {
    title: '3. Confirm the campaign connection',
    body:
      'The dashboard becomes strongest when the worker can see both sides: Meta spend from the ad account and site events from the tracker.',
    bullets: [
      'Pixel ID configured means browser events can be sent to Meta.',
      'Conversions API token means server events can be sent to Meta.',
      'Ad account connected means the dashboard can pull spend, impressions, clicks, CTR, CPM, and frequency.',
      'Tracking storage means the dashboard can remember visits, traffic sources, devices, and conversion events.',
      'GHL lead routing configured means submitted demo applications can enter the CRM workflow.',
    ],
  },
  {
    title: '4. Test before judging performance',
    body:
      'After publishing the ads, send a real test click through an ad preview or a live ad and make sure the URL fills in real values.',
    bullets: [
      'The landing page URL should include values like campaign_id=238..., ad_id=238..., placement=..., and site_source_name=fb or ig.',
      'If you still see {{campaign.id}} or {{ad.id}} in the live URL, the parameters were not inserted by Meta correctly.',
      'Check this dashboard after new traffic arrives. Old visitors will not magically receive the new UTM fields.',
      'Meta ID Capture and fbclid Capture should climb as new Meta traffic comes in.',
    ],
  },
  {
    title: '5. Use the AI Summary once data is flowing',
    body:
      'The AI Summary works best after the dashboard has clean Meta IDs, spend data, traffic source data, and enough leads or demo events to compare.',
    bullets: [
      'Run it after campaigns have meaningful traffic, not immediately after setup.',
      'Use it to spot winning campaigns, weak ads, mobile issues, placement patterns, tracking gaps, and next optimization moves.',
      'If the AI says data is thin, wait for more traffic before making big budget changes.',
    ],
  },
];

const PARAMETER_MEANINGS = [
  { name: 'utm_source=meta', meaning: 'Marks the visit as coming from Meta paid traffic.' },
  { name: 'utm_medium=cpc', meaning: 'Labels the traffic as paid click traffic.' },
  { name: 'utm_campaign={{campaign.name}}', meaning: 'Stores the campaign name for readable reporting.' },
  { name: 'utm_content={{ad.name}}', meaning: 'Stores the ad name so you can compare creative.' },
  { name: 'utm_term={{adset.name}}', meaning: 'Stores the ad set or audience name.' },
  { name: 'utm_id={{campaign.id}}', meaning: 'Stores the campaign ID for more reliable joins.' },
  { name: 'campaign_id={{campaign.id}}', meaning: 'Lets the dashboard match conversions to Meta campaign spend.' },
  { name: 'adset_id={{adset.id}}', meaning: 'Lets the dashboard identify the ad set that drove the visit.' },
  { name: 'ad_id={{ad.id}}', meaning: 'Lets the dashboard match conversions to the exact ad.' },
  { name: 'placement={{placement}}', meaning: 'Shows whether the click came from Feed, Reels, Stories, and similar surfaces.' },
  { name: 'site_source_name={{site_source_name}}', meaning: 'Shows whether the click came from Facebook, Instagram, Messenger, or Audience Network.' },
];

export default function SetupGuide({ setup }) {
  const items = [
    { label: 'Pixel ID configured', ok: setup.hasPixelId },
    { label: 'Conversions API token', ok: setup.hasCapiToken },
    { label: 'Ad account connected', ok: setup.hasAdAccountId && setup.hasMetaMarketingToken },
    { label: 'GHL lead routing', ok: setup.hasGhlLeadRouting },
    { label: 'Tracking storage', ok: setup.hasTrackingKv },
    {
      label: setup.testEventCode ? 'Test events mode' : 'Live events mode',
      ok: !setup.testEventCode,
      neutral: Boolean(setup.testEventCode),
    },
  ];

  return (
    <section className="rounded-3xl border border-white/5 bg-white/[0.03] p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Settings2 className="h-4 w-4 text-blue-300" aria-hidden="true" />
            <h3 className="text-sm font-black uppercase italic tracking-tight text-white">Setup checklist</h3>
          </div>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
            Follow this guide to connect Meta campaigns, UTMs, Pixel, Conversions API, spend, and demo applications into one
            clean reporting view.
          </p>
        </div>
        <StatusPill items={items} />
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <SetupStatus key={item.label} item={item} />
        ))}
      </div>

      {setup.urlParamTemplate && <UrlParameterBox value={setup.urlParamTemplate} />}

      <div className="mt-6 space-y-3">
        <ExpandableSection title="Step by step: add Meta URL parameters" defaultOpen>
          <div className="space-y-4">
            {ENABLEMENT_STEPS.map((step) => (
              <div key={step.title} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-sm font-black text-white">{step.title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">{step.body}</p>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-400">
                  {step.bullets.map((bullet) => (
                    <li key={bullet} className="flex gap-2">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-300" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </ExpandableSection>

        <ExpandableSection title="What each tracking parameter means">
          <div className="grid gap-3 md:grid-cols-2">
            {PARAMETER_MEANINGS.map((param) => (
              <div key={param.name} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <code className="block overflow-x-auto whitespace-pre text-[11px] font-bold text-blue-100">
                  {param.name}
                </code>
                <p className="mt-2 text-sm leading-6 text-slate-400">{param.meaning}</p>
              </div>
            ))}
          </div>
        </ExpandableSection>

        <ExpandableSection title="How to know the dashboard is fully enabled">
          <div className="grid gap-3 md:grid-cols-2">
            <Signal
              title="Campaign and ad tables fill in"
              body="Spend, clicks, impressions, leads, demos, CPL, and cost per demo appear by campaign and ad."
            />
            <Signal
              title="Meta ID Capture is high"
              body="Campaign ID and ad ID capture should trend toward 90%+ for new Meta traffic after the parameters are live."
            />
            <Signal
              title="fbclid Capture is high"
              body="Meta-sourced visits should usually arrive with fbclid. Low capture can mean the click path is stripping URL parameters."
            />
            <Signal
              title="Traffic Explorer gets richer"
              body="Device, placement, platform, landing page, hour, returning visitor, country, browser, and intent views become more useful."
            />
            <Signal
              title="Demo applications show up"
              body="Applications appear when the custom form reaches the Worker and the contact is routed into the GHL workflow."
            />
            <Signal
              title="AI Summary has enough signal"
              body="The AI can explain what is working once there is clean spend, traffic, and conversion data in the selected range."
            />
          </div>
        </ExpandableSection>
      </div>
    </section>
  );
}

function SetupStatus({ item }) {
  const isOk = item.ok && !item.neutral;
  const Icon = item.neutral ? CircleAlert : isOk ? CheckCircle2 : CircleAlert;
  return (
    <div
      className={`flex items-center gap-3 rounded-2xl border p-4 ${
        item.neutral
          ? 'border-amber-500/30 bg-amber-500/10'
          : isOk
            ? 'border-emerald-500/30 bg-emerald-500/10'
            : 'border-red-500/30 bg-red-500/10'
      }`}
    >
      <Icon
        className={`h-5 w-5 shrink-0 ${
          item.neutral ? 'text-amber-300' : isOk ? 'text-emerald-300' : 'text-red-300'
        }`}
        aria-hidden="true"
      />
      <span className="text-sm font-bold text-white">{item.label}</span>
    </div>
  );
}

function StatusPill({ items }) {
  const ready = items.filter((item) => item.ok && !item.neutral).length;
  const total = items.length;
  return (
    <div className="inline-flex shrink-0 rounded-full border border-white/10 bg-black/30 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-300">
      {ready}/{total} ready
    </div>
  );
}

function UrlParameterBox({ value }) {
  return (
    <div className="mt-6 rounded-2xl border border-blue-400/20 bg-blue-500/[0.06] p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-blue-200">Meta ad URL parameters</p>
          <p className="mt-1 text-xs leading-5 text-slate-400">
            Paste into every Meta ad's URL parameters field so spend ties back to leads and demos.
          </p>
        </div>
        <CopyButton value={value} />
      </div>
      <code className="mt-3 block max-w-full overflow-x-auto whitespace-pre rounded-xl border border-white/10 bg-black/40 p-3 text-[11px] text-slate-200">
        {value}
      </code>
    </div>
  );
}

function ExpandableSection({ title, children, defaultOpen = false }) {
  return (
    <details className="group rounded-2xl border border-white/10 bg-black/20 p-4" open={defaultOpen}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
        <span className="text-sm font-black uppercase italic tracking-tight text-white">{title}</span>
        <ChevronDown
          className="h-4 w-4 shrink-0 text-slate-400 transition group-open:rotate-180"
          aria-hidden="true"
        />
      </summary>
      <div className="mt-4">{children}</div>
    </details>
  );
}

function Signal({ title, body }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <p className="text-sm font-black text-white">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-400">{body}</p>
    </div>
  );
}

function CopyButton({ value }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard may be blocked in some browsers */
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-white transition hover:bg-white/20"
    >
      <Clipboard className="h-3.5 w-3.5" aria-hidden="true" />
      {copied ? 'Copied' : 'Copy params'}
    </button>
  );
}
