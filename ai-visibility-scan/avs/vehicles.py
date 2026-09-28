"""Brand and model vocabulary.

Used twice: to write generic "model in my city" questions when no inventory samples
are given, and to stop "Toyota Camry" being mistaken for a dealership name.
"""

# brand (as a buyer types it) -> popular used models, most searched first
BRAND_MODELS = {
    "Acura": ["MDX", "RDX", "TLX"],
    "Audi": ["Q5", "A4", "Q7"],
    "BMW": ["X3", "3 Series", "X5"],
    "Buick": ["Enclave", "Encore GX", "Envision"],
    "Cadillac": ["Escalade", "XT5", "XT4"],
    "Chevrolet": ["Silverado 1500", "Equinox", "Tahoe"],
    "Chrysler": ["Pacifica", "300", "Voyager"],
    "Dodge": ["Durango", "Charger", "Challenger"],
    "Ford": ["F-150", "Explorer", "Escape"],
    "GMC": ["Sierra 1500", "Acadia", "Yukon"],
    "Honda": ["CR-V", "Civic", "Accord"],
    "Hyundai": ["Tucson", "Santa Fe", "Elantra"],
    "Infiniti": ["QX60", "QX50", "Q50"],
    "Jeep": ["Grand Cherokee", "Wrangler", "Cherokee"],
    "Kia": ["Sportage", "Telluride", "Sorento"],
    "Lexus": ["RX 350", "ES 350", "NX 300"],
    "Lincoln": ["Aviator", "Nautilus", "Corsair"],
    "Mazda": ["CX-5", "CX-50", "Mazda3"],
    "Mercedes-Benz": ["GLC 300", "C 300", "GLE 350"],
    "Mitsubishi": ["Outlander", "Eclipse Cross", "Outlander Sport"],
    "Nissan": ["Rogue", "Altima", "Frontier"],
    "Ram": ["1500", "2500", "ProMaster"],
    "Subaru": ["Outback", "Forester", "Crosstrek"],
    "Tesla": ["Model 3", "Model Y", "Model S"],
    "Toyota": ["Camry", "RAV4", "Tacoma"],
    "Volkswagen": ["Tiguan", "Atlas", "Jetta"],
    "Volvo": ["XC90", "XC60", "XC40"],
}

BRAND_ALIASES = {"chevy": "Chevrolet", "vw": "Volkswagen", "mercedes": "Mercedes-Benz", "benz": "Mercedes-Benz"}

# used when the dealer gave no inventory samples and no brands
GENERIC_MODELS = [
    ("Ford", "F-150"),
    ("Toyota", "RAV4"),
    ("Honda", "CR-V"),
    ("Chevrolet", "Silverado 1500"),
    ("Toyota", "Camry"),
]

# Extra model words not in the question list, so extraction still rejects "Honda Pilot".
_EXTRA_MODELS = {
    "Ford": ["Mustang", "Bronco", "Ranger", "Maverick", "Expedition", "Edge", "F-250", "Transit"],
    "Toyota": ["Corolla", "Highlander", "Tundra", "4Runner", "Prius", "Sienna", "Sequoia"],
    "Honda": ["Pilot", "Odyssey", "HR-V", "Passport", "Ridgeline"],
    "Chevrolet": ["Malibu", "Traverse", "Colorado", "Suburban", "Blazer", "Trax", "Camaro", "Corvette"],
    "Nissan": ["Sentra", "Pathfinder", "Murano", "Kicks", "Titan"],
    "Jeep": ["Compass", "Gladiator", "Renegade"],
    "Hyundai": ["Sonata", "Palisade", "Kona"],
    "Kia": ["Soul", "Forte", "Seltos", "Carnival"],
    "Subaru": ["Impreza", "Ascent", "Legacy", "WRX"],
    "GMC": ["Terrain", "Canyon"],
    "Dodge": ["Grand Caravan", "Journey"],
    "Ram": ["3500"],
}


def _tokens(text):
    import re

    return [t for t in re.split(r"[^a-z0-9]+", text.lower()) if t]


def canonical_brand(word):
    """'chevy' -> 'Chevrolet'; 'ford' -> 'Ford'; unknown -> None."""
    w = (word or "").strip().lower()
    if w in BRAND_ALIASES:
        return BRAND_ALIASES[w]
    for brand in BRAND_MODELS:
        if brand.lower() == w:
            return brand
    return None


def _build_model_tokens():
    by_brand = {}
    for brand in set(BRAND_MODELS) | set(_EXTRA_MODELS):
        models = BRAND_MODELS.get(brand, []) + _EXTRA_MODELS.get(brand, [])
        toks = set()
        for model in models:
            toks.update(t for t in _tokens(model) if t not in {"series", "sport", "cross", "grand"} or len(_tokens(model)) == 1)
        by_brand[brand.lower()] = toks
    by_brand["chevy"] = by_brand["chevrolet"]
    by_brand["vw"] = by_brand["volkswagen"]
    by_brand["mercedes"] = by_brand["mercedes-benz"]
    by_brand["benz"] = by_brand["mercedes-benz"]
    return by_brand


# brand token (lowercase) -> set of model tokens for that brand
MODEL_TOKENS_BY_BRAND = _build_model_tokens()
