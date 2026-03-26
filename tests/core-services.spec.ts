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
  test('CTA hides when phone is invalid', async ({ page }) => {
    await page.goto('/');

    await page.evaluate(() => {
      (window as any).__APP_CONFIG__ = { VITE_OFFICE_PHONE: 'abc' };
    });

    await page.getByText('Septic / Holding Tank Pumping', { exact: true }).click();

    await page.evaluate(() => {
      (window as any).__setContactState?.({
        contact_name: 'No Phone',
        contact_phone: '5551112222',
        contact_email: 'nofone@example.com',
      });
      (window as any).__triggerLeadSend?.();
    });

    await expect(page.getByRole('link', { name: /Call\/Text/i })).toHaveCount(0);
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

  test('service query preselects estimator context from deep link', async ({ page }) => {
    await page.goto('/?service=uco-recycling#estimator');

    await expect(page.getByText('UCO Recycling', { exact: false })).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('What is the best contact name?', { exact: true })).toBeVisible({ timeout: 5000 });
  });

  test('instant estimate route preselects service card context', async ({ page }) => {
    await page.goto('/instant-estimate?service=grease-trap-interceptor');

    await expect(page.getByText('Grease Trap / Interceptor Pumping', { exact: true })).toBeVisible();
    await expect(page.locator('input').first()).toBeVisible();
  });

  test('Grease Trap / Interceptor Pumping glows and runs intake with estimate summary', async ({ page }) => {
    const payloads: any[] = [];
    await page.route('**/api/estimate', async route => {
      const bodyText = route.request().postData() || '{}';
      let parsed: any = null;
      try {
        parsed = JSON.parse(bodyText);
      } catch {
        parsed = null;
      }
      payloads.push(parsed);
      await route.fulfill({ status: 200, body: 'ok' });
    });

    await page.goto('/');

    const chatShell = page.locator('[data-testid="chat-shell"]');

    await page.getByText('Grease Trap / Interceptor Pumping', { exact: true }).click();

    await expect(chatShell).toHaveAttribute('data-glowing', '1', { timeout: 800 });
    await expect(chatShell).toHaveAttribute('data-glowing', '0', { timeout: 2000 });

    const firstQuestion = page.locator('text=What is your business name?').first();
    await expect(firstQuestion).toBeVisible();

    await answerIntakeAndContact(page);

    await expect(page.getByText('Estimated total:', { exact: false })).toBeVisible({ timeout: 8000 });
    await expect(page.getByRole('button', { name: 'Yes, move forward' })).toBeVisible({ timeout: 8000 });

    const payload = await waitForPayload(page, payloads);
    expect(payload).not.toBeNull();
    expect(payload?.meta?.source).toBe('core-services');
    expect(payload?.meta?.service).toBe('Grease Trap / Interceptor Pumping');
  });

  test('Septic / Holding Tank Pumping is contact-only with manual quote lead', async ({ page }) => {
    const payloads: any[] = [];
    await page.route('**/api/estimate', async route => {
      const bodyText = route.request().postData() || '{}';
      let parsed: any = null;
      try {
        parsed = JSON.parse(bodyText);
      } catch {
        parsed = null;
      }
      payloads.push(parsed);
      await route.fulfill({ status: 200, body: 'ok' });
    });

    await page.goto('/');
    await page.getByText('Septic / Holding Tank Pumping', { exact: true }).click();

    await expect(page.getByText('ESTIMATE SUMMARY')).toHaveCount(0);

    await page.evaluate(() => {
      (window as any).__setContactState?.({
        contact_name: 'Casey Contact',
        contact_phone: '5559876543',
        contact_email: 'casey@example.com',
      });
      (window as any).__triggerLeadSend?.();
    });

    const payload = await waitForPayload(page, payloads);
    expect(payload).not.toBeNull();
    await expect(page.getByText('request received', { exact: false })).toBeVisible({ timeout: 12000 });
    await expect(page.getByRole('link', { name: /Call\/Text/i })).toBeVisible({ timeout: 12000 });
    expect(payload?.meta?.source).toBe('core-services');
    expect(payload?.meta?.service).toBe('Septic / Holding Tank Pumping');
    expect(payload?.estimate?.manualQuote || payload?.estimate?.manual_quote).toBeTruthy();
  });

  test('Main Sewer Line Jetting / Hydro Jetting is contact-only with manual quote lead', async ({ page }) => {
    const payloads: any[] = [];
    await page.route('**/api/estimate', async route => {
      const bodyText = route.request().postData() || '{}';
      let parsed: any = null;
      try {
        parsed = JSON.parse(bodyText);
      } catch {
        parsed = null;
      }
      payloads.push(parsed);
      await route.fulfill({ status: 200, body: 'ok' });
    });

    await page.goto('/');
    await page.getByText('Main Sewer Line Jetting / Hydro Jetting', { exact: true }).click();

    await expect(page.getByText('ESTIMATE SUMMARY')).toHaveCount(0);

    await page.evaluate(() => {
      (window as any).__setContactState?.({
        contact_name: 'Casey Contact',
        contact_phone: '5559876543',
        contact_email: 'casey@example.com',
      });
      (window as any).__triggerLeadSend?.();
    });

    const payload = await waitForPayload(page, payloads);
    expect(payload).not.toBeNull();
    await expect(page.getByText('request received', { exact: false })).toBeVisible({ timeout: 12000 });
    expect(payload?.meta?.source).toBe('core-services');
    expect(payload?.meta?.service).toBe('Main Sewer Line Jetting / Hydro Jetting');
    expect(payload?.estimate?.manualQuote || payload?.estimate?.manual_quote).toBeTruthy();
  });

  test('Repeated core-service clicks do not spam interest messages', async ({ page }) => {
    await page.goto('/');
    const label = 'Septic / Holding Tank Pumping';

    await page.getByText(label, { exact: true }).click();
    await page.waitForTimeout(150);
    await page.getByText(label, { exact: true }).click();

    const interest = page.locator(`text=interested in "${label}"`);
    await expect(interest).toHaveCount(1);
    const updated = page.locator(`text=Updated — noted request for "${label}".`);
    await expect(updated).toHaveCount(0);
  });
});
