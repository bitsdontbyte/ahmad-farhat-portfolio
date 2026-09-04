const http = require('http');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const root = __dirname;
const mime = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.txt': 'text/plain; charset=utf-8',
};

const server = http.createServer((request, response) => {
  const relative = request.url === '/' ? 'index.html' : decodeURIComponent(request.url.split('?')[0]).replace(/^\/+/, '');
  const target = path.resolve(root, relative);
  if (!target.startsWith(path.resolve(root)) || !fs.existsSync(target)) {
    response.writeHead(404);
    response.end('Not found');
    return;
  }
  response.writeHead(200, { 'Content-Type': mime[path.extname(target)] || 'application/octet-stream' });
  fs.createReadStream(target).pipe(response);
});

(async () => {
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  const browser = await puppeteer.launch({ headless: true, timeout: 120000, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  page.setDefaultTimeout(120000);
  const errors = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`console: ${message.text()}`);
  });
  page.on('pageerror', (error) => errors.push(`page: ${error.message}`));

  await page.setViewport({ width: 1440, height: 950, deviceScaleFactor: 1 });
  await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'networkidle0', timeout: 60000 });

  const checks = await page.evaluate(() => {
    const localAnchors = [...document.querySelectorAll('a[href^="#"]')];
    const brokenAnchors = localAnchors.map((link) => link.getAttribute('href')).filter((href) => href !== '#' && !document.querySelector(href));
    const cards = [...document.querySelectorAll('.project-card')];
    return {
      title: document.title,
      projectCards: cards.length,
      thumbnails: cards.filter((card) => card.querySelector('.card-thumb')).length,
      compactCardHeadings: cards.filter((card) => !card.classList.contains('research-analytics-card')).every((card) => parseFloat(getComputedStyle(card.querySelector('h3')).fontSize) <= 20),
      featuredCardReadable: parseFloat(getComputedStyle(document.querySelector('.research-analytics-card h3')).fontSize) >= 23 && parseFloat(getComputedStyle(document.querySelector('.research-analytics-card .card-summary')).fontSize) >= 15,
      robotsMeta: document.querySelector('meta[name="robots"]')?.content || '',
      oxfordImage: document.querySelector('.public-health [data-lightbox="assets/oxford.webp"]') !== null,
      oxfordSection: document.querySelector('#oxcovid + .project-list .public-health') !== null,
      oxfordNavigation: document.querySelector('.site-nav a[href="#oxcovid"]') !== null,
      oxfordPublicationFraming: document.querySelector('.public-health .card-kicker').textContent.includes('Nature Portfolio') && document.querySelector('.public-health').textContent.includes('Paper scope and achievement') && !document.querySelector('.public-health').textContent.includes('Verified contribution'),
      researchAnalyticsExpandable: document.querySelector('.governance [data-lightbox="assets/research_analytics_card.webp"]') !== null,
      researchArchitectureCoverage: ['Governed source capture', 'Conservative identity resolution', 'Normalized research graph', 'Protected institutional model', 'Reviewable ML matching', 'Operational analytics'].every((term) => document.querySelector('.research-analytics-thumb').closest('.project-card').textContent.includes(term)),
      researchArchitectureCurrent: ['17 CLI commands', '89 SQL migrations', '12 protected API domains'].every((term) => document.querySelector('.research-analytics-thumb').closest('.project-card').textContent.includes(term)),
      researchAnalyticsDemoLabel: [...document.querySelectorAll('.governance .card-actions a')].some((link) => link.textContent.includes('Live demo')),
      researchAnalyticsSourceRemoved: document.querySelector('.research-analytics-thumb').closest('.project-card').querySelectorAll('.card-actions a').length === 1,
      dublinProjectTitle: [...document.querySelectorAll('.archives h3')].some((heading) => heading.textContent.includes('Dublin 18th-Century Wide Streets Commission Transcription Project')),
      projectDividers: document.querySelectorAll('.project-divider').length,
      expandedAiSkills: ['RAG', 'LangGraph', 'Classification', 'Clustering', 'Anomaly detection', 'Sentence Transformers', 'Embeddings', 'Model deployment'].every((skill) => document.querySelector('.skills-panel').innerText.includes(skill)),
      dimensionalSkills: document.querySelector('.skills-panel').innerText.includes('Star schema') && document.querySelector('.skills-panel').innerText.includes('Fact & dimension tables') && document.querySelector('.skills-panel').innerText.includes('Data warehousing'),
      removedPhrases: ['Live land-intelligence demo', 'Data · GIS · AI systems', 'Data engineer · ML practitioner · researcher', 'Remote collaboration', 'Data systems with evidence behind every result.'].filter((phrase) => document.body.innerText.includes(phrase)),
      brokenAnchors,
    };
  });

  await page.click('.project-card details summary');
  const detailsOpen = await page.$eval('.project-card details', (element) => element.open);
  await page.click('.project-card details summary');
  await page.click('[data-lightbox]');
  const lightboxOpen = await page.$eval('#lightbox', (element) => element.classList.contains('is-open'));
  await page.keyboard.press('Escape');
  await page.$eval('.site-header', (element) => { element.style.position = 'static'; });
  const researchCard = await page.$('.research-analytics-card');
  await researchCard.screenshot({ path: path.join(root, 'preview-research-card.png') });
  await page.$eval('.site-header', (element) => { element.style.removeProperty('position'); });
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 700) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 80));
    }
    window.scrollTo(0, 0);
  });
  await page.screenshot({ path: path.join(root, 'preview-desktop.png'), fullPage: true });

  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
  await page.reload({ waitUntil: 'networkidle0', timeout: 60000 });
  await page.click('.menu-button');
  const mobileMenuOpen = await page.$eval('.site-nav', (element) => element.classList.contains('is-open'));
  await page.click('.menu-button');
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 600) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 80));
    }
    window.scrollTo(0, 0);
  });
  await page.screenshot({ path: path.join(root, 'preview-mobile.png'), fullPage: true });

  await browser.close();
  server.close();

  const result = { ...checks, detailsOpen, lightboxOpen, mobileMenuOpen, errors };
  const robotsText = fs.readFileSync(path.join(root, 'robots.txt'), 'utf8');
  result.robotsDisallowAll = /Disallow:\s*\//i.test(robotsText);
  console.log(JSON.stringify(result, null, 2));
  if (checks.projectCards !== 8 || checks.thumbnails !== 8 || !checks.compactCardHeadings || !checks.featuredCardReadable || !checks.robotsMeta.includes('noindex') || !checks.oxfordImage || !checks.oxfordSection || !checks.oxfordNavigation || !checks.oxfordPublicationFraming || !checks.researchAnalyticsExpandable || !checks.researchArchitectureCoverage || !checks.researchArchitectureCurrent || !checks.researchAnalyticsDemoLabel || !checks.researchAnalyticsSourceRemoved || !checks.dublinProjectTitle || checks.projectDividers !== 4 || !checks.expandedAiSkills || !checks.dimensionalSkills || checks.removedPhrases.length || checks.brokenAnchors.length || !detailsOpen || !lightboxOpen || !mobileMenuOpen || errors.length || !result.robotsDisallowAll) process.exitCode = 1;
})().catch((error) => {
  server.close();
  console.error(error);
  process.exitCode = 1;
});
