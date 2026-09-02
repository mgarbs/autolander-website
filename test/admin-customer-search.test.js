import assert from 'node:assert/strict';
import test from 'node:test';
import {
  candidateContacts,
  candidatePeople,
  dialablePhone,
  displayReferralCode,
  friendlyAdjustmentError,
  normalizeCandidate,
  searchSupportCandidates,
} from '../src/admin/lib/support-adjustments.js';

test('candidate normalization preserves searchable identity and phone aliases', () => {
  const candidate = normalizeCandidate({
    orgId: 'org-42',
    orgName: 'Northside Motors',
    org: { slug: 'northside' },
    matches: [{
      user_id: 'user-7',
      first_name: 'Avery',
      last_name: 'Stone',
      username: 'averys',
      email: 'avery@example.com',
      mobile_phone: '(212) 555-0123',
      referral_code: 'a1b2c3d4',
    }],
  });

  assert.equal(candidate.orgId, 'org-42');
  assert.equal(candidate.orgName, 'Northside Motors');
  assert.deepEqual(candidate.matchedUsers[0], {
    id: 'user-7',
    username: 'averys',
    firstName: 'Avery',
    lastName: 'Stone',
    displayName: 'Avery Stone',
    email: 'avery@example.com',
    phone: '(212) 555-0123',
    referralCode: 'a1b2c3d4',
    role: '',
  });
  assert.match(candidatePeople(candidate), /Avery Stone/);
  assert.match(candidatePeople(candidate), /avery@example\.com/);
  assert.match(candidatePeople(candidate), /\(212\) 555-0123/);
});

test('candidate contact falls back to account-level customer fields', () => {
  const candidate = normalizeCandidate({
    id: 'org-fallback',
    name: 'Fallback Auto',
    primaryContact: {
      name: 'Jordan Dealer',
      email: 'jordan@example.com',
      phoneNumber: '+1 646 555 0100',
    },
  });

  assert.equal(candidate.contactName, 'Jordan Dealer');
  assert.equal(candidate.email, 'jordan@example.com');
  assert.equal(candidate.phone, '+1 646 555 0100');
  assert.deepEqual(candidateContacts(candidate), [{
    displayName: 'Jordan Dealer',
    email: 'jordan@example.com',
    phone: '+1 646 555 0100',
    referralCode: '',
    username: '',
    firstName: '',
    lastName: '',
    id: '',
    role: '',
  }]);
});

test('candidate normalization preserves referral-code aliases for every user', () => {
  const candidate = normalizeCandidate({
    id: 'org-referrals',
    users: [
      { id: 'admin-1', email: 'one@example.com', referralCode: 'deadbeef' },
      { id: 'admin-2', email: 'two@example.com', invite_code: 'facefeed' },
      { id: 'admin-3', email: 'three@example.com' },
    ],
  });

  assert.deepEqual(
    candidate.admins.map(({ email, referralCode }) => ({ email, referralCode })),
    [
      { email: 'one@example.com', referralCode: 'deadbeef' },
      { email: 'two@example.com', referralCode: 'facefeed' },
      { email: 'three@example.com', referralCode: '' },
    ],
  );
  assert.equal(displayReferralCode(candidate.admins[0]), 'deadbeef');
  assert.equal(displayReferralCode(candidate.admins[2]), 'Not assigned');
});

test('phone links retain a leading plus and strip display punctuation', () => {
  assert.equal(dialablePhone('+1 (212) 555-0123'), '+12125550123');
  assert.equal(dialablePhone('646.555.0199'), '6465550199');
  assert.equal(dialablePhone('n/a'), '');
});

test('one-character customer queries do not call the candidates endpoint', async () => {
  assert.deepEqual(await searchSupportCandidates(' a '), []);
});

test('billing adjustment reasons use operator-friendly messages', () => {
  const messages = {
    group_billed: 'This dealership is billed through its dealer group — it has no card subscription of its own.',
    sub_mismatch: 'This customer\'s Stripe subscription doesn\'t match our records — handle it in Stripe.',
    no_open_invoice: 'Their unpaid bill was just settled or written off — refresh billing and look again.',
    invoice_already_paid: 'Their unpaid bill was just settled or written off — refresh billing and look again.',
    target_out_of_range: 'Pick a date in the next month.',
    bad_status: 'Their subscription isn\'t in a state this tool can adjust — handle it in Stripe.',
    schedule_present: 'This subscription already has a Stripe schedule. Manage its billing date in Stripe so the existing schedule is preserved.',
    trial_present: 'This subscription is in or has a trial configuration and cannot be adjusted here.',
  };

  for (const [reason, message] of Object.entries(messages)) {
    assert.equal(friendlyAdjustmentError({ reason }), message);
  }
});
