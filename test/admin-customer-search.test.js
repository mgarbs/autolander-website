import assert from 'node:assert/strict';
import test from 'node:test';
import {
  candidateContacts,
  candidatePeople,
  dialablePhone,
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
    username: '',
    firstName: '',
    lastName: '',
    id: '',
    role: '',
  }]);
});

test('phone links retain a leading plus and strip display punctuation', () => {
  assert.equal(dialablePhone('+1 (212) 555-0123'), '+12125550123');
  assert.equal(dialablePhone('646.555.0199'), '6465550199');
  assert.equal(dialablePhone('n/a'), '');
});

test('one-character customer queries do not call the candidates endpoint', async () => {
  assert.deepEqual(await searchSupportCandidates(' a '), []);
});
