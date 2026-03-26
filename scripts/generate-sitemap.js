import fs from 'fs';

const BASE_URL = 'https://myaarohan.com';
const ARTICLES_API_BASE = process.env.SITEMAP_API_BASE_URL || process.env.VITE_API_BASE_URL || 'https://aarohan-iota.vercel.app';
const today = new Date().toISOString().split('T')[0];

const staticPages = [
  { loc: '/', changefreq: 'weekly', priority: '1.0' },
  { loc: '/articles', changefreq: 'weekly', priority: '0.8' },
  { loc: '/career-explorer', changefreq: 'monthly', priority: '0.8' },
  { loc: '/student-login', changefreq: 'monthly', priority: '0.6' },
  { loc: '/counselor-login', changefreq: 'monthly', priority: '0.6' }
];

function normalizeDate(value) {
  if (!value) return today;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return today;
  return parsed.toISOString().split('T')[0];
}

async function fetchArticlesFromBackend() {
  const response = await fetch(`${ARTICLES_API_BASE}/articles?page=1&limit=500&includeContent=false`);
  if (!response.ok) {
    throw new Error(`Article API request failed: ${response.status}`);
  }

  const payload = await response.json();
  return Array.isArray(payload.data) ? payload.data : [];
}

function fetchArticlesFromPublicFallback() {
  try {
    const indexPath = './public/articles/index.json';
    const files = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
    if (!Array.isArray(files)) return [];

    return files
      .map((fileName) => {
        const article = JSON.parse(fs.readFileSync(`./public/articles/${fileName}`, 'utf-8'));
        return {
          slug: article.slug,
          publishedAt: article.publishedAt || article.date,
          updatedAt: article.lastModifiedAt || article.updatedAt || article.date
        };
      })
      .filter((article) => Boolean(article.slug));
  } catch {
    return [];
  }
}

async function generateSitemap() {
  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  for (const page of staticPages) {
    sitemap += `
  <url>
    <loc>${BASE_URL}${page.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
  }

  let articles = [];
  try {
    articles = await fetchArticlesFromBackend();
  } catch (error) {
    console.warn(`Could not load articles from backend (${ARTICLES_API_BASE}/articles): ${error.message}`);
  }

  if (!articles.length) {
    articles = fetchArticlesFromPublicFallback();
  }

  for (const article of articles) {
    if (!article?.slug) continue;

    const lastmod = normalizeDate(article.lastModifiedAt || article.updatedAt || article.publishedAt || article.date);

    sitemap += `
  <url>
    <loc>${BASE_URL}/articles/${article.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
  }

  sitemap += '\n</urlset>';

  fs.writeFileSync('./public/sitemap.xml', sitemap);
  console.log('Sitemap generated at public/sitemap.xml');
}

generateSitemap().catch((error) => {
  console.error('Failed to generate sitemap:', error);
  process.exitCode = 1;
});
