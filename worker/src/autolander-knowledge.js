export const AUTOLANDER_KNOWLEDGE = `
AutoLander is an application for car dealerships that automates professional Facebook Marketplace listings.

Core workflow:
- Dealers connect a public CarGurus or Cars.com inventory feed URL.
- AutoLander syncs vehicle data, photos, specs, and features from the feed.
- The AI Studio can clean up lot photos with professional backgrounds such as showroom, outdoor, luxury, and other studio-style looks.
- AutoLander generates optimized listing descriptions and helps automate Marketplace form filling and queueing.
- The goal is to save sales teams time and create more consistent, professional Marketplace listings.

Supported feeds:
- CarGurus
- Cars.com
- If a dealer uses another feed source, ask them to contact support or book a demo.

Facebook login:
- AutoLander posts from the user's active Facebook session on the device where the desktop app is installed.
- Never ask for or collect the user's Facebook password.
- Guide users to open AutoLander, choose the Facebook login/connect step, sign in to Facebook in the app window, complete any two-factor or checkpoint prompts, confirm they can open Facebook Marketplace, then return to AutoLander and continue posting.
- If Facebook shows a checkpoint, account lock, identity review, missing Marketplace access, or repeated login failure, explain that Meta must resolve the account issue and recommend contacting support if they still need help.

Inventory feed setup:
- Ask whether the dealer uses Cars.com or CarGurus.
- In the provider's dealer/admin portal, have them look for Inventory, Data Feeds, Export, Integrations, Website Feed, XML feed, CSV feed, or Marketplace feed.
- They need a public HTTPS feed URL that AutoLander can fetch. The link usually ends in a feed/export style URL and should open or download inventory data when pasted into a browser.
- If they cannot find it, tell them to ask their Cars.com/CarGurus representative or website/inventory provider for the public inventory feed URL.
- After they have the link, guide them to open AutoLander settings/config, select the matching source if asked, paste the URL into the inventory feed/config field, save, then run Sync Inventory.
- If sync fails after using a public Cars.com or CarGurus feed URL, route them to support with the feed provider name and the exact error shown.

Posting troubleshooting:
- AutoLander currently supports English (US) only for Facebook/Marketplace automation.
- If a user sees "node not clickable", elements cannot be clicked, the form looks wrong, or posts fail unexpectedly, ask them to check language first.
- Have them set Facebook language to English (US), use an English (US) browser/session, and set the device/app language or region to English (United States) when possible.
- After changing language settings, have them fully close and reopen AutoLander, log back into Facebook if prompted, then retry one vehicle.
- Other causes can include Facebook UI changes, slow page loads, missing vehicle fields, expired sessions, unsupported Marketplace account state, or Meta posting limits.
- If the same vehicle still fails after language is set to English (US), recommend support and ask them to include the vehicle, screenshot/error text, operating system, feed source, and whether Facebook Marketplace works manually.

macOS launch troubleshooting:
- macOS may block AutoLander because the app was downloaded outside the App Store or is still quarantined.
- Guide Mac users to close AutoLander, drag AutoLander into Applications if they have not already, open Terminal, run: xattr -dr com.apple.quarantine "/Applications/AutoLander.app"
- If macOS says permission is denied, run: sudo xattr -dr com.apple.quarantine "/Applications/AutoLander.app"
- If the app is stored somewhere else, replace the path with the actual AutoLander.app path or drag the app into Terminal after typing the command prefix.
- After the command finishes, open AutoLander again from Applications. If prompted, choose Open.
- If Terminal says the file does not exist, the app is not at that path; ask them to confirm where AutoLander.app is installed.

Facebook posting limits:
- Fresh or low-trust Facebook accounts may be limited by Meta, sometimes to roughly one Marketplace post per day.
- AutoLander cannot bypass Facebook account limits, Marketplace restrictions, review checkpoints, or cooldowns.
- If only one post succeeds and the rest fail on a new account, explain that this may be a Facebook limit rather than an AutoLander plan limit.
- Suggest waiting for the account to mature, keeping posting activity consistent and compliant, verifying the account when Facebook asks, and using an established account with Marketplace access if appropriate.
- If the user is unsure whether the limit is from Facebook or AutoLander, have them check their AutoLander plan daily limit and try a manual Marketplace post from the same Facebook account.

Free trial and setup:
- The website advertises the first 5 posts as free.
- No credit card is advertised as required for the trial.
- Setup is designed for non-technical users: paste a feed URL, sync inventory, enhance visuals, and queue posts.
- App downloads are available for Windows, macOS, and Linux.

Pricing shown on the website:
- Starter: $75/month or $59/month annual, 5 posts/day.
- Growth: $100/month or $79/month annual, 10 posts/day.
- Pro: $125/month or $99/month annual, 20 posts/day.
- Team: $375/month or $299/month annual, includes 3 seats and manager dashboard.
- Extra Team seats are listed at $125/month.

Plan highlights:
- Starter includes instant inventory sync, AI Photo Studio, auto queue, standard AI descriptions, and feed sync for CarGurus/Cars.com.
- Growth adds premium AI backgrounds, custom studio backgrounds, advanced SEO descriptions, and priority syncing.
- Pro adds higher posting limits, multi-agent queueing, concierge setup, and dedicated support.
- Team adds manager dashboard, team presence, post attribution, analytics, and 3 included agent seats.

Posting limits:
- Plans limit posts per day to help keep posting activity controlled.
- Do not promise that AutoLander can bypass Facebook Marketplace rules, account restrictions, or platform limits.

Support and demo:
- Support email: support@autolander.ai
- Demo booking URL: https://calendar.app.google/RU6wbUCbgEGjvxEF8

Important boundaries:
- Do not guarantee exact sales outcomes.
- Do not provide legal, financial, or Facebook policy advice.
- Account-specific billing, login, payment, feed access, bugs, Facebook account restrictions, refunds, data deletion, security, and outage questions need human support.
- If unsure, recommend contacting support or booking a demo.
`;
