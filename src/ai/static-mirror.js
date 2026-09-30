import {
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
  WHERE_BUYERS_ASK,
  RESULTS_VIEW,
  ILLUSTRATION_SLOTS,
  SMS_CONSENT,
  comparisonRows,
  fmtUsd,
} from '../../shared/ai-visibility-content.js';
import { aiImage } from '../../shared/ai-images.js';
import { responsiveImageHtml, IMAGE_SIZES } from '../../shared/responsive-images.js';

const esc = (value) => String(value ?? '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;');

const emailSafe = (value) => esc(value).replace(
  /\b([A-Za-z0-9._%+-]+@autolander\.ai)\b/g,
  '<!--email_off--><a class="text-blue-300 underline" href="mailto:$1">$1</a><!--/email_off-->',
);

const copy = (value) => emailSafe(value);
const eyebrow = (value) => `<p class="font-mono text-[11px] font-semibold uppercase tracking-[0.28em] text-blue-300">${copy(value)}</p>`;
const heading = (lead, grad = '') => `<h2 class="mt-5 font-display text-4xl font-extrabold uppercase italic leading-[0.94] text-white sm:text-5xl">${copy(lead)}${grad ? ` <span class="text-blue-400">${copy(grad)}</span>` : ''}</h2>`;
const list = (items, className = 'mt-5 space-y-3 text-sm leading-relaxed text-slate-300') => `<ul class="${className}">${items.map((item) => `<li class="flex gap-3"><span class="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400" aria-hidden="true"></span><span>${copy(item)}</span></li>`).join('')}</ul>`;

const image = (slug, sizes, eager = false, className) => responsiveImageHtml(aiImage(slug), { sizes, eager, className });

const reportCard = ({ title, body, accent }) => `<article class="self-start rounded-3xl border p-6 ${accent ? 'border-blue-400/30 bg-blue-500/[0.08]' : 'border-white/10 bg-white/[0.03]'}"><h3 class="font-display text-xl font-extrabold uppercase italic text-white">${copy(title)}</h3><p class="mt-3 text-[15px] leading-relaxed text-slate-400">${copy(body)}</p></article>`;

function reportMock() {
  const cell = {
    named: 'rounded bg-emerald-500/25 py-1.5 text-center text-emerald-200',
    rival: 'rounded bg-rose-500/20 py-1.5 text-center text-rose-200',
    none: 'rounded bg-white/5 py-1.5 text-center text-slate-400',
  };
  return `<div class="relative mt-5 hidden md:block">
    <div class="absolute -inset-6 -z-10 rounded-[2.5rem] bg-blue-600/20 blur-[80px]" aria-hidden="true"></div>
    <div class="rounded-3xl border border-white/10 bg-[#0b0d12]/95 p-6 shadow-2xl shadow-blue-950/50">
      <div class="flex items-center justify-between gap-4"><span class="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">${copy(REPORT_MOCK.caption)}</span><span class="rounded-full bg-white/10 px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-widest text-slate-300">${copy(REPORT_MOCK.badge)}</span></div>
      <div class="mt-5 flex items-end gap-4"><p class="font-display text-7xl font-extrabold italic text-white">${copy(REPORT_MOCK.score)}<span class="ml-1 text-2xl text-slate-500">/100</span></p><p class="mb-2 text-sm text-slate-300">${copy(REPORT_MOCK.scoreNote)}</p></div>
      <div class="mt-5 grid grid-cols-3 gap-1.5 font-mono text-[9px] uppercase tracking-wider text-slate-400"><span></span>${REPORT_MOCK.columns.map((name) => `<span class="text-center">${copy(name)}</span>`).join('')}${REPORT_MOCK.rows.map(([question, ...columns]) => `<div class="contents"><span>${copy(question)}</span>${columns.map((value) => `<span class="${cell[value]}">${copy(REPORT_MOCK.cellLabel[value])}</span>`).join('')}</div>`).join('')}</div>
      <ol class="m-0 mt-5 grid list-none gap-2 p-0 text-sm">${REPORT_MOCK.fixes.map((fix, index) => `<li class="flex gap-2 text-slate-300"><span class="text-blue-400">${index + 1}</span>${copy(fix)}</li>`).join('')}</ol>
    </div>
  </div>`;
}

