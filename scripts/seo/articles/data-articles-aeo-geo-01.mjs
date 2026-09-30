// AEO and GEO silo, batch 01 (2026-09-30): the "Your website: crawlers, schema and vehicle
// pages" cluster, access articles. Publish numbers 1, 10, 28, 42 and 50 from
// the 2026-09-30 silo plan.
//
// Pure data per the article-system.mjs contract: no imports, string literals only.
// Link rules (Michael, 2026-09-30): in-body sibling links use the publish-aware token
// [anchor](@slug) and point ONLY to lower publish numbers, so publishing in number order never
// creates a dead link. Later siblings connect through alsoRelated, which the builder renders
// only once the target is live. The money page /aeo-geo-for-car-dealers/ is live and linked in
// the first two sections of every article with the plan's assigned anchor.
// House rules: no em or en dashes, no "is not X. It is Y." cadence, no invented numbers. Every
// third-party claim is from the silo fact bank (read 2026-09-30) with its source URL.

export const ARTICLES = [

  // ---------------------------------------------------------------------------
  // #1 /aeo-geo/can-chatgpt-see-my-dealer-website/ (cluster pillar)
  // ---------------------------------------------------------------------------
  {
    slug: 'can-chatgpt-see-my-dealer-website',
    silo: 'aeoGeo',
    cluster: 'website',
    publishOrder: 1,
    anchor: 'Can ChatGPT and Claude read your dealership website? A 15-minute check',
    crumb: 'Can AI read your website?',
    primaryKeyword: 'can chatgpt see my website',
    secondaryKeywords: [
      'is my website blocked from chatgpt',
      'ai crawler access checker',
      'test ai bot access',
      'do ai crawlers run javascript',
    ],
    alsoRelated: [
      'how-chatgpt-recommends-car-dealerships',
      'cloudflare-ai-bots-dealer-websites',
      'vehicle-detail-page-ai-readable',
      'should-dealers-block-ai-crawlers',
      'dealer-website-provider-ai-search',
      'aeo-vs-seo-for-car-dealers',
    ],
    augmentKeys: ['aiDealers'],
    title: 'Can ChatGPT and Claude Read Your Dealership Website?',
    description:
      'A 15-minute check of whether ChatGPT, Claude and other AI tools can read your dealership website: '
      + 'robots.txt, firewalls, JavaScript and VDP text.',
    eyebrow: 'AEO and GEO for car dealers',
    h1: 'Can ChatGPT and Claude read your dealership website? A 15-minute check',
    tldr:
      'Can ChatGPT see my website? That depends on four doors you can check in about 15 minutes with a '
      + 'browser: your robots.txt, the security service or CDN in front of the site, whether pages need '
      + 'JavaScript to show content, and whether price, mileage and VIN appear as plain text on vehicle pages. '
      + 'OpenAI’s and Anthropic’s search crawlers need every door open to read your pages, and anything that '
      + 'fails goes on a short fix list for your website vendor.',
    sections: [
      {
        type: 'qa',
        id: 'can-chatgpt-and-claude-read-your-site',
        q: 'Can ChatGPT see my website, and can Claude?',
        a: [
          'ChatGPT and Claude can read a dealership website only when their search crawlers are let in and the '
          + 'key facts sit in the page text. [OpenAI says](https://help.openai.com/en/articles/9237897-searching-the-web-with-chatgpt) '
          + 'ChatGPT search needs OAI-SearchBot allowed and your host or CDN open to its published IP addresses. '
          + '[Anthropic runs](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler) '
          + 'Claude-SearchBot and Claude-User for search and retrieval.',
          'Think of it as four doors, and a crawler has to get through every one of them. The first is '
          + 'robots.txt, the plain text file that tells each bot what it may read. The second is the security '
          + 'service or CDN in front of the site, which can turn a bot away even when robots.txt says yes. The '
          + 'third is JavaScript: if a page shows its content only after scripts run, some crawlers see an empty '
          + 'shell. The fourth is the vehicle page itself, where price, mileage and VIN need to be readable as '
          + 'text. Anthropic says blocking Claude-SearchBot prevents indexing for search and reduces visibility in '
          + 'its search results, so a closed door has a real cost.',
          'None of this needs a developer to check. A browser, a notepad and one of your own vehicle pages are '
          + 'enough, and the steps below take about 15 minutes. Making your store easy for AI tools to read, '
          + 'trust and cite is the work of [AEO and GEO for car dealers](/aeo-geo-for-car-dealers/), and crawler '
          + 'access comes first, because an assistant can only quote what its crawler was allowed to read.',
        ],
      },
      {
        type: 'steps',
        h2: 'How do you check your robots.txt in two minutes?',
        intro:
          'Open your robots.txt in a browser and read the rules for each AI search crawler by name. If '
          + 'OAI-SearchBot, Claude-SearchBot, Claude-User and PerplexityBot are not blocked, and the catch-all '
          + 'group does not shut everything, this door is open. The steps below show exactly where to look.',
        steps: [
          {
            title: 'Open the file',
            body:
              'Type your domain followed by /robots.txt into a browser, for example yourstore.com/robots.txt. '
              + 'If the file is empty or the address returns a not-found error, robots.txt blocks no one, and you '
              + 'can move on to the firewall check. A server error is different, so report that to your vendor.',
          },
          {
            title: 'Find the AI search crawlers by name',
            body:
              'Search the page with Ctrl+F (Cmd+F on a Mac) for OAI-SearchBot, Claude-SearchBot, Claude-User '
              + 'and PerplexityBot. Each one, if present, sits on a line that starts with User-agent, and the '
              + 'Allow and Disallow lines right under it apply to that crawler.',
          },
          {
            title: 'Read the catch-all group',
            body:
              'Find the line User-agent: * (an asterisk). Its rules apply to every crawler that has no group of '
              + 'its own. A Disallow: / under the asterisk tells every unnamed bot to stay out of the whole site, '
              + 'so a search crawler without its own group is shut out too.',
          },
          {
            title: 'Know what Disallow means',
            body:
              'Disallow: / blocks the entire site for that user agent. Disallow: /inventory/ blocks only that '
              + 'folder, which on some dealer sites is where the vehicle pages live. An empty Disallow: line blocks '
              + 'nothing. Write down every AI search crawler that is blocked and which folders it cannot reach.',
          },
          {
            title: 'Note the date, then re-check',
            body:
              '[OpenAI says](https://developers.openai.com/api/docs/bots) its systems reflect a robots.txt change '
              + 'in about 24 hours. After your vendor edits the file, open it again the next day to confirm the new '
              + 'rules are live.',
          },
        ],
      },
      {
        type: 'qa',
        id: 'firewall-cdn-blocking-ai-bots',
        q: 'Could your firewall or CDN be blocking AI search bots?',
        a: [
          'Yes. Your firewall, bot protection or CDN can turn AI search bots away even when robots.txt welcomes '
          + 'them, and nothing in robots.txt will show it. [OpenAI asks](https://help.openai.com/en/articles/9237897-searching-the-web-with-chatgpt) '
          + 'sites to let its published search bot IP addresses through at the host or CDN, on top of allowing '
          + 'OAI-SearchBot in robots.txt.',
          'Security services exist to stop scrapers and attacks, and many challenge any automated visitor they '
          + 'do not recognize, often with a check a person can pass and a crawler cannot. That is the right call '
          + 'for a login page and the wrong one for your inventory. The defaults are shifting too: '
          + '[Cloudflare announced on July 1, 2025](https://www.cloudflare.com/press/press-releases/2025/cloudflare-just-changed-how-ai-crawlers-scrape-the-internet-at-large/) '
          + 'that it would block, by default, AI crawlers that access content without permission or compensation, '
          + 'and ask every new domain whether to allow AI crawlers.',
          'The trap is that nobody at the store sees the block. Your site loads fine for you and for buyers, '
          + 'robots.txt looks right, and the crawler gets a challenge page instead of your inventory. For Claude, '
          + '[Anthropic says](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler) '
          + 'its bots honor robots.txt and that blocking them by IP address may not work correctly, which is one '
          + 'more reason to manage access by bot name. Ask your vendor which security service fronts the site and '
          + 'how it treats AI search crawlers, in writing.',
        ],
      },
      {
        type: 'qa',
        id: 'do-ai-crawlers-run-javascript',
        q: 'Do AI crawlers run JavaScript?',
        a: [
          'Some do not. [A 2024 analysis by Vercel and MERJ](https://vercel.com/blog/the-rise-of-the-ai-crawler) '
          + 'of traffic on Vercel’s network found that none of the major AI crawlers rendered JavaScript at the '
          + 'time, including OpenAI’s and Anthropic’s, while Gemini, through Googlebot, and Applebot did. Content '
          + 'that appears only after scripts run may be invisible to the rest.',
          'Treat that as a dated snapshot, since crawlers change. The safe position does not depend on who '
          + 'renders what: put the facts a buyer needs in the HTML the server sends. '
          + '[Google says](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) it can '
          + 'process content inside JavaScript as long as it is not blocked, and '
          + '[Bing’s webmaster guidelines](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a) '
          + 'warn against hiding critical content behind client-side rendering, because content that cannot be '
          + 'reliably rendered may not be indexed or used to ground answers.',
          'Some dealer websites load inventory results, prices or payment calculators with scripts after the '
          + 'page opens. A page like that can look perfect to a shopper and still hand a crawler a photo carousel '
          + 'with no price. The next check shows you which kind of page you have.',
        ],
      },
      {
        type: 'steps',
        h2: 'Are your prices, mileage and VINs readable as text?',
        intro:
          'Open one of your own vehicle pages and look at the raw HTML the server sends, then search it for the '
          + 'price, the mileage and the VIN. If all three appear as plain text, this door is open. If they are '
          + 'missing, a crawler that does not run scripts sees none of them.',
        steps: [
          {
            title: 'Pick a typical used unit',
            body:
              'Choose a vehicle page for a unit that has been in stock a few weeks, with a real price and '
              + 'mileage. A brand-new arrival may still show placeholder text and give you a false alarm.',
          },
          {
            title: 'View the page source',
            body:
              'In Chrome or Edge, press Ctrl+U (Cmd+Option+U on a Mac), or type view-source: in front of the '
              + 'address. This shows the HTML the server sent before any scripts ran, which is close to what a '
              + 'crawler that skips JavaScript receives.',
          },
          {
            title: 'Search for the three facts',
            body:
              'Press Ctrl+F and search for the price digits, the mileage digits and the last six characters of '
              + 'the VIN. Try the price with and without the comma. Each one you find in the source is readable '
              + 'as text.',
          },
          {
            title: 'Compare with scripts turned off',
            body:
              'For a second opinion, turn JavaScript off for your site in the browser settings and reload the '
              + 'page. What still shows is roughly what a crawler that does not render scripts gets. Turn it back '
              + 'on afterward.',
          },
          {
            title: 'Write down what was missing',
            body:
              '[Bing says](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a) pages are more '
              + 'likely to be selected for grounding and citations when important information is visible on the '
              + 'URL itself. If price, mileage or VIN only appear after scripts run, note which one and on which '
              + 'page type. That is usually a template fix your vendor makes once for every unit.',
          },
        ],
      },
      {
        type: 'table',
        h2: 'Does blocking AI training bots hurt your AI search visibility?',
        intro:
          'Blocking training bots does not have to touch AI search, as long as you block bot by bot. OpenAI and '
          + 'Anthropic each run separate crawlers for search and for model training, so a store can opt out of '
          + 'training and still let the search and retrieval bots read its pages.',
        head: ['Company', 'Search and retrieval bots', 'Training bot', 'What blocking the training bot does'],
        rows: [
          [
            'OpenAI',
            'OAI-SearchBot surfaces sites in ChatGPT search; ChatGPT-User handles some actions a user starts',
            'GPTBot',
            'Signals your content should not be used to train OpenAI’s models; OpenAI treats it separately from OAI-SearchBot',
          ],
          [
            'Anthropic',
            'Claude-SearchBot indexes for Claude’s search; Claude-User fetches pages when a Claude user asks',
            'ClaudeBot',
            'Signals exclusion from future training data; Anthropic says blocking the other two reduces visibility',
          ],
        ],
        note:
          'From OpenAI’s crawler overview and Anthropic’s help center as of September 2026. Both sources are '
          + 'linked at the end of this article.',
      },
      {
        type: 'bullets',
        h2: 'What should you send your website vendor?',
        intro:
          'Send your website vendor a short list of testable changes, one per line, each with the way you will '
          + 'confirm it. A precise request is easier for a support team to act on than a general worry about AI. '
          + 'Here is a starting list, adapted to whatever your four checks found.',
        items: [
          'Allow OAI-SearchBot, Claude-SearchBot, Claude-User and PerplexityBot in robots.txt, and make sure no '
          + 'catch-all Disallow: / shuts them out. Test: open /robots.txt the next day.',
          'Allow OpenAI’s published search bot IP ranges at the CDN or firewall, as '
          + '[OpenAI’s help center](https://help.openai.com/en/articles/9237897-searching-the-web-with-chatgpt) '
          + 'asks, and confirm the security service does not challenge AI search crawlers. Test: ask for a dated '
          + 'screenshot of the bot settings.',
          'Render price, mileage and the full VIN in the HTML of every vehicle page, so they do not depend on '
          + 'scripts. Test: view source on three vehicle pages and search for each value.',
          'Keep training decisions separate. If the store wants to opt out of model training, block GPTBot and '
          + 'ClaudeBot by name instead of blocking everything. Test: read the robots.txt group for each name.',
          'Tell the store before any security setting or template changes, including a redesign, and reply in '
          + 'writing with what changed and the date, so the store can re-check it.',
        ],
      },
      {
        type: 'qa',
        id: 'how-the-free-scan-checks-your-website',
        q: 'How does the free scan check your website?',
        a: [
          'The free scan reads only your robots.txt, your homepage, your sitemap when needed and up to five '
          + 'vehicle pages. It checks whether AI search crawlers are allowed, whether the security service in '
          + 'front of your site challenges automated visitors, and whether price, mileage and VIN are readable. '
          + 'If our check gets blocked, that block becomes a finding.',
          'The website check is one part of the scan. It also asks ChatGPT and Claude, each with web search on, '
          + 'up to 20 questions a buyer in your town would ask, 3 times each, because answers change from run to '
          + 'run. The report shows who gets named, which sources are cited, a score out of 100 with a margin, and '
          + 'the 3 fixes to make first, written plainly enough to hand to your vendor.',
          'A person on our team checks every report and walks you through it in 20 minutes. No logins are '
          + 'needed and nothing gets installed. You can [request the free scan](/aeo-geo-for-car-dealers/#scan-form) '
          + 'with your store name, website and city, and the 3 fixes are yours to keep whether or not you hire us.',
        ],
      },
      {
        type: 'bullets',
        h2: 'Where do these facts come from?',
        intro:
          'Every claim above about OpenAI, Anthropic, Google, Microsoft Bing, Cloudflare and Vercel comes from '
          + 'that company’s own published pages, listed here. Crawler rules and security defaults change, so '
          + 're-read the source before you change a setting, and write down the date of your own checks.',
        items: [
          '[OpenAI Help Center: Searching the web with ChatGPT](https://help.openai.com/en/articles/9237897-searching-the-web-with-chatgpt)',
          '[OpenAI: Overview of OpenAI crawlers](https://developers.openai.com/api/docs/bots)',
          '[Anthropic: how Anthropic crawls the web and how site owners can block the crawler](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler)',
          '[Google Search Central: optimizing for generative AI features](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)',
          '[Microsoft Bing Webmaster Guidelines](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a)',
          '[Cloudflare press release, July 1, 2025](https://www.cloudflare.com/press/press-releases/2025/cloudflare-just-changed-how-ai-crawlers-scrape-the-internet-at-large/)',
          '[Vercel: The rise of the AI crawler, December 2024](https://vercel.com/blog/the-rise-of-the-ai-crawler)',
        ],
      },
    ],
    faq: [
      ['Is my dealership website blocking ChatGPT?',
        'It might be, and you can find out in a few minutes. Open yourstore.com/robots.txt and look for '
        + 'OAI-SearchBot or a catch-all Disallow: / line, then ask your website vendor whether the security '
        + 'service in front of the site challenges AI search crawlers. '
        + '[OpenAI says](https://help.openai.com/en/articles/9237897-searching-the-web-with-chatgpt) a site needs '
        + 'both doors open to be eligible for ChatGPT search results.'],
      ['How long after I fix robots.txt will ChatGPT see my site?',
        '[OpenAI says](https://developers.openai.com/api/docs/bots) its systems reflect a robots.txt change in '
        + 'about 24 hours. That covers the crawl rule only. Whether ChatGPT then names or cites your store depends '
        + 'on many other signals, and no one can promise when or whether that happens. Re-check the file the next '
        + 'day, then test a few buyer questions over the following weeks.'],
      ['Does ChatGPT-User follow my robots.txt?',
        'Not always. [OpenAI says](https://developers.openai.com/api/docs/bots) ChatGPT-User handles '
        + 'certain actions a person starts inside ChatGPT, and because those are user actions, '
        + 'robots.txt rules may not apply to it. Whether your store can appear in ChatGPT search '
        + 'depends on OAI-SearchBot, so that is the crawler to check first.'],
      ['What if my website vendor controls robots.txt?',
        'Many dealers are in that spot. Send the vendor a written request naming the exact crawlers to allow, the '
        + 'CDN or firewall setting to check, and how you will test it, then open robots.txt again the next day. '
        + 'Keep the reply in writing so you can show what changed and when.'],
    ],
    cta: {
      heading: 'Find out if AI can read your site',
      sub:
        'Your robots.txt, the security service in front of your site and up to five vehicle pages are part of '
        + 'the free scan, along with who ChatGPT and Claude name for local buyer questions. A person walks you '
        + 'through it in 20 minutes.',
    },
  },

  // ---------------------------------------------------------------------------
  // #10 /aeo-geo/cloudflare-ai-bots-dealer-websites/
  // ---------------------------------------------------------------------------
  {
    slug: 'cloudflare-ai-bots-dealer-websites',
    silo: 'aeoGeo',
    cluster: 'website',
    publishOrder: 10,
    anchor: 'Cloudflare AI bot blocking on dealer websites: what to allow',
    crumb: 'Cloudflare AI bots',
    primaryKeyword: 'cloudflare block ai crawlers',
    secondaryKeywords: [
      'cloudflare block ai crawlers by default',
      'cloudflare ai crawl control',
      'allow oai-searchbot in cloudflare',
      'cloudflare managed robots.txt',
    ],
    alsoRelated: [
      'should-dealers-block-ai-crawlers',
      'dealer-website-provider-ai-search',
      'how-claude-cites-sources',
      'perplexity-for-car-dealerships',
    ],
    augmentKeys: [],
    title: 'Cloudflare AI Bot Blocking on Dealer Websites: What to Set',
    description:
      'How Cloudflare’s AI bot blocking can hide a dealer website from AI search, what its Search, Agent and '
      + 'Training bot categories mean, and what to allow.',
    eyebrow: 'AEO and GEO for car dealers',
    h1: 'Cloudflare AI bot blocking on dealer websites: how to keep AI search crawlers in',
    tldr:
      'Does Cloudflare block AI crawlers on dealer websites? It can: Cloudflare announced in July 2025 that it '
      + 'would block, by default, AI crawlers that take content without permission or compensation, and ask '
      + 'every new domain whether to allow AI crawlers. The fix is to keep Cloudflare’s Search '
      + 'category allowed, allow OAI-SearchBot, Claude-SearchBot and PerplexityBot by name, and make the '
      + 'training decision separately. The Cloudflare account often sits with your website vendor, so send them '
      + 'a short, testable change request and ask for screenshots back.',
    sections: [
      {
        type: 'qa',
        id: 'can-cloudflare-block-ai-search-crawlers',
        q: 'Does Cloudflare block AI crawlers on dealer websites?',
        a: [
          'It can. Cloudflare sits in front of many websites as a security layer, and '
          + '[it announced on July 1, 2025](https://www.cloudflare.com/press/press-releases/2025/cloudflare-just-changed-how-ai-crawlers-scrape-the-internet-at-large/) '
          + 'that it would block, by default, AI crawlers that take content without permission or compensation, '
          + 'and ask every new domain whether to allow AI crawlers. If its settings turn away OAI-SearchBot or '
          + 'Claude-SearchBot, a permissive robots.txt does not help.',
          'The two layers work independently. [RFC 9309](https://www.rfc-editor.org/rfc/rfc9309.html), the '
          + 'robots.txt standard, says its rules are not a form of access authorization: robots.txt is a request '
          + 'a crawler reads and chooses to follow. Cloudflare is a gate that decides whether the request reaches '
          + 'your server at all. [OpenAI’s help center](https://help.openai.com/en/articles/9237897-searching-the-web-with-chatgpt) '
          + 'says ChatGPT search eligibility needs both: OAI-SearchBot allowed in robots.txt, and your host or CDN '
          + 'letting through traffic from OpenAI’s published search bot IP addresses. Understanding '
          + '[what ChatGPT looks at before it recommends a store](@how-chatgpt-recommends-car-dealerships) starts with that door '
          + 'being open.',
          'For a dealer, being readable is the starting line for '
          + '[AEO for car dealerships](/aeo-geo-for-car-dealers/): an assistant cannot quote your hours, name your '
          + 'store for a model you stock or cite your service page if its crawler never gets a page back. '
          + 'Cloudflare framed its defaults around publishers whose content gets used without permission or pay. '
          + 'A dealership usually wants the opposite for its public pages.',
        ],
      },
      {
        type: 'qa',
        id: 'what-cloudflare-changed-july-2025',
        q: 'What did Cloudflare change in July 2025?',
        a: [
          'On July 1, 2025, [Cloudflare said](https://www.cloudflare.com/press/press-releases/2025/cloudflare-just-changed-how-ai-crawlers-scrape-the-internet-at-large/) '
          + 'it had become the first internet infrastructure provider to block AI crawlers that access content '
          + 'without permission or compensation by default, and that every new domain would be asked whether to '
          + 'allow AI crawlers. Cloudflare says it helps manage and protect traffic for 20% of the web.',
          'Cloudflare framed the change around publishers getting paid for their work. In '
          + '[a post the same day](https://blog.cloudflare.com/content-independence-day-no-ai-crawl-without-compensation/), '
          + 'Cloudflare’s CEO estimated that getting traffic from OpenAI was 750 times harder, and from Anthropic '
          + '30,000 times harder, than from the Google of old. Those are Cloudflare’s own mid-2025 estimates, and '
          + 'they explain why its defaults lean toward blocking.',
          'A dealer’s position is different. Your site exists to be found, and an assistant that reads your '
          + 'inventory, hours and service pages is doing the job your website was built for: putting your store in '
          + 'front of a local buyer. Search crawlers that surface and cite pages are the ones to keep. Training is '
          + 'a separate choice, and Cloudflare’s newer controls let you make it on its own.',
        ],
      },
      {
        type: 'table',
        h2: 'What are Cloudflare’s Search, Agent and Training bot categories?',
        intro:
          'Cloudflare sorts AI bots by what they do. Search bots index content, Agent bots carry out automated '
          + 'tasks in real time, and Training bots collect content for model training. The table maps the crawlers a dealer '
          + 'cares about to the closest category, using each company’s own description of its bot.',
        head: ['Crawler', 'What its owner says it does', 'Closest Cloudflare category', 'Usual dealer choice'],
        rows: [
          ['OAI-SearchBot (OpenAI)', 'Surfaces websites in ChatGPT search; not used for training', 'Search', 'Allow'],
          ['ChatGPT-User (OpenAI)', 'Certain actions a ChatGPT user starts', 'Agent', 'Allow'],
          ['GPTBot (OpenAI)', 'Collects content that may train OpenAI’s models', 'Training', 'Business choice'],
          ['Claude-SearchBot (Anthropic)', 'Crawls to improve Claude’s search results', 'Search', 'Allow'],
          ['Claude-User (Anthropic)', 'Fetches pages when a Claude user asks a question', 'Agent', 'Allow'],
          ['ClaudeBot (Anthropic)', 'Collects content that may train Anthropic’s models', 'Training', 'Business choice'],
          ['PerplexityBot (Perplexity)', 'Surfaces and links sites in Perplexity results; not used to train foundation models', 'Search', 'Allow'],
        ],
        note:
          'Owner descriptions come from OpenAI, Anthropic and Perplexity documentation as of September 2026. '
          + 'Cloudflare assigns each bot’s category itself, so confirm the label in your own dashboard before '
          + 'changing a rule.',
      },
      {
        type: 'qa',
        id: 'cloudflare-managed-robots-txt',
        q: 'What does Cloudflare’s managed robots.txt add?',
        a: [
          '[Cloudflare’s managed robots.txt](https://developers.cloudflare.com/bots/additional-configurations/managed-robots-txt/) '
          + 'adds Disallow rules for a list of AI crawlers, including GPTBot, ClaudeBot, Google-Extended and '
          + 'Applebot-Extended, plus a content signal that reads search=yes, ai-train=no. Cloudflare itself notes '
          + 'that obeying robots.txt is voluntary, so the file states your wishes rather than enforcing them.',
          'For a store that wants to opt out of training while staying readable, this is a sensible middle '
          + 'setting, because the crawlers Cloudflare lists as examples are mostly training crawlers, and its '
          + 'signal says search use is welcome. Three cautions. Google-Extended covers more than training: '
          + '[Google says](https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers) it '
          + 'also controls grounding in Gemini Apps, though it does not affect inclusion in Google Search, so '
          + 'weigh that line on its own. The list is Cloudflare’s and can change, so read the live file instead of '
          + 'assuming what it contains. And if your vendor also maintains its own robots.txt, find out how the two '
          + 'combine, because two people editing the same rules is how a store ends up blocking what it meant to '
          + 'allow.',
        ],
      },
      {
        type: 'qa',
        id: 'cloudflare-september-2026-defaults',
        q: 'What did Cloudflare announce for new domains from September 15, 2026?',
        a: [
          '[Cloudflare’s documentation announced](https://developers.cloudflare.com/bots/additional-configurations/block-ai-bots/) '
          + 'that from September 15, 2026, new domains would get updated defaults: bots classed as Training or '
          + 'Agent blocked on pages that display ads, with Search bots still allowed. The same page marked the '
          + 'older Block AI bots option as deprecating that day. Check your own dashboard for what applies.',
          'If your vehicle pages do not display ads, the ad-page rule may not touch them. The part that matters '
          + 'is the direction: Cloudflare keeps moving toward separate controls for search, agents and training. '
          + 'For a dealer that is good news, because it makes the right setting, search on and training your '
          + 'call, easier to express.',
        ],
      },
      {
        type: 'callout',
        title: 'Dated notice',
        body:
          'Everything in this article reflects Cloudflare’s public documentation as read in September 2026, and '
          + 'the September 15, 2026 change is described as Cloudflare announced it. Before your vendor changes '
          + 'anything, have them read the current page and your live dashboard, and date the screenshot.',
      },
      {
        type: 'qa',
        id: 'see-which-ai-bots-reach-your-site',
        q: 'How do you see which AI bots reach your site?',
        a: [
          'Use Cloudflare’s AI Crawl Control. [Cloudflare says](https://developers.cloudflare.com/ai-crawl-control/) '
          + 'it shows which AI services access your content and lets you set allow or block rules per crawler, '
          + 'and that it is available on all plans. Whoever holds the Cloudflare login can open it, which is often '
          + 'your website vendor rather than the store.',
          'Ask for three things from that screen: the AI crawlers that visited over a recent period, whether each '
          + 'one is allowed or blocked, and whether any search crawler shows challenges or blocks. A search '
          + 'crawler that keeps visiting and keeps getting blocked is the clearest sign of a setting working '
          + 'against you.',
          'If your site does not use Cloudflare, the same question applies to whatever security service fronts '
          + 'it. Many bot managers and firewalls can challenge automated visitors, and each has its own controls. '
          + 'Ask your vendor the same questions in the same words, and ask for a screenshot rather than a yes.',
        ],
      },
      {
        type: 'steps',
        h2: 'What should a dealer ask the website vendor to set?',
        intro:
          'Ask the vendor to keep Cloudflare’s Search category allowed, allow the named AI search crawlers and '
          + 'OpenAI’s published IP ranges, set training separately, and send proof back. Five changes, each '
          + 'testable, cover the usual problems for a dealer site behind Cloudflare or a similar security service.',
        steps: [
          {
            title: 'Keep the Search category allowed',
            body:
              'In Cloudflare’s AI bot controls, Search should stay allowed for the whole site. If anything in the '
              + 'dashboard blocks all AI bots at once, ask the vendor to replace it with per-category or '
              + 'per-crawler rules.',
          },
          {
            title: 'Allow the AI search crawlers by name',
            body:
              'Ask for explicit allow rules for OAI-SearchBot, Claude-SearchBot and PerplexityBot, plus Claude-User '
              + 'and ChatGPT-User for pages a buyer asks an assistant to open. Named rules make your intent explicit '
              + 'if a default changes later.',
          },
          {
            title: 'Let OpenAI’s published IP ranges through',
            body:
              '[OpenAI asks](https://help.openai.com/en/articles/9237897-searching-the-web-with-chatgpt) sites to '
              + 'allow traffic from its published search bot IP addresses at the host or CDN. Ask the vendor to '
              + 'confirm no firewall rule, rate limit or challenge page stands between those addresses and your '
              + 'vehicle pages.',
          },
          {
            title: 'Decide on training separately',
            body:
              'Blocking Training bots such as GPTBot and ClaudeBot is a business decision, and it can sit '
              + 'alongside open search access. Put the decision in writing so the next person at the vendor does '
              + 'not undo it.',
          },
          {
            title: 'Get proof back, then test it yourself',
            body:
              'Ask for dated screenshots of the AI Crawl Control settings and the live robots.txt. Then '
              + '[test whether AI crawlers can read your site](@can-chatgpt-see-my-dealer-website) with '
              + 'the 15-minute routine, and repeat it after any redesign or security change.',
          },
        ],
      },
      {
        type: 'bullets',
        h2: 'Where do these facts come from?',
        intro:
          'Every Cloudflare, OpenAI, Anthropic, Perplexity and Google claim in this article comes from that company’s '
          + 'own pages or from the robots.txt standard, listed below. Cloudflare updates its bot settings over '
          + 'time, so re-read the live page before anyone changes a setting on your site.',
        items: [
          '[Cloudflare press release, July 1, 2025](https://www.cloudflare.com/press/press-releases/2025/cloudflare-just-changed-how-ai-crawlers-scrape-the-internet-at-large/)',
          '[Cloudflare blog: Content Independence Day, July 1, 2025](https://blog.cloudflare.com/content-independence-day-no-ai-crawl-without-compensation/)',
          '[Cloudflare Docs: block AI bots](https://developers.cloudflare.com/bots/additional-configurations/block-ai-bots/)',
          '[Cloudflare Docs: AI bot categories](https://developers.cloudflare.com/bots/concepts/bot/#ai-bots)',
          '[Cloudflare Docs: managed robots.txt](https://developers.cloudflare.com/bots/additional-configurations/managed-robots-txt/)',
          '[Cloudflare Docs: AI Crawl Control](https://developers.cloudflare.com/ai-crawl-control/)',
          '[OpenAI Help Center: Searching the web with ChatGPT](https://help.openai.com/en/articles/9237897-searching-the-web-with-chatgpt)',
          '[OpenAI: Overview of OpenAI crawlers](https://developers.openai.com/api/docs/bots)',
          '[Anthropic: how Anthropic crawls the web](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler)',
          '[Perplexity: Perplexity crawlers](https://docs.perplexity.ai/guides/bots)',
          '[Google Search Central: Google’s common crawlers (Google-Extended)](https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers)',
          '[RFC 9309: Robots Exclusion Protocol](https://www.rfc-editor.org/rfc/rfc9309.html)',
        ],
      },
    ],
    faq: [
      ['How do I know if my dealer website uses Cloudflare?',
        'Ask your website vendor, who can answer in one reply. You can also open your browser’s developer tools, '
        + 'load your homepage and look for cloudflare in the server line of the response headers. The vendor’s '
        + 'answer is the one to trust, since some sites sit behind more than one service.'],
      ['Can Cloudflare block training bots and still allow AI search?',
        'Yes. [Cloudflare sorts AI bots](https://developers.cloudflare.com/bots/concepts/bot/#ai-bots) into Search, '
        + 'Agent and Training categories, and its managed robots.txt targets training crawlers such as GPTBot and '
        + 'ClaudeBot with a search=yes, ai-train=no signal. You can block Training while leaving Search allowed, '
        + 'and add named allow rules for the search crawlers you care about.'],
      ['Does Cloudflare’s managed robots.txt block ChatGPT search?',
        'The managed file Cloudflare documents targets training crawlers, including OpenAI’s GPTBot, and its '
        + 'content signal says search=yes. OAI-SearchBot, the crawler behind ChatGPT search, is a separate bot. '
        + 'Read your live robots.txt to confirm, because the list can change and your vendor may add its own rules.'],
      ['Who at my dealership can change Cloudflare settings?',
        'Often nobody at the store. The Cloudflare account frequently belongs to the website vendor or an IT '
        + 'contractor, so your job is a clear written request. If the account is in the dealership’s name, find '
        + 'out who has the login before you need it, and keep that person on the vendor thread.'],
    ],
    cta: {
      heading: 'See whether your security settings let AI in',
      sub:
        'If the security service in front of your site challenges automated visitors, the free scan reports it '
        + 'as a finding, along with your robots.txt, up to five vehicle pages and who ChatGPT and Claude name for '
        + 'local buyer questions.',
    },
  },

  // ---------------------------------------------------------------------------
  // #28 /aeo-geo/should-dealers-block-ai-crawlers/
  // ---------------------------------------------------------------------------
  {
    slug: 'should-dealers-block-ai-crawlers',
    silo: 'aeoGeo',
    cluster: 'website',
    publishOrder: 28,
    anchor: 'Should your dealership block AI crawlers? Search bots vs training bots',
    crumb: 'Block AI crawlers?',
    primaryKeyword: 'should i block ai crawlers',
    secondaryKeywords: [
      'robots.txt for ai crawlers',
      'gptbot vs oai-searchbot',
      'google-extended robots.txt',
      'list of ai user agents',
    ],
    alsoRelated: [
      'llms-txt-for-car-dealerships',
      'perplexity-for-car-dealerships',
      'dealer-website-provider-ai-search',
      'how-claude-cites-sources',
      'chatgpt-ads-for-car-dealers',
    ],
    augmentKeys: [],
    title: 'Should Your Dealership Block AI Crawlers? Bot by Bot',
    description:
      'Should a dealership block AI crawlers? Search bots vs training bots from OpenAI, Anthropic, Google, '
      + 'Perplexity and Apple, plus robots.txt examples.',
    eyebrow: 'AEO and GEO for car dealers',
    h1: 'Should your dealership block AI crawlers? Search bots, training bots and the robots.txt lines',
    tldr:
      'Should I block AI crawlers? For a car dealership, keep the AI search and retrieval bots allowed, because '
      + 'they are how ChatGPT, Claude and Perplexity read and cite your store. Blocking training bots such as '
      + 'GPTBot and ClaudeBot is a separate business choice, since OpenAI and Anthropic run training apart from '
      + 'search. Google-Extended needs more thought: Google says it does not affect inclusion in Google Search, '
      + 'but it also covers grounding in Gemini Apps. Write the rules bot by bot, and never block every crawler '
      + 'at once.',
    sections: [
      {
        type: 'qa',
        id: 'should-a-dealership-block-ai-crawlers',
        q: 'Should a car dealership block AI crawlers?',
        a: [
          'No, not the ones that matter for being found. A dealership should keep AI search and retrieval bots '
          + 'such as OAI-SearchBot, Claude-SearchBot, Claude-User and PerplexityBot allowed so assistants can read '
          + 'and cite its pages. Blocking training bots is a separate business choice, because '
          + '[OpenAI](https://developers.openai.com/api/docs/bots) and '
          + '[Anthropic](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler) '
          + 'run training on different crawlers from search.',
          'The reasoning is simple for a store. Your website exists to put your name, your inventory and your '
          + 'service department in front of local buyers, and an assistant can only name or cite what its crawler '
          + 'was allowed to read. Anthropic says blocking Claude-SearchBot prevents indexing for search and '
          + 'reduces visibility in its search results, and that blocking Claude-User prevents retrieval when a '
          + 'user asks a question. Blocking those bots amounts to asking not to be read.',
          'Before deciding anything, [check whether ChatGPT and Claude can read your website](@can-chatgpt-see-my-dealer-website) '
          + 'today, because a robots.txt file is easy to forget once it is written. Crawler access is the base '
          + 'layer of [AEO for car dealerships](/aeo-geo-for-car-dealers/): the answer pages, reviews and listings '
          + 'work that follows only counts if the assistants can get in.',
        ],
      },
      {
        type: 'table',
        h2: 'Which AI bots are search bots and which are training bots?',
        intro:
          'The major AI companies publish the names of their crawlers and what each one does. Search and '
          + 'retrieval bots read pages so an assistant can find, quote and cite them, while training bots collect '
          + 'content that may train future models. The table lists the ones a dealer will see, as each company '
          + 'describes them.',
        head: ['Company', 'Crawler or token', 'Job', 'What to know before blocking'],
        rows: [
          ['OpenAI', 'OAI-SearchBot', 'Search: surfaces sites in ChatGPT search, not used for training', 'OpenAI says sites must allow it to be eligible for ChatGPT search results'],
          ['OpenAI', 'GPTBot', 'Training: content that may train OpenAI’s models', 'Disallowing it signals your content should not be used in training'],
          ['OpenAI', 'ChatGPT-User', 'User actions: certain actions a ChatGPT user starts', 'OpenAI says robots.txt rules may not apply to it'],
          ['Anthropic', 'Claude-SearchBot', 'Search: improves Claude’s search results', 'Anthropic says blocking it prevents indexing for search'],
          ['Anthropic', 'Claude-User', 'Retrieval: fetches pages when a Claude user asks', 'Anthropic says blocking it prevents retrieval for user questions'],
          ['Anthropic', 'ClaudeBot', 'Training: content that may train Anthropic’s models', 'Blocking it signals exclusion from future training data'],
          ['Perplexity', 'PerplexityBot', 'Search: surfaces and links sites in Perplexity, not used to train foundation models', 'Respects robots.txt; changes can take up to 24 hours'],
          ['Perplexity', 'Perplexity-User', 'User actions: visits a page to answer a user’s question', 'Perplexity says it generally ignores robots.txt'],
          ['Google', 'Google-Extended', 'A robots.txt token for Gemini training and grounding in Gemini Apps and Vertex AI', 'Google says it does not affect inclusion in Google Search and has no separate user agent'],
          ['Apple', 'Applebot', 'Crawler whose data feeds Apple search features in Spotlight, Siri and Safari', 'Separate from Apple’s training opt-out'],
          ['Apple', 'Applebot-Extended', 'Opt-out token for training Apple’s generative models', 'Apple says it does not crawl pages itself'],
        ],
        note:
          'Descriptions paraphrase each company’s own crawler documentation as of September 2026. Sources are '
          + 'listed at the end of this article.',
      },
      {
        type: 'qa',
        id: 'what-if-you-block-oai-searchbot',
        q: 'What happens if your site blocks OAI-SearchBot?',
        a: [
          'Your site drops out of eligibility for ChatGPT search results. '
          + '[OpenAI says](https://help.openai.com/en/articles/9237897-searching-the-web-with-chatgpt) a site must '
          + 'allow OAI-SearchBot to crawl it, and must let OpenAI’s published search bot IP addresses through its '
          + 'host or CDN, to be eligible for inclusion. Of every line in a dealer’s robots.txt, this is the one to '
          + 'get right for ChatGPT.',
          'There is a wrinkle. [OpenAI’s publisher FAQ](https://help.openai.com/en/articles/12627856-publishers-and-developers-faq) '
          + 'says that if a page is disallowed but OpenAI learns its URL from a third-party search provider or '
          + 'other pages, ChatGPT Atlas may still show the bare link and title. A noindex meta tag prevents that, '
          + 'and the crawler has to be allowed in to read the tag. So robots.txt controls reading, while noindex '
          + 'controls listing. For a dealer that wants to be found, the takeaway stays the same: allow '
          + 'OAI-SearchBot and give it pages worth quoting.',
          'Being readable is the entry ticket, and what ChatGPT does with your pages depends on much more. For '
          + 'the rest of the picture, read [how ChatGPT chooses a dealership](@how-chatgpt-recommends-car-dealerships) '
          + 'when local buyers ask for one.',
        ],
      },
      {
        type: 'qa',
        id: 'google-extended-and-ai-overviews',
        q: 'Does blocking Google-Extended remove you from AI Overviews?',
        a: [
          'No, based on how Google describes its controls. '
          + '[Google says](https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers) '
          + 'Google-Extended governs whether its crawled content trains future Gemini models and grounds answers '
          + 'in Gemini Apps and Vertex AI, and that it does not affect inclusion in Google Search. Google AI '
          + 'Overviews and Google AI Mode sit under Search’s own controls.',
          '[Google’s AI features page](https://developers.google.com/search/docs/appearance/ai-features) says the '
          + 'controls for how a page appears in its AI features are the normal Search preview controls: '
          + 'nosnippet, data-nosnippet, max-snippet and noindex. '
          + '[Search Console](https://support.google.com/webmasters/answer/16908024) also has a generative AI '
          + 'setting, on by default for every property, that lets an owner exclude the site’s links and content '
          + 'from AI Overviews, AI Mode and generative AI features in Discover. Google says that exclusion does '
          + 'not affect AI training.',
          'Putting those pages together is our reading of Google’s documentation, since Google does not state '
          + 'the combination in one place: Google-Extended is a training and Gemini grounding decision, and the '
          + 'AI Overviews decision lives in Search. For a dealer that wants to be cited, leave the Search Console '
          + 'setting on and avoid nosnippet on pages you want quoted. More on '
          + '[Google AI Overviews for car dealers](@google-ai-overviews-for-car-dealers).',
        ],
      },
      {
        type: 'qa',
        id: 'do-all-bots-obey-robots-txt',
        q: 'Do all bots obey robots.txt?',
        a: [
          'No. [RFC 9309](https://www.rfc-editor.org/rfc/rfc9309.html), the robots.txt standard, says its rules '
          + 'are not a form of access authorization, so compliance is up to each crawler. '
          + '[OpenAI says](https://developers.openai.com/api/docs/bots) robots.txt rules may not apply to '
          + 'ChatGPT-User, [Perplexity says](https://docs.perplexity.ai/guides/bots) Perplexity-User generally '
          + 'ignores them, and [Cloudflare notes](https://developers.cloudflare.com/bots/additional-configurations/managed-robots-txt/) '
          + 'that robots.txt compliance is voluntary.',
          'The user-triggered bots are a special case for a reason: they fetch a page because a person asked for '
          + 'it. If a buyer pastes one of your vehicle pages into ChatGPT and asks whether the price is fair, the '
          + 'fetch that may follow is that buyer’s request. Blocking fetches like that mostly gets in the way of '
          + 'your own shoppers.',
          'For the crawlers that honor robots.txt, the file does its job. For anything else, the control sits at '
          + 'the security layer, which is where [Cloudflare’s AI bot settings](@cloudflare-ai-bots-dealer-websites) '
          + 'and similar tools come in. [Anthropic says](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler) '
          + 'its bots honor robots.txt and that blocking them by IP address may not work correctly, so for Claude, '
          + 'robots.txt is the right tool.',
        ],
      },
      {
        type: 'steps',
        h2: 'What robots.txt lines should a dealership use?',
        intro:
          'Use a robots.txt that names each AI search crawler and allows it, then adds training blocks only if the '
          + 'store has decided on them. The lines below are an example to adapt with your website vendor, never a '
          + 'file to paste over your current one, since that file may hold rules your site needs.',
        steps: [
          {
            title: 'Keep your existing rules',
            body:
              'Start from the current file. Rules that keep crawlers out of admin pages, internal search results '
              + 'or checkout flows usually belong there, and your vendor added them for a reason. Add the AI groups '
              + 'below them instead of starting over.',
          },
          {
            title: 'Allow the search and retrieval bots by name',
            body:
              'Add one group per crawler: a line reading User-agent: OAI-SearchBot followed by a line reading '
              + 'Allow: /, then the same two lines for Claude-SearchBot, Claude-User and PerplexityBot. With a named '
              + 'group, each of these crawlers follows its own rules instead of the catch-all group.',
          },
          {
            title: 'Decide on training, then write it down',
            body:
              'If the store opts out of model training, add User-agent: GPTBot with Disallow: /, and the same for '
              + 'ClaudeBot and Applebot-Extended. Weigh Google-Extended on its own, since Google says it also '
              + 'controls grounding in Gemini Apps. [Apple says](https://support.apple.com/en-us/119829) '
              + 'Applebot-Extended does not crawl pages; it only controls training use. Applebot, the crawler behind '
              + 'Apple’s search features in Spotlight, Siri and Safari, is a separate name.',
          },
          {
            title: 'Check the catch-all group',
            body:
              'Look at User-agent: * last. If it says Disallow: /, every crawler without its own group is shut out, '
              + 'which is why the named Allow groups in step 2 matter. Never add a blanket Disallow: / to settle a '
              + 'training worry.',
          },
          {
            title: 'Test after 24 hours',
            body:
              '[OpenAI says](https://developers.openai.com/api/docs/bots) robots.txt changes take about 24 hours '
              + 'to be reflected, and [Perplexity says](https://docs.perplexity.ai/guides/bots) up to 24 hours. '
              + 'Open yourstore.com/robots.txt the next day, confirm every group reads the way you wrote it, and '
              + 'date the check.',
          },
        ],
      },
      {
        type: 'qa',
        id: 'robots-txt-and-keeping-pages-out-of-search',
        q: 'Is robots.txt the way to keep a page out of search?',
        a: [
          'No. [Google says](https://developers.google.com/search/docs/crawling-indexing/robots/intro) robots.txt '
          + 'mainly manages crawler traffic and is not a mechanism for keeping a page out of Google. To keep a '
          + 'page out of search results, use a noindex tag or password protection. OpenAI makes a similar point '
          + 'for ChatGPT Atlas, where a disallowed page can still show as a link and title.',
          'This matters for pages a dealer genuinely wants hidden, such as a staff-only price sheet, a test '
          + 'landing page or an old campaign. Blocking them in robots.txt can leave the address findable with no '
          + 'description. A noindex tag, with the crawler allowed to read it, is the cleaner tool, and anything '
          + 'with private information belongs behind a login.',
          'For everything a buyer should find, including inventory, the service menu, hours and directions, do '
          + 'the opposite: let the search crawlers in and make each page easy to quote. Getting those rules '
          + 'right, and keeping them right after every site change, is part of the monthly website work in our '
          + 'service.',
        ],
      },
      {
        type: 'bullets',
        h2: 'Where do these facts come from?',
        intro:
          'Every bot description in this article comes from the company that runs the bot: OpenAI, Anthropic, '
          + 'Perplexity, Google and Apple, plus the robots.txt standard and Cloudflare’s documentation. Crawler '
          + 'names and rules change from time to time, so check the live page before editing your file.',
        items: [
          '[OpenAI: Overview of OpenAI crawlers](https://developers.openai.com/api/docs/bots)',
          '[OpenAI Help Center: Searching the web with ChatGPT](https://help.openai.com/en/articles/9237897-searching-the-web-with-chatgpt)',
          '[OpenAI Help Center: Publishers and developers FAQ](https://help.openai.com/en/articles/12627856-publishers-and-developers-faq)',
          '[Anthropic: how Anthropic crawls the web](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler)',
          '[Perplexity: Perplexity crawlers](https://docs.perplexity.ai/guides/bots)',
          '[Google Search Central: Google’s common crawlers](https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers)',
          '[Google Search Central: AI features and your website](https://developers.google.com/search/docs/appearance/ai-features)',
          '[Google Search Console Help: Search generative AI setting](https://support.google.com/webmasters/answer/16908024)',
          '[Google Search Central: introduction to robots.txt](https://developers.google.com/search/docs/crawling-indexing/robots/intro)',
          '[Apple Support: About Applebot](https://support.apple.com/en-us/119829)',
          '[RFC 9309: Robots Exclusion Protocol](https://www.rfc-editor.org/rfc/rfc9309.html)',
          '[Cloudflare Docs: managed robots.txt](https://developers.cloudflare.com/bots/additional-configurations/managed-robots-txt/)',
        ],
      },
    ],
    faq: [
      ['Will blocking GPTBot keep my dealership out of ChatGPT?',
        'Not out of ChatGPT search. [OpenAI describes](https://developers.openai.com/api/docs/bots) GPTBot as its '
        + 'training crawler and treats blocking it as separate from OAI-SearchBot, the crawler that surfaces sites '
        + 'in ChatGPT search. A store can disallow GPTBot and stay eligible for ChatGPT search results, as long as '
        + 'OAI-SearchBot and OpenAI’s published IP ranges are allowed.'],
      ['Can I block AI training but still allow AI search?',
        'Yes. Name each crawler in robots.txt: allow OAI-SearchBot, Claude-SearchBot, Claude-User and '
        + 'PerplexityBot, and disallow GPTBot, ClaudeBot and Applebot-Extended if the store wants to opt out of '
        + 'training. Decide on Google-Extended separately, because Google says it also covers grounding in Gemini '
        + 'Apps. Avoid a blanket rule for every bot, which would block search along with training.'],
      ['Does Applebot matter for a car dealership?',
        'It can. [Apple says](https://support.apple.com/en-us/119829) Applebot data feeds search features across '
        + 'Spotlight, Siri and Safari, so keep Applebot allowed. If the store wants to opt out of Apple’s model '
        + 'training, disallow Applebot-Extended, which Apple says does not crawl pages itself.'],
      ['How long do robots.txt changes take to work?',
        'OpenAI says about 24 hours for OAI-SearchBot, and Perplexity says up to 24 hours for PerplexityBot. Check the live file the '
        + 'next day, then allow a few weeks before judging whether assistants have read your pages again, since '
        + 'crawling and answering run on their own schedules.'],
    ],
    cta: {
      heading: 'Check what your robots.txt lets in',
      sub:
        'The free scan reads your robots.txt and checks whether the security service in front of your site '
        + 'challenges automated visitors, then shows who ChatGPT and Claude name when local buyers ask. A person '
        + 'walks you through it in 20 minutes.',
    },
  },

  // ---------------------------------------------------------------------------
  // #42 /aeo-geo/llms-txt-for-car-dealerships/
  // ---------------------------------------------------------------------------
  {
    slug: 'llms-txt-for-car-dealerships',
    silo: 'aeoGeo',
    cluster: 'website',
    publishOrder: 42,
    anchor: 'llms.txt for car dealerships: what it does and what it doesn’t',
    crumb: 'llms.txt',
    primaryKeyword: 'llms.txt for car dealerships',
    secondaryKeywords: [
      'what is llms.txt',
      'llms.txt example',
      'does google use llms.txt',
      'llms.txt generator',
    ],
    alsoRelated: [
      'dealer-website-provider-ai-search',
      'perplexity-for-car-dealerships',
      'how-claude-cites-sources',
    ],
    augmentKeys: [],
    title: 'llms.txt for Car Dealerships: What It Does and Doesn’t',
    description:
      'What llms.txt is, what Google says about it, whether a car dealership needs one, and what to put in it '
      + 'if you decide to publish one anyway.',
    eyebrow: 'AEO and GEO for car dealers',
    h1: 'llms.txt for car dealerships: what it does and what it doesn’t',
    tldr:
      'llms.txt for car dealerships is optional. It began as a 2024 proposal for a Markdown file that gives AI '
      + 'tools a short guide to a website, and [Google says](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) '
      + 'Google Search does not use it and that one will neither help nor harm your visibility there. When we '
      + 'checked in September 2026, we found no official statement from OpenAI, Anthropic, Perplexity or '
      + 'Microsoft committing to use it. Publish one '
      + 'only after crawler access, vehicle page text and your Business Profile are right, and never pay for it '
      + 'as a ranking fix.',
    sections: [
      {
        type: 'qa',
        id: 'what-is-llms-txt',
        q: 'What is llms.txt?',
        a: [
          'llms.txt is a proposal, first published on September 3, 2024 by Jeremy Howard and hosted by Answer.AI, '
          + 'for a Markdown file at yoursite.com/llms.txt that gives AI agents a curated summary of a website. '
          + '[The proposal](https://llmstxt.org/) requires only an H1 with the site name, and a short blockquote '
          + 'summary comes next.',
          'The idea is practical. A web page carries menus, scripts, pop-ups and footers, and an AI tool reading '
          + 'it has to dig the useful text out. An llms.txt file hands over a clean list of the pages that matter, '
          + 'in plain Markdown, with a line on what each one covers. The site itself describes llms.txt as a '
          + 'proposal for a standard, and it has not been adopted as one.',
          'For AI search in general, the bigger levers sit elsewhere: '
          + '[generative engine optimization for dealers](/aeo-geo-for-car-dealers/) starts with whether '
          + 'assistants can read your site and trust what it says, and an llms.txt file is a small, cheap '
          + 'addition on top of that work.',
        ],
      },
      {
        type: 'qa',
        id: 'does-google-use-llms-txt',
        q: 'Does Google use llms.txt?',
        a: [
          'No. [Google says](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) Google '
          + 'Search does not use llms.txt or similar special AI files, and that creating one for other services is '
          + 'fine but “will neither harm nor help your site’s visibility or rankings in Google Search.” '
          + '[Google also says](https://developers.google.com/search/docs/appearance/ai-features) you need no new '
          + 'AI text files or special markup for its AI features.',
          'That covers Google AI Overviews and Google AI Mode too, since they are features of Google Search. '
          + '[Google’s guidance](https://developers.google.com/search/docs/appearance/ai-features) for appearing '
          + 'there is ordinary search work: a page has to be indexed and eligible to show with a snippet. If a '
          + 'vendor tells you llms.txt will lift your Google rankings or get you into AI Overviews, that claim '
          + 'conflicts with Google’s own documentation.',
        ],
      },
      {
        type: 'qa',
        id: 'do-chatgpt-claude-perplexity-use-llms-txt',
        q: 'Do ChatGPT, Claude or Perplexity use llms.txt?',
        a: [
          'We found no official statement from OpenAI, Anthropic, Perplexity or Microsoft committing to use '
          + 'llms.txt for ranking or citations when we researched this article in September 2026. Some tools and '
          + 'AI agents may read the file, and the proposal is written for them, but none of those companies had '
          + 'published a commitment we could find.',
          'What those companies have documented is how their crawlers work. '
          + '[OpenAI’s](https://developers.openai.com/api/docs/bots) search crawler is OAI-SearchBot, '
          + '[Anthropic](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler) '
          + 'runs Claude-SearchBot and Claude-User, and [Perplexity](https://docs.perplexity.ai/guides/bots) runs '
          + 'PerplexityBot. Each company says its search crawler respects robots.txt, and each crawler reads '
          + 'ordinary web pages. That is where a dealer’s attention belongs first.',
          'This could change. If one of these companies announces llms.txt support, a correct file becomes more '
          + 'useful, and because it is cheap to publish, having one ready costs little. Until then, treat it as a '
          + 'courtesy to the tools that look for it.',
        ],
      },
      {
        type: 'qa',
        id: 'should-a-dealership-publish-llms-txt',
        q: 'Should a car dealership publish an llms.txt file?',
        a: [
          'A car dealership can publish an llms.txt file if it wants, since it is optional and costs little, but '
          + 'it belongs at the bottom of the list. Do it only after AI search crawlers can reach the site, vehicle '
          + 'pages show price, mileage and VIN as text, and your Business Profile facts match your website.',
          'The order matters because each earlier item decides whether anything gets read at all. A perfect '
          + 'llms.txt behind a robots.txt that blocks OAI-SearchBot, or in front of vehicle pages that load their '
          + 'prices by script, does little for a buyer asking ChatGPT about your store. Start with the 15-minute '
          + 'routine to [test whether AI crawlers can read your site](@can-chatgpt-see-my-dealer-website).',
          'Then decide on llms.txt with your website vendor. Some dealer website platforms may already generate '
          + 'a file, and a second hand-made one could conflict with it. Ask before anyone uploads anything.',
        ],
      },
      {
        type: 'steps',
        h2: 'What would a dealership llms.txt contain?',
        intro:
          'A dealership llms.txt would contain the store name as a heading, a one-paragraph summary, and short '
          + 'lists of links to the pages a buyer or an AI tool needs most. Every fact in it should match the '
          + 'website word for word, so it never becomes a second, stale version of your store.',
        steps: [
          {
            title: 'Start with one H1 line',
            body:
              'The first line is the store name after a single pound sign, for example “# Your Store Name”. '
              + '[The proposal](https://llmstxt.org/) requires this line and nothing else, so everything below it '
              + 'is your choice.',
          },
          {
            title: 'Add a short summary',
            body:
              'Next comes a blockquote line starting with >, holding one or two sentences: the brands you sell, '
              + 'new or used or both, the city, and the departments, such as sales, service, parts and finance. '
              + 'Write it as plain fact, the way you would describe the store to a new hire.',
          },
          {
            title: 'List the pages buyers shop from',
            body:
              'Under a heading such as “## Shopping”, add links to new inventory, used inventory, specials and the '
              + 'trade-in page, one per line in Markdown link format, each with a few words on what the page holds.',
          },
          {
            title: 'List the store facts',
            body:
              'Under a heading such as “## Store”, link hours and directions, contact, service scheduling, '
              + 'financing and the FAQ page. These are the pages that answer the practical questions buyers ask '
              + 'before they visit.',
          },
          {
            title: 'Upload it to the site root',
            body:
              'Your vendor places the file at yoursite.com/llms.txt. Open that address afterward to confirm it '
              + 'loads as plain text and that every link works.',
          },
          {
            title: 'Keep it matched to the site',
            body:
              'Put a reminder on the calendar to update the file whenever hours, departments or page addresses '
              + 'change. A file that lists last year’s hours is worse than no file, because it hands a tool a '
              + 'confident wrong answer.',
          },
        ],
      },
      {
        type: 'bullets',
        h2: 'What matters more than llms.txt for car dealerships?',
        intro:
          'Four things matter more than llms.txt for a dealership: crawler access, readable vehicle pages, '
          + 'structured data that matches the page, and store facts that agree everywhere. Each one affects '
          + 'whether an assistant can read, understand and trust your store. Fix these first, in this order, and '
          + 'llms.txt becomes a finishing touch.',
        items: [
          'Crawler access. Let OAI-SearchBot, Claude-SearchBot, Claude-User and PerplexityBot through robots.txt '
          + 'and the security service in front of the site. Our guide on '
          + '[which AI crawlers to block and which to allow](@should-dealers-block-ai-crawlers) has the bot-by-bot '
          + 'table.',
          'Vehicle page text. Price, mileage and the full VIN belong in the HTML the server sends, so no script '
          + 'has to run first. [Bing’s guidelines](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a) '
          + 'warn against hiding critical content behind client-side rendering.',
          'Structured data that matches the page: AutoDealer or LocalBusiness markup for the store, and Vehicle '
          + 'and Offer markup on vehicle pages, with the same price a buyer sees. '
          + '[Google says](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) '
          + 'structured data is not required for its generative AI search, so treat it as a clarity aid. See '
          + '[schema markup for car dealerships](@car-dealership-schema-markup) for what to include.',
          'Consistent store facts. Use the same name, address, phone and hours on your website, Google Business '
          + 'Profile, Bing Places, Apple Business Connect, DealerRater and the listing sites. '
          + '[Bing says](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a) clear entity '
          + 'definition improves grounding visibility and citation accuracy.',
          'Pages that answer real buyer questions, from trade-in steps to service hours, so an assistant has '
          + 'specific text about your store to work with.',
        ],
      },
      {
        type: 'qa',
        id: 'should-you-pay-for-llms-txt',
        q: 'Should you pay for an llms.txt service?',
        a: [
          'Treat a paid llms.txt service sold as a ranking fix as a red flag. Google says the file will neither '
          + 'harm nor help visibility in Google Search, and '
          + '[it warns](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) site owners '
          + 'to be wary of third-party tools claiming ranking success, noting that no third-party tool has access '
          + 'to its internal ranking or AI systems.',
          'An internet manager can write a dealership llms.txt with the steps above in a short sitting, and your '
          + 'website vendor can upload it. If someone quotes a monthly fee for llms.txt alone, ask what it changes '
          + 'that you can measure. A good answer names specific tools that read the file. A weak answer mentions '
          + 'Google rankings or AI Overviews.',
          'The same test applies to any AI search vendor: the pitch should match what Google, OpenAI and Anthropic '
          + 'actually document. Our list of [AEO red flags](@aeo-agency-red-flags) covers the other promises no '
          + 'one can keep.',
        ],
      },
      {
        type: 'bullets',
        h2: 'Where do these facts come from?',
        intro:
          'The claims about llms.txt come from the proposal’s own site and from Google’s published guidance, and '
          + 'the crawler details come from OpenAI, Anthropic, Perplexity and Microsoft Bing. The note about '
          + 'missing statements reflects our research in September 2026, so check again before you decide.',
        items: [
          '[llmstxt.org: the llms.txt proposal](https://llmstxt.org/)',
          '[Google Search Central: optimizing for generative AI features](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)',
          '[Google Search Central: AI features and your website](https://developers.google.com/search/docs/appearance/ai-features)',
          '[OpenAI: Overview of OpenAI crawlers](https://developers.openai.com/api/docs/bots)',
          '[Anthropic: how Anthropic crawls the web](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler)',
          '[Perplexity: Perplexity crawlers](https://docs.perplexity.ai/guides/bots)',
          '[Microsoft Bing Webmaster Guidelines](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a)',
        ],
      },
    ],
    faq: [
      ['Is llms.txt an official web standard?',
        'No. It is a proposal, first published in September 2024 by Jeremy Howard and hosted by Answer.AI, and its '
        + 'own site presents it as a proposal for a standard. We found no major search engine or AI company that '
        + 'has announced it as a requirement.'],
      ['Will an llms.txt file get my dealership into ChatGPT?',
        'Not on its own, and no one can promise what ChatGPT says. OpenAI’s documented requirement for ChatGPT '
        + 'search is letting OAI-SearchBot crawl your site and letting its published IP addresses through your '
        + 'host or CDN. We found no official OpenAI statement committing to use llms.txt, so get crawler access '
        + 'right first.'],
      ['Should llms.txt list every vehicle?',
        'No. Inventory changes daily, and a file that lists last week’s cars hands AI tools stale '
        + 'facts. Point to your inventory page and key store pages instead, and leave hours and '
        + 'addresses out unless someone will update the file with every change.'],
      ['Does my dealer website platform create llms.txt for me?',
        'Ask your provider. Platforms differ, and some may generate a file automatically while others leave it to '
        + 'you. Open yoursite.com/llms.txt to see whether one exists, and if it does, read it for wrong or outdated '
        + 'facts before adding anything.'],
    ],
    cta: {
      heading: 'See what AI already reads about your store',
      sub:
        'Before adding new files, find out what ChatGPT and Claude can read today. The free scan checks your '
        + 'robots.txt and up to five vehicle pages, and a person walks you through the 3 fixes in 20 minutes.',
    },
  },

  // ---------------------------------------------------------------------------
  // #50 /aeo-geo/dealer-website-provider-ai-search/
  // ---------------------------------------------------------------------------
  {
    slug: 'dealer-website-provider-ai-search',
    silo: 'aeoGeo',
    cluster: 'website',
    publishOrder: 50,
    anchor: 'What to ask your dealer website provider about AI search',
    crumb: 'Website provider questions',
    primaryKeyword: 'dealer website provider ai search',
    secondaryKeywords: [
      'can i edit my robots.txt',
      'dealer website ai crawler settings',
      'oem certified website program ai',
      'dealer website vendor seo',
    ],
    alsoRelated: [
      'can-chatgpt-see-my-dealer-website',
      'llms-txt-for-car-dealerships',
      'inventory-feeds-ai-shopping',
      'aeo-checklist-for-dealerships',
    ],
    augmentKeys: [],
    title: 'What to Ask Your Dealer Website Provider About AI Search',
    description:
      'What to ask your dealer website provider about AI search: robots.txt, bot blocking, JavaScript, vehicle '
      + 'page text, schema and who fixes what.',
    eyebrow: 'AEO and GEO for car dealers',
    h1: 'Dealer website platforms and AI search: what to ask your provider and what you can change',
    tldr:
      'Your dealer website provider often controls the three things AI search depends on: robots.txt, the '
      + 'security service or CDN, and the page templates. So the practical route is a precise request that asks '
      + 'which AI crawlers are allowed, whether search bots get challenged, whether price, mileage and VIN are in '
      + 'the HTML, and whether vehicle markup matches the page. Put one change per line, say how to test it, and '
      + 're-check after about 24 hours.',
    sections: [
      {
        type: 'qa',
        id: 'who-controls-ai-access',
        q: 'Who controls AI search access: you or your dealer website provider?',
        a: [
          'On many dealer websites, the website provider controls AI access, because it hosts the robots.txt '
          + 'file, runs or contracts the CDN and firewall, and owns the page templates. '
          + '[OpenAI’s requirement](https://help.openai.com/en/articles/9237897-searching-the-web-with-chatgpt) '
          + 'for ChatGPT search touches both robots.txt and the host or CDN, so the dealer’s job is a clear, '
          + 'testable request to that provider.',
          'That split is normal and sensible. Platforms that host many dealer sites tend to keep templates and '
          + 'security rules centralized, which protects every store from one bad edit. It also means the '
          + 'decisions that shape your AI visibility were often made once, at the platform level, possibly before '
          + 'AI search crawlers existed, and nobody at the store has read them since.',
          'You do not need to become a web developer to fix it. You need the right questions, a way to test the '
          + 'answers and someone who follows up. Follow-up is the part that slips when the store gets busy, and it '
          + 'is built into [AEO for car dealerships](/aeo-geo-for-car-dealers/) as we run it: a written fix list '
          + 'sent to your provider with your authorization, chased every week and re-checked until each fix is '
          + 'live.',
        ],
      },
      {
        type: 'bullets',
        h2: 'What should you ask about robots.txt?',
        intro:
          'Ask your provider which AI user agents your robots.txt allows or blocks today, whether you can allow '
          + 'the AI search crawlers by name, and whether training bots can be set separately. Ask for the answer '
          + 'in writing, with the current file attached, so you can check it yourself.',
        items: [
          'Which AI crawlers does our robots.txt name today, and what does each one allow or disallow? Include the '
          + 'catch-all User-agent: * group in the answer.',
          'Can you allow OAI-SearchBot, Claude-SearchBot, Claude-User and PerplexityBot by name? '
          + '[OpenAI](https://help.openai.com/en/articles/9237897-searching-the-web-with-chatgpt), '
          + '[Anthropic](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler) '
          + 'and [Perplexity](https://docs.perplexity.ai/guides/bots) document these as the crawlers their search '
          + 'and answers rely on.',
          'Can training crawlers such as GPTBot and ClaudeBot be set separately, so the store decides on training '
          + 'without touching search? Our breakdown of '
          + '[which AI crawlers to block and which to allow](@should-dealers-block-ai-crawlers) explains the '
          + 'difference.',
          'Can we edit robots.txt ourselves, or does every change go through a support ticket? If it is a ticket, '
          + 'how long does one usually take?',
          'Is robots.txt shared across every site on the platform, or is ours our own? A shared file means a '
          + 'change request may need a platform decision.',
        ],
      },
      {
        type: 'bullets',
        h2: 'What should you ask about bot protection and firewalls?',
        intro:
          'Ask which security service sits in front of your site, whether it challenges AI search crawlers, '
          + 'whether OpenAI’s published IP ranges are allowed, and whether you can see a log of which AI bots reach '
          + 'the site. This layer can block crawlers even when robots.txt allows them.',
        items: [
          'Which CDN, firewall or bot protection service fronts our site, and who holds the account?',
          'Are AI search crawlers challenged, rate limited or blocked? A challenge page a person clicks through '
          + 'can stop a crawler completely.',
          'Are OpenAI’s published search bot IP addresses allowed at the host or CDN? '
          + '[OpenAI asks](https://help.openai.com/en/articles/9237897-searching-the-web-with-chatgpt) for this '
          + 'on top of robots.txt.',
          'Is there a crawler log we can see? Some services have one: '
          + '[Cloudflare’s AI Crawl Control](https://developers.cloudflare.com/ai-crawl-control/), for example, '
          + 'shows which AI services access a site and lets the owner allow or block each crawler. Our guide to '
          + '[Cloudflare’s AI bot settings](@cloudflare-ai-bots-dealer-websites) walks through that screen.',
          'Will you tell us before any security setting changes, so we can re-check AI access the same week?',
        ],
      },
      {
        type: 'bullets',
        h2: 'What should you ask about JavaScript and vehicle page text?',
        intro:
          'Ask whether price, mileage and VIN are in the HTML when a vehicle page first loads or injected later '
          + 'by scripts, and what a text-only fetch of a vehicle page returns. Crawlers that skip JavaScript only '
          + 'see what the server sends, so the answer decides what they can read.',
        items: [
          'Are price, mileage and the full VIN in the server-rendered HTML of every vehicle detail page? '
          + '[A 2024 analysis by Vercel and MERJ](https://vercel.com/blog/the-rise-of-the-ai-crawler) found that '
          + 'the AI crawlers from OpenAI, Anthropic and Perplexity did not render JavaScript at the time.',
          'What does a plain text fetch of a vehicle page show? Ask for one example, or check it yourself with '
          + 'view source. [Bing says](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a) '
          + 'important information should be visible on the URL itself and warns against hiding critical content '
          + 'behind client-side rendering. Our checklist for '
          + '[vehicle detail pages AI can read](@vehicle-detail-page-ai-readable) covers the rest of the page.',
          'Do payment calculators, price badges or incentive banners stand in for the actual price in the text? '
          + 'A price that only exists inside a script or an image is invisible to a crawler that reads text.',
          'Is the price on the vehicle page the same price in the inventory feed and in any structured data? '
          + 'Mismatches confuse buyers and machines alike.',
        ],
      },
      {
        type: 'bullets',
        h2: 'What should you ask about structured data?',
        intro:
          'Ask whether the site carries AutoDealer or LocalBusiness markup with your departments, and whether '
          + 'vehicle pages carry Vehicle and Offer markup that matches the visible price. Structured data helps '
          + 'machines read a page, and Google says it is optional for AI search, so treat it as a clarity aid.',
        items: [
          'Is there AutoDealer or LocalBusiness markup on the site, with name, address, phone, hours and a '
          + 'department for sales, service and parts? '
          + '[Google’s LocalBusiness documentation](https://developers.google.com/search/docs/appearance/structured-data/local-business) '
          + 'requires name and address, recommends department for businesses with distinct departments, and says '
          + 'to use the most specific subtype possible.',
          'Do vehicle detail pages carry Vehicle markup with the VIN, mileage and other specs, and Offer markup '
          + 'with the price? [Schema.org’s Vehicle type](https://schema.org/Vehicle) includes '
          + 'vehicleIdentificationNumber and mileageFromOdometer, among other properties.',
          'Does the markup match what a buyer sees? '
          + '[Bing says](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a) markup must accurately '
          + 'reflect visible content, and that structured data may support clearer grounding without securing '
          + 'visibility on its own.',
          'Who updates the markup when prices change? If the feed updates the page and leaves the markup behind, '
          + 'the two drift apart.',
          '[Google says](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) structured '
          + 'data is not required for its generative AI search, so a missing field is a clarity issue rather than '
          + 'an emergency. Our guide to [schema markup for car dealerships](@car-dealership-schema-markup) covers '
          + 'what to include.',
        ],
      },
      {
        type: 'qa',
        id: 'oem-certified-website-program',
        q: 'What if you are on an OEM certified website program?',
        a: [
          'If your store is on an OEM certified website program, the rules about what you can change come from '
          + 'that program and vary by manufacturer. Ask your provider in writing which of these requests the '
          + 'program allows: robots.txt edits, security settings, vehicle page templates and added structured '
          + 'data. Some changes may need program approval.',
          'Programs exist for real reasons, from brand consistency to co-op eligibility, so work inside them. Most '
          + 'of the requests in this article are settings and template details, which leaves a provider room to '
          + 'say yes. Where the answer is no, get the reason in writing, because it tells you where AI access is '
          + 'being decided.',
          'One honest note about us: AutoLander is not on any manufacturer’s approved-vendor list, and our service '
          + 'does not include manufacturer program approval or co-op eligibility. We work alongside the provider '
          + 'and the program you already have.',
        ],
      },
      {
        type: 'steps',
        h2: 'How do you write a fix request the provider will act on?',
        intro:
          'Write one issue per line, state the exact change, say how to test it, and set a date to re-check. A '
          + 'provider’s support team can act on a request like that without a meeting, and you can confirm each fix '
          + 'yourself instead of waiting for a status update.',
        steps: [
          {
            title: 'Name the problem in one line',
            body:
              'For example: “OAI-SearchBot and Claude-SearchBot are blocked by the User-agent: * group in '
              + 'robots.txt.” One issue per line keeps tickets from bouncing between teams.',
          },
          {
            title: 'State the exact change',
            body:
              'Write the change you want rather than the outcome you hope for: “Add named groups allowing '
              + 'OAI-SearchBot, Claude-SearchBot, Claude-User and PerplexityBot.” A request like “make us show up in '
              + 'ChatGPT” gives a support agent nothing to do.',
          },
          {
            title: 'Say how you will test it',
            body:
              'Add the check you will run: open /robots.txt, view source on three vehicle pages, or read the '
              + 'crawler log. A request with a test attached is easier to close correctly.',
          },
          {
            title: 'Set a re-check date',
            body:
              'Give a date to look again, a few business days out. Keep the thread, and reply on it when the '
              + 're-check passes or fails.',
          },
          {
            title: 'Keep a written trail',
            body:
              'Save each request and reply, so a redesign or a staff change on either side does not quietly undo '
              + 'the work. If you would rather not run this yourself, our team sends the fix list with your written '
              + 'authorization, chases it every week and re-checks your site until each fix is live.',
          },
        ],
      },
      {
        type: 'bullets',
        h2: 'How do you check the fix went live?',
        intro:
          'Check the fix yourself: re-open robots.txt, re-fetch a vehicle page, and look at the security settings '
          + 'or crawler log again. Wait about a day before judging crawler behavior, since OpenAI says its systems '
          + 'take about 24 hours to reflect a robots.txt change. Then write down the date and the result.',
        items: [
          'Open yoursite.com/robots.txt in a private browser window and confirm each named group reads as '
          + 'requested. [OpenAI says](https://developers.openai.com/api/docs/bots) robots.txt changes take about '
          + '24 hours to be reflected for OAI-SearchBot.',
          'View source on three vehicle pages of different ages and search for price, mileage and VIN.',
          'Ask for a dated screenshot of the bot or firewall settings that changed.',
          'Run the same check again after the next site update or redesign, because template changes can undo old '
          + 'fixes.',
          'Log each result with the date, so the next person at the store knows what was fixed and what is still '
          + 'open.',
        ],
      },
      {
        type: 'bullets',
        h2: 'Where do these facts come from?',
        intro:
          'Every claim here about OpenAI, Anthropic, Perplexity, Google, Microsoft Bing, Cloudflare and Vercel '
          + 'comes from that organization’s own published pages, listed below. Provider settings and crawler rules '
          + 'change over time, so bring the current version of each page to your provider conversation.',
        items: [
          '[OpenAI Help Center: Searching the web with ChatGPT](https://help.openai.com/en/articles/9237897-searching-the-web-with-chatgpt)',
          '[OpenAI: Overview of OpenAI crawlers](https://developers.openai.com/api/docs/bots)',
          '[Anthropic: how Anthropic crawls the web](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler)',
          '[Perplexity: Perplexity crawlers](https://docs.perplexity.ai/guides/bots)',
          '[Microsoft Bing Webmaster Guidelines](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a)',
          '[Vercel: The rise of the AI crawler, December 2024](https://vercel.com/blog/the-rise-of-the-ai-crawler)',
          '[Cloudflare Docs: AI Crawl Control](https://developers.cloudflare.com/ai-crawl-control/)',
          '[Google Search Central: LocalBusiness structured data](https://developers.google.com/search/docs/appearance/structured-data/local-business)',
          '[Google Search Central: optimizing for generative AI features](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)',
          '[Schema.org: Vehicle](https://schema.org/Vehicle)',
          '[Google Search Central: AI features and your website](https://developers.google.com/search/docs/appearance/ai-features)',
        ],
      },
    ],
    faq: [
      ['Do I need to switch website providers to show up in AI answers?',
        'Usually not. Most of what AI search depends on, including crawler access, security settings, vehicle '
        + 'page text and markup, can be changed by the provider you already have. Start with a written fix list '
        + 'and see what comes back. Switching providers is a big project, and no one can promise it will change '
        + 'what an AI assistant says.'],
      ['Can my website provider block AI crawlers without telling me?',
        'It can happen without anyone intending it. A platform-wide robots.txt update, a new security rule or a '
        + 'CDN default can change what AI crawlers reach, and nobody at the store gets a notice. That is why the '
        + 'check is worth repeating after any redesign or security change.'],
      ['Is my provider’s SEO package the same as AEO?',
        'They overlap. AEO and GEO build on SEO: '
        + '[Google says](https://developers.google.com/search/docs/appearance/ai-features) a page must be indexed '
        + 'and eligible for a snippet to show as a link in its AI features, which is ordinary SEO work. AEO adds '
        + 'answer-first pages, AI crawler access and consistent store facts across the sites assistants read. '
        + 'Keep your provider’s SEO and ask how it handles the AI pieces.'],
      ['How long should a website fix take?',
        'It depends on the provider and the fix. A robots.txt edit is small, while a vehicle page template change '
        + 'can take longer and may need testing across every unit. Ask for a date in writing, re-check on that '
        + 'date, and follow up every week until it is live. Once robots.txt changes, OpenAI says its search '
        + 'crawler reflects it in about 24 hours.'],
    ],
    cta: {
      heading: 'Get the 3 fixes to send your provider',
      sub:
        'The free scan checks your robots.txt, the security service in front of your site and up to five vehicle '
        + 'pages, then gives you the 3 fixes written plainly enough to hand to your website provider. A person '
        + 'walks you through it in 20 minutes.',
    },
  },
];
