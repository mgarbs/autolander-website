"""US state names and a primary IANA time zone per state (used for the engines'
approximate user location). States that span zones use the zone most residents share."""

US_STATES = {
    "AL": ("Alabama", "America/Chicago"),
    "AK": ("Alaska", "America/Anchorage"),
    "AZ": ("Arizona", "America/Phoenix"),
    "AR": ("Arkansas", "America/Chicago"),
    "CA": ("California", "America/Los_Angeles"),
    "CO": ("Colorado", "America/Denver"),
    "CT": ("Connecticut", "America/New_York"),
    "DE": ("Delaware", "America/New_York"),
    "DC": ("District of Columbia", "America/New_York"),
    "FL": ("Florida", "America/New_York"),
    "GA": ("Georgia", "America/New_York"),
    "HI": ("Hawaii", "Pacific/Honolulu"),
    "ID": ("Idaho", "America/Boise"),
    "IL": ("Illinois", "America/Chicago"),
    "IN": ("Indiana", "America/Indiana/Indianapolis"),
    "IA": ("Iowa", "America/Chicago"),
    "KS": ("Kansas", "America/Chicago"),
    "KY": ("Kentucky", "America/New_York"),
    "LA": ("Louisiana", "America/Chicago"),
    "ME": ("Maine", "America/New_York"),
    "MD": ("Maryland", "America/New_York"),
    "MA": ("Massachusetts", "America/New_York"),
    "MI": ("Michigan", "America/Detroit"),
    "MN": ("Minnesota", "America/Chicago"),
    "MS": ("Mississippi", "America/Chicago"),
    "MO": ("Missouri", "America/Chicago"),
    "MT": ("Montana", "America/Denver"),
    "NE": ("Nebraska", "America/Chicago"),
    "NV": ("Nevada", "America/Los_Angeles"),
    "NH": ("New Hampshire", "America/New_York"),
    "NJ": ("New Jersey", "America/New_York"),
    "NM": ("New Mexico", "America/Denver"),
    "NY": ("New York", "America/New_York"),
    "NC": ("North Carolina", "America/New_York"),
    "ND": ("North Dakota", "America/Chicago"),
    "OH": ("Ohio", "America/New_York"),
    "OK": ("Oklahoma", "America/Chicago"),
    "OR": ("Oregon", "America/Los_Angeles"),
    "PA": ("Pennsylvania", "America/New_York"),
    "RI": ("Rhode Island", "America/New_York"),
    "SC": ("South Carolina", "America/New_York"),
    "SD": ("South Dakota", "America/Chicago"),
    "TN": ("Tennessee", "America/Chicago"),
    "TX": ("Texas", "America/Chicago"),
    "UT": ("Utah", "America/Denver"),
    "VT": ("Vermont", "America/New_York"),
    "VA": ("Virginia", "America/New_York"),
    "WA": ("Washington", "America/Los_Angeles"),
    "WV": ("West Virginia", "America/New_York"),
    "WI": ("Wisconsin", "America/Chicago"),
    "WY": ("Wyoming", "America/Denver"),
    "PR": ("Puerto Rico", "America/Puerto_Rico"),
}

_BY_NAME = {name.lower(): code for code, (name, _tz) in US_STATES.items()}


def resolve_state(value):
    """Return (code, full name, time zone) for "NC" or "North Carolina"; None if unknown."""
    text = " ".join(str(value or "").replace(".", " ").split())
    if not text:
        return None
    code = text.upper() if text.upper() in US_STATES else _BY_NAME.get(text.lower())
    if not code:
        return None
    name, tz = US_STATES[code]
    return code, name, tz
