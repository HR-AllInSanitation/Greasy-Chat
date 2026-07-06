import { createServer } from 'node:http';
import { readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';
import puppeteerCore from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const SITEMAP_PATH = path.join(ROOT_DIR, 'public', 'sitemap.xml');
const SITE_URL = 'https://www.larestaurantservices.com';
const PORT = Number(process.env.PRERENDER_PORT || 4174);
const PREVIEW_ORIGIN = `http://127.0.0.1:${PORT}`;

const DEFERRED_ROUTES = new Set([
  '/instant-estimate',
]);

const contentTypeByExt = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const IS_VERCEL = Boolean(process.env.VERCEL);

const routeToOutputFile = (routePath) => {
  if (routePath === '/') return path.join(DIST_DIR, 'index.html');
  const safeRoute = routePath.startsWith('/') ? routePath.slice(1) : routePath;
  return path.join(DIST_DIR, safeRoute, 'index.html');
};

const getPathStats = async (filePath) => {
  try {
    return await stat(filePath);
  } catch {
    return null;
  }
};

const parseRoutesFromSitemap = async () => {
  const raw = await readFile(SITEMAP_PATH, 'utf8');
  const routes = new Set(['/']);
  const regex = /<loc>\s*([^<\s]+)\s*<\/loc>/g;
  let match;
  while ((match = regex.exec(raw)) !== null) {
    const value = match[1].trim();
    if (!value.startsWith(SITE_URL)) continue;
    const routePath = value.slice(SITE_URL.length) || '/';
    if (!routePath.startsWith('/')) continue;
    if (DEFERRED_ROUTES.has(routePath)) continue;
    routes.add(routePath);
  }
  return Array.from(routes);
};

const startStaticServer = () => {
  const server = createServer(async (req, res) => {
    try {
      const requestUrl = new URL(req.url || '/', PREVIEW_ORIGIN);
      const pathname = decodeURIComponent(requestUrl.pathname);
      const filePath = path.join(DIST_DIR, pathname);

      let targetPath = filePath;
      const asFileStats = await getPathStats(targetPath);
      if (asFileStats?.isDirectory()) {
        const asIndexPath = path.join(targetPath, 'index.html');
        const asIndexStats = await getPathStats(asIndexPath);
        targetPath = asIndexStats?.isFile() ? asIndexPath : path.join(DIST_DIR, 'index.html');
      } else if (!asFileStats?.isFile()) {
        const asIndexPath = path.join(filePath, 'index.html');
        const asIndexStats = await getPathStats(asIndexPath);
        if (asIndexStats?.isFile()) {
          targetPath = asIndexPath;
        } else {
          targetPath = path.join(DIST_DIR, 'index.html');
        }
      }

      const ext = path.extname(targetPath).toLowerCase();
      const contentType = contentTypeByExt[ext] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': contentType, 'Cache-Control': 'no-cache' });
      createReadStream(targetPath).pipe(res);
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(`Prerender static server error: ${error?.message || 'unknown error'}`);
    }
  });

  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(PORT, '127.0.0.1', () => resolve(server));
  });
};

const ensureBuilt = async () => {
  const indexPath = path.join(DIST_DIR, 'index.html');
  const stats = await getPathStats(indexPath);
  if (!stats?.isFile()) {
    throw new Error('dist/index.html not found. Run `npm run build` before prerendering.');
  }
};

const prerenderRoute = async (page, routePath) => {
  const url = `${PREVIEW_ORIGIN}${routePath}`;
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });

  await page.waitForFunction(
    (expectedPath) => {
      const canonical = document.querySelector('link[rel="canonical"]')?.getAttribute('href') || '';
      return document.readyState === 'complete' && canonical.includes(expectedPath);
    },
    { timeout: 10000 },
    routePath === '/' ? '/' : routePath,
  );

  await sleep(200);
  const html = await page.content();
  const outputFile = routeToOutputFile(routePath);
  await mkdir(path.dirname(outputFile), { recursive: true });
  await writeFile(outputFile, html, 'utf8');
  return outputFile;
};

const launchBrowser = async () => {
  if (IS_VERCEL) {
    const executablePath = await chromium.executablePath();
    return puppeteerCore.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath,
      headless: chromium.headless,
    });
  }

  return puppeteer.launch({ headless: true });
};

const run = async () => {
  await ensureBuilt();
  const routes = await parseRoutesFromSitemap();

  console.log(`Prerender: ${routes.length} route(s) from sitemap (deferred: ${Array.from(DEFERRED_ROUTES).join(', ') || 'none'})`);

  const server = await startStaticServer();
  const browser = await launchBrowser();

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1366, height: 900 });

    for (const routePath of routes) {
      const outPath = await prerenderRoute(page, routePath);
      console.log(`✓ ${routePath} -> ${path.relative(ROOT_DIR, outPath)}`);
    }
  } finally {
    await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }

  console.log('Prerender complete.');
};

run().catch((error) => {
  console.error(`Prerender failed: ${error?.message || error}`);
  process.exit(1);
});