function publicIllustrations() {
  return `<section class="bg-[#050505] py-20 lg:py-28"><div class="mx-auto max-w-7xl px-6">
    ${eyebrow(WHERE_BUYERS_ASK.eyebrow)}${heading(WHERE_BUYERS_ASK.h2Lead, WHERE_BUYERS_ASK.h2Grad)}
    <p class="mt-6 max-w-3xl text-lg leading-relaxed text-slate-300">${copy(WHERE_BUYERS_ASK.body)}</p>
    <div class="mt-12 grid gap-6 lg:grid-cols-2">${WHERE_BUYERS_ASK.cards.map((card) => `<article class="min-w-0 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]"><div class="p-6"><h3 class="font-display text-2xl font-extrabold uppercase italic text-white">${copy(card.name)}</h3><p class="mt-2 font-mono text-[11px] uppercase tracking-[0.2em] text-blue-300">${copy(card.maker)}</p><p class="mt-3 leading-relaxed text-slate-400">${copy(card.body)}</p></div>${image(card.image, IMAGE_SIZES.aiCard, false, 'block h-auto w-full')}</article>`).join('')}</div>
    <p class="mt-5 text-sm leading-relaxed text-slate-400">${copy(WHERE_BUYERS_ASK.caption)}</p>
    <p class="mt-6 rounded-2xl border border-blue-400/20 bg-blue-500/[0.06] px-5 py-4 leading-relaxed text-blue-200">${copy(WHERE_BUYERS_ASK.scanNote)}</p>
  </div></section>
  <section class="border-y border-white/5 bg-[#080808] py-20 lg:py-28"><div class="mx-auto max-w-7xl px-6">
    ${eyebrow(RESULTS_VIEW.eyebrow)}${heading(RESULTS_VIEW.h2Lead, RESULTS_VIEW.h2Grad)}
    <p class="mt-6 max-w-3xl text-lg leading-relaxed text-slate-300">${copy(RESULTS_VIEW.body)}</p>
    <div class="mt-12 grid gap-8">${RESULTS_VIEW.panels.map((panel) => `<article class="grid items-center gap-6 lg:grid-cols-[0.34fr_0.66fr]"><div class="rounded-3xl border border-white/10 bg-[#0b0d12] p-6"><h3 class="font-display text-3xl font-extrabold uppercase italic text-white">${copy(panel.title)}</h3><p class="mt-4 leading-relaxed text-slate-400">${copy(panel.body)}</p></div>${image(panel.image, IMAGE_SIZES.aiResults)}</article>`).join('')}</div>
    <p class="mt-5 text-sm leading-relaxed text-slate-400">${copy(RESULTS_VIEW.caption)}</p>
  </div></section>`;
}

const fieldErrors = {
  dealershipName: FORM.errors.missing_dealership,
  website: FORM.errors.invalid_website,
  location: FORM.errors.missing_location,
  fullName: FORM.errors.missing_full_name,
  role: FORM.errors.missing_role,
  email: FORM.errors.invalid_email,
  phone: FORM.errors.invalid_phone,
};

function inputField(name, field) {
  const type = name === 'email' ? 'email' : name === 'phone' ? 'tel' : name === 'website' ? 'url' : 'text';
  const inputMode = name === 'website' ? 'url' : name === 'email' ? 'email' : name === 'phone' ? 'tel' : '';
  const hint = field.hint || field.note || field.agentHint;
  const describedBy = [`scan-${name}-hint`, `scan-${name}-error`].join(' ');
  return `<div class="min-w-0">
    <label for="scan-${name}" class="block text-sm font-bold text-slate-200">${copy(field.label)}</label>
    <p id="scan-${name}-hint" class="mt-1 text-xs leading-relaxed text-slate-400">${copy(hint)}</p>
    <input id="scan-${name}" name="${name}" type="${type}" autocomplete="${esc(field.autocomplete)}" ${inputMode ? `inputmode="${inputMode}" ` : ''}${['website', 'email'].includes(name) ? 'autocapitalize="none" spellcheck="false" ' : ''}required aria-describedby="${describedBy}" aria-invalid="false" toolparamdescription="${esc(field.agentHint)}" class="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30" />
    <p id="scan-${name}-error" class="mt-1 hidden text-xs text-red-300">${copy(fieldErrors[name])}</p>
  </div>`;
}

