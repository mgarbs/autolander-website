import {
  CHIPS,
  EYEBROW,
  FAQ,
  FINAL_CTA,
  HEADLINES,
  PLAN_LINES,
  PRICING,
  SUBS,
  TEAM_META,
  TIERS,
} from '../../shared/team-content.js';

const esc = (value) => String(value ?? '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;');

export function renderTeamMirror() {
  return `<!--AL_STATIC_PAGE_START--><div id="al-static-page" class="min-h-dvh bg-[#050505] font-sans text-slate-50">
    <main id="main-content">
      <section class="py-14 lg:py-24"><div class="mx-auto grid max-w-7xl items-center gap-10 px-6 lg:grid-cols-2"><div><p class="font-mono text-[11px] font-semibold uppercase tracking-[0.28em] text-blue-300">${esc(EYEBROW)}</p><h1 class="mt-5 font-display text-4xl font-extrabold uppercase italic leading-[0.92] text-white sm:text-6xl">${esc(HEADLINES.a)}</h1><p class="mt-5 text-lg leading-relaxed text-slate-300">${esc(SUBS.a)}</p><a href="#team-pricing" class="mt-7 inline-flex rounded-2xl bg-blue-600 px-7 py-4 font-display text-base font-extrabold uppercase italic text-white shadow-lg shadow-blue-600/30">${esc(FINAL_CTA.button)}</a><ul class="mt-5 flex flex-wrap gap-3 font-mono text-[10px] uppercase tracking-wider text-slate-400">${CHIPS.map((chip) => `<li>${esc(chip)}</li>`).join('')}</ul></div><img src="/team/sales-floor.webp" width="1600" height="893" alt="Illustrated dealership sales floor using AutoLander team tools" decoding="async" fetchpriority="high" class="w-full rounded-3xl border border-white/10 object-cover shadow-2xl shadow-blue-950/40" /></div></section>

      <section id="team-pricing" class="border-y border-white/5 bg-[#080808] py-20"><div class="mx-auto max-w-7xl px-6"><p class="font-mono text-[11px] font-semibold uppercase tracking-[0.28em] text-blue-300">${esc(PRICING.eyebrow)}</p><h2 class="mt-5 font-display text-4xl font-extrabold uppercase italic text-white sm:text-5xl">${esc(PRICING.headingLead)} <span class="text-blue-400">${esc(PRICING.headingAccent)}</span></h2><p class="mt-5 max-w-3xl text-lg leading-relaxed text-slate-300">${esc(PRICING.lead)}</p><div class="mt-10 grid items-start gap-5 sm:grid-cols-3">${TIERS.map((tier) => `<article class="rounded-3xl border border-white/10 bg-[#0b0d12] p-6"><h3 class="font-display text-2xl font-extrabold uppercase italic text-white">${esc(tier.name)}</h3><p class="mt-4 font-display text-4xl font-extrabold italic text-blue-300">$${tier.price}</p><p class="mt-2 text-sm text-slate-400">${tier.posts} posts a day</p></article>`).join('')}</div><article class="mt-6 rounded-3xl border border-blue-400/20 bg-blue-500/[0.06] p-6"><p class="font-mono text-[10px] font-bold uppercase tracking-widest text-blue-300">${esc(PRICING.badge)}</p><h3 class="mt-3 font-display text-3xl font-extrabold uppercase italic text-white">${esc(PRICING.planName)}</h3><p class="mt-3 text-slate-300">${esc(PRICING.from)} ${esc(PRICING.monthly)} ${esc(PRICING.perMonth)}</p><p class="mt-2 font-bold text-white">${esc(PRICING.builder)}</p><p class="mt-2 text-sm text-slate-400">${esc(PRICING.summary)}</p><ul class="mt-5 grid items-start gap-3 sm:grid-cols-2">${PLAN_LINES.map((item) => `<li class="text-sm text-slate-300">${esc(item)}</li>`).join('')}</ul></article></div></section>

      <section class="py-20"><div class="mx-auto grid max-w-7xl items-center gap-10 px-6 lg:grid-cols-[0.8fr_1.2fr]"><img src="/team/manager-tablet.webp" width="1000" height="1241" alt="Illustrated sales manager reviewing a dealership activity dashboard on a tablet" decoding="async" loading="lazy" class="mx-auto w-full max-w-md rounded-3xl border border-white/10 object-cover shadow-2xl shadow-blue-950/40" /><div><h2 class="font-display text-4xl font-extrabold uppercase italic text-white">${esc(PRICING.planName)}</h2><p class="mt-5 text-lg leading-relaxed text-slate-300">${esc(TEAM_META.description)}</p><ul class="mt-6 space-y-3">${PLAN_LINES.slice(3).map((item) => `<li class="text-sm text-slate-300">${esc(item)}</li>`).join('')}</ul></div></div></section>

      <section class="border-y border-white/5 bg-[#080808] py-20"><div class="mx-auto max-w-4xl px-6"><h2 class="font-display text-4xl font-extrabold uppercase italic text-white">FAQ</h2><div class="mt-8 space-y-3">${FAQ.map(({ q, a }) => `<details class="rounded-2xl border border-white/10 bg-[#0b0d12] p-5"><summary class="cursor-pointer font-bold text-white">${esc(q)}</summary><p class="mt-3 text-sm leading-relaxed text-slate-300">${esc(a)}</p></details>`).join('')}</div></div></section>

      <section class="py-20 text-center"><div class="mx-auto max-w-4xl px-6"><h2 class="font-display text-4xl font-extrabold uppercase italic text-white sm:text-5xl">${esc(FINAL_CTA.headingLead)} <span class="text-blue-400">${esc(FINAL_CTA.headingAccent)}</span></h2><p class="mt-5 text-lg leading-relaxed text-slate-300">${esc(FINAL_CTA.body)}</p><p class="mt-4 text-sm text-slate-400">${esc(FINAL_CTA.formNote)}</p><p class="mt-3 font-mono text-xs uppercase tracking-wider text-slate-400">${esc(FINAL_CTA.chips)}</p></div></section>
    </main>
  </div><!--AL_STATIC_PAGE_END-->`;
}
