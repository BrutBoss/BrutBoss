import { Actor, log } from 'apify';
import { PlaywrightCrawler } from 'crawlee';
import Apify from 'apify';
import { scrapeGoogleJobs } from './extractors/googleJobs.js';
import { scrapeIndeed } from './extractors/indeedJobs.js';
import { hashJob } from './utils/dedupe.js';
import { REQUIRED_FIELDS } from './config.js';

const { Actor, log } = Apify;

await Actor.init();
const input = await Actor.getInput();
const dataset = await Actor.openDataset();

const {
  searchQueries = [],
  location,
  maxResults = 100,
  rateLimitRpm = 30,
  sources = ['google', 'indeed']
} = input || {};

const seen = new Set();
const stats = { saved: 0, duplicates: 0, errors: 0 };

const requests = [];
const googleUrl = (query) =>
  `https://www.google.com/search?q=${encodeURIComponent(`${query} jobs in ${location}`)}`;
const indeedUrl = (query) =>
  `https://www.indeed.com/jobs?q=${encodeURIComponent(query)}&l=${encodeURIComponent(location)}`;

for (const query of searchQueries) {
  if (sources.includes('google')) {
    requests.push({ url: googleUrl(query), userData: { source: 'google', query } });
  }
  if (sources.includes('indeed')) {
    requests.push({ url: indeedUrl(query), userData: { source: 'indeed', query } });
  }
}

const crawler = new PlaywrightCrawler({
  proxyConfiguration: input?.proxy ? await Actor.createProxyConfiguration() : null,
  useSessionPool: true,
  maxConcurrency: 1,
  launchContext: { useChrome: true },
  requestHandler: async ({ request, page }) => {
    const { source, query } = request.userData;

    try {
      let jobs = [];

      if (source === 'google') {
        jobs = await scrapeGoogleJobs({
const crawler = await Actor.createPlaywrightCrawler({
  proxyConfiguration: input?.proxy ? await Actor.createProxyConfiguration() : null,
  useSessionPool: true,
  maxConcurrency: 1,
  launchContext: { useChrome: true }
});

const seen = new Set();
const stats = { saved: 0, duplicates: 0, errors: 0 };

for (const query of searchQueries) {
  const page = await crawler.browserPool.newPage();

  try {
    let jobs = [];

    if (sources.includes('google')) {
      jobs.push(
        ...await scrapeGoogleJobs({
          page,
          query,
          location,
          maxResults,
          rpm: rateLimitRpm
        });
      } else if (source === 'indeed') {
        jobs = await scrapeIndeed({ page, query, location, maxResults });
      }

      for (const job of jobs) {
        if (!REQUIRED_FIELDS.every((field) => job[field])) continue;

        const hash = hashJob(job);
        if (seen.has(hash)) {
          stats.duplicates++;
          continue;
        }

        seen.add(hash);
        await dataset.pushData(job);
        stats.saved++;
      }
    } catch (e) {
      stats.errors++;
      log.exception(e, `Failed to process ${source} query "${query}".`);
    }
  }
});

await crawler.run(requests);
        })
      );
    }
    if (sources.includes('indeed')) {
      jobs.push(...await scrapeIndeed({ page, query, location, maxResults }));
    }

    for (const job of jobs) {
      if (!REQUIRED_FIELDS.every((field) => job[field])) continue;

      const hash = hashJob(job);
      if (seen.has(hash)) {
        stats.duplicates++;
        continue;
      }

      seen.add(hash);
      await dataset.pushData(job);
      stats.saved++;
    }
  } catch (e) {
    stats.errors++;
    log.exception(e);
  } finally {
    await page.close();
  }
}

await dataset.pushData({ _runStats: stats });
await Actor.exit();