function roleField() {
  const field = FORM.fields.role;
  return `<div class="min-w-0">
    <label for="scan-role" class="block text-sm font-bold text-slate-200">${copy(field.label)}</label>
    <p id="scan-role-hint" class="mt-1 text-xs leading-relaxed text-slate-400">${copy(field.agentHint)}</p>
    <select id="scan-role" name="role" autocomplete="${esc(field.autocomplete)}" required aria-describedby="scan-role-hint scan-role-error" aria-invalid="false" toolparamdescription="${esc(field.agentHint)}" class="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30">
      <option value="">${copy(field.placeholder)}</option>
      ${ROLE_CHOICES.map((role) => `<option value="${esc(role)}">${copy(role)}</option>`).join('')}
    </select>
    <p id="scan-role-error" class="mt-1 hidden text-xs text-red-300">${copy(fieldErrors.role)}</p>
  </div>`;
}

function scanForm(action) {
  const fields = FORM.fields;
  return `<section id="scan" class="border-y border-white/5 bg-[#080808] py-20 lg:py-28">
    <div class="mx-auto grid max-w-7xl items-start gap-10 px-6 lg:grid-cols-[0.85fr_1.15fr]">
      <div>
        ${eyebrow(HOW.eyebrow)}
        ${heading(HOW.h2Lead, HOW.h2Grad)}
        <ol class="mt-8 space-y-4">${HOW.steps.map((step, index) => `<li class="rounded-2xl border border-white/10 bg-white/[0.03] p-5"><p class="font-display text-2xl font-extrabold italic text-blue-400">${index + 1}</p><h3 class="mt-2 font-bold text-white">${copy(step.title)}</h3><p class="mt-1 text-sm leading-relaxed text-slate-400">${copy(step.body)}</p></li>`).join('')}</ol>
      </div>
      <form id="scan-form" method="post" action="${esc(action)}" aria-labelledby="scan-form-title" toolname="${esc(FORM.webmcp.toolname)}" tooldescription="${esc(FORM.webmcp.tooldescription)}" class="rounded-[2rem] border border-white/10 bg-[#0b0d12] p-6 shadow-2xl shadow-blue-950/30 sm:p-8">
        <h2 id="scan-form-title" class="font-display text-2xl font-extrabold uppercase italic text-white">${copy(FORM.title)}</h2>
        <p class="mt-2 text-sm leading-relaxed text-slate-400">${copy(FORM.intro)}</p>
        <p class="mt-2 text-xs leading-relaxed text-slate-400">${copy(FORM.requiredNote)}</p>
        <div id="scan-errors" tabindex="-1" class="mt-4 hidden rounded-xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-200"><p class="font-bold">${copy(FORM.errorSummaryTitle)}</p></div>
        <div class="mt-5 grid gap-4 sm:grid-cols-2">
          <div class="sm:col-span-2">${inputField('dealershipName', fields.dealershipName)}</div>
          ${inputField('website', fields.website)}
          ${inputField('location', fields.location)}
          ${inputField('fullName', fields.fullName)}
          ${roleField()}
          ${inputField('email', fields.email)}
          ${inputField('phone', fields.phone)}
        </div>
        <div class="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden="true">
          <label for="scan-company">Leave this field empty</label>
          <input id="scan-company" name="company" autocomplete="off" tabindex="-1" />
        </div>
        <input type="hidden" name="submissionId" value="" />
        <input type="hidden" name="smsConsentVersion" value="${esc(SMS_CONSENT.version)}" />
        <input type="hidden" name="submittedVia" value="form" />
        <label class="mt-5 flex items-start gap-3 text-sm leading-relaxed text-slate-300">
          <input id="scan-sms-consent" name="smsConsent" type="checkbox" value="true" aria-describedby="scan-sms-consent-hint" class="mt-1 h-4 w-4 shrink-0" />
          <span id="scan-sms-consent-hint">${copy(SMS_CONSENT.text)} ${SMS_CONSENT.links.map((link) => `<a class="text-blue-300 underline" href="${esc(link.href)}">${copy(link.label)}</a>`).join(' ')}</span>
        </label>
        <p id="scan-agent-banner" class="mt-4 hidden rounded-xl border border-blue-400/30 bg-blue-500/10 p-3 text-sm text-blue-100">${copy(FORM.agentBanner)}</p>
        <p id="scan-status" tabindex="-1" aria-live="polite" class="mt-4 text-sm text-slate-400"></p>
        <button type="submit" class="mt-4 flex w-full items-center justify-center rounded-2xl bg-blue-600 px-6 py-5 font-display text-base font-extrabold uppercase italic text-white shadow-lg shadow-blue-600/30">${copy(FORM.submit)}</button>
        <p class="mt-3 text-xs leading-relaxed text-slate-400">${copy(FORM.useNote)}</p>
      </form>
    </div>
  </section>`;
}

