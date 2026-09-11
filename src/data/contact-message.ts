import type { ContactMessage } from '../pages';

/**
 * A fresh, isolated message per test run - no shared fixture data for a
 * form that leaves a permanent record on the target.
 */
export function generateContactMessage(): ContactMessage {
  const unique = `${Date.now()}-${Math.floor(Math.random() * 10_000)}`;

  return {
    name: `QA Runner ${unique}`,
    email: `qa-runner-${unique}@example.com`,
    subject: `Automated contact test ${unique}`,
    message:
      'This message was submitted by an automated Playwright check and can be disregarded.',
  };
}
