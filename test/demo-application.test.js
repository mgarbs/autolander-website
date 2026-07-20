import assert from 'node:assert/strict';
import test from 'node:test';
import { handleBooking } from '../worker/src/booking/router.js';

function applicationRequest(vehicleCount) {
  return new Request('https://autolander.ai/api/apply', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 AutoLander regression test browser',
    },
    body: JSON.stringify({
      fullName: 'Jamie Dealer',
      email: 'jamie@example.com',
      phone: '(212) 555-0123',
      role: 'Owner',
      inventoryUrl: 'https://example.com/inventory',
      vehicleCount,
      consentTimestamp: new Date().toISOString(),
      submissionId: 'sub_vehiclecountrequired123',
    }),
  });
}

const env = {
  DISABLE_RATE_LIMITS: 'true',
  GHL_PRIVATE_INTEGRATION_TOKEN: 'test-token',
  GHL_LOCATION_ID: 'test-location',
  GHL_WORKFLOW_ID: 'test-workflow',
};

test('demo application rejects a missing vehicle inventory count', async () => {
  const response = await handleBooking(applicationRequest(''), env, {}, {});
  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), { ok: false, reason: 'missing_vehicle_count' });
});

test('demo application rejects a vehicle inventory count outside the offered choices', async () => {
  const response = await handleBooking(applicationRequest('500+'), env, {}, {});
  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), { ok: false, reason: 'invalid_vehicle_count' });
});