function plansSection() {
  const rows = comparisonRows();
  return `<section id="plans" class="py-20 lg:py-28">
    <div class="mx-auto max-w-7xl px-6">
      ${eyebrow(PLANS_SECTION.eyebrow)}
      ${heading(PLANS_SECTION.h2Lead, PLANS_SECTION.h2Grad)}
      <p class="mt-6 max-w-3xl text-lg leading-relaxed text-slate-300">${copy(PLANS_SECTION.lead)}</p>
      <div class="mt-12 grid items-start gap-5 lg:grid-cols-3">${PLANS.map((plan) => `<article id="${esc(plan.anchor)}" class="rounded-3xl border border-white/10 bg-[#0b0d12] p-6 shadow-xl shadow-black/30">
        <div class="flex flex-wrap items-start justify-between gap-3"><h3 class="font-display text-2xl font-extrabold uppercase italic text-white">${copy(plan.name)}</h3>${plan.availability === 'by-application' ? `<span class="rounded-full border border-blue-400/30 bg-blue-500/10 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-blue-200">${copy(PLANS_SECTION.byApplication)}</span>` : ''}</div>
        <p class="mt-5 font-display text-4xl font-extrabold italic text-white">${copy(fmtUsd(plan.monthly))} <span class="font-sans text-sm font-medium not-italic text-slate-400">${copy(PLANS_SECTION.perMonth)}</span></p>
        <p class="mt-1 text-sm text-slate-400">${copy(fmtUsd(plan.setup))} ${copy(PLANS_SECTION.setupSuffix)}</p>
        <p class="mt-5 text-sm font-semibold leading-relaxed text-blue-200">${copy(plan.builtFor)}</p>
        <p class="mt-3 text-sm leading-relaxed text-slate-300">${copy(plan.summary)}</p>
        ${list(plan.includes)}
        <a href="#scan-form" class="mt-6 flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-3 font-display text-sm font-extrabold uppercase italic text-white">${copy(PLANS_SECTION.cardCta)}</a>
      </article>`).join('')}</div>
      <p class="mt-6 text-center font-bold text-blue-200">${copy(PLANS_SECTION.customerLine)}</p>
      <div class="mt-10 overflow-x-auto rounded-3xl border border-white/10 bg-[#0b0d12]">
        <table class="min-w-[900px] w-full border-collapse text-left text-sm text-slate-300">
          <caption class="p-5 text-left font-bold text-white">${copy(PLANS_SECTION.tableCaption)}</caption>
          <thead><tr><th scope="col" class="border-t border-white/10 p-4"></th>${PLANS.map((plan) => `<th scope="col" class="border-t border-white/10 p-4 text-white">${copy(plan.name)}</th>`).join('')}</tr></thead>
          <tbody>${rows.map(([label, ...cells]) => `<tr class="border-t border-white/10"><th scope="row" class="p-4 font-semibold text-white">${copy(label)}</th>${cells.map((cell) => `<td class="p-4">${copy(cell)}</td>`).join('')}</tr>`).join('')}</tbody>
        </table>
      </div>

      <div class="mt-12 rounded-3xl border border-white/10 bg-[#0b0d12] p-6 sm:p-8"><h3 class="font-display text-3xl font-extrabold uppercase italic text-white">${copy(PLANS_SECTION.everyPlanHeading)}</h3>${list(EVERY_PLAN_INCLUDES, 'mt-6 grid gap-3 text-sm leading-relaxed text-slate-300 lg:grid-cols-2 lg:gap-x-8')}</div>

      <div class="mt-16">
        <h3 class="font-display text-3xl font-extrabold uppercase italic text-white">${copy(PLANS_SECTION.promisesHeading)}</h3>
        <p class="mt-3 text-slate-300">${copy(PLANS_SECTION.promisesIntro)}</p>
        <div class="mt-6 overflow-x-auto rounded-3xl border border-white/10 bg-[#0b0d12]"><table class="min-w-[720px] w-full border-collapse text-left text-sm"><tbody>${PROMISES.map(({ promise, step }) => `<tr class="border-t border-white/10 first:border-t-0"><th scope="row" class="w-1/2 p-4 align-top font-semibold text-white">${copy(promise)}</th><td class="p-4 align-top leading-relaxed text-slate-300">${copy(step)}</td></tr>`).join('')}</tbody></table></div>
      </div>

      <details id="${esc(RESULTS_CREDIT.anchor)}" class="mt-10 rounded-3xl border border-white/10 bg-[#0b0d12] p-6">
        <summary class="cursor-pointer font-display text-2xl font-extrabold uppercase italic text-white">${copy(RESULTS_CREDIT.heading)}</summary>
        <p class="mt-4 leading-relaxed text-slate-300">${copy(RESULTS_CREDIT.intro)}</p>
        <ol class="mt-5 space-y-4">${RESULTS_CREDIT.steps.map(({ title, body }, index) => `<li><h4 class="font-bold text-white">${index + 1}. ${copy(title)}</h4><p class="mt-1 text-sm leading-relaxed text-slate-300">${copy(body)}</p></li>`).join('')}</ol>
        ${list(RESULTS_CREDIT.conditions)}
        <p class="mt-5 text-sm leading-relaxed text-slate-300">${copy(RESULTS_CREDIT.covers)}</p>
      </details>

      <div class="mt-10 grid items-start gap-5 lg:grid-cols-2">
        <article class="rounded-3xl border border-white/10 bg-[#0b0d12] p-6"><h3 class="font-display text-2xl font-extrabold uppercase italic text-white">${copy(PLANS_SECTION.neverHeading)}</h3>${list(NEVER_PROMISE)}</article>
        <article class="rounded-3xl border border-white/10 bg-[#0b0d12] p-6"><h3 class="font-display text-2xl font-extrabold uppercase italic text-white">${copy(PLANS_SECTION.notIncludedHeading)}</h3>${list(NOT_INCLUDED)}</article>
      </div>

      <div class="mt-10 grid items-start gap-5 lg:grid-cols-2">
        <article class="rounded-3xl border border-white/10 bg-[#0b0d12] p-6"><h3 class="font-display text-2xl font-extrabold uppercase italic text-white">${copy(PLANS_SECTION.howItStartsHeading)}</h3><ol class="mt-5 space-y-4">${HOW_IT_STARTS.map(({ title, body }, index) => `<li><h4 class="font-bold text-white">${index + 1}. ${copy(title)}</h4><p class="mt-1 text-sm leading-relaxed text-slate-300">${copy(body)}</p></li>`).join('')}</ol></article>
        <article class="rounded-3xl border border-white/10 bg-[#0b0d12] p-6"><h3 class="font-display text-2xl font-extrabold uppercase italic text-white">${copy(PLANS_SECTION.finePrintHeading)}</h3>${list(FINE_PRINT)}</article>
      </div>
      <p class="mt-8 font-mono text-xs uppercase tracking-wider text-slate-400">Prices and plans updated <time datetime="${esc(AI_VISIBILITY_UPDATED)}">${copy(AI_VISIBILITY_UPDATED_HUMAN)}</time></p>
      <article class="mt-10 rounded-3xl border border-blue-400/20 bg-blue-500/[0.06] p-6"><h3 class="font-display text-2xl font-extrabold uppercase italic text-white">${copy(BRAND_SCAN.heading)}</h3><p class="mt-3 leading-relaxed text-slate-300">${copy(BRAND_SCAN.body)}</p></article>
    </div>
  </section>`;
}

