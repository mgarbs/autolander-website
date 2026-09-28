"""The 20 localized buyer questions.

8 finding a dealer, 5 specific cars, 3 reputation, 2 comparisons, 2 trade-in. A question
is "branded" when it names the dealership; presence is scored on non-branded questions
only, because naming the dealer in the question makes a mention in the answer trivial.
"""

from .models import Question
from .vehicles import BRAND_MODELS, GENERIC_MODELS, canonical_brand

CATEGORY_LABELS = {
    "find_dealer": "Finding a dealer",
    "specific_car": "Specific car",
    "reputation": "Reputation",
    "comparison": "Comparison",
    "trade_in": "Trade-in",
}
CATEGORY_COUNTS = {"find_dealer": 8, "specific_car": 5, "reputation": 3, "comparison": 2, "trade_in": 2}


def _generic_models(brands, needed, taken):
    picks = []
    pool = []
    if needed <= 0:
        return picks
    for brand in brands:
        canon = canonical_brand(brand)
        if canon:
            pool += [(canon, m) for m in BRAND_MODELS[canon]]
    # interleave brands so two brands share the slots
    if len(brands) > 1:
        by_brand = [[p for p in pool if p[0] == canonical_brand(b)] for b in brands]
        pool = [p for group in zip(*by_brand) for p in group] + pool
    pool += GENERIC_MODELS
    for make, model in pool:
        key = (make.lower(), model.lower())
        if key in taken or (make, model) in picks:
            continue
        picks.append((make, model))
        taken.add(key)
        if len(picks) == needed:
            break
    return picks


def build_questions(dealer):
    place, zip_code, name = dealer.place, dealer.zip, dealer.dealership_name
    questions = []

    def add(category, text, branded=False, **extra):
        questions.append(Question(id=f"Q{len(questions) + 1:02d}", category=category, text=text, branded=branded, **extra))

    # 8 - finding a dealer
    add("find_dealer", f"What is the best used car dealer in {place}?")
    add("find_dealer", f"Where can I buy a used truck near {zip_code}?")
    add("find_dealer", f"Which car dealerships in {place} have the best selection of used SUVs?")
    add("find_dealer", f"Where should I buy a car in {place}?")
    add("find_dealer", f"Which car dealerships near {zip_code} help buyers with bad credit get approved?")
    add("find_dealer", f"Who has the best prices on used cars in {place}?")
    brands = dealer.brands
    if brands:
        add("find_dealer", f"Who is the best {brands[0]} dealer in {place}?", subject=brands[0])
        if len(brands) > 1:
            add("find_dealer", f"Who is the best {brands[1]} dealer in {place}?", subject=brands[1])
        else:
            add("find_dealer", f"Where can I buy a new {brands[0]} near {zip_code}?", subject=brands[0])
    else:
        add("find_dealer", f"Where can I find a certified pre-owned car in {place}?")
        add("find_dealer", f"Which car dealers near {zip_code} are best for first-time buyers?")

    # 5 - specific cars in stock (generic model-in-city questions fill any gap)
    samples = dealer.inventory_samples[:5]
    for i, car in enumerate(samples):
        add("specific_car", f"Where can I buy a {car.label} near {place}?", inventory_index=i, subject=car.label)
    taken = {(c.make.lower(), c.model.lower()) for c in samples}
    for make, model in _generic_models(brands, 5 - len(samples), taken):
        add("specific_car", f"Where can I find a used {make} {model} for sale in {place}?", subject=f"{make} {model}")

    # 3 - reputation (the first two name the dealer)
    add("reputation", f"Is {name} in {place} a good dealership?", branded=True)
    add("reputation", f"What do reviews say about {name} in {place}?", branded=True)
    add("reputation", f"Who is the most trusted car dealer in {place}?")

    # 2 - comparisons
    fallback = [f"Compare the used car dealers in {place}.", f"Compare the top-rated car dealerships near {zip_code}."]
    for competitor in dealer.competitors[:2]:
        add("comparison", f"{name} vs {competitor}: which is better for buying a car in {place}?", branded=True, competitor=competitor)
    while sum(q.category == "comparison" for q in questions) < 2:
        add("comparison", fallback.pop(0))

    # 2 - trade-in
    add("trade_in", f"Where can I trade in my car in {place}?")
    add("trade_in", f"Who pays the most for trade-ins near {zip_code}?")

    assert len(questions) == 20, len(questions)
    return questions
