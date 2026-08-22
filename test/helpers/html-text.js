// Extracts the text a JavaScript-free crawler would read out of an HTML document.
//
// Regex tag-stripping is not good enough here: the page contains HTML comments that mention tag
// names, and a naive /<noscript>[\s\S]*?<\/noscript>/ will start matching at a tag name inside a
// comment and swallow the rest of the document — which silently reports 0 characters and makes
// this whole test file lie. Use a real tokenizer.
//
// <script>, <style> and <noscript> contents are dropped. <noscript> in particular is deliberate:
// the AI-readiness auditors ignore it, which is exactly why the static home shell exists.

const VOID_SKIP = new Set(['script', 'style', 'noscript']);

const ENTITIES = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
  mdash: '—', ndash: '–', middot: '·', rsquo: '’', lsquo: '‘',
  ldquo: '“', rdquo: '”', hellip: '…', copy: '©', deg: '°',
};

function decodeEntities(text) {
  return text.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (match, entity) => {
    if (entity[0] === '#') {
      const code = entity[1] === 'x' || entity[1] === 'X'
        ? Number.parseInt(entity.slice(2), 16)
        : Number.parseInt(entity.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : match;
    }
    const key = entity.toLowerCase();
    return Object.prototype.hasOwnProperty.call(ENTITIES, key) ? ENTITIES[key] : match;
  });
}

export class HTMLParser {
  /** @param {string} html @returns {string} whitespace-collapsed visible text */
  textOf(html) {
    const out = [];
    let i = 0;
    let skipDepth = 0;
    let skipTag = '';

    while (i < html.length) {
      const lt = html.indexOf('<', i);
      if (lt === -1) {
        if (!skipDepth) out.push(html.slice(i));
        break;
      }
      if (lt > i && !skipDepth) out.push(html.slice(i, lt));

      // Comment / doctype / CDATA — consume without emitting text.
      if (html.startsWith('<!--', lt)) {
        const close = html.indexOf('-->', lt + 4);
        i = close === -1 ? html.length : close + 3;
        continue;
      }
      if (html.startsWith('<!', lt)) {
        const close = html.indexOf('>', lt);
        i = close === -1 ? html.length : close + 1;
        continue;
      }

      const gt = html.indexOf('>', lt);
      if (gt === -1) break;
      const raw = html.slice(lt + 1, gt);
      const closing = raw.startsWith('/');
      const name = (closing ? raw.slice(1) : raw).match(/^[a-zA-Z0-9-]+/)?.[0]?.toLowerCase() || '';

      if (skipDepth) {
        if (closing && name === skipTag) skipDepth -= 1;
        else if (!closing && name === skipTag && !raw.endsWith('/')) skipDepth += 1;
      } else if (!closing && VOID_SKIP.has(name) && !raw.endsWith('/')) {
        skipDepth = 1;
        skipTag = name;
      }

      i = gt + 1;
    }

    return decodeEntities(out.join(' ')).replace(/\s+/g, ' ').trim();
  }
}
