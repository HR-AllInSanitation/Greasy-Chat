import { test, expect, Page } from '@playwright/test';
const INPUT_SELECTOR = 'input[placeholder="Type here..."]';

const patchSendBeacon = () => {
  (window as any).__capturedBeacons = [];
  navigator.sendBeacon = (url: string | URL, data?: BodyInit | null) => {
    const entry: any = { url: String(url) };
    if (data) {
      try {
        const clone = data instanceof Blob ? data.slice() : data;
        new Response(clone).text().then(txt => { entry.text = txt; });
      } catch {
        // ignore
      }
    }
    (window as any).__capturedBeacons.push(entry);
    try {
      fetch(url, { method: 'POST', body: data as BodyInit, headers: { 'Content-Type': 'application/json' } });
    } catch {
      // ignore
    }
    return false; // force fetch fallback path in app logic
  };
};

const sendMessage = async (page: Page, text: string) => {
  await page.fill(INPUT_SELECTOR, text);
  await page.press(INPUT_SELECTOR, 'Enter');
  await page.waitForTimeout(300);
};

const answerIntakeAndContact = async (page: Page) => {
  const intakeSteps: Array<{ prompt: string; answer: string }> = [
    { prompt: 'What is your business name?', answer: 'Test Biz' },
    { prompt: 'What is the street address?', answer: '123 Main St' },
    { prompt: 'What city is this in?', answer: 'Sylmar' },
    { prompt: 'What state is this in?', answer: 'CA' },
    { prompt: 'What is the ZIP code?', answer: '90001' },
    { prompt: 'What is the parking distance (in feet)?', answer: '50' },
    { prompt: 'How many months since your last service?', answer: '6' },
    { prompt: 'Any additional services?', answer: 'None' },
    { prompt: 'When was the system last cleaned?', answer: '1–2 years' },
    { prompt: 'Do you need used cooking oil (UCO) recycling?', answer: 'No' },
  ];

  for (const step of intakeSteps) {
    const prompt = page.locator(`text=${step.prompt}`).first();
    await expect(prompt).toBeVisible({ timeout: 10000 });
    await sendMessage(page, step.answer);
  }

  const contactSteps: Array<{ prompt: string; answer: string }> = [
    { prompt: 'What is the best contact name?', answer: 'Pat Tester' },
    { prompt: 'What is the best phone number?', answer: '5551234567' },
    { prompt: 'What is the best email address?', answer: 'pat@example.com' },
  ];

  for (const step of contactSteps) {
    const prompt = page.locator(`text=${step.prompt}`).first();
    await expect(prompt).toBeVisible({ timeout: 10000 });
    await sendMessage(page, step.answer);
  }
};

const answerContactOnly = async (page: Page) => {
  await page.waitForTimeout(300);
  await sendMessage(page, 'Casey Contact');
  await page.waitForTimeout(1500);
  await sendMessage(page, '5559876543');
  await page.waitForTimeout(1500);
  await sendMessage(page, 'casey@example.com');
};

const waitForPayload = async (page: Page, payloads: any[]) => {
  if (payloads.length) return payloads[0];

  const windowPayload = await page.evaluate(() => (window as any).__lastLeadPayload ?? null);
  if (windowPayload) return windowPayload;

  const timeoutMs = 12000;
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const windowPayloadLoop = await page.evaluate(() => (window as any).__lastLeadPayload ?? null);
    if (windowPayloadLoop) return windowPayloadLoop;
    const beacons: any[] = await page.evaluate(() => (window as any).__capturedBeacons || []);
    const withText = beacons.find(b => b.url?.includes('/api/estimate') && b.text);
    if (withText?.text) return JSON.parse(withText.text);
    await page.waitForTimeout(200);
  }

  return null;
};

test.beforeEach(async ({ page }) => {
  await page.addInitScript(patchSendBeacon);
  await page.route('**/api/gemini', route => route.fulfill({ status: 200, body: '{}' }));
});

