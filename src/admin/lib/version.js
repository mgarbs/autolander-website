export function compareSemver(left, right) {
  const leftParts = numericSemver(left);
  const rightParts = numericSemver(right);
  if (!leftParts || !rightParts) return null;

  for (let index = 0; index < leftParts.length; index += 1) {
    if (leftParts[index] < rightParts[index]) return -1;
    if (leftParts[index] > rightParts[index]) return 1;
  }
  return 0;
}

function numericSemver(value) {
  const match = String(value || '').trim().match(/^v?(\d+)\.(\d+)\.(\d+)(?:[-+\s].*)?$/i);
  return match ? match.slice(1).map(Number) : null;
}
