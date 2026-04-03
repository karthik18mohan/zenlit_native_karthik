import test from 'node:test';
import assert from 'node:assert/strict';

const canSubmitSignup = ({ isValidEmail, hasAcceptedLegal, emailLoading }) => {
  return isValidEmail && hasAcceptedLegal && !emailLoading;
};

const buildLegalLinks = (baseUrl) => {
  const normalized = String(baseUrl).trim().replace(/\/$/, '');
  return {
    terms: `${normalized}/terms`,
    privacy: `${normalized}/privacy`,
  };
};

const hasLatestLegalVersions = (record, versions) => {
  if (!record) {
    return false;
  }

  return (
    record.terms_version === versions.terms &&
    record.privacy_version === versions.privacy &&
    Boolean(record.accepted_at)
  );
};

test('signup remains blocked until legal acceptance is checked', () => {
  assert.equal(
    canSubmitSignup({ isValidEmail: true, hasAcceptedLegal: false, emailLoading: false }),
    false,
  );
  assert.equal(
    canSubmitSignup({ isValidEmail: true, hasAcceptedLegal: true, emailLoading: false }),
    true,
  );
});

test('legal links resolve to live terms/privacy endpoints', () => {
  const links = buildLegalLinks('https://zenlit.app/');
  assert.equal(links.terms, 'https://zenlit.app/terms');
  assert.equal(links.privacy, 'https://zenlit.app/privacy');
});

test('acceptance validity requires matching terms/privacy versions and timestamp', () => {
  const versions = { terms: 'v1.0', privacy: 'v1.0' };

  assert.equal(
    hasLatestLegalVersions(
      { terms_version: 'v1.0', privacy_version: 'v1.0', accepted_at: '2026-04-03T12:00:00.000Z' },
      versions,
    ),
    true,
  );

  assert.equal(
    hasLatestLegalVersions(
      { terms_version: 'v0.9', privacy_version: 'v1.0', accepted_at: '2026-04-03T12:00:00.000Z' },
      versions,
    ),
    false,
  );
});