export function renderAiVisibilityMirror({ capiUrl = 'https://autolander.ai' } = {}) {
  return `<!--AL_STATIC_PAGE_START--><div id="al-static-page" class="min-h-dvh bg-[#050505] font-sans text-slate-50">
    <main id="main-content">
      ${heroSection()}

      ${renderAiVisibilityMirrorRest({ capiUrl })}
    </main>
  </div><!--AL_STATIC_PAGE_END-->`;
}

function heroSection() {
  return `<section class="relative overflow-hidden pb-16 pt-12 lg:pb-24 lg:pt-20">
        <div class="mx-auto grid max-w-7xl items-center gap-10 px-6 lg:grid-cols-[1.02fr_0.98fr]">
          <div>${eyebrow(HERO.eyebrow)}<h1 class="mt-5 font-display text-4xl font-extrabold uppercase italic leading-[0.92] text-white sm:text-6xl">${copy(HERO.h1Lead)} <span class="text-blue-400">${copy(HERO.h1Grad)}</span></h1><p class="al-ai-summary mt-5 text-lg leading-relaxed text-slate-300">${copy(HERO.summary)}</p><a href="#scan-form" class="mt-7 inline-flex rounded-2xl bg-blue-600 px-7 py-4 font-display text-base font-extrabold uppercase italic text-white shadow-lg shadow-blue-600/30">${copy(HERO.cta)}</a><div class="mt-5 flex flex-wrap gap-3 font-mono text-[10px] uppercase tracking-wider text-slate-400">${HERO.chips.map((chip) => `<span>${copy(chip)}</span>`).join('')}</div><p class="mt-4 text-sm text-slate-400">${copy(HERO.trustLine)}</p></div>
          <div>${image(ILLUSTRATION_SLOTS.hero.image, IMAGE_SIZES.aiHero, true)}<p class="mt-3 text-xs leading-relaxed text-slate-400">${copy(ILLUSTRATION_SLOTS.hero.caption)}</p>${reportMock()}</div>
        </div>
      </section>`;
}

