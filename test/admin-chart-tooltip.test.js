import assert from 'node:assert/strict';
import test from 'node:test';
import {
  DARK_CHART_TOOLTIP_CONTENT_STYLE,
  DARK_CHART_TOOLTIP_ITEM_STYLE,
  DARK_CHART_TOOLTIP_LABEL_STYLE,
} from '../src/admin/lib/chart-tooltip.js';

test('keeps dark chart tooltip labels and values at high contrast', () => {
  const background = DARK_CHART_TOOLTIP_CONTENT_STYLE.backgroundColor;

  assert.ok(contrastRatio(DARK_CHART_TOOLTIP_LABEL_STYLE.color, background) >= 7);
  assert.ok(contrastRatio(DARK_CHART_TOOLTIP_ITEM_STYLE.color, background) >= 7);
  assert.ok(DARK_CHART_TOOLTIP_LABEL_STYLE.fontWeight >= 700);
  assert.ok(DARK_CHART_TOOLTIP_ITEM_STYLE.fontWeight >= 600);
});

function contrastRatio(foreground, background) {
  const lighter = Math.max(luminance(foreground), luminance(background));
  const darker = Math.min(luminance(foreground), luminance(background));
  return (lighter + 0.05) / (darker + 0.05);
}

function luminance(hex) {
  const channels = hex
    .replace('#', '')
    .match(/.{2}/g)
    .map((channel) => Number.parseInt(channel, 16) / 255)
    .map((channel) => (channel <= 0.04045
      ? channel / 12.92
      : ((channel + 0.055) / 1.055) ** 2.4));
  return (0.2126 * channels[0]) + (0.7152 * channels[1]) + (0.0722 * channels[2]);
}
