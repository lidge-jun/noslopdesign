// Render above-the-fold thumbnails for docs/compare from the published copies.
//   PLAYWRIGHT=/path/to/playwright node scripts/compare-thumbs.cjs http://127.0.0.1:8765/compare/
const { chromium } = require(process.env.PLAYWRIGHT || 'playwright');
const { readdirSync, mkdirSync } = require('node:fs');
const { join } = require('node:path');
(async () => {
  const base = process.argv[2];
  const root = join(__dirname, '..', 'docs', 'compare');
  mkdirSync(join(root, 'thumbs'), { recursive: true });
  const b = await chromium.launch();
  for (const cond of readdirSync(join(root, 'sites'))) for (const slug of readdirSync(join(root, 'sites', cond))) {
    for (const [w, h, dsf] of [[1440, 900, 0.5], [390, 844, 0.62]]) {
      const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: dsf, reducedMotion: 'reduce' });
      await p.goto(base + 'sites/' + cond + '/' + slug + '/', { waitUntil: 'networkidle' }).catch(() => {});
      await p.waitForTimeout(600);
      await p.screenshot({ path: join(root, 'thumbs', cond + '-' + slug + '-' + w + '.jpg'), type: 'jpeg', quality: 74 });
      await p.close();
    }
    console.log('thumbs', cond, slug);
  }
  await b.close();
})();
