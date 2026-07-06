#!/usr/bin/env node
import { readFile } from 'node:fs/promises';

const INDEXNOW_ENDPOINT = process.env.INDEXNOW_ENDPOINT || 'https://api.indexnow.org/indexnow';
const SITE_ORIGIN = (process.env.SITE_ORIGIN || process.env.VITE_SITE_URL || '').replace(/\/$/, '');
const KEY = process.env.INDEXNOW_KEY || '891709ac5542488e8e52426bc1c5c58a';
const KEY_FILE_PATH = process.env.INDEXNOW_KEY_FILE_PATH || `/${KEY}.txt`;
const SITEMAP_PATH = process.env.SITEMAP_PATH || './public/sitemap.xml';
const DRY_RUN = process.argv.includes('--dry-run');

function parseSitemapUrls(xml) {
  const matches = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)];
  const urls = matches.map((match) => match[1]?.trim()).filter(Boolean);

  return [...new Set(urls)];
}

function getOrigin(url) {
  return new URL(url).origin;
}

async function main() {
  const xml = await readFile(SITEMAP_PATH, 'utf8');
  const allUrls = parseSitemapUrls(xml);

  if (allUrls.length === 0) {
    throw new Error(`No URLs found in ${SITEMAP_PATH}`);
  }

  const resolvedOrigin = SITE_ORIGIN || getOrigin(allUrls[0]);
  const keyLocation = `${resolvedOrigin}${KEY_FILE_PATH}`;
  const urlList = allUrls.filter((url) => getOrigin(url) === resolvedOrigin);

  if (urlList.length === 0) {
    throw new Error(`No URLs found for host ${resolvedOrigin} in ${SITEMAP_PATH}`);
  }

  const payload = {
    host: new URL(resolvedOrigin).host,
    key: KEY,
    keyLocation,
    urlList,
  };

  if (DRY_RUN) {
    console.log('[IndexNow dry-run] Payload preview:');
    console.log(JSON.stringify(payload, null, 2));
    return;
  }

  const response = await fetch(INDEXNOW_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(payload),
  });

  const responseText = await response.text();
  console.log(`IndexNow response: ${response.status} ${response.statusText}`);
  if (responseText) {
    console.log(responseText);
  }

  if (!response.ok) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error('[IndexNow] Failed to submit URLs.');
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
