export function readQaTestEventCode() {
  try {
    const code = new URLSearchParams(window.location.search).get('test_event_code') || '';
    const valid = /^TEST[A-Za-z0-9]{1,32}$/;
    if (valid.test(code)) window.sessionStorage.setItem('al_test_event_code', code);
    const stored = window.sessionStorage.getItem('al_test_event_code') || '';
    return valid.test(stored) ? stored : '';
  } catch { return ''; }
}
