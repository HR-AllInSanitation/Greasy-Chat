import puppeteer from 'puppeteer';

(async () => {
  const base = process.env.BASE_URL || 'http://localhost:3002';
  const browser = await puppeteer.launch({ headless: false, slowMo: 50 });
  const page = await browser.newPage();
  await page.goto(base, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('input[type="text"]', { timeout: 60000 });

  async function dumpMessages(prefix) {
    const msgs = await page.evaluate(() => {
      const nodes = Array.from(document.querySelectorAll('.animate-in'));
      return nodes.map(n => {
        const p = n.querySelector('p');
        const role = n.classList.contains('justify-end') ? 'user' : 'model';
        return { role, text: p ? p.textContent && p.textContent.trim() : null };
      });
    });
    console.log(prefix, JSON.stringify(msgs, null, 2));
  }

  // Ensure clean session
  await page.evaluate(() => sessionStorage.clear());
  await page.reload({ waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 300));

  await dumpMessages('initial');

  // Send name+address
  const input = await page.$('input[type="text"]');
  await input.focus();
  await page.evaluate((t) => { const el = document.querySelector('input[type="text"]'); el.value = t; el.dispatchEvent(new Event('input', { bubbles: true })); }, 'Taco Bell 27800 McBean Pkwy Valencia, CA 91354');
  await page.keyboard.press('Enter');
  await new Promise(r => setTimeout(r, 500));
  await dumpMessages('after name+address');

  // Send system type
  await page.evaluate((t) => { const el = document.querySelector('input[type="text"]'); el.value = t; el.dispatchEvent(new Event('input', { bubbles: true })); }, 'Indoor Trap');
  await page.keyboard.press('Enter');
  await new Promise(r => setTimeout(r, 500));
  await dumpMessages('after system type');

  // Send gallons
  await page.evaluate((t) => { const el = document.querySelector('input[type="text"]'); el.value = t; el.dispatchEvent(new Event('input', { bubbles: true })); }, '50');
  await page.keyboard.press('Enter');
  await new Promise(r => setTimeout(r, 500));
  await dumpMessages('after gallons');

  // Send parking distance
  await page.evaluate((t) => { const el = document.querySelector('input[type="text"]'); el.value = t; el.dispatchEvent(new Event('input', { bubbles: true })); }, '50');
  await page.keyboard.press('Enter');
  await new Promise(r => setTimeout(r, 500));
  await dumpMessages('after parking distance');

  // Send contact info
  await page.evaluate((t) => { const el = document.querySelector('input[type="text"]'); el.value = t; el.dispatchEvent(new Event('input', { bubbles: true })); }, 'Roberto roberto@example.com 555-555-5555');
  await page.keyboard.press('Enter');
  await new Promise(r => setTimeout(r, 500));
  await dumpMessages('after contact info');

  await browser.close();
  process.exit(0);
})();