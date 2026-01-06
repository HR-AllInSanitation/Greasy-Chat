import puppeteer from 'puppeteer';

(async () => {
  const results = [];
  const browser = await puppeteer.launch({ headless: false, slowMo: 50 });
  const page = await browser.newPage();

  // Determine base URL from environment or fallbacks
  const candidates = [process.env.BASE_URL, 'http://localhost:3001', 'http://localhost:3000', 'http://localhost:5173'].filter(Boolean);
  let baseUrl = null;
  for (const url of candidates) {
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
      baseUrl = url;
      console.log('Opened', url);
      break;
    } catch (e) {
      // try next
    }
  }
  if (!baseUrl) throw new Error('Could not open any candidate base URLs: ' + candidates.join(', '));

  // Wait for chat input to be available (stable DOM readiness). Use a general text input selector to avoid depending on placeholder text.
  await page.waitForSelector('input[type="text"]', { timeout: 60000 });


  // Utility: get last assistant (model) message text
  async function getLastModelText() {
    return await page.evaluate(() => {
      // model messages are rendered with 'justify-start'
      const ps = Array.from(document.querySelectorAll('.justify-start p'))
        .map(p => p.textContent && p.textContent.trim())
        .filter(Boolean);
      return ps.length ? ps[ps.length - 1] : '';
    });
  }

  // Diagnostic: get the full message list with role
  async function getAllMessages() {
    return await page.evaluate(() => {
      const nodes = Array.from(document.querySelectorAll('.animate-in'));
      return nodes.map(n => {
        const p = n.querySelector('p');
        if (!p) return null;
        const role = n.classList.contains('justify-end') ? 'user' : 'model';
        return { role, text: p.textContent && p.textContent.trim() };
      }).filter(Boolean);
    });
  }

  // Utility: check for presence of suggestion chips exactly matching the required set
  async function getChipLabels() {
    return await page.evaluate(() => {
      return Array.from(document.querySelectorAll('button'))
        .map(b => b.textContent && b.textContent.trim())
        .filter(Boolean);
    });
  }

  // Helper to clear storage and reload for fresh session
  async function freshLoad() {
    await page.evaluate(() => sessionStorage.clear());
    await page.reload({ waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 300)); // allow initial render
  }

  // Helper to send a message and wait for a new assistant message
  async function sendMessageAndAwaitReply(text) {
    const before = await page.evaluate(() => Array.from(document.querySelectorAll('p')).map(p => p.textContent && p.textContent.trim()).filter(Boolean).length);
    const inputSelector = 'input[type="text"]';
    await page.waitForSelector(inputSelector, { timeout: 2000 });
    await page.focus(inputSelector);
    await page.evaluate((t) => { const el = document.querySelector('input[type="text"]'); el.value = t; el.dispatchEvent(new Event('input', { bubbles: true })); }, text);
    await page.keyboard.press('Enter');
    // wait for p count to increase or for some timeout
    let attempts = 0;
    while (attempts < 30) {
      const now = await page.evaluate(() => Array.from(document.querySelectorAll('p')).map(p => p.textContent && p.textContent.trim()).filter(Boolean).length);
      if (now > before) break;
      attempts++;
      await new Promise(r => setTimeout(r, 200));
    }
    await new Promise(r => setTimeout(r, 300));
    return await getLastModelText();
  }

  // Test 1: Refresh -> type 'hello' -> expect greeting + ask business name & address; NO chips
  await freshLoad();
  // initial message (model) on load
  const initialMsg = await getLastModelText();
  const helloReply = await sendMessageAndAwaitReply('hello');
  const allButtons1 = await getChipLabels();
  const hasChips1 = ['50','100','150','200','Unsure'].some(c => allButtons1.includes(c));
  results.push({ test: 'Refresh + type "hello"', initialMessage: initialMsg, assistantReply: helloReply, chipsPresent: hasChips1 });

  // Test 2: Paste address only -> expect exact: "Thanks — what’s the business name?"
  await freshLoad();
  const addr = '27800 McBean Pkwy Valencia, CA 91354';
  const addrReply = await sendMessageAndAwaitReply(addr);
  results.push({ test: 'Paste address only', input: addr, assistantReply: addrReply });

  // Test 3: Paste name only -> expect exact: "Got it — what’s the address?"
  await freshLoad();
  const name = 'Taco Bell';
  const nameReply = await sendMessageAndAwaitReply(name);
  results.push({ test: 'Paste name only', input: name, assistantReply: nameReply });

  // Test 4: Chips appear ONLY at parking distance step
  // Try to drive the flow: send combined name+address, then a system type, then a gallons input; afterwards check for chips
  await freshLoad();
  const combo = 'Taco Bell 27800 McBean Pkwy Valencia, CA 91354';
  const comboReply = await sendMessageAndAwaitReply(combo);
  // attempt basic sequenced replies - may require AI support; we send system type and gallons
  const step2Reply = await sendMessageAndAwaitReply('Indoor Trap');
  const step3Reply = await sendMessageAndAwaitReply('50');
  const allButtons4 = await getChipLabels();
  const chipsAtParking = ['50','100','150','200','Unsure'].every(c => allButtons4.includes(c));
  results.push({ test: 'Chips at parking distance step', comboReply, step2Reply, step3Reply, chips: allButtons4, chipsMatch: chipsAtParking });

  // Complete the full flow: send parking distance, then contact info, then confirmation
  const parkingReply = await sendMessageAndAwaitReply('50');
  results.push({ test: 'Provide parking distance', input: '50', assistantReply: parkingReply });

  const contactReply = await sendMessageAndAwaitReply('Roberto roberto@example.com 555-555-5555');
  results.push({ test: 'Provide contact info', input: 'Roberto roberto@example.com 555-555-5555', assistantReply: contactReply });

  const confirmReply = await sendMessageAndAwaitReply('yes');
  results.push({ test: 'Confirm quote', input: 'yes', assistantReply: confirmReply });

  console.log(JSON.stringify(results, null, 2));

  await browser.close();
})();
