export const TEAM_META = {
  title: 'AutoLander for Dealerships | Team Plans from $117/mo',
  description: 'Put your whole sales floor on Facebook Marketplace. AutoPilot posts, reprices and pulls sold cars for every rep. $39 per rep, team plans from $117/mo.',
  ogCardEyebrow: 'For dealership teams',
  ogCardTitle: 'Put your whole sales floor on Marketplace',
};

export const HEADLINE_SEGMENTS = {
  a: [
    { text: 'Put your ' },
    { text: 'whole sales floor', accent: true },
    { text: ' on Marketplace and ' },
    { text: 'see it all.', accent: true },
  ],
  b: [
    { text: 'You stopped asking who posted. ' },
    { text: 'Put it on AutoPilot.', accent: true },
  ],
  c: [
    { text: 'Your people ', accent: false },
    { text: 'sell.', accent: true },
    { text: ' AutoPilot does ' },
    { text: 'the posting.', accent: true },
  ],
  d: [
    { text: 'How many of your cars can a buyer ' },
    { text: 'find tonight?', accent: true },
  ],
};

export const HEADLINES = Object.fromEntries(
  Object.entries(HEADLINE_SEGMENTS).map(([key, parts]) => [key, parts.map((part) => part.text).join('')]),
);

export const SUBS = {
  a: 'Flip on AutoPilot and your inventory posts to Marketplace by itself, day and night: new cars up, prices updated, sold units pulled down. You see it all in one Manager Dashboard. $39 per sales rep.',
  b: 'The Manager Dashboard shows every rep’s posts, live listings and sold cars, so you never have to ask. AutoPilot does the posting for your whole floor from one inventory feed. $39 per sales rep.',
  c: 'AutoPilot runs the whole listing cycle for every salesperson on your floor, day and night: new cars posted, prices updated, sold units pulled down. One Manager Dashboard shows you who’s posting. $39 per sales rep.',
  d: 'Your buyers scroll Marketplace every night. AutoPilot keeps your inventory in front of them through every salesperson on your floor: posted, priced right and cleaned up, day and night. $39 per sales rep.',
};

export const EYEBROW = 'For dealers, GMs and sales managers · 3+ salespeople';
export const DEMO_LINE = 'Free 30-minute demo: we post up to 5 of your own cars while you watch, whether you buy or not.';
export const CHIPS = [
  'More than 200 dealerships on AutoLander',
  '5 free posts in your demo',
  'No credit card',
  'Month to month',
  'Team plans from $117/mo',
];

export const TIERS = [
  { name: 'Starter', price: 39, posts: 5 },
  { name: 'Growth', price: 59, posts: 10 },
  { name: 'Pro', price: 79, posts: 15 },
];

export const PLAN_LINES = [
  'Everything in Pro',
  'Minimum 3 Seats, Any Tier Mix',
  'Starter $39 • Growth $59 • Pro $79 per seat',
  'Live Manager Dashboard',
  'Real-Time Team Presence',
  'Post Attribution + Analytics',
  'AI Studio welcome credits scale with team size',
  'Managers free: only salespeople who post take a seat',
  'Month to month, no contract',
];

export const PRICING = {
  eyebrow: 'Simple team pricing',
  headingLead: '$39 per sales rep.',
  headingAccent: 'Team plans from $117 a month.',
  lead: 'Pay per posting seat. Your managers watch the dashboard free. Mix plans however your floor works, and add seats anytime.',
  badge: 'For teams',
  planName: 'Dealer Plan',
  from: 'From',
  monthly: '$117',
  perMonth: '/ month',
  builder: 'Build Your Team: Any Mix of Seats',
  summary: 'Build a team that scales with you. Mix tiers, add seats anytime.',
};

export const FAQ = [
  {
    q: 'Will my salespeople actually use it?',
    a: 'They barely have to touch it. One switch turns on AutoPilot, and it posts through their own Facebook profile, updates prices and marks sold units by itself. You’ll see who’s posting in the Manager Dashboard.',
  },
  {
    q: 'How fast can we be live?',
    a: 'If your cars are on CarGurus or Cars.com, we can set you up right on the demo call. Other feeds connect through your vendor’s export, and we set it up with you.',
  },
  {
    q: 'My salespeople already post on Marketplace. What changes?',
    a: 'They stop typing listings. AutoPilot works through your whole inventory from your feed, keeps prices current and marks sold units, day and night, and you see who is posting and what is live, rep by rep.',
  },
  { q: 'Do I pay for my managers?', a: 'No. Only salespeople who post take a paid seat. Managers see the dashboard free.' },
  {
    q: 'Only 1 or 2 salespeople?',
    a: 'The individual plans ($39, $59 or $79 each) are simpler. The Dealer Plan starts at 3 seats and adds the Manager Dashboard, because that’s where it pays off.',
  },
  {
    q: 'What happens when a salesperson leaves?',
    a: 'Remove them under Configuration → Team (the trash icon on their row), and their posting seat opens up for your next hire the same day. Free Marketplace vehicle listings are posted from personal profiles, so their existing listings stay on their own profile. We can’t move them.',
  },
  {
    q: 'Does it work with our feed or DMS?',
    a: 'CarGurus and Cars.com connect directly, and many dealer websites load directly too. Other systems (vAuto, DealerCenter, DealerTrack, VINCue, Tekion, CDK) connect through a dealer-authorized export in a supported format. We confirm yours before you buy.',
  },
  {
    q: 'Where does AutoPilot run?',
    a: 'In the AutoLander desktop app on each salesperson’s computer, Windows or Mac. Leave AutoLander open and flip on AutoPilot: it keeps the computer awake and keeps working day and night, even after they leave the lot. Laptops stay open and plugged in.',
  },
  { q: 'How many cars a day?', a: 'Per salesperson: Starter 5, Growth 10, Pro 15 posts a day. AutoPilot spreads them across the hours you choose.' },
  {
    q: 'Will prices and sold cars stay right?',
    a: 'Yes. AutoPilot updates prices and pulls sold units down from your feed on its own, AutoLander renews eligible listings, and sold units show up as alerts in your dashboard.',
  },
  {
    q: 'Who talks to the buyers?',
    a: 'Your salespeople, in Messenger. That’s the part that sells cars. AutoPilot does the posting so they spend their time closing deals.',
  },
  {
    q: 'Do I drop CarGurus or Cars.com?',
    a: 'No. AutoLander uses the inventory you already list. Marketplace is one more place your local buyers find it.',
  },
  { q: 'Can I cancel?', a: 'Yes. Month to month, no contract. Your demo includes 5 free posts, no card.' },
];

export const FINAL_CTA = {
  headingLead: 'Tonight your buyers will scroll Marketplace.',
  headingAccent: 'Make sure they find your cars.',
  body: '30 minutes on your own inventory: we post up to 5 of your cars while you watch, walk you through AutoPilot and the Manager Dashboard, and price your team.',
  button: 'Book your free team demo',
  formNote: '6 quick questions. Then pick your time from the link we send you.',
  chips: '5 free posts in your demo · No credit card · Month to month',
};
