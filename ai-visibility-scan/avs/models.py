"""Plain data records shared by every module (all JSON-serialisable via dataclasses.asdict)."""

from dataclasses import dataclass, field
from typing import Optional


@dataclass
class InventorySample:
    year: str
    make: str
    model: str
    trim: str = ""
    url: str = ""

    @property
    def label(self) -> str:
        return " ".join(p for p in (str(self.year), self.make, self.model, self.trim) if p).strip()


@dataclass
class CompetitorRating:
    name: str
    rating: Optional[float] = None
    count: Optional[int] = None


@dataclass
class DealerInput:
    dealership_name: str
    website_url: str
    city: str
    state: str
    zip: str
    state_code: str = ""
    state_name: str = ""
    timezone: str = ""
    brands: list = field(default_factory=list)
    competitors: list = field(default_factory=list)
    cars_sold_per_month: Optional[float] = None
    avg_gross_per_car: Optional[float] = None
    inventory_samples: list = field(default_factory=list)  # list[InventorySample]
    google_rating: Optional[float] = None
    google_review_count: Optional[int] = None
    competitor_ratings: list = field(default_factory=list)  # list[CompetitorRating]
    yelp_claimed: Optional[bool] = None
    manual_notes: str = ""
    warnings: list = field(default_factory=list)

    @property
    def place(self) -> str:
        return f"{self.city}, {self.state_code or self.state}"


@dataclass
class Question:
    id: str
    category: str
    text: str
    branded: bool
    inventory_index: Optional[int] = None
    competitor: Optional[str] = None
    subject: str = ""


@dataclass
class Citation:
    url: str
    title: str = ""
    domain: str = ""
    source: str = "other"
    mentions_dealer: bool = False
    is_dealer_site: bool = False


@dataclass
class Answer:
    engine: str
    model: str
    question_id: str
    run: int
    text: str = ""
    citations: list = field(default_factory=list)  # list[Citation]: sources cited in the answer
    consulted: list = field(default_factory=list)  # list[Citation]: sources searched, not necessarily cited
    usage: dict = field(default_factory=dict)
    latency_s: float = 0.0
    error: Optional[str] = None
    warnings: list = field(default_factory=list)
    # filled in by analysis
    dealer_named: bool = False
    match_how: str = ""
    match_evidence: str = ""
    named_dealers: list = field(default_factory=list)
    dealer_domain_cited: bool = False
    dealer_listing_cited: bool = False
    sources_cited: list = field(default_factory=list)
    vehicle_found: Optional[bool] = None

    @property
    def ok(self) -> bool:
        return self.error is None
