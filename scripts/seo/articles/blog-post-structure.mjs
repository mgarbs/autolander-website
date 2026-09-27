const SLUG_RE = /^[a-z0-9][a-z0-9-]{2,80}$/;

const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const isString = (value) => typeof value === 'string';
const isNonEmptyString = (value) => isString(value) && value.trim().length > 0;
const isStringArray = (value) => Array.isArray(value) && value.every(isString);
const optionalString = (object, key) => !Object.hasOwn(object, key) || isString(object[key]);

function validSection(section) {
  if (!isObject(section) || !isString(section.type)) return false;
  if (!optionalString(section, 'id') || !optionalString(section, 'intro') || !optionalString(section, 'note')) return false;
  switch (section.type) {
    case 'prose':
      return isNonEmptyString(section.paras) || isStringArray(section.paras);
    case 'qa':
      return isNonEmptyString(section.q)
        && (isNonEmptyString(section.a) || (isStringArray(section.a) && section.a.length > 0));
    case 'bullets':
      return isNonEmptyString(section.h2) && isStringArray(section.items)
        && optionalString(section, 'variant');
    case 'features':
      return isNonEmptyString(section.h2) && Array.isArray(section.cards)
        && section.cards.every((card) => isObject(card)
          && isNonEmptyString(card.title) && isNonEmptyString(card.body));
    case 'steps':
      return isNonEmptyString(section.h2) && Array.isArray(section.steps)
        && section.steps.every((step) => isObject(step)
          && isNonEmptyString(step.title) && isNonEmptyString(step.body));
    case 'table': {
      if (!isNonEmptyString(section.h2) || !Array.isArray(section.head)
        || section.head.length === 0 || !section.head.every(isString)
        || !Array.isArray(section.rows)) return false;
      if (Object.hasOwn(section, 'caption') && !isString(section.caption)) return false;
      if (Object.hasOwn(section, 'alCol')
        && (!Number.isInteger(section.alCol) || section.alCol < 0 || section.alCol >= section.head.length)) return false;
      return section.rows.every((row) => Array.isArray(row)
        && row.length === section.head.length && row.every(isString));
    }
    case 'callout':
      return isNonEmptyString(section.body) && optionalString(section, 'title');
    case 'quotes':
      return isNonEmptyString(section.h2) && Array.isArray(section.quotes)
        && section.quotes.every((quote) => isObject(quote)
          && isNonEmptyString(quote.text) && isNonEmptyString(quote.who)
          && optionalString(quote, 'role'));
    case 'twocol':
      return ['left', 'right'].every((side) => isObject(section[side])
        && isNonEmptyString(section[side].h2) && isStringArray(section[side].items));
    case 'figure':
      return ['before', 'after', 'beforeAlt', 'afterAlt', 'caption']
        .every((key) => isNonEmptyString(section[key]));
    case 'image':
      return ['src', 'alt', 'caption'].every((key) => isNonEmptyString(section[key]));
    default:
      return false;
  }
}

export function structuralErrorsForPost(post, {
  fileSlug = '', mode = '', requestedSlug = '',
} = {}) {
  const errors = [];
  if (!isObject(post)) return ['post shape must be a JSON object'];

  const stringFields = [
    'slug', 'anchor', 'crumb', 'primaryKeyword', 'title', 'description', 'eyebrow', 'h1', 'tldr',
  ];
  for (const field of stringFields) {
    if (!isNonEmptyString(post[field])) errors.push(`post shape: ${field} must be a non-empty string`);
  }
  if (!SLUG_RE.test(post.slug || '') || post.slug === 'feed') errors.push('post shape: slug is not valid');
  if (post.silo !== 'blog') errors.push("post shape: silo must equal 'blog'");
  for (const field of ['secondaryKeywords', 'alsoRelated', 'augmentKeys', 'alsoOnCompetitors', 'inboundFrom']) {
    if (!isStringArray(post[field])) errors.push(`post shape: ${field} must be an array of strings`);
  }
  if (!isObject(post.cta) || !isNonEmptyString(post.cta.heading) || !isNonEmptyString(post.cta.sub)) {
    errors.push('post shape: cta must contain string heading and sub values');
  }

  if (!Array.isArray(post.sections)) {
    errors.push('post shape: sections must be an array');
  } else {
    post.sections.forEach((section, index) => {
      if (!validSection(section)) errors.push(`section ${index + 1} shape does not match its renderer`);
    });
  }

  if (!Array.isArray(post.faq)
    || post.faq.some((entry) => !Array.isArray(entry) || entry.length !== 2
      || entry.some((value) => !isNonEmptyString(value)))) {
    errors.push('faq shape must be an array of [question, answer] string pairs');
  }
  if (fileSlug && post.slug !== fileSlug) errors.push('slug must match file name');
  if (mode === 'revise' && requestedSlug && post.slug !== requestedSlug) errors.push('revise must keep slug');
  return [...new Set(errors)];
}

export function isStructurallyRenderable(post) {
  return structuralErrorsForPost(post).length === 0;
}
