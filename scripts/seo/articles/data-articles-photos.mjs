// Avalanche articles — 'photos' silo (photos & merchandising spokes under /guide/).
// Pure content data per the article-system.mjs contract: NO imports, string/array/object
// literals only. The builder adds paths, breadcrumbs, JSON-LD and publish-aware links.

export const ARTICLES = [

  // ---------------------------------------------------- /guide/car-photography-tips-for-dealerships/
  {
    slug: 'car-photography-tips-for-dealerships',
    silo: 'photos',
    anchor: 'Car dealership photography tips: a process any porter can run',
    crumb: 'Dealership photography tips',
    primaryKeyword: 'car dealership photography tips',
    secondaryKeywords: [
      'how to photograph cars for a dealership',
      'vehicle photography checklist',
      'dealership photo process',
    ],
    title: 'Car Dealership Photography Tips: A Process Any Porter Can Run',
    description:
      'Car dealership photography tips that scale: the per-unit process any porter can '
      + 'run — time of day, lot spot, shot list, phone settings — and where AI fits.',
    eyebrow: 'Dealer photo guide',
    h1: 'Car dealership photography tips: a process any porter can run',
    tldr:
      'Good dealership photography is a process, not a talent. Pick one photo spot on the lot, '
      + 'shoot in the first or last hours of daylight, walk the same shot list on every unit, and '
      + 'lock the phone settings once. A porter can produce consistent, dealer-grade photos in '
      + 'about fifteen minutes per car. AI background replacement then handles the one variable '
      + 'the process cannot: what is behind the car.',
    sections: [
      {
        type: 'qa',
        q: 'What are the best photography tips for a car dealership?',
        a: [
          'The single best tip is to stop treating photos as artistry and start treating them as a '
          + 'repeatable process. Buyers scrolling Marketplace or your website do not reward creative '
          + 'shots — they reward listings where every car is clean, well lit, fully covered, and '
          + 'consistent with the one next to it. Consistency is what reads as “professional store.”',
          'That means the store needs a written photo routine any porter or salesperson can run '
          + 'without judgment calls: one staging spot, one time-of-day window, one shot list, one '
          + 'set of phone settings. Everything below is that routine.',
        ],
      },
      {
        type: 'steps',
        h2: 'The dealership photo process, step by step',
        intro: 'Run this loop on every unit that hits the lot. Same order, every time — the order is what makes it fast.',
        steps: [
          { title: 'Stage the car before you touch the camera', body: 'Washed, dried, tires dressed, paper tags and window stock stickers off, seats vacuumed, no coffee cup in the console. A photo of a dirty car is an ad for a dirty car — no edit fixes it.' },
          { title: 'Pick one photo spot and never improvise', body: 'Find the emptiest corner of the lot — a plain wall, fence line, or open pavement with no other inventory behind it. Mark it. Every unit gets photographed in that exact spot so the background problem is solved once, not per car.' },
          { title: 'Shoot inside the light window', body: 'First two hours after sunrise or the last two before sunset, sun behind the photographer. A bright overcast day is a gift — shoot all day. Skip high noon; overhead sun buries the roof in glare and the sides in shadow.' },
          { title: 'Set the phone once and leave it alone', body: 'Wipe the lens, turn the grid on, keep HDR on, and never pinch-zoom — walk closer instead. Zoom throws away resolution; walking preserves it. Hold the phone at mid-door height, not eye level.' },
          { title: 'Walk the same exterior loop', body: 'Three-quarter front from the driver side, full profile, three-quarter rear, straight-on rear, straight-on front, then repeat the angled shots from the passenger side. Fill the frame with the car every time.' },
          { title: 'Shoot the interior with the doors open', body: 'Open both doors a minute to let light in. Wide shot from the driver door, dash and screen powered on, odometer readable, front seats, rear seats, cargo area. Buyers live inside the car — do not shortchange this set.' },
          { title: 'Close with details and honest flaws', body: 'Wheel and tread close-up, key fobs, engine bay, and every notable ding or scratch. Flaws photographed on your terms build trust and end the phone haggling before it starts.' },
          { title: 'Get the photos onto the listing the same day', body: 'A photographed car that is not posted is still invisible inventory. Stores that [sell cars on Facebook Marketplace](/guide/how-to-sell-cars-on-facebook-marketplace/) at volume push the photo set straight into the listing flow the day the unit is front-line ready.' },
        ],
      },
      {
        type: 'qa',
        q: 'How do you photograph cars for a dealership with just a phone?',
        a: [
          'Any recent phone is more camera than a car listing needs. The failures you see in dealer '
          + 'photos — murky color, blown-out sky, a car lost in a row of other cars — are light and '
          + 'background failures, not sensor failures. A phone shot in the right hour, at mid-door '
          + 'height, filling the frame, beats a DSLR shot at noon in a crowded row.',
          'The phone habits that matter: clean the lens (pocket lint is the most common “soft photo” '
          + 'cause on a lot), shoot landscape for exteriors, tap the car on screen so the exposure '
          + 'sets for the paint rather than the sky, and take one extra frame of every angle so a '
          + 'blink-and-blur never forces a reshoot.',
        ],
      },
      {
        type: 'bullets',
        h2: 'The vehicle photography checklist',
        intro: 'Print this and put it on the wall where the porter clocks in. Roughly twenty frames per unit.',
        items: [
          'Exterior: three-quarter front and three-quarter rear from both sides, full profile of both sides, straight-on front and rear — eight frames that prove the body is straight.',
          'Interior: wide from the driver door, dash powered on, odometer, infotainment screen, front seats, rear seats, cargo area with the floor visible.',
          'Details: wheel and tire tread, key fobs on the seat, engine bay, sunroof or third row if equipped.',
          'Honesty frames: every scratch, curb-rashed wheel, or worn bolster — shot close and in focus.',
          'One rule for all of them: the car fills the frame, and nothing else on the lot is in it.',
        ],
      },
      {
        type: 'figure',
        before: '/studio/ram-1500-before.webp',
        after: '/studio/ram-1500-after.webp',
        beforeAlt: 'Raw dealership lot photo of a 2021 Ram 1500 before AutoLander',
        afterAlt: 'The same 2021 Ram 1500 re-staged in a clean scene by AutoLander’s AI Photo Studio',
        caption: 'The process gets you the left image — a real 2021 Ram 1500 lot photo. AutoLander’s AI Photo Studio re-stages it into the right one: same truck, same angle, only the scene changed.',
      },
      {
        type: 'qa',
        q: 'Where does AI background replacement fit in the dealership photo process?',
        a: [
          'It solves the one variable the process cannot control: the background. The staging spot '
          + 'gets rained on, the lot fills up, the fence line gets a dumpster, winter kills the light '
          + 'window by 5pm. An [AI car photo editor](/ai-car-photo-editor/) takes the porter’s real '
          + 'photos and re-stages the car in a clean, consistent scene — every unit on the site and '
          + 'on Marketplace ends up looking like it was shot in the same studio.',
          'The order of operations matters: process first, AI second. Background replacement makes '
          + 'a well-shot car look showroom-grade. It cannot invent angles the porter never took.',
        ],
      },
      {
        type: 'callout',
        title: 'The honest part',
        body: 'Software cannot rescue a blurry frame, a missing angle, or a dirty interior — the porter '
          + 'process still decides most of the quality. And no reputable tool should alter the car '
          + 'itself: paint color, wheels, and damage must stay exactly as shot, or the listing is '
          + 'writing a check the test drive cannot cash. An [AI car photo editor](/ai-car-photo-editor/) '
          + 'earns its keep on the scene, not the car.',
      },
    ],
    faq: [
      ['What time of day is best for dealership car photos?',
        'The first two hours after sunrise and the last two before sunset, with the sun behind the photographer. Paint reads true, chrome and glass stop blowing out, and shadows stay soft. A bright overcast day works all day long. The worst window is midday full sun, which buries the roof in glare and the rockers in shadow.'],
      ['How many photos should a dealership take of each car?',
        'Around twenty frames covers a standard unit: eight exterior angles, six or seven interior shots, and a handful of detail and flaw close-ups. The target is coverage — every question a serious buyer would ask, answered in pictures — rather than hitting a magic number. Trucks and three-rows justify a few extra frames for beds and seating.'],
      ['Should a dealership hire a professional photographer?',
        'Most stores get further with a trained porter and a fixed process than with an occasional pro. A photographer shoots beautifully but visits weekly at best, while inventory turns daily — and the units that sell fastest are often photographed worst because they never waited for the pro. Consistency every day beats artistry once a week.'],
      ['What equipment does a dealership need for vehicle photography?',
        'A recent phone, a microfiber cloth for the lens, and a marked photo spot on the lot. That is genuinely the list. A tripod helps interior shots in dim weather, and a polarizing clip-on filter can tame windshield glare, but neither is required. Spend the budget on wash labor and posting discipline instead of glass.'],
      ['How long should photographing one car take?',
        'About fifteen minutes once the routine is muscle memory: two or three minutes staging at the photo spot, five for the exterior loop, five for the interior and details, and a minute to review for blur. A porter running the same loop on every unit will get faster without the quality dropping — that is the point of a fixed process.'],
    ],
    cta: {
      heading: 'Shoot it once — AutoLander makes it showroom-grade',
      sub: 'AutoLander’s AI Photo Studio turns your porter’s real lot photos into clean, consistent listing images and posts them with every unit to Facebook Marketplace.',
    },
  },

  // ---------------------------------------------------- /guide/how-to-take-pictures-of-a-car-to-sell/
  {
    slug: 'how-to-take-pictures-of-a-car-to-sell',
    silo: 'photos',
    anchor: 'How to take pictures of a car to sell: a dealer-grade shot list',
    crumb: 'Pictures to sell a car',
    primaryKeyword: 'how to take pictures of a car to sell',
    secondaryKeywords: [
      'best way to photograph a car',
      'car photos with a phone',
      'what pictures to take when selling a car',
    ],
    title: 'How to Take Pictures of a Car to Sell (Dealer Shot List)',
    description:
      'How to take pictures of a car to sell: prep, light, background, a dealer-grade shot '
      + 'list, and the phone settings that make any car look worth the asking price.',
    eyebrow: 'Photo guide',
    h1: 'How to take pictures of a car to sell',
    tldr:
      'Clean the car completely, shoot in the first or last hours of daylight with the sun behind '
      + 'you, and find open space with nothing distracting behind the car. Hold the phone at '
      + 'mid-door height, fill the frame, and work a full list: eight exterior angles, the '
      + 'interior with the dash on, the odometer, tires, and every flaw. Around twenty honest, '
      + 'well-lit photos sell a car better than any description.',
    sections: [
      {
        type: 'qa',
        q: 'How do you take pictures of a car to sell?',
        a: [
          'Three inputs decide almost everything: a genuinely clean car, low soft light, and an '
          + 'uncluttered background. Get those right and a phone produces photos that stand next to '
          + 'dealership listings. Get them wrong and no camera or filter saves the shoot.',
          'The standard worth copying is the dealer standard, because that is who your listing sits '
          + 'next to in the search results. A private seller’s photos compete with stores that shoot '
          + 'the same angles on every unit — so shoot like a store: full coverage, consistent height, '
          + 'nothing hidden.',
        ],
      },
      {
        type: 'steps',
        h2: 'Seven steps to listing photos that sell the car',
        steps: [
          { title: 'Clean it like the buyer is coming today', body: 'Wash and dry the outside, dress the tires, vacuum the carpets, empty the trunk and console. Buyers read a clean car as a cared-for car, and every photo amplifies whichever story the surfaces tell.' },
          { title: 'Find open space with a calm background', body: 'An empty end of a parking lot, a plain wall, an open field entrance. Avoid the driveway with the garage clutter, the hedge, the neighbor’s trash cans — the background is part of the picture whether you notice it or not.' },
          { title: 'Time the light', body: 'Shoot in the first two hours after sunrise or the last two before sunset, sun at your back. Overcast is even easier — soft light with no harsh reflections. Never shoot into the sun, and skip midday if you can.' },
          { title: 'Set the phone up once', body: 'Wipe the lens, turn on the grid, leave HDR on, shoot landscape for exteriors, and never pinch-zoom — step closer instead. Tap the car on screen so the phone exposes for the paint, not the sky.' },
          { title: 'Walk the exterior loop', body: 'From mid-door height: three-quarter front, full profile, three-quarter rear, straight-on rear, straight-on front — then the angled shots again from the other side. Fill the frame; the car is the subject, not the scenery.' },
          { title: 'Shoot the interior honestly', body: 'Doors open for light, ignition on so the dash and screen glow, a clear odometer frame, front seats, rear seats, cargo area. Interiors are where private-sale photos usually collapse — five extra frames here separate you from every rushed listing.' },
          { title: 'Close with details and flaws', body: 'Tire tread, wheels, keys, engine bay, and close-ups of every scratch or ding. Photographing flaws yourself sets the story on your terms — the buyer who arrives already knowing about the door ding does not use it to grind the price.' },
        ],
      },
      {
        type: 'bullets',
        h2: 'What pictures to take when selling a car',
        intro: 'The complete set, in the order buyers expect to see it:',
        items: [
          'Hero shot: three-quarter front angle in good light — this is the photo that earns the click.',
          'Exterior coverage: both sides, both angled corners, straight-on front and rear.',
          'Interior: wide cabin shot, dash powered on, odometer, screen, front and rear seats, cargo space.',
          'Mechanical trust: engine bay, tire tread close-up, both key fobs.',
          'Honesty set: every flaw a buyer would find in person, shot close and sharp.',
        ],
      },
      {
        type: 'qa',
        q: 'Are car photos with a phone good enough — or do you need a real camera?',
        a: [
          'A phone is enough, and it has been for years. The best way to photograph a car has almost '
          + 'nothing to do with the device: it is light, background, height, and coverage. Dealerships '
          + 'that [sell cars on Facebook Marketplace](/guide/how-to-sell-cars-on-facebook-marketplace/) '
          + 'move tens of thousands of dollars of metal with phone photos every day.',
          'What a phone cannot do is override physics. Dusk shots come out grainy, noon shots come '
          + 'out harsh, and a cluttered lot stays cluttered. If the conditions are wrong, the fix is '
          + 'never a better camera — it is a better hour, a better spot, or software.',
        ],
      },
      {
        type: 'figure',
        before: '/studio/ford-maverick-before.webp',
        after: '/studio/ford-maverick-after.webp',
        beforeAlt: 'Raw lot photo of a 2026 Ford Maverick before AutoLander',
        afterAlt: 'The same 2026 Ford Maverick on a clean showroom background after AutoLander’s AI Photo Studio',
        caption: 'Same 2026 Ford Maverick, same phone photo — AutoLander’s AI Photo Studio replaced only the background. When the location will not cooperate, this is the fix.',
      },
      {
        type: 'qa',
        q: 'What if the light and background won’t cooperate?',
        a: [
          'That is the honest limit of technique. If you are selling one car, wait a day for better '
          + 'weather — it costs nothing. A dealership photographing every unit that lands, in whatever '
          + 'weather the week brings, cannot wait, which is why stores run background replacement '
          + 'through an [AI car photo editor](/ai-car-photo-editor/): the real photo of the real car, '
          + 're-staged in a clean scene, with the paint, wheels, and condition untouched.',
          'The distinction that keeps it honest: changing the scene behind the car is merchandising; '
          + 'changing the car is misrepresentation. The first sells the appointment, the second blows '
          + 'it up on arrival.',
        ],
      },
      {
        type: 'callout',
        title: 'The honest part',
        body: 'Photos sell the appointment, not the car. If the price is wrong, twenty perfect frames '
          + 'produce twenty minutes of silence. Shoot honestly, price honestly, and answer fast — '
          + 'the photo’s job is only to make sure your car is the one that gets the message.',
      },
    ],
    faq: [
      ['What is the best way to photograph a car?',
        'Shoot a clean car in low, soft light — early morning or late afternoon with the sun behind you — against an open, uncluttered background, holding the camera at mid-door height. Cover eight exterior angles, the full interior with the dash powered on, and close with tires and flaws. Those conditions matter far more than the camera.'],
      ['How many pictures should I take when selling my car?',
        'Take thirty to forty frames and publish the best twenty or so. Serious buyers want full coverage: every exterior angle, the interior from several positions, the odometer, tires, and any damage. Listings with a handful of photos read as either lazy or evasive, and both interpretations cost you responses and negotiating position.'],
      ['Should I photograph the flaws on my car?',
        'Yes — close, sharp, and in the main photo set, not buried. A buyer who discovers a scratch in person that the photos hid stops trusting everything else in the listing and grinds the price. A buyer who saw the scratch up front already accepted it when they messaged you. Flaw photos filter out grinders and speed up the sale.'],
      ['What time of day should I photograph my car?',
        'The two hours after sunrise or before sunset, with the sun at your back — paint color reads true and reflections stay manageable. A bright overcast sky is just as good at any hour. Avoid midday sun, which creates harsh hot spots on the roof and hood, and avoid dusk, when phone sensors turn everything grainy.'],
      ['How do dealerships take pictures of so many cars?',
        'Volume stores run a fixed routine — one photo spot, one shot list, one porter — and let software handle the rest. Tools like AutoLander re-stage the backgrounds for consistency and then [post the full photo set to Facebook Marketplace](/facebook-marketplace-auto-poster/) with each unit, so a forty-car lot stays fully photographed and fully listed without a photographer on payroll.'],
    ],
    cta: {
      heading: 'Dealer-grade photos without the dealer headcount',
      sub: 'AutoLander re-stages your real car photos in clean scenes and posts every unit — photos, price, and details — to Facebook Marketplace automatically.',
    },
  },

  // ---------------------------------------------------- /guide/how-many-photos-should-a-car-listing-have/
  {
    slug: 'how-many-photos-should-a-car-listing-have',
    silo: 'photos',
    anchor: 'How many photos a car listing should have — coverage beats count',
    crumb: 'How many photos',
    primaryKeyword: 'how many photos should a car listing have',
    secondaryKeywords: [
      'minimum photos for a car listing',
      'photo order car listing',
      'best first photo for a car listing',
    ],
    title: 'How Many Photos Should a Car Listing Have? Coverage Guide',
    description:
      'How many photos should a car listing have? Coverage beats count — the shots that '
      + 'answer buyer objections, the first photo that wins the click, and order.',
    eyebrow: 'Photo guide',
    h1: 'How many photos should a car listing have?',
    tldr:
      'Enough to answer every question a serious buyer would ask in person — in practice, fifteen '
      + 'to twenty-five photos. Coverage beats count: eight exterior angles, a full interior set, '
      + 'odometer, tires, and honest flaw close-ups. Below roughly eight photos, buyers assume the '
      + 'listing is hiding something. And the first photo matters more than the rest combined, '
      + 'because it is the only one shown in the search results.',
    sections: [
      {
        type: 'qa',
        q: 'How many photos should a car listing have?',
        a: [
          'The right question is not “how many” but “is anything missing.” A car listing needs full '
          + 'coverage: every exterior angle, the complete interior, the odometer, the tires, and the '
          + 'flaws. Run that checklist honestly and you land between fifteen and twenty-five photos '
          + 'on most vehicles — more for trucks, three-rows, and RVs with more to show.',
          'Count is a side effect of coverage. Padding a listing to thirty frames with near-duplicate '
          + 'angles helps nobody, and a tight twelve that answers everything beats a bloated thirty '
          + 'that repeats itself. The buyer is not counting — they are checking whether their next '
          + 'question has a picture.',
        ],
      },
      {
        type: 'qa',
        q: 'Is there a minimum number of photos for a car listing?',
        a: 'As a working floor, treat eight as the minimum before a listing starts costing you trust: '
          + 'four exterior corners, one interior wide shot, the dash with the odometer, and two more '
          + 'covering seats and cargo. Below that, shoppers do the math silently — if the seller '
          + 'could not take ten pictures of a five-figure vehicle, either the effort or the vehicle '
          + 'has a problem. On Marketplace, where competing listings sit one thumb-flick away, a '
          + 'three-photo listing is effectively invisible.',
      },
      {
        type: 'table',
        h2: 'The coverage checklist: a shot for every buyer objection',
        intro: 'Every photo should retire a question. This is the map from the questions buyers actually ask to the frame that answers each one.',
        head: ['Buyer objection', 'The shot that answers it'],
        rows: [
          ['“Is the body straight?”', 'Three-quarter front and rear from both sides, in even light'],
          ['“What is the far side hiding?”', 'Full profile of both sides — never just the pretty side'],
          ['“How hard was it driven inside?”', 'Driver’s seat bolster, steering wheel, and pedals up close'],
          ['“Do the electronics work?”', 'Dash and infotainment powered on, warning-light area visible'],
          ['“How many miles, really?”', 'A clear, readable odometer frame'],
          ['“Will I need tires soon?”', 'Tread close-up on at least one tire per axle'],
          ['“What is wrong with it?”', 'Close, sharp frames of every scratch, ding, and worn spot'],
          ['“Can it fit my family / gear?”', 'Rear seats and open cargo area with the floor visible'],
        ],
      },
      {
        type: 'qa',
        q: 'What is the best first photo for a car listing?',
        a: [
          'A three-quarter front shot in good light on a clean background — no promo frame, no '
          + 'banner text, no row of other inventory behind it. In the search grid, your first photo '
          + 'is a small thumbnail competing against dozens of others, and it decides whether anyone '
          + 'ever sees photos two through twenty.',
          'This is where merchandising earns its keep: the same car with a cluttered or branded '
          + 'first frame gets scrolled past, while a clean re-staged hero from an '
          + '[AI car photo editor](/ai-car-photo-editor/) reads as a professional listing at '
          + 'thumbnail size — which is the only size that matters until the click.',
        ],
      },
      {
        type: 'qa',
        q: 'What order should car listing photos go in?',
        a: 'Hero first, then the exterior loop, then interior, then details, flaws last — but present. '
          + 'The logic is a test drive in picture form: the buyer sees the car the way they would walk '
          + 'up to it. Never lead with an interior or a wheel; never bury the hero mid-set where the '
          + 'search grid cannot use it; and never end on your best shot, because the buyer who reached '
          + 'the flaws is the serious one — meet them there with honesty, not salesmanship.',
      },
      {
        type: 'figure',
        before: '/studio/infiniti-qx60-before.webp',
        after: '/studio/infiniti-qx60-after.webp',
        beforeAlt: 'Dealer feed photo of a 2023 Infiniti QX60 with a branded promo frame, before AutoLander',
        afterAlt: 'The same 2023 Infiniti QX60 re-staged in a clean showroom scene by AutoLander’s AI Photo Studio',
        caption: 'Slot one decides the click: a real 2023 Infiniti QX60 feed photo boxed in a promo frame (left) versus the same car re-staged by AutoLander’s AI Photo Studio (right). Only one of these survives a thumbnail.',
      },
      {
        type: 'prose',
        paras: [
          'The scale problem is the honest reason most dealer listings run thin. Twenty photos per '
          + 'unit times a forty-car lot is eight hundred uploads, repeated every time inventory '
          + 'turns — so hand-posted listings quietly shrink to five or six photos out of fatigue, '
          + 'not strategy. Software removes the fatigue: a tool that can '
          + '[bulk post cars to Facebook Marketplace](/bulk-post-cars-to-facebook-marketplace/) '
          + 'carries the full photo set onto every listing, every time, and an '
          + '[auto poster](/facebook-marketplace-auto-poster/) keeps doing it as units come and go.',
        ],
      },
      {
        type: 'callout',
        title: 'The honest part',
        body: 'Count cannot rescue quality. Twenty dark, cluttered frames lose to twelve clean ones '
          + 'every time, and one great hero with no supporting coverage reads as a listing with '
          + 'something to hide. You need both: a first photo that wins the thumbnail and a full set '
          + 'that survives the buyer’s cross-examination. Neither substitutes for the other.',
      },
    ],
    faq: [
      ['Do more photos help a car sell faster?',
        'More coverage helps; more repetition does not. Buyers shortlist listings where every question they have is answered visually — body condition, interior wear, mileage, tires. Once coverage is complete, additional near-duplicate angles add nothing. The gains come from filling gaps: the second side of the car, the odometer, the flaw close-ups most sellers skip.'],
      ['Should I include photos of flaws and damage?',
        'Yes, near the end of the set — visible, close, and sharp. Flaw photos filter your inquiries toward buyers who have already accepted the condition, which makes showings faster and price grinding rarer. Hiding a flaw that the buyer will find in ninety seconds on the lot converts a small objection into a trust collapse.'],
      ['Are stock photos okay for a car listing?',
        'No. A stock image of “a” silver SUV is not evidence about your silver SUV, and shoppers know it — listings without real photos of the actual unit get skipped or flooded with “is this real” messages. Re-staging a real photo on a clean background is different: the vehicle in the frame is still the vehicle for sale.'],
      ['Does photo order matter on Facebook Marketplace?',
        'Enormously, because the first photo is the listing as far as search results are concerned — it is the thumbnail buyers scroll past or tap. Lead with a clean three-quarter front hero. After the tap, order matters less, but a walk-up sequence — exterior, interior, details, flaws — keeps buyers moving through the set instead of bouncing.'],
      ['Should every car on the lot get the same photo set?',
        'Yes — the same shot list, the same order, the same style. Consistency across listings is what makes a store’s inventory read as professionally merchandised rather than assembled from leftovers, and it makes gaps obvious internally: when every unit has twenty frames, the one with nine gets fixed before a buyer ever notices.'],
    ],
    cta: {
      heading: 'Full photo sets on every listing, automatically',
      sub: 'AutoLander posts every unit to Facebook Marketplace with its complete, showroom-grade photo set — and keeps price, status, and photos in step with your inventory.',
    },
  },

  // ---------------------------------------------------- /guide/car-photo-backdrop-vs-ai-background/
  {
    slug: 'car-photo-backdrop-vs-ai-background',
    silo: 'photos',
    anchor: 'Car photography backdrop vs AI background: the real tradeoffs',
    crumb: 'Backdrop vs AI',
    primaryKeyword: 'car photography backdrop',
    secondaryKeywords: [
      'car photo booth for dealerships',
      'dealership photo booth cost',
      'ai background replacement for car photos',
    ],
    title: 'Car Photography Backdrop vs AI Background: Real Tradeoffs',
    description:
      'Car photography backdrop, photo booth, staging spot, or AI background replacement? The '
      + 'real costs and tradeoffs of each way to get clean car listing photos.',
    eyebrow: 'Dealer photo guide',
    h1: 'Car photography backdrop vs AI background replacement',
    tldr:
      'There are three ways to get clean, consistent backgrounds behind your inventory: a '
      + 'physical backdrop or photo booth (total control, but a dedicated bay and a serious '
      + 'five-figure build), a staging spot on the lot (free, but hostage to weather and light), '
      + 'and AI background replacement (per-photo software that re-stages the real shot). Most '
      + 'independent dealers get booth-grade consistency cheapest from the staging spot plus AI.',
    sections: [
      {
        type: 'qa',
        q: 'Do you need a car photography backdrop?',
        a: [
          'You need what a backdrop produces: a clean, even, repeatable background that makes the '
          + 'car the only subject in the frame. Whether that comes from a physical wall, an empty '
          + 'corner of the lot, or software is a cost question, not a quality question — all three '
          + 'can produce listing photos that look professional at thumbnail size.',
          'The mistake is skipping the question entirely and shooting units wherever they happen to '
          + 'be parked. A row of other inventory, a dumpster, a service bay door — every background '
          + 'object competes with the car for the buyer’s half-second of attention.',
        ],
      },
      {
        type: 'qa',
        q: 'What does a dealership photo booth cost?',
        a: [
          'Think of it as a construction project, not a purchase. A proper booth is a dedicated '
          + 'indoor bay large enough to walk a full-size truck with room to shoot — plus seamless '
          + 'wall treatment, professional lighting, often a turntable, and the electrical and '
          + 'install work behind all of it. By the time it produces its first photo it is a serious '
          + 'five-figure build, and the bay it occupies stops earning as service or storage space.',
          'The ongoing cost is process: every unit has to physically move through the booth, which '
          + 'means scheduling, a driver, and a bottleneck on busy intake days. Booths reward stores '
          + 'with the volume and staffing to keep them fed.',
        ],
      },
      {
        type: 'qa',
        q: 'What does a car photo booth for dealerships actually buy you?',
        a: 'Total control. Weather stops existing, light never changes, every unit is shot in an '
          + 'identical environment, and the results are as consistent as photography gets. For a '
          + 'franchise store shooting hundreds of units a month with a dedicated photo person, that '
          + 'control can be worth the build. The buy-in is the catch: the capital, the floor space, '
          + 'and the discipline of routing every single vehicle through one room — miss units and '
          + 'the consistency advantage evaporates, because now your inventory is half booth shots, '
          + 'half parking-lot shots.',
      },
      {
        type: 'prose',
        paras: [
          'The middle path is the staging spot: pick the cleanest corner of your lot — a plain '
          + 'wall, a fence line, open pavement with sky behind it — and photograph every unit '
          + 'there. It costs nothing and gets you most of the consistency. Its weakness is '
          + 'everything you cannot schedule: rain, snow, harsh noon sun, the seasonal 5pm sunset, '
          + 'and the day the “empty” corner has a delivery truck parked in it.',
        ],
      },
      {
        type: 'qa',
        q: 'How does AI background replacement for car photos work?',
        a: [
          'You shoot the car wherever it sits — staging spot, back row, in the rain — and an '
          + '[AI car photo editor](/ai-car-photo-editor/) isolates the vehicle and re-stages it in '
          + 'a clean, consistent scene, rebuilding the ground shadow and cleaning up what the old '
          + 'background left reflected in the paint and glass. The vehicle itself is untouched: '
          + 'same paint, same wheels, same condition, same angle.',
          'In AutoLander’s case this runs on the photos already in your inventory feed, so the '
          + 're-staged images flow straight onto your '
          + '[Facebook Marketplace listings](/facebook-marketplace-auto-poster/) without anyone '
          + 'editing photos by hand.',
        ],
      },
      {
        type: 'table',
        h2: 'Backdrop vs staging spot vs AI: the honest tradeoffs',
        head: ['Approach', 'Upfront cost', 'Per-car effort', 'Weather-proof', 'Consistency'],
        rows: [
          ['Physical backdrop / photo booth', 'A serious five-figure build plus a dedicated bay', 'Drive every unit through the booth, on a schedule', 'Yes — fully indoor', 'Best possible, if every unit actually goes through it'],
          ['Staging spot on the lot', 'Free', 'Move the car to the spot, wait for decent light', 'No — rain, snow, and noon sun all cost you days', 'Good in good weather, ragged the rest of the year'],
          ['AI background replacement', 'Software subscription, per-photo processing', 'None beyond the normal photo loop', 'Yes — shoot in any conditions, re-stage after', 'Identical scene on every unit, all year'],
        ],
        note: 'Costs stated qualitatively on purpose — booth builds vary wildly with bay size and finish level. The pattern holds regardless: capital vs patience vs software.',
      },
      {
        type: 'figure',
        before: '/studio/jeep-wagoneer-before.webp',
        after: '/studio/jeep-wagoneer-after.webp',
        beforeAlt: 'Jeep Wagoneer dealer feed photo boxed in a cluttered promo frame, before AutoLander',
        afterAlt: 'The same Jeep Wagoneer re-staged in a clean golden-hour scene by AutoLander’s AI Photo Studio',
        caption: 'The software path in practice: a real Jeep Wagoneer feed photo (left) re-staged by AutoLander’s AI Photo Studio (right) — booth-grade background with no booth, no bay, and no reshoot.',
      },
      {
        type: 'callout',
        title: 'The honest part',
        body: 'AI replacement cannot fix a blurry frame, a missing angle, or a filthy car — it '
          + 'inherits whatever the photographer gave it. And a booth genuinely is the gold standard '
          + 'if you have the volume, the spare bay, and the staffing to run one without gaps. The '
          + 'argument for software is not that it beats a booth photo — it is that it gets '
          + 'indistinguishably close for a monthly subscription instead of a construction project.',
      },
    ],
    faq: [
      ['Is a photo booth worth it for a used car dealership?',
        'Usually only at franchise-store volume with dedicated photo staff. The booth itself is a serious five-figure build, it consumes a bay, and it only pays off if every unit routes through it without exception. Most independent lots get the same visual consistency from a fixed staging spot plus AI background replacement, at software prices.'],
      ['What makes a good car photography backdrop?',
        'Size and evenness. A car needs a background several times larger than the vehicle with no seams, signage, or texture changes in frame — which is why product-photography backdrops do not scale to automotive and real booths are built rooms, not hung sheets. Outdoors, the closest equivalents are a long plain wall, a tree line, or open sky.'],
      ['Can you use a portable backdrop for car photography?',
        'In practice, no. At car scale a portable backdrop would need to stand roughly ten feet tall and thirty wide, stay wrinkle-free, and survive wind — and even then it only covers one angle. That is why the workable options collapse to three: a built booth, a naturally clean staging spot, or replacing the background in software.'],
      ['Does AI background replacement look fake?',
        'Bad tools do — floating cars with no ground shadow, halos around mirrors, backgrounds still visible through the windows. Vehicle-specific replacement handles the hard parts: rebuilt shadow under the car, glass that shows the new scene, cleaned paint reflections, untouched wheels and badges. Judge any tool by those four details on your own inventory.'],
      ['Which option is cheapest for a small dealership?',
        'The staging spot is free and should exist regardless — every unit photographed in the same clean corner of the lot. Add [AI background replacement](/ai-car-photo-editor/) when weather, seasons, or lot congestion keep breaking the spot’s consistency. Together they cost a software subscription and deliver the consistency a booth promises, without the build.'],
    ],
    cta: {
      heading: 'Booth-grade backgrounds, no booth required',
      sub: 'AutoLander’s AI Photo Studio re-stages your existing inventory photos in clean, consistent scenes and posts them to Facebook Marketplace with every unit.',
    },
  },

  // ---------------------------------------------------- /guide/best-angles-for-car-listing-photos/
  {
    slug: 'best-angles-for-car-listing-photos',
    silo: 'photos',
    anchor: 'The best car photography angles for listing photos, shot by shot',
    crumb: 'Best photo angles',
    primaryKeyword: 'car photography angles',
    secondaryKeywords: [
      'best angles to photograph a car',
      'three quarter front angle',
      'interior shots for car listings',
    ],
    title: 'Car Photography Angles: The Shot List That Sells the Car',
    description:
      'Car photography angles explained — why the three-quarter front is the hero, the full '
      + 'angle-by-angle shot list, what each frame answers, and mistakes to avoid.',
    eyebrow: 'Photo guide',
    h1: 'The best car photography angles, shot by shot',
    tldr:
      'Lead with the three-quarter front — it shows the car’s face and its depth in one frame. '
      + 'Then cover both full profiles, both three-quarter rears, straight-on front and rear, a '
      + 'complete interior set with the dash powered on, and detail close-ups. Shoot every '
      + 'exterior angle from mid-door height, fill the frame, and never skip the far side. Each '
      + 'angle exists to answer a specific buyer question.',
    sections: [
      {
        type: 'qa',
        q: 'What are the best car photography angles?',
        a: [
          'The set that sells a car is not a secret: three-quarter front, full profile, '
          + 'three-quarter rear, straight-on front and rear — from both sides where the angle '
          + 'differs — plus the interior and details. What separates dealer-grade photos from '
          + 'driveway photos is not exotic angles; it is shooting the standard ones at the right '
          + 'height, in the right order, without skipping the inconvenient ones.',
          'Every angle is a claim of evidence. The buyer cannot walk around the car, so the angles '
          + 'do the walking — and any angle you leave out reads as a question you preferred not to '
          + 'answer.',
        ],
      },
      {
        type: 'qa',
        q: 'Why is the three-quarter front angle the hero shot?',
        a: 'Because it is the only single frame that shows the car’s face and its body at once — '
          + 'grille, headlights, and stance, plus the length of the profile receding behind it. '
          + 'Straight-on shots flatten the car into a cardboard cutout; pure profiles hide the '
          + 'front end buyers identify with. Shoot it from mid-door height, roughly forty-five '
          + 'degrees off the nose, close enough that the car fills the frame. This is the photo '
          + 'that represents the listing in search results, so it gets the best light and the '
          + 'cleanest background of the whole set.',
      },
      {
        type: 'steps',
        h2: 'The angle-by-angle shot list',
        intro: 'Walk the loop in this order. Each frame answers a specific question the buyer would otherwise have to ask.',
        steps: [
          { title: 'Three-quarter front, driver side', body: 'The hero. Answers “what does this car look like?” in one frame — face, stance, and depth together. Best light and cleanest background of the day go here — or let an [AI car photo editor](/ai-car-photo-editor/) supply the clean background afterward.' },
          { title: 'Full profile, driver side', body: 'Answers “is the body straight and the trim complete?” Shot square-on from mid-door height so panel lines stay honest and wheels stay round.' },
          { title: 'Three-quarter rear, driver side', body: 'Answers “what condition is the back corner in?” — the corner that takes parking-lot hits. Also shows the tail design buyers care about more than sellers think.' },
          { title: 'Straight-on rear, then straight-on front', body: 'Answers “is anything cracked, dented, or misaligned dead-center?” Bumpers, tailgate, grille, and lights, shot level so nothing distorts.' },
          { title: 'Repeat the angled shots from the passenger side', body: 'Answers the buyer’s most suspicious question: “what is the side they didn’t show me hiding?” The far side is the most-skipped set in amateur listings — and the most requested follow-up.' },
          { title: 'Interior wide, from the driver door', body: 'Answers “what will living in this car feel like?” Doors open for light, seat pulled back, one frame that takes in wheel, dash, and console together.' },
          { title: 'Dash powered on, odometer readable', body: 'Answers “does everything work and how far has it gone?” Ignition on so the cluster and screen glow; a separate tight frame makes the mileage legible.' },
          { title: 'Details: wheels, tread, seats, cargo, flaws', body: 'Answers the deal-closing questions — tire life, seat wear, trunk space, and the honest close-ups of every ding that would otherwise ambush the showing.' },
        ],
      },
      {
        type: 'qa',
        q: 'What interior shots do car listings need?',
        a: [
          'Six frames minimum: the wide shot from the driver door, the dash and cluster powered '
          + 'on, the odometer, the infotainment screen, the rear seats, and the cargo area. Add '
          + 'the driver’s seat bolster up close on higher-mileage units — it is the first place '
          + 'wear shows and the first thing an in-person buyer checks.',
          'Interior shots fail in the dark. Open both doors for a minute before shooting, and let '
          + 'the phone expose for the cabin rather than the bright windows — a dim interior photo '
          + 'reads as a hiding place even when the cabin is mint.',
        ],
      },
      {
        type: 'twocol',
        left: {
          h2: 'Do',
          items: [
            'Shoot exteriors from mid-door height — roughly bumper-to-mirror level.',
            'Fill the frame with the car; step closer instead of zooming.',
            'Cover both sides, even when they look identical.',
            'Keep the horizon level so the car does not appear to roll downhill.',
            'Power the dash on for every interior frame.',
          ],
        },
        right: {
          h2: 'Don’t',
          items: [
            'Shoot down at the car from standing eye level — it makes any vehicle look squat and small.',
            'Use ultra-wide mode up close; it bloats bumpers and warps panels.',
            'Shoot into the sun, which silhouettes the car and buries the paint.',
            'Crop wheels or roofline out of exterior frames.',
            'Skip the far side, the rear three-quarter, or the flaws.',
          ],
        },
      },
      {
        type: 'figure',
        before: '/studio/jeep-wrangler-before.webp',
        after: '/studio/jeep-wrangler-after.webp',
        beforeAlt: 'Raw dealership lot photo of a 2026 Jeep Wrangler before AutoLander',
        afterAlt: 'The same 2026 Jeep Wrangler at the same angle, re-staged in a clean scene by AutoLander’s AI Photo Studio',
        caption: 'Same 2026 Jeep Wrangler, same three-quarter angle — the angle work was done on the lot, and AutoLander’s AI Photo Studio finished the job by replacing the cluttered background.',
      },
      {
        type: 'callout',
        title: 'The honest part',
        body: 'Angles present the car; they cannot improve it. The far-side profile you are tempted to '
          + 'skip is precisely the frame serious buyers ask for, and clever angles that hide a dent '
          + 'just relocate the argument to your showroom. Get the angles complete and honest, then '
          + 'let an [AI car photo editor](/ai-car-photo-editor/) fix the one thing the lot ruins — '
          + 'the background — while the car stays exactly as shot.',
      },
    ],
    faq: [
      ['What angles should you photograph a car from?',
        'Eight exterior frames: three-quarter front, full profile, and three-quarter rear from both sides, plus straight-on front and rear. Then the interior set — wide cabin, powered dash, odometer, screen, rear seats, cargo — and detail close-ups of wheels, tread, and flaws. That sequence answers every question a walk-around would, in the order a buyer would ask.'],
      ['What height should the camera be for car photos?',
        'Mid-door height — roughly the level of the mirrors, around chest-to-waist on most people. It matches how a buyer sees a car standing a few feet away. Standing tall and shooting down makes vehicles look small and squat; crouching to ground level adds drama but distorts proportions and hides the greenhouse. Consistent height across every unit matters as much as the height itself.'],
      ['Should you photograph both sides of the car?',
        'Always. Buyers assume the unphotographed side is the damaged side — it is the single most common suspicion in used-car listings, and it generates the follow-up message you will answer anyway. Shooting both sides costs ninety seconds and removes the doubt before it forms. If the far side does have damage, photograph it close and honestly; hiding it only defers the discovery.'],
      ['What is the most flattering angle for a truck or SUV?',
        'A slightly lower three-quarter front — nearer bumper height than mirror height — which emphasizes stance and tire size without warping the body. Trucks also earn two extra frames sedans do not need: the bed from the open tailgate and a straight-on rear showing hitch and bumper condition. Keep the lens standard, not ultra-wide; wide mode up close bloats fenders.'],
      ['How do dealerships keep every listing’s angles so consistent?',
        'A fixed loop and no improvisation: every porter shoots the same angles in the same order at the same height on every unit, usually from a printed checklist. Consistency across the lot is what reads as professional when a buyer browses [a store’s Marketplace inventory](/guide/how-to-sell-cars-on-facebook-marketplace/) — fifty units that all look shot by the same hand.'],
    ],
    cta: {
      heading: 'Shoot the angles — AutoLander handles the rest',
      sub: 'Your team shoots the loop once; AutoLander re-stages the backgrounds, writes the description, and posts every angle to Facebook Marketplace with the unit.',
    },
  },

  // ---------------------------------------------------- /guide/car-walkaround-video-for-dealers/
  {
    slug: 'car-walkaround-video-for-dealers',
    silo: 'photos',
    anchor: 'Car walkaround video for dealers: script, technique, AI option',
    crumb: 'Walkaround video',
    primaryKeyword: 'car walkaround video',
    secondaryKeywords: [
      'vehicle walkaround video tips',
      'do videos help sell cars',
      'video for car listings',
    ],
    title: 'Car Walkaround Video: A 60-Second Script for Dealers',
    description:
      'Car walkaround video for dealers: a 60-second script anyone can follow, phone technique '
      + 'that looks steady, where video surfaces on listings, and an AI fallback.',
    eyebrow: 'Video guide',
    h1: 'Car walkaround video: the 60-second dealer script',
    tldr:
      'A car walkaround video is a single continuous sixty-second lap: open on the '
      + 'three-quarter front, walk the exterior slowly, step into the interior with the dash '
      + 'powered on, show the odometer, and close on the feature that sells the unit. Shoot it '
      + 'on a phone with slow feet and a wiped lens. When nobody has time to shoot, AutoLander '
      + 'can generate a walkaround-style AI video from the listing photos instead.',
    sections: [
      {
        type: 'qa',
        q: 'What is a car walkaround video — and is it worth shooting?',
        a: [
          'A walkaround is a continuous, roughly sixty-second video lap of a vehicle — exterior, '
          + 'interior, mileage, one feature — shot as if the buyer were standing on the lot while '
          + 'you showed them the car. It is the closest a listing gets to an in-person look.',
          'It is worth shooting when the unit justifies the minutes: motion proves things still '
          + 'photos cannot — straight panels moving through light, a dash with no warning lights, '
          + 'a screen that boots, doors that close with one push. And because most listings carry '
          + 'no video at all, a decent one separates the unit from every photo-only competitor on '
          + 'the page.',
        ],
      },
      {
        type: 'qa',
        q: 'Do videos help sell cars?',
        a: 'Video helps the same way good photos help, for the same reason: it retires doubt. The '
          + 'buyer deciding whether to drive forty minutes wants evidence the car is real, straight, '
          + 'and as described — and thirty seconds of continuous, unedited motion is hard evidence '
          + 'in a way a curated photo set is not. Where video moves the needle most is mid-funnel: '
          + 'sent by your salesperson in a reply when a serious buyer asks a condition question, it '
          + 'answers in one message what would otherwise take a dozen texts. It does not fix price, '
          + 'photos, or a slow response — it compounds them.',
      },
      {
        type: 'steps',
        h2: 'The 60-second walkaround script',
        intro: 'One continuous take, slow feet, no editing required. Rough time marks keep the lap on pace.',
        steps: [
          { title: '0–5 seconds: open on the hero angle', body: 'Start on the three-quarter front, whole car in frame, and say the year, make, model, and trim out loud. That one sentence makes the video self-contained wherever it gets watched or forwarded.' },
          { title: '5–20 seconds: walk the driver side to the rear', body: 'Move slowly — half your natural walking speed — keeping the whole car in frame. This stretch proves the body: panels, paint, and wheels passing through real light.' },
          { title: '20–30 seconds: rear and cargo', body: 'Pause on the straight-on rear, then open the trunk, hatch, or tailgate one-handed and show the cargo area. Utility questions die here.' },
          { title: '30–45 seconds: interior with the dash alive', body: 'Open the driver door, sit or lean in, and pan the cabin with the ignition on — glowing cluster, screen booted, no warning lights. Hold on the odometer for a full two seconds so it is readable.' },
          { title: '45–55 seconds: the one feature that sells this unit', body: 'Panoramic roof, third row, tow package, heated everything — pick one and show it working. One feature lands; five become noise.' },
          { title: '55–60 seconds: close with where it is', body: 'End back on the front of the car and say the store name and city. Skip the price in the video — the listing carries it, and prices move faster than videos get reshot.' },
        ],
      },
      {
        type: 'bullets',
        h2: 'Vehicle walkaround video tips that fix most amateur footage',
        items: [
          'Slow everything down: walk at half speed and pan slower than feels natural — fast motion is the number-one amateur tell.',
          'Elbows against your ribs turn your body into a stabilizer; a gimbal is nice, not necessary.',
          'Wipe the lens first. One thumbprint softens all sixty seconds.',
          'Shoot the orientation your destination needs — vertical for social and phone viewing, horizontal for the website — rather than one compromise clip.',
          'Skip background music and let the real sounds carry it: doors closing, the engine starting.',
          'One continuous take beats an edited montage; cuts read as places where something was removed.',
          'Wind ruins audio faster than anything — put the breeze at your back or narrate afterward.',
        ],
      },
      {
        type: 'qa',
        q: 'Where does video actually show up on a car listing?',
        a: [
          'Marketplace vehicle listings are photo-led — photos, price, mileage, and description are '
          + 'the fields doing the selling, so the walkaround’s highest-traffic home is usually the '
          + 'website vehicle page and the store’s social channels. The clip also earns its keep in '
          + 'conversation: when a buyer asks “any scratches on the hood?”, your salesperson '
          + 'replying with the walkaround answers ten questions at once — a '
          + '[speed-to-lead](/guide/car-sales-leads/) play that costs nothing extra because the '
          + 'video already exists.',
          'The practical rule: shoot once, use everywhere, and never let the video contradict the '
          + 'listing — a clip showing the old price or the since-repaired ding creates exactly the '
          + 'confusion it was meant to remove.',
        ],
      },
      {
        type: 'qa',
        q: 'What if nobody has time to shoot video?',
        a: 'That is the honest constraint at most stores: the walkaround takes minutes, but minutes '
          + 'times forty units times weekly turnover is a part-time job nobody was hired for. '
          + 'AutoLander’s answer is generated coverage: it can produce a walkaround-style AI video '
          + 'from the listing photos it already has — motion built from the same frames the '
          + '[AI car photo editor](/ai-car-photo-editor/) staged — so every unit carries video-grade '
          + 'presentation even in weeks when nobody touched a camera. Units worth real footage '
          + 'still deserve real footage; the AI version exists so the other thirty-five units are '
          + 'not bare.',
      },
      {
        type: 'figure',
        before: '/studio/toyota-tacoma-before.webp',
        after: '/studio/toyota-tacoma-after.webp',
        beforeAlt: 'Raw dealership lot photo of a 2025 Toyota Tacoma before AutoLander',
        afterAlt: 'The same 2025 Toyota Tacoma re-staged in a clean scene by AutoLander’s AI Photo Studio',
        caption: 'Video starts with the photos: this 2025 Toyota Tacoma, re-staged by AutoLander’s AI Photo Studio, is the raw material its walkaround-style AI video is generated from — clean frames in, clean motion out.',
      },
      {
        type: 'callout',
        title: 'The honest part',
        body: 'An AI walkaround is generated from photos — it will not capture the cold start, the '
          + 'engine note, or the door-thunk that a real phone video proves. For the flagship unit a '
          + 'serious buyer is deciding on, sixty real seconds still beats anything generated. The AI '
          + 'version wins on coverage: it is the difference between video on three units and video '
          + 'on the whole lot.',
      },
    ],
    faq: [
      ['How long should a car walkaround video be?',
        'Around sixty seconds — long enough to lap the exterior, show the powered-on interior and odometer, and land one feature, short enough that buyers watch to the end. Past ninety seconds completion drops fast. If a unit genuinely needs more, shoot a second focused clip to send on request rather than stretching the main lap.'],
      ['Should a walkaround video be vertical or horizontal?',
        'Match the destination. Vertical suits social feeds and the phones most Marketplace browsing happens on; horizontal suits the website vehicle page and desktop viewing. If you will only shoot once, shoot the format where the clip will actually live — a cropped compromise usually looks worse than committing to either orientation.'],
      ['Do I need to talk during a walkaround video?',
        'Narration helps if it sounds like a person, not a commercial — year, make, trim, the one feature, where the car is. If talking on camera is not natural for the person shooting, a steady silent lap with the real sounds of the car is better than forced salesmanship. Say the vehicle identity out loud either way so the clip stands alone when forwarded.'],
      ['What equipment do you need for dealership walkaround videos?',
        'A phone with a wiped lens, a quiet corner of the lot, and slow feet. That covers most of what quality requires. A cheap gimbal smooths the walk, and a clip-on mic helps on windy lots, but neither is required to produce footage buyers trust. The consistent process matters far more than the gear list.'],
      ['Can AI really make a walkaround video from photos?',
        'Yes — AutoLander generates walkaround-style video from a listing’s existing photos, producing motion coverage of the real vehicle without anyone shooting footage. It presents the car; it cannot demonstrate sound or driving behavior, so it complements rather than replaces real video on showcase units. Its job is making sure no unit [posts to Marketplace](/facebook-marketplace-auto-poster/) bare.'],
    ],
    cta: {
      heading: 'Video-grade listings, even in the busy weeks',
      sub: 'AutoLander turns your inventory photos into showroom-grade images and walkaround-style AI video, then posts the whole package to Facebook Marketplace unit by unit.',
    },
  },

  // ---------------------------------------------------- /guide/dark-cluttered-car-photos-cost-sales/
  {
    slug: 'dark-cluttered-car-photos-cost-sales',
    silo: 'photos',
    anchor: 'Bad car listing photos: the five failures that cost the click',
    crumb: 'Bad listing photos',
    primaryKeyword: 'bad car listing photos',
    secondaryKeywords: [
      'why isn’t my car listing getting clicks',
      'dark car photos',
      'cluttered background car photos',
    ],
    title: 'Bad Car Listing Photos: 5 Failures That Cost You Clicks',
    description:
      'Bad car listing photos fail a half-second scroll test. The five failures — dark shots, '
      + 'clutter, promo frames, bad crops, missing angles — and the fix for each.',
    eyebrow: 'Photo guide',
    h1: 'Bad car listing photos: the five failures that cost sales',
    tldr:
      'A buyer gives each listing less than a second in the scroll, and the first photo does all '
      + 'the talking. Bad car listing photos fail in five repeatable ways — too dark, cluttered '
      + 'background, promo frames, the car too small or cropped in the frame, and missing '
      + 'angles. Each failure has a specific fix, and none of them requires a photographer: a '
      + 'light window, a staging spot, and background replacement cover all five.',
    sections: [
      {
        type: 'qa',
        q: 'Why do bad car listing photos cost sales?',
        a: [
          'Because the decision happens before anyone reads a word. In the search grid a listing '
          + 'is a thumbnail and a price, judged in well under a second while the thumb is already '
          + 'moving. A dark or cluttered first photo does not make the car look slightly worse — '
          + 'it removes the car from consideration entirely, silently.',
          'That silence is the expensive part. The unit gets no message, the store reads it as '
          + '“no demand for this car,” and the price gets cut — when the actual failure was that '
          + 'nobody could see the car well enough to want it. Photo problems routinely get '
          + 'misdiagnosed as pricing problems.',
        ],
      },
      {
        type: 'qa',
        q: 'Why isn’t my car listing getting clicks?',
        a: 'Run the scroll test before blaming the price: pull up the search results a buyer would '
          + 'see, find your listing among the competitors, and give it the same half second you '
          + 'give the others. Nine times out of ten the answer is sitting in slot one — a dusk '
          + 'shot, a promo frame, a car parked in a crowded row — next to a competitor’s clean '
          + 'three-quarter front. Stores that consistently '
          + '[sell cars on Facebook Marketplace](/guide/how-to-sell-cars-on-facebook-marketplace/) '
          + 'win that half second first and negotiate price second. If your thumbnail survives the '
          + 'test and clicks still are not coming, then look at price, mileage, and listing age.',
      },
      {
        type: 'table',
        h2: 'The five photo failures — and what buyers read into each',
        intro: 'None of these read as “photo problem” to the buyer. They read as facts about the car and the store.',
        head: ['Failure', 'What the buyer reads', 'The fix'],
        rows: [
          ['Dark or dusk shots', '“They are hiding the condition — or nobody cared enough to shoot it properly”', 'Shoot in the first or last two hours of daylight, or on bright overcast; reshoot rather than brighten'],
          ['Cluttered background', '“Low-effort store; and is that dent on this car or the one behind it?”', 'One fixed staging spot on the lot, or AI background replacement on the existing photo'],
          ['Promo frames and banner graphics', '“This is an ad, not a car” — the unit shrinks to make room for the pitch', 'Strip overlays from listing photos; let the car fill the frame'],
          ['Wrong crop — car tiny or clipped', '“What is outside the frame?” Cut wheels and rooflines read as concealment', 'Fill the frame with the whole car; step closer instead of zooming'],
          ['Missing angles', '“The side they didn’t show is the damaged side”', 'Fixed shot list, every unit: both sides, interior, odometer, flaws'],
        ],
      },
      {
        type: 'figure',
        before: '/studio/hyundai-sonata-before.webp',
        after: '/studio/hyundai-sonata-after.webp',
        beforeAlt: 'Dark, cluttered dealership lot photo of a 2024 Hyundai Sonata before AutoLander',
        afterAlt: 'The same 2024 Hyundai Sonata re-staged on a clean showroom background by AutoLander’s AI Photo Studio',
        caption: 'The whole argument in one frame: the same 2024 Hyundai Sonata, same angle, same price. The left photo is what the lot produced and gets scrolled past; the right is the same shot re-staged by AutoLander’s AI Photo Studio — and it is the one that earns the tap.',
      },
      {
        type: 'qa',
        q: 'Are dark car photos really that costly?',
        a: [
          'Yes, because darkness makes the two things a buyer must verify — color and condition — '
          + 'unverifiable. A dusk shot turns silver, gray, and light blue into the same murky '
          + 'nothing, hides panel condition, and adds sensor grain that reads as “old phone, old '
          + 'listing, old car.” The buyer does not think “bad lighting”; they think “pass.”',
          'Dark photos usually come from process, not carelessness: units photographed at intake '
          + 'in the evening, or in winter when the lot loses light before the porter gets free. '
          + 'That is a scheduling fix — hold the shoot for the morning window — not a talent fix.',
        ],
      },
      {
        type: 'qa',
        q: 'What do cluttered background car photos signal?',
        a: 'That nobody is in charge of presentation. A car shot in a packed row makes the buyer’s '
          + 'eye do the work of separating the subject from the scenery — and worse, it borrows '
          + 'defects: the neighboring car’s ding, the dumpster, the sagging banner all attach '
          + 'themselves to your unit at thumbnail size. The traditional fix is a staging spot in '
          + 'the emptiest corner of the lot. The software fix is re-staging the photo you already '
          + 'took: an [AI car photo editor](/ai-car-photo-editor/) lifts the vehicle out of the '
          + 'clutter and sets it in a clean scene, with the car itself — paint, wheels, condition — '
          + 'exactly as shot.',
      },
      {
        type: 'prose',
        paras: [
          'The stakes are not cosmetic. The median dealer unit posted to Marketplace asks '
          + '$28,295, across 10,823 priced dealer listings in '
          + '[AutoLander’s 2026 Marketplace report](/facebook-marketplace-used-car-report-2026/) — '
          + 'and a buyer weighing a purchase that size cross-shops hard. At those prices, the '
          + 'first photo is fronting a five-figure decision, and it is competing against stores '
          + 'that treat presentation as a system: fixed shot list going forward, and the existing '
          + 'feed re-staged in software so the whole lot passes the scroll test at once.',
        ],
      },
      {
        type: 'callout',
        title: 'The honest part',
        body: 'Great photos of an overpriced car get clicks, not calls — fixing the photos exposes '
          + 'the price rather than excusing it. And no photo fix survives a stale listing: the '
          + 'sold unit still showing, the price that no longer matches the windshield. Photos win '
          + 'the half second; price, accuracy, and response speed have to win everything after it.',
      },
    ],
    faq: [
      ['How do I make my car listing stand out?',
        'Win the thumbnail: a clean three-quarter front shot in good light with nothing behind the car, no promo frame, and the vehicle filling the frame. Then support the click with full coverage — both sides, interior with the dash on, odometer, tires, honest flaws. Most competing listings fail at least one of those, so simply completing the list stands out.'],
      ['Can I fix dark car photos with editing?',
        'Only slightly. Brightening a genuinely underexposed photo amplifies sensor grain and shifts the paint color, which trades one credibility problem for another. Exposure has to be captured, not manufactured — reshoot in the morning or late-afternoon window. Background replacement is different: it re-stages a well-exposed car in a new scene, but it cannot rescue a frame that was too dark to begin with.'],
      ['Do promo frames and banners on car photos help or hurt?',
        'They hurt in search results. A frame shrinks the actual vehicle to make room for a pitch nobody asked for, and at thumbnail size the listing reads as an advertisement rather than a car — the exact thing scrollers have trained themselves to skip. The store name belongs in the listing details and the description, not on top of the merchandise.'],
      ['Why does the first photo matter so much?',
        'Because it is the only photo that exists until someone taps. Search results show one image per listing, so photos two through twenty — however good — are invisible to every buyer who scrolled past slot one. Auditing listings in grid view at phone size, next to real competitors, shows you exactly what that first photo is up against.'],
      ['Do better photos matter if my price is already right?',
        'Yes — price only gets evaluated after the click. A well-priced car behind a dark, cluttered thumbnail never gets its price seen by most of the buyers it deserves, which quietly reads as weak demand and invites an unnecessary price cut. Fix the photo first, then let the correct price do its work on the buyers who now actually open the listing.'],
    ],
    cta: {
      heading: 'Fix the whole lot’s photos in one pass',
      sub: 'AutoLander re-stages the dark, cluttered photos already in your feed into clean, showroom-grade images — and posts them to Facebook Marketplace with every unit.',
    },
  },

  // ---------------------------------------------------- /guide/remove-background-from-car-photo/
  {
    slug: 'remove-background-from-car-photo',
    silo: 'photos',
    anchor: 'Remove the background from a car photo without it looking fake',
    crumb: 'Remove photo background',
    primaryKeyword: 'remove background from car photo',
    secondaryKeywords: [
      'car background replacement',
      'free background remover for car photos',
      'car photo editing for dealers',
    ],
    title: 'Remove Background from Car Photo: What Actually Works',
    description:
      'How to remove the background from a car photo — why generic removers fail on wheels, '
      + 'glass, and shadows, when a free tool is fine, and what dealers use instead.',
    eyebrow: 'Photo guide',
    h1: 'How to remove the background from a car photo (without it looking fake)',
    tldr:
      'Any background remover can cut a car out of a photo. The hard part is what makes the '
      + 'result believable: wheel spokes, glass the old background still shows through, the old '
      + 'scene reflected in the paint, and the ground shadow that keeps the car from floating. '
      + 'Generic tools fail on those four; vehicle-specific background replacement rebuilds '
      + 'them. Free tools are fine for one car, once — a dealer lot every week is a different '
      + 'problem.',
    sections: [
      {
        type: 'qa',
        q: 'How do you remove the background from a car photo?',
        a: [
          'Mechanically, it is easy: upload the photo to a background remover and it returns the '
          + 'car as a cutout on a transparent or plain backdrop. For most objects that is the '
          + 'whole job. For cars it is maybe half of it — a vehicle is a two-ton object made of '
          + 'mirrors, glass, and gaps, and the background you removed is still present inside the '
          + 'car: through the windows, reflected in the doors, implied by the shadow.',
          'So the real question is not “how do I remove the background” but “how do I replace it '
          + 'so the car looks like it was photographed in the new scene.” That is a harder problem '
          + 'and the one worth judging tools on.',
        ],
      },
      {
        type: 'qa',
        q: 'Why do generic background removers struggle with car photos?',
        a: [
          'Four places, every time. Wheels: spokes and the gaps between them are fine detail that '
          + 'generic edge detection smears or fills, leaving mushy rims. Glass: windows are '
          + 'transparent, so the old parking lot stays visible through the cabin even after the '
          + '“removal” — the single most common tell. Reflections: automotive paint is a mirror, '
          + 'and the old scene stays smeared across the doors and bumper of the “clean” cutout.',
          'And shadow: cut the car out and it loses contact with the ground, producing the '
          + 'pasted-on, floating look everyone recognizes instantly. A believable result needs a '
          + 'rebuilt shadow that matches the new scene’s light — which a remover, by definition, '
          + 'does not do.',
        ],
      },
      {
        type: 'qa',
        q: 'Is a free background remover good enough for car photos?',
        a: 'For one car, one time — genuinely yes. Selling your own vehicle, you can run the hero '
          + 'shot through a free tool, clean up the edges by hand, set it on a plain backdrop, and '
          + 'come out ahead of most private listings. The math breaks at dealer scale: minutes of '
          + 'cleanup per photo, times a twenty-photo set, times a forty-unit lot, times weekly '
          + 'inventory turn — hand-editing becomes a hire. And the free tier’s output — a floating '
          + 'car on white — reads as clip art next to competitors whose '
          + '[re-staged listings](/ai-car-photo-editor/) look shot in a studio. Free is the right '
          + 'answer exactly as long as volume is one.',
      },
      {
        type: 'qa',
        q: 'What is car background replacement — and how is it different from removal?',
        a: [
          'Removal ends with a cutout. Replacement ends with a photograph: the vehicle re-staged '
          + 'in a new scene with the ground shadow rebuilt, the paint reflections cleaned so the '
          + 'old lot is not still smeared on the doors, and the glass showing the new environment '
          + 'instead of the old one. Done right, it does not look edited — it looks like the car '
          + 'was driven somewhere better and shot again.',
          'That is what a vehicle-specific [AI car photo editor](/ai-car-photo-editor/) does, and '
          + 'why it is a different product category from a general-purpose remover: it was built '
          + 'around the four automotive failure points instead of tripping over them.',
        ],
      },
      {
        type: 'bullets',
        h2: 'What a finished replacement should look like',
        intro: 'Judge any tool — including ours — against this list on your own inventory:',
        items: [
          'The car sits on a rebuilt shadow that matches the scene’s light — no floating.',
          'Windows show the new scene, not ghosts of the old parking lot.',
          'Wheel spokes stay crisp, with real gaps between them.',
          'No halo or fringe at mirrors, antennas, roof racks, or spoilers.',
          'Paint color, badges, and trim are untouched — the car is exactly the car.',
          'Light direction on the vehicle agrees with the light in the background.',
        ],
      },
      {
        type: 'table',
        h2: 'Generic remover vs vehicle-specific replacement',
        head: ['', 'Generic free remover', 'Vehicle-specific replacement'],
        rows: [
          ['Wheels and spokes', 'Often smeared or filled in', 'Preserved with clean gaps'],
          ['Glass', 'Old background still visible through windows', 'New scene visible through the glass'],
          ['Paint reflections', 'Old scene stays mirrored in the panels', 'Cleaned to match the new scene'],
          ['Ground shadow', 'Removed — the car floats', 'Rebuilt to match the new light'],
          ['Output', 'Cutout on transparent or flat color', 'A finished, listing-ready photograph'],
          ['Best for', 'One car, one time', 'A lot that turns inventory every week'],
        ],
      },
      {
        type: 'figure',
        before: '/studio/chevrolet-malibu-before.webp',
        after: '/studio/chevrolet-malibu-after.webp',
        beforeAlt: 'Raw dealership lot photo of a 2022 Chevrolet Malibu before AutoLander',
        afterAlt: 'The same 2022 Chevrolet Malibu with the background replaced by AutoLander’s AI Photo Studio — shadow, glass, and reflections rebuilt',
        caption: 'Replacement, not removal: the same 2022 Chevrolet Malibu, re-staged by AutoLander’s AI Photo Studio. Check the tells — grounded shadow, clean glass, intact wheels, untouched paint.',
      },
      {
        type: 'callout',
        title: 'The honest part',
        body: 'The line that must never be crossed: change the scene, never the car. Repainting a '
          + 'color, straightening a dent, or erasing curb rash in software is misrepresentation, '
          + 'and it detonates at the showing. And even the best replacement inherits its input — '
          + 'a blurry, dirty, badly-framed photo comes back as a well-staged blurry, dirty, '
          + 'badly-framed photo. Shoot clean, then re-stage.',
      },
    ],
    faq: [
      ['What is the best app to remove the background from a car photo?',
        'Judge candidates on the four automotive failure points instead of brand names: run one of your own photos through and inspect the wheel spokes, whether the old background still shows through the glass, what is reflected in the paint, and whether the shadow survived. General-purpose removers fail at least one; tools built specifically for vehicles are the ones that pass all four.'],
      ['Can I remove the background from a car photo for free?',
        'Yes, and for a single private sale it is often the right call — free removers produce a usable cutout you can tidy by hand in a few minutes. Expect to fix edges around mirrors and spokes yourself, and accept the flat-backdrop look. The free approach stops making sense when the photo count is a lot’s worth rather than a car’s worth.'],
      ['How do dealers edit car photos at scale?',
        'They stop editing photo-by-photo. Dealer-grade car photo editing runs as a pipeline: the photos already in the inventory feed go through AI background replacement automatically, and the finished images flow onto the listings — AutoLander does exactly this and then [posts each unit to Facebook Marketplace](/facebook-marketplace-auto-poster/) with its re-staged set. Nobody at the store opens an editor.'],
      ['Should the new background be a studio or an outdoor scene?',
        'Either works — what converts is consistency and plausibility. Pick one look, apply it to every unit, and make sure the light on the car agrees with the scene behind it. A mixed lot of studio shots, sunset shots, and raw photos reads as chaotic; fifty units in one consistent scene reads as a professional operation.'],
      ['Is it okay to edit car listing photos at all?',
        'Editing the scene is normal merchandising — dealers have staged cars in front of nicer backdrops since photography met car sales. Editing the vehicle is deception: color, wheels, trim, and damage must appear exactly as they are in person. The test is simple: if the buyer arriving on the lot sees the car the photos promised, the edit was honest.'],
    ],
    cta: {
      heading: 'Backgrounds replaced, nothing else touched',
      sub: 'AutoLander’s AI Photo Studio re-stages every feed photo — shadow, glass, and reflections rebuilt — and posts the finished set to Facebook Marketplace with each unit.',
    },
  },

  // ---------------------------------------------------- /guide/used-car-merchandising-checklist/
  {
    slug: 'used-car-merchandising-checklist',
    silo: 'photos',
    anchor: 'The used car merchandising checklist: five levers that convert',
    crumb: 'Merchandising checklist',
    primaryKeyword: 'used car merchandising',
    secondaryKeywords: [
      'vehicle merchandising best practices',
      'online vehicle merchandising',
      'what makes a car listing convert',
    ],
    title: 'Used Car Merchandising: The One Checklist That Converts',
    description:
      'Used car merchandising is five levers on one checklist — price, photos, description, '
      + 'freshness, response speed — and the weakest lever caps every listing.',
    eyebrow: 'Merchandising guide',
    h1: 'Used car merchandising: one checklist, five levers',
    tldr:
      'Used car merchandising is everything that presents a unit to an online buyer: the price, '
      + 'the photos, the description, the listing’s freshness and accuracy, and how fast the '
      + 'store answers. The five work as one system — the weakest lever caps the listing, so a '
      + 'perfectly priced car with dark photos converts like an overpriced one. Run all five as '
      + 'a single checklist on every unit, every week.',
    sections: [
      {
        type: 'qa',
        q: 'What is used car merchandising?',
        a: [
          'It is the work of making a specific unit look worth its asking price everywhere a '
          + 'buyer meets it — which today means the listing, long before the lot. Merchandising '
          + 'is not decoration on top of the deal; for an online shopper the listing is the '
          + 'entire dealership until the moment they message you.',
          'The trap is treating its parts separately — a pricing tool over here, a photo vendor '
          + 'over there, listings whenever someone gets time. Buyers experience all of it as one '
          + 'thing, in about a second, and the weakest element caps the whole listing: great '
          + 'photos cannot rescue a stale price, and a sharp price cannot rescue photos nobody '
          + 'clicks.',
          'The stakes are set by what inventory costs now. Across 10,823 priced dealer listings '
          + 'in [AutoLander’s 2026 Marketplace report](/facebook-marketplace-used-car-report-2026/), '
          + 'the median asking price of a dealer unit posted to Marketplace is $28,295 — and '
          + '22.6% of listings changed price after going live. At those numbers, every unit on '
          + 'your lot is a five-figure product competing in a scroll, and repricing after launch '
          + 'is normal operations, not an admission of error. Merchandising is how a $28,295 '
          + 'listing earns the click it needs before the market moves again.',
        ],
      },
      {
        type: 'bullets',
        variant: 'win',
        h2: 'The used car merchandising checklist',
        intro: 'Five levers, one checklist. A unit is merchandised when every box checks — not when most do.',
        items: [
          'Price: set to the live market with evidence, reviewed on a fixed cadence — a reprice on schedule beats a panic cut at day 60.',
          'Photos: full coverage — every angle, interior, odometer, flaws — on clean, consistent backgrounds; an [AI car photo editor](/ai-car-photo-editor/) makes the feed you already have showroom-grade.',
          'Description: the trim, options, and condition facts that justify the price, written honestly — no ALL-CAPS hype a buyer has to read around.',
          'Freshness: new units listed the day they are front-line ready, prices matching the feed everywhere, and sold units gone the same day via [inventory sync](/facebook-marketplace-inventory-sync/).',
          'Response speed: a named owner per shift answering in minutes, not hours — the [speed-to-lead playbook](/guide/car-sales-leads/) is where merchandising converts into appointments.',
        ],
      },
      {
        type: 'qa',
        q: 'What are the vehicle merchandising best practices behind the checklist?',
        a: 'Treat the checklist as an operating rhythm, not a launch task, because most '
          + 'merchandising failure is decay rather than error: the listing that was perfect on '
          + 'day one quietly rots as the price ages out of the market, the sold twin stays live, '
          + 'and Saturday inquiries go unanswered. Best practice is therefore cadence plus '
          + 'ownership — every checklist item gets a frequency and a name attached — and price '
          + 'parity is absolute: one number on Marketplace, the website, and the windshield, '
          + 'changed everywhere the same day. Nothing burns a buyer’s trust faster than '
          + 'discovering the online price was a lure.',
      },
      {
        type: 'table',
        h2: 'The merchandising cadence',
        intro: 'The checklist as a schedule. If a task has no owner on the calendar, it is already slipping.',
        head: ['When', 'What gets done'],
        rows: [
          ['Daily', 'Front-line-ready units get listed; sold units are confirmed down; the shift owner answers every inquiry'],
          ['Weekly', 'Photo audit on new arrivals; price review on anything past its first age threshold'],
          ['On every price change', 'One number everywhere the same day — feed, website, Marketplace, windshield'],
          ['On every sale', 'The listing comes down the same day, before a buyer drives out for a ghost'],
        ],
      },
      {
        type: 'qa',
        q: 'How is online vehicle merchandising different from the lot?',
        a: 'On the lot, merchandising is physical and forgiving — balloons, windshield numbers, a '
          + 'salesperson who can recover a bad first impression in conversation. Online there is '
          + 'no recovery: the listing is a thumbnail and a price judged in under a second, '
          + 'alone, against every competitor in the same scroll. Online merchandising also decays '
          + 'in a way the lot never shows you — the sold unit still listed, the price cut that '
          + 'never reached Marketplace. A physical lot cannot advertise a car that is not there; '
          + 'an unmaintained listing does it every day, and buyers who drive out for a ghost do '
          + 'not give the store a second chance.',
      },
      {
        type: 'qa',
        q: 'What makes a car listing convert?',
        a: 'Conversion is a chain, and each link has an owner. The click belongs to the first '
          + 'photo — clean, well-lit, car filling the frame. The open belongs to price and '
          + 'mileage passing the buyer’s sanity check against everything else in the scroll. The '
          + 'message belongs to trust: full photo coverage, an honest description, flaws shown '
          + 'before they are asked about. And the appointment belongs to speed — the store that '
          + 'answers in two minutes gets the visit the store that answers at closing time reads '
          + 'about. A listing that stalls is diagnosed by finding which link broke, in that order.',
      },
      {
        type: 'figure',
        before: '/studio/ford-expedition-before.webp',
        after: '/studio/ford-expedition-after.webp',
        beforeAlt: 'Raw dealership lot photo of a 2024 Ford Expedition before AutoLander',
        afterAlt: 'The same 2024 Ford Expedition on a clean showroom background after AutoLander’s AI Photo Studio',
        caption: 'Lever two of five: the same 2024 Ford Expedition, re-staged by AutoLander’s AI Photo Studio. Same truck, same price — but only the right-hand version earns the click that lets the other four levers work.',
      },
      {
        type: 'callout',
        title: 'The honest part',
        body: 'Merchandising cannot fix a unit that was bought wrong — a car acquired over the money '
          + 'stays hard to sell no matter how well it is presented. What it can do is stop '
          + 'well-bought cars from dying of presentation. Three of the five levers — photos, '
          + 'freshness, price parity — are mechanical and automatable; the honest play is letting '
          + 'software hold those steady so your people spend their judgment on the two levers '
          + 'only humans can pull: pricing the car and answering the buyer.',
      },
    ],
    faq: [
      ['What are the key elements of used car merchandising?',
        'Five: a market-evidenced price, complete photos on clean backgrounds, an honest description that justifies the number, listing freshness — right price, right status, sold units removed — and fast human response to inquiries. They work as a system: buyers experience the listing as one impression, so the weakest element sets the ceiling for the other four.'],
      ['How often should used car listings be updated?',
        'Continuously, in effect: new units up the day they are front-line ready, sold units down the same day, and prices synchronized everywhere the moment they change. Repricing after launch is routine at today’s market speed, which is why parity between your feed, your website, and Marketplace matters more than any individual update — drift is where trust dies.'],
      ['Does merchandising matter more than price?',
        'Neither outranks the other, because price is one of merchandising’s five levers. What is true: presentation gets judged first. A well-priced unit behind dark photos never gets its price seen, so it reads as unwanted and invites an unnecessary cut. Fix presentation to get the price evaluated, then let the market tell you whether the number is right.'],
      ['What should a used car description include?',
        'The facts that justify the price: exact trim, the options that matter on that model, mileage context, condition stated honestly including flaws, and what is recent — tires, brakes, service. Skip the ALL-CAPS urgency; buyers read around it. AutoLander generates AI-written descriptions from the unit’s actual feed data, which keeps them factual and consistent across the lot.'],
      ['How do small dealerships merchandise like the big stores?',
        'With software instead of headcount. The volume advantages big stores buy with staff — every unit photographed consistently, listed everywhere daily, repriced on schedule, removed when sold — are exactly the mechanical tasks a [Facebook Marketplace auto poster](/facebook-marketplace-auto-poster/) automates from an inventory feed. A three-person store can run whole-lot merchandising that looks like a photo department and a BDC.'],
    ],
    cta: {
      heading: 'Four of five levers, on autopilot',
      sub: 'AutoLander holds photos, freshness, price parity, and full-lot coverage steady on Facebook Marketplace — so your team can focus on pricing the car and answering the buyer.',
    },
  },

];
