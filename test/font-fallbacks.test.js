import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

// src/index.css: the metric-matched local fallbacks for Inter / Archivo, in two sets (Arial / Liberation Sans, and
// Roboto for Android, which has neither). See the comment above them for how the values were chosen.
const css = readFileSync('src/index.css', 'utf8');
const faces = [...css.matchAll(/@font-face\s*\{([^}]*)\}/g)].map((m) => {
  const get = (name) => m[1].match(new RegExp(`${name}:\\s*([^;]+);`))?.[1].trim();
  return {
    family: get('font-family')?.replace(/['"]/g, ''), style: get('font-style'), weight: get('font-weight'), src: get('src') || '',
    sizeAdjust: Number.parseFloat(get('size-adjust')), ascent: Number.parseFloat(get('ascent-override')),
    descent: Number.parseFloat(get('descent-override')), lineGap: get('line-gap-override'), range: get('unicode-range'),
  };
});
const WEB = { Inter: [1984 / 2048, 494 / 2048], Archivo: [878 / 1000, 210 / 1000] };
const GROUPS = [
  ['Inter', 'normal', '100 450'], ['Inter', 'normal', '451 599'], ['Inter', 'normal', '600 749'], ['Inter', 'normal', '750 1000'],
  ['Archivo', 'normal', '1 850'], ['Archivo', 'normal', '851 1000'], ['Archivo', 'italic', '1 850'], ['Archivo', 'italic', '851 1000'],
];

test('every web weight range has an Arial-based and a Roboto-based fallback face', () => {
  const webRange = faces.find((f) => f.family === 'Inter').range;
  for (const [family, style, weight] of GROUPS) {
    for (const set of ['Fallback', 'Fallback Roboto']) {
      const face = faces.find((f) => f.family === `${family} ${set}` && f.style === style && f.weight === weight);
      assert.ok(face, `${family} ${set} ${style} ${weight}`);
      assert.equal(face.range, webRange, 'same unicode-range as the web font');
      assert.equal(face.lineGap, '0%');
      assert.ok(face.sizeAdjust > 85 && face.sizeAdjust < 125, `${face.family} ${weight}: size-adjust ${face.sizeAdjust}`);
      // Baseline and line boxes stay put: (web metric + 0.15em per side) / size-adjust.
      const [asc, desc] = WEB[family];
      assert.ok(Math.abs(face.ascent - (100 * (asc + 0.15)) / (face.sizeAdjust / 100)) < 0.02, `${face.family} ${weight} ascent`);
      assert.ok(Math.abs(face.descent - (100 * (desc + 0.15)) / (face.sizeAdjust / 100)) < 0.02, `${face.family} ${weight} descent`);
      if (set === 'Fallback') {
        assert.match(face.src, /local\('Arial/);
        assert.match(face.src, /local\('Liberation Sans/);
        assert.doesNotMatch(face.src, /Roboto|url\(/);
      } else {
        // Static Roboto first (Android 11 and older), then the variable Roboto of Android 12+; never a download.
        assert.match(face.src, /local\('Roboto'\), local\('Roboto-Regular'\)$/, `${face.family} ${weight}: ${face.src}`);
        assert.doesNotMatch(face.src, /Arial|Liberation|url\(/);
        if (style === 'italic') assert.match(face.src, /^local\('Roboto (Bold|Black) Italic'\)/);
      }
    }
  }
  assert.equal(faces.filter((f) => /Fallback/.test(f.family)).length, 16, 'no stray fallback faces');
});

test('all three stylesheets try the Arial set, then the Roboto set, before system-ui', () => {
  const sans = "--font-sans: 'Inter', 'Inter Fallback', 'Inter Fallback Roboto', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;";
  const display = "--font-display: 'Archivo', 'Archivo Fallback', 'Archivo Fallback Roboto', 'Inter', 'Inter Fallback', 'Inter Fallback Roboto', system-ui, sans-serif;";
  for (const file of ['src/index.css', 'src/ai/ai.css', 'src/team/team.css']) {
    const text = readFileSync(file, 'utf8');
    assert.ok(text.includes(sans), `${file} --font-sans`);
    assert.ok(text.includes(display), `${file} --font-display`);
  }
});

test('the built pages carry both fallback sets (the inline route CSS too)', { skip: !existsSync('dist/index.html') }, () => {
  for (const file of ['dist/aeo-geo-for-car-dealers/index.html', 'dist/team/index.html']) {
    const html = readFileSync(file, 'utf8');
    const inline = html.match(/<style data-inline-route-css>([\s\S]*?)<\/style>/)?.[1] || '';
    for (const family of ['Inter Fallback', 'Archivo Fallback', 'Inter Fallback Roboto', 'Archivo Fallback Roboto']) {
      assert.match(inline, new RegExp(`@font-face\\{font-family:["']?${family}["']?;`), `${file}: ${family}`);
    }
    assert.match(inline, /Archivo Fallback Roboto["']?,/, `${file}: the Roboto set is in the stack`);
  }
});
