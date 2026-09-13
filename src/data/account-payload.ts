export interface AccountPayload {
  // Index signature required by Playwright's `request.post(url, { form })`.
  [key: string]: string;

  name: string;
  email: string;
  password: string;
  title: 'Mr' | 'Mrs';
  birth_date: string;
  birth_month: string;
  birth_year: string;
  firstname: string;
  lastname: string;
  company: string;
  address1: string;
  address2: string;
  country: string;
  zipcode: string;
  state: string;
  city: string;
  mobile_number: string;
}

/** Builds a unique createAccount payload so repeat test runs don't collide on email. */
export function generateAccountPayload(): AccountPayload {
  const unique = `${Date.now()}-${Math.floor(Math.random() * 10_000)}`;

  return {
    name: `QA Runner ${unique}`,
    email: `qa-runner-${unique}@example.com`,
    password: 'Test1234!',
    title: 'Mr',
    birth_date: '1',
    birth_month: '1',
    birth_year: '1990',
    firstname: 'QA',
    lastname: 'Runner',
    company: 'Acme Testing Co',
    address1: '1 Test Street',
    address2: '',
    country: 'India',
    zipcode: '12345',
    state: 'Testville',
    city: 'Test City',
    mobile_number: '1234567890',
  };
}