test.describe('core services flows', () => {
  test('homepage is form-first (chat shell is not rendered)', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-testid="chat-shell"]')).toHaveCount(0);
    await expect(page.getByRole('heading', { name: /Fast Quote Form/i })).toBeVisible();
  });

  test('SEO assets are served', async ({ request }) => {
    const robots = await request.get('/robots.txt');
    expect(robots.status()).toBe(200);
    expect(await robots.text()).toContain('Sitemap:');

    const sitemap = await request.get('/sitemap.xml');
    expect(sitemap.status()).toBe(200);

    const favicon = await request.get('/favicon.ico');
    expect(favicon.status()).toBeLessThan(400);
  });

  test('support content routes are reachable', async ({ page }) => {
    const routes = [
      '/faq',
      '/about-us',
      '/best-practices',
      '/environmental-impact',
      '/instant-estimate',
    ];

    for (const route of routes) {
      await page.goto(route);
      await expect(page.locator('h1').first()).toBeVisible();
    }
  });

  test('key public pages expose only valid internal links', async ({ page, baseURL }) => {
    const seedRoutes = [
      '/',
      '/faq',
      '/about-us',
      '/best-practices',
      '/environmental-impact',
      '/instant-estimate',
      '/restaurant-waste-services',
      '/grease-trap-cleaning-los-angeles',
      '/used-cooking-oil-pickup-los-angeles',
      '/restroom-trailer-rentals-los-angeles',
      '/septic-holding-tank-pumping-los-angeles',
      '/hydro-jetting-los-angeles',
      '/compliance-audits-los-angeles',
      '/hood-cleaning-los-angeles',
      '/janitorial-services-los-angeles',
    ];

    const discovered = new Set<string>();

    for (const route of seedRoutes) {
      await page.goto(route);
      const hrefs = await page.locator('a[href]').evaluateAll((anchors, origin) => {
        return anchors
          .map(anchor => anchor.getAttribute('href') || '')
          .filter(href => href && !href.startsWith('#') && !href.startsWith('tel:') && !href.startsWith('mailto:'))
          .map(href => {
            try {
              const url = new URL(href, origin as string);
              return url.origin === origin ? `${url.pathname}${url.search}` : '';
            } catch {
              return '';
            }
          })
          .filter(Boolean);
      }, baseURL || 'http://127.0.0.1:4173');

      for (const href of hrefs) {
        discovered.add(href);
      }
    }

    for (const route of discovered) {
      const response = await page.goto(route);
      expect(response?.status() ?? 200).toBeLessThan(400);
      await expect(page.locator('body')).not.toContainText(/404|not found/i);
      await expect(page.locator('h1').first()).toBeVisible();
    }
  });

  test('all service landing routes are reachable', async ({ page }) => {
    const serviceRoutes = [
      '/grease-trap-cleaning-los-angeles',
      '/used-cooking-oil-pickup-los-angeles',
      '/restroom-trailer-rentals-los-angeles',
      '/septic-holding-tank-pumping-los-angeles',
      '/hydro-jetting-los-angeles',
      '/compliance-audits-los-angeles',
      '/hood-cleaning-los-angeles',
      '/janitorial-services-los-angeles',
    ];

    for (const route of serviceRoutes) {
      await page.goto(route);
      await expect(page.locator('h1').first()).toBeVisible();
    }
  });

  test('service landings expose dispatch CTA', async ({ page }) => {
    await page.goto('/hydro-jetting-los-angeles');
    await expect(page.getByRole('link', { name: 'Talk to Dispatch' })).toBeVisible();

    await page.goto('/hood-cleaning-los-angeles');
    await expect(page.getByRole('link', { name: 'Talk to Dispatch' })).toBeVisible();
  });

  test('service query preselects estimator context from deep link', async ({ page }) => {
    await page.goto('/?service=uco-recycling#estimator');

    await expect(page.locator('#estimator').getByText('UCO Recycling', { exact: false }).first()).toBeVisible({ timeout: 5000 });
    await expect(page.locator('#estimator textarea[placeholder*="Estimated gallons per week"]')).toBeVisible({ timeout: 5000 });
  });

  test('instant estimate route preselects service card context', async ({ page }) => {
    await page.goto('/instant-estimate?service=grease-trap-interceptor');

    await expect(page.getByText('Grease Trap / Interceptor Pumping', { exact: true })).toBeVisible();
    await expect(page.locator('input').first()).toBeVisible();
  });

  test('instant estimate quote flow validates fields and sends frequency + preferred contact', async ({ page }) => {
    const payloads: any[] = [];
    await page.route('**/api/geocode', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ verified: false }),
      });
    });
    await page.route('**/api/estimate', async route => {
      const bodyText = route.request().postData() || '{}';
      payloads.push(JSON.parse(bodyText));
      await route.fulfill({ status: 200, body: 'ok' });
    });

    await page.goto('/instant-estimate?service=grease-trap-interceptor');

    await page.getByRole('button', { name: 'Continue' }).click();
    await expect(page.getByText('Business name is required.', { exact: true })).toBeVisible();

    await page.locator('input[placeholder="Your business or property name"]').fill('Test Kitchen');
    await page.locator('input[placeholder="123 Main St"]').fill('123 Main St');
    await page.locator('input[placeholder="Los Angeles"]').fill('Sylmar');
    await page.locator('input[placeholder="CA"]').fill('CA');
    await page.locator('input[placeholder="90001"]').fill('90001');
    await page.locator('select[aria-label="System type"]').selectOption('Interceptor');
    await page.locator('select[aria-label="Capacity (gallons)"]').selectOption('1600');
    await page.locator('select[aria-label="Hose / parking distance"]').selectOption('100');
    await page.locator('select[aria-label="Service frequency"]').selectOption('Quarterly');

    await page.getByRole('button', { name: 'Continue' }).click();

    await page.locator('input[placeholder="Full name"]').fill('Pat Tester');
    await page.locator('input[placeholder="(818) 000-0000"]').fill('5551234567');
    await page.locator('input[placeholder="you@restaurant.com"]').fill('pat@example.com');
    await page.locator('select[aria-label="Preferred contact method"]').selectOption('phone');

    await page.getByRole('button', { name: 'Submit Request' }).click();
    await expect(page.getByText('Confirmation sent to pat@example.com', { exact: false })).toBeVisible({ timeout: 10000 });

    expect(payloads.length).toBeGreaterThan(0);
    const payload = payloads[0];
    expect(payload?.intake?.frequency).toBe('Quarterly');
    expect(payload?.contact?.preferred_contact).toBe('phone');
  });

  test('instant estimate contact-only flow uses service-specific prompt and validates contact format', async ({ page }) => {
    await page.goto('/instant-estimate?service=hydro-jetting');

    await expect(page.getByText('Describe the drain issue', { exact: true })).toBeVisible();
    await expect(page.getByText('Street address', { exact: true })).toHaveCount(0);

    await page.locator('input[placeholder="Your business or property name"]').fill('Drain Test Co');
    await page.locator('textarea').fill('Main kitchen drain backs up daily.');
    await page.getByRole('button', { name: 'Continue' }).click();

    await page.locator('input[placeholder="Full name"]').fill('Casey Contact');
    await page.locator('input[placeholder="(818) 000-0000"]').fill('123');
    await page.locator('input[placeholder="you@restaurant.com"]').fill('bad-email');
    await page.getByRole('button', { name: 'Submit Request' }).click();

    await expect(page.getByText('Enter a valid 10-digit US phone number.', { exact: true })).toBeVisible();
    await expect(page.getByText('Enter a valid email address.', { exact: true })).toBeVisible();
  });

  test('homepage grease-trap card preselects form and submits lead', async ({ page }) => {
    const payloads: any[] = [];
    await page.route('**/api/geocode', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ verified: false }),
      });
    });
    await page.route('**/api/estimate', async route => {
      const bodyText = route.request().postData() || '{}';
      payloads.push(JSON.parse(bodyText));
      await route.fulfill({ status: 200, body: 'ok' });
    });

    await page.goto('/');

    await page.locator('button[aria-label="Request Grease Trap / Interceptor Pumping"]').click();
    await expect(page.locator('#estimator').getByRole('heading', { name: 'Grease Trap / Interceptor Pumping' })).toBeVisible();

    await page.locator('input[placeholder="Your business or property name"]').fill('Main Kitchen LA');
    await page.locator('input[placeholder="123 Main St"]').fill('123 Main St');
    await page.locator('input[placeholder="Los Angeles"]').fill('Sylmar');
    await page.locator('input[placeholder="CA"]').fill('CA');
    await page.locator('input[placeholder="90001"]').fill('90001');
    await page.locator('select[aria-label="Hose / parking distance"]').selectOption('50');
    await page.getByRole('button', { name: 'Continue' }).click();

    await page.locator('input[placeholder="Full name"]').fill('Pat Tester');
    await page.locator('input[placeholder="(818) 000-0000"]').fill('5551234567');
    await page.locator('input[placeholder="you@restaurant.com"]').fill('pat@example.com');
    await page.getByRole('button', { name: 'Submit Request' }).click();

    await expect(page.getByText('Here is your estimate', { exact: false })).toBeVisible({ timeout: 10000 });
    expect(payloads.length).toBeGreaterThan(0);
    expect(payloads[0]?.meta?.service).toContain('Grease Trap / Interceptor Pumping');
  });

  test('homepage septic card starts contact-only form flow', async ({ page }) => {
    const payloads: any[] = [];
    await page.route('**/api/estimate', async route => {
      const bodyText = route.request().postData() || '{}';
      payloads.push(JSON.parse(bodyText));
      await route.fulfill({ status: 200, body: 'ok' });
    });

    await page.goto('/');
    await page.locator('button[aria-label="Request Septic / Holding Tank Pumping"]').click();
    await expect(page.getByText('Describe the system', { exact: true })).toBeVisible();

    await page.locator('input[placeholder="Your business or property name"]').fill('Septic Site');
    await page.locator('textarea').fill('Holding tank near loading dock.');
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.locator('input[placeholder="Full name"]').fill('Casey Contact');
    await page.locator('input[placeholder="(818) 000-0000"]').fill('5559876543');
    await page.locator('input[placeholder="you@restaurant.com"]').fill('casey@example.com');
    await page.getByRole('button', { name: 'Submit Request' }).click();

    await expect(page.getByText('Request captured', { exact: false })).toBeVisible({ timeout: 12000 });
    expect(payloads.length).toBeGreaterThan(0);
    expect(payloads[0]?.estimate?.manualQuote || payloads[0]?.estimate?.manual_quote).toBeTruthy();
  });

  test('header resource links navigate to real pages (no 404)', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: /Company/i }).first().hover();
    await page.locator('nav a[href="/faq"]').click();
    await expect(page).toHaveURL(/\/faq$/);
    await expect(page.locator('h1').first()).toBeVisible();

    await page.goto('/');
    await page.getByRole('button', { name: /Company/i }).first().hover();
    await page.locator('nav a[href="/about-us"]').click();
    await expect(page).toHaveURL(/\/about-us$/);
    await expect(page.locator('h1').first()).toBeVisible();

    await page.goto('/');
    await page.getByRole('button', { name: /Resources/i }).first().hover();
    await page.locator('nav a[href="/best-practices"]').click();
    await expect(page).toHaveURL(/\/best-practices$/);
    await expect(page.locator('h1').first()).toBeVisible();

    await page.goto('/');
    await page.getByRole('button', { name: /Resources/i }).first().hover();
    await page.locator('nav a[href="/environmental-impact"]').click();
    await expect(page).toHaveURL(/\/environmental-impact$/);
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('services dropdown links navigate to service landing pages', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: /Services/i }).first().hover();
    await page.locator('nav a[href="/hydro-jetting-los-angeles"]').click();
    await expect(page).toHaveURL(/\/hydro-jetting-los-angeles$/);
    await expect(page.locator('h1').first()).toBeVisible();

    await page.goto('/');
    await page.getByRole('button', { name: /Services/i }).first().hover();
    await page.locator('nav a[href="/janitorial-services-los-angeles"]').click();
    await expect(page).toHaveURL(/\/janitorial-services-los-angeles$/);
    await expect(page.locator('h1').first()).toBeVisible();
  });
});
