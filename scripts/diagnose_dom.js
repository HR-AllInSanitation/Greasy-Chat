import puppeteer from 'puppeteer';

(async () => {
  const url = process.env.BASE_URL || 'http://localhost:3001';
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  console.log('Opening', url);
  const consoleMsgs = [];
  page.on('console', m => consoleMsgs.push({ type: m.type(), text: m.text() }));
  const pageErrors = [];
  page.on('pageerror', e => pageErrors.push(String(e)));
  const failedRequests = [];
  page.on('requestfailed', req => failedRequests.push({ url: req.url(), method: req.method(), failureText: req.failure()?.errorText }));
  const responses = [];
  page.on('requestfinished', async req => {
    try {
      const r = req.response();
      if (r) {
        responses.push({ url: r.url(), status: r.status(), statusText: r.statusText() });
      }
    } catch (e) {}
  });

  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await new Promise(r => setTimeout(r, 1000));
  const bodyText = await page.evaluate(() => document.body ? document.body.innerText.slice(0, 4000) : 'NO BODY');
  const scriptSrcs = await page.evaluate(() => Array.from(document.querySelectorAll('script')).map(s => ({ type: s.type, src: s.src, inner: s.innerText ? s.innerText.slice(0,200) : '' })));
  const moduleScripts = await page.evaluate(() => Array.from(document.querySelectorAll('script[type="module"]')).map(s => s.src));
  const rootInnerHTML = await page.evaluate(() => document.getElementById('root') ? document.getElementById('root').innerHTML : null);
  const hasReactHook = await page.evaluate(() => Boolean(window.$RefreshReg$));
  console.log('CONSOLE MSGS:', JSON.stringify(consoleMsgs, null, 2));
  console.log('PAGE ERRORS:', JSON.stringify(pageErrors, null, 2));
  console.log('REQUEST FAILURES:', JSON.stringify(failedRequests, null, 2));
  console.log('RESPONSES (sample):', JSON.stringify(responses.slice(-20), null, 2));
  console.log('SCRIPTS:', JSON.stringify(scriptSrcs, null, 2));
  console.log('MODULE SCRIPTS:', JSON.stringify(moduleScripts, null, 2));
  console.log('ROOT INNER HTML LENGTH:', rootInnerHTML ? rootInnerHTML.length : 0);
  console.log('HAS REACT HOOK:', hasReactHook);
  const inputs = await page.evaluate(() => Array.from(document.querySelectorAll('input')).map(i => ({ type: i.type, placeholder: i.getAttribute('placeholder'), disabled: i.disabled })));
  const buttons = await page.evaluate(() => Array.from(document.querySelectorAll('button')).map(b => b.textContent && b.textContent.trim()).filter(Boolean));
  const divCount = await page.evaluate(() => document.querySelectorAll('div').length);
  console.log('BODY SNIPPET:\n', bodyText);
  console.log('INPUTS:', inputs);
  console.log('BUTTONS SAMPLE:', buttons.slice(0,10));
  console.log('DIV COUNT:', divCount);
  await browser.close();
})();