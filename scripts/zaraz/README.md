# GA4 / first-party Meta rollout

`al-tags-v1.js` resolves once to `zaraz`, lazy `legacy`, or `off`. The Worker
injects Zaraz only on eligible production HTML with al-tags in its head and
without legacy GA. TRACKING KV `cfg:zaraz_mode` overrides the default
`ZARAZ_MODE="off"` with a 60-second cache. `canary` requires `al_zaraz=1`;
`al_zaraz=0` opts out of injection. Meta is independent of this switch.

No Meta tool or secret belongs in Zaraz. Browser-originated Meta events use
`/capi/track`; accepted applications and scans use their existing Worker senders.
Known-visitor matching defaults off. `ALLOW_QA_TEST_EVENT_CODE` gates per-request
QA codes; the global `META_TEST_EVENT_CODE` must remain unset in production.

The desired config starts from the supplied September 29 subset. The orchestrator's
privacy override adds just two GA4 default fields, `dl` and `dr`, to redact payment
paths on automatic pageviews and custom events. They use documented
[Zaraz JSONata expressions](https://developers.cloudflare.com/zaraz/advanced/using-jsonata/)
and [page context](https://developers.cloudflare.com/zaraz/reference/context/).
The [GA4 component](https://github.com/managed-components/google-analytics-4/blob/main/src/requestBuilder.ts)
accepts these as built-in URL/referrer overrides. Legacy GA and the Meta vendor
boundary apply the same `/pay/:token` replacement. Opaque Meta click IDs stay exact.

The config CLI defaults to read-only:

```sh
node scripts/zaraz/apply-config.mjs --dry-run
node scripts/zaraz/apply-config.mjs --show-live
```

Credentials come from environment variables or `~/.autolander-cloudflare.env`.
Never pass credentials as CLI arguments. For Git Bash use `MSYS_NO_PATHCONV=1`.
`--apply` is reserved for the rollout operator. Backups contain the real debug key
and must remain outside this public repository. The committed live fixture is
redacted. Dashboard-created tools and triggers are adopted by measurement ID and
AL name, respectively; reapplying an adopted config is idempotent.

Rollout order: Worker with mode off; review/apply GA4 config with auto-injection
off; site deploy; canary; mode on. Confirm server CAPI success and
`sendsWorkerLead:true` before the browser-pixel cutover. Keep the site-to-on window
within two hours: lazy fallback undercounts visitors leaving before interaction
or the eight-second timer. Compare seven full days before the site rollout to
seven full days after mode on, excluding that transition and QA traffic.

Deployment-only checks remain necessary:

- One i.js tag at the end of head after the module and exactly one s.js request;
  `alTags.mode()` is `zaraz`, with no browser Google or Facebook requests.
- GA DebugView: one pageview and all five custom events; cid matches `_ga` and
  `al_ga_cid`; verify the blocked-al-tags/missing-cookie fallback in the component.
- Payment paths and referrers reach GA/Meta as `/pay/:token`; `session_id` and
  thank-you `bt` are absent from page locations. Verify JSONata evaluation live.
- Excluded paths/hosts send nothing. Check GET response headers (HEAD skips).
- Meta Test Events show Server only; replaying an event ID sends no second hit.
  Monitor `capi_ok`, `capi_failed`, transition counters and rate/bot loss counters.
- Check i.js behavior with the GA tool disabled, custom-ID acceptance, defer
  initialization, GA server 2xx, and the optional Cloudflare Web Analytics beacon.
- PSI mobile on `/`, `/aeo-geo-for-car-dealers/`, `/team`, `/pricing`, and a guide page is a
  rollout check; performance work beyond this migration belongs to the next lane.

Rollback is the operator setting `cfg:zaraz_mode=off`; Meta stays server-only.
The optional GA tool disable affects already-cached pages. KV event markers stop
observed replays; Workers KV is eventually consistent and does not provide an
atomic cross-colocation lock for simultaneous submissions of an identical ID.

Local verification uses `npm test -- --test-concurrency=1`, followed separately by
`npm run build`. Worker regressions are Node tests in the root `test/` directory;
there is no separate worker package or test runner.