/**
 * Everything the static mirror carries below its hero: the crawlable no-JS body (scan form with its native
 * POST action and WebMCP attributes, plans, FAQ, closing sections). The production shell ships it inside
 * React's prerendered page as an inert island right after the hydrated hero (src/components/StaticIsland.jsx);
 * React swaps in the live sections after the first paint.
 */
export function renderAiVisibilityMirrorRest({ capiUrl = 'https://autolander.ai' } = {}) {
  const action = `${String(capiUrl).replace(/\/+$/, '')}/api/ai-scan`;
  return `<section class="border-y border-white/5 bg-[#080808] py-20"><div class="mx-auto grid max-w-7xl items-center gap-10 px-6 lg:grid-cols-2"><div>${eyebrow(SHIFT.eyebrow)}${heading(SHIFT.h2Lead, SHIFT.h2Grad)}<p class="mt-6 text-lg leading-relaxed text-slate-300">${copy(SHIFT.body)}</p></div><div class="rounded-3xl border border-white/10 bg-[#0b0d12] p-7"><p class="font-display text-6xl font-extrabold italic text-white">${copy(SHIFT.stat.value)}</p><p class="mt-3 text-lg text-slate-300">${copy(SHIFT.stat.text)}</p><a class="mt-4 block text-xs text-blue-300 underline" href="${esc(SHIFT.stat.sourceUrl)}">${copy(SHIFT.stat.source)}</a></div></div></section>

      ${publicIllustrations()}
      <section class="py-20 lg:py-32"><div class="mx-auto max-w-7xl px-6">${eyebrow(REPORT.eyebrow)}${heading(REPORT.h2Lead, REPORT.h2Grad)}
        <div class="mt-12 grid items-start gap-6 lg:grid-cols-[0.9fr_1.1fr]">${image(ILLUSTRATION_SLOTS.report.image, IMAGE_SIZES.aiReport)}<div class="grid items-start gap-4 sm:grid-cols-2">${REPORT.parts.slice(0, 2).map(reportCard).join('')}</div></div>
        <div class="mt-6 grid items-start gap-6 lg:grid-cols-[1.1fr_0.9fr]"><div class="grid items-start gap-4 sm:grid-cols-2">${REPORT.parts.slice(2).map(reportCard).join('')}</div>${image(ILLUSTRATION_SLOTS.vehicle.image, IMAGE_SIZES.aiReport)}</div>
        <p class="mt-5 text-sm leading-relaxed text-slate-400">${copy(ILLUSTRATION_SLOTS.reportCaption)}</p>
      </div></section>

      <section class="border-y border-white/5 bg-[#080808] py-20"><div class="mx-auto max-w-7xl px-6">${eyebrow(REASONS.eyebrow)}${heading(REASONS.h2Lead, REASONS.h2Grad)}<div class="mt-10 grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-4">${REASONS.items.map(({ title, body }) => `<article class="rounded-3xl border border-white/10 bg-[#0b0d12] p-6"><h3 class="font-display text-xl font-extrabold uppercase italic text-white">${copy(title)}</h3><p class="mt-3 text-sm leading-relaxed text-slate-400">${copy(body)}</p></article>`).join('')}</div></div></section>

      ${scanForm(action)}
      ${plansSection()}

      <section id="faq" class="border-y border-white/5 bg-[#080808] py-20"><div class="mx-auto max-w-4xl space-y-3 px-6">${FAQ.map(({ q, a }) => `<details class="rounded-2xl border border-white/10 bg-[#0b0d12] p-5"><summary class="cursor-pointer font-bold text-white">${copy(q)}</summary><div class="al-faq-a mt-3 text-sm leading-relaxed text-slate-300">${copy(a)}</div></details>`).join('')}</div></section>

      <section class="py-20 text-center"><div class="mx-auto max-w-4xl px-6"><h2 class="font-display text-4xl font-extrabold uppercase italic text-white sm:text-5xl">${copy(FINAL_CTA.h2Lead)} <span class="text-blue-400">${copy(FINAL_CTA.h2Grad)}</span></h2><a href="#scan-form" class="mt-7 inline-flex rounded-2xl bg-blue-600 px-7 py-4 font-display text-base font-extrabold uppercase italic text-white">${copy(FINAL_CTA.cta)}</a><p class="mt-4 font-mono text-xs uppercase tracking-wider text-slate-400">${copy(FINAL_CTA.note)}</p></div></section>
      <section class="border-t border-white/5 py-10"><div class="mx-auto max-w-7xl px-6"><p class="text-sm leading-relaxed text-slate-400">${copy(SERVICE_SUMMARY)}</p><p class="mt-4 text-sm leading-relaxed text-slate-400">${copy(FOOTER.line)}</p><nav class="mt-4 flex flex-wrap gap-4" aria-label="${esc(FOOTER.line)}">${FOOTER.links.map((link) => `<a class="text-sm text-blue-300" href="${esc(link.href)}">${copy(link.label)}</a>`).join('')}</nav></div></section>`;
}
