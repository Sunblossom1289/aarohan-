/* eslint-disable no-console */
require('dotenv').config();

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const connectDB = require('../config/db');
const Article = require('../models/Article');

const SOURCE_DIR = path.resolve(__dirname, '../../public/articles');
const INDEX_FILE = path.join(SOURCE_DIR, 'index.json');

function slugify(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function parseDate(rawDate) {
  if (!rawDate) return new Date();
  const parsed = new Date(rawDate);
  if (!Number.isNaN(parsed.getTime())) return parsed;
  return new Date();
}

function normalizeKeywords(metadataKeywords, article) {
  const fromMetadata = Array.isArray(metadataKeywords) ? metadataKeywords : [];
  const derived = [
    article.category,
    article.author,
    ...String(article.title || '')
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((word) => word.length > 4)
      .slice(0, 10)
  ];

  return [...new Set([...fromMetadata, ...derived].map((entry) => String(entry || '').trim().toLowerCase()).filter(Boolean))];
}

function buildMetadata(article, slug) {
  const existingMetadata = article.metadata || {};
  const title = article.title || '';
  const description = existingMetadata.metaDescription || article.excerpt || '';
  const image = article.image || existingMetadata.ogImage || existingMetadata.twitterImage || '';

  return {
    metaTitle: existingMetadata.metaTitle || title,
    metaDescription: description,
    keywords: normalizeKeywords(existingMetadata.keywords, article),
    canonicalUrl: existingMetadata.canonicalUrl || `https://myaarohan.com/articles/${slug}`,
    ogTitle: existingMetadata.ogTitle || title,
    ogDescription: existingMetadata.ogDescription || description,
    ogImage: existingMetadata.ogImage || image,
    ogType: existingMetadata.ogType || 'article',
    twitterCard: existingMetadata.twitterCard || 'summary_large_image',
    twitterTitle: existingMetadata.twitterTitle || title,
    twitterDescription: existingMetadata.twitterDescription || description,
    twitterImage: existingMetadata.twitterImage || image,
    articleSection: existingMetadata.articleSection || article.category || '',
    locale: existingMetadata.locale || 'en_IN'
  };
}

async function run() {
  if (!fs.existsSync(INDEX_FILE)) {
    throw new Error(`Missing article index file: ${INDEX_FILE}`);
  }

  const articleFiles = JSON.parse(fs.readFileSync(INDEX_FILE, 'utf-8'));
  if (!Array.isArray(articleFiles) || articleFiles.length === 0) {
    throw new Error('No article files found in public/articles/index.json');
  }

  await connectDB();

  const seenSlugs = new Set();
  let upserted = 0;
  let skipped = 0;

  for (const articleFile of articleFiles) {
    const articlePath = path.join(SOURCE_DIR, articleFile);
    if (!fs.existsSync(articlePath)) {
      console.warn(`Skipping missing article file: ${articleFile}`);
      skipped += 1;
      continue;
    }

    const article = JSON.parse(fs.readFileSync(articlePath, 'utf-8'));
    const slug = slugify(article.slug || article.title || articleFile.replace(/\.json$/i, ''));

    if (!slug) {
      console.warn(`Skipping article with invalid slug: ${articleFile}`);
      skipped += 1;
      continue;
    }

    if (seenSlugs.has(slug)) {
      throw new Error(`Duplicate slug detected during migration: ${slug}`);
    }
    seenSlugs.add(slug);

    const payload = {
      legacyId: Number.isFinite(Number(article.id)) ? Number(article.id) : undefined,
      slug,
      title: String(article.title || '').trim(),
      excerpt: String(article.excerpt || '').trim(),
      author: String(article.author || 'MyAarohan Team').trim(),
      date: String(article.date || '').trim(),
      readTime: String(article.readTime || '').trim(),
      category: String(article.category || 'Guidance').trim(),
      image: String(article.image || '').trim(),
      content: String(article.content || '').trim(),
      tags: normalizeKeywords((article.metadata || {}).keywords, article),
      metadata: buildMetadata(article, slug),
      schemaJsonLd: article.schemaJsonLd || null,
      isPublished: article.isPublished !== false,
      publishedAt: parseDate(article.publishedAt || article.date),
      lastModifiedAt: parseDate(article.lastModifiedAt || article.updatedAt || article.date)
    };

    if (!payload.title || !payload.excerpt || !payload.content) {
      console.warn(`Skipping invalid article payload: ${articleFile}`);
      skipped += 1;
      continue;
    }

    await Article.updateOne(
      { slug: payload.slug },
      { $set: payload },
      { upsert: true }
    );

    upserted += 1;
  }

  console.log(`Article migration complete. Upserted: ${upserted}, Skipped: ${skipped}`);
}

run()
  .then(async () => {
    await mongoose.disconnect();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error('Article migration failed:', error);
    await mongoose.disconnect();
    process.exit(1);
  });
