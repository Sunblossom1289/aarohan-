const express = require('express');

const router = express.Router();
const Article = require('../models/Article');
const { verifyToken, requireRole } = require('../middleware/auth');

function toPositiveInt(value, fallback, max = 200) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed <= 0) return fallback;
  return Math.min(parsed, max);
}

function sanitizeSlug(slugValue) {
  return String(slugValue || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function isValidHttpUrl(value) {
  if (!value) return true;
  try {
    const parsed = new URL(String(value));
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function normalizeKeywords(value) {
  if (Array.isArray(value)) {
    return [...new Set(value.map((item) => String(item || '').trim().toLowerCase()).filter(Boolean))];
  }

  if (typeof value === 'string') {
    return [...new Set(value.split(',').map((item) => item.trim().toLowerCase()).filter(Boolean))];
  }

  return [];
}

function parseDate(value) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function mapSeoDefaults(payload) {
  const metadata = payload.metadata || {};
  const title = payload.title || metadata.metaTitle || '';
  const excerpt = payload.excerpt || metadata.metaDescription || '';
  const image = payload.image || metadata.ogImage || metadata.twitterImage || '';
  const canonicalUrl = metadata.canonicalUrl || `https://myaarohan.com/articles/${payload.slug}`;

  return {
    ...payload,
    metadata: {
      ...metadata,
      metaTitle: metadata.metaTitle || title,
      metaDescription: metadata.metaDescription || excerpt,
      keywords: normalizeKeywords(metadata.keywords),
      canonicalUrl,
      ogTitle: metadata.ogTitle || title,
      ogDescription: metadata.ogDescription || excerpt,
      ogImage: metadata.ogImage || image,
      ogType: metadata.ogType || 'article',
      twitterCard: metadata.twitterCard || 'summary_large_image',
      twitterTitle: metadata.twitterTitle || title,
      twitterDescription: metadata.twitterDescription || excerpt,
      twitterImage: metadata.twitterImage || image,
      articleSection: metadata.articleSection || payload.category || '',
      locale: metadata.locale || 'en_IN'
    }
  };
}

function buildArticlePayload(body, fallbackSlug = '') {
  const payload = {
    slug: sanitizeSlug(body.slug || fallbackSlug),
    title: String(body.title || '').trim(),
    excerpt: String(body.excerpt || '').trim(),
    author: String(body.author || '').trim(),
    date: String(body.date || '').trim(),
    readTime: String(body.readTime || '').trim(),
    category: String(body.category || '').trim(),
    image: String(body.image || '').trim(),
    content: String(body.content || ''),
    tags: normalizeKeywords(body.tags),
    schemaJsonLd: body.schemaJsonLd || undefined,
    metadata: {
      ...(body.metadata || {}),
      keywords: normalizeKeywords((body.metadata || {}).keywords || body.keywords)
    }
  };

  if (typeof body.isPublished === 'boolean') {
    payload.isPublished = body.isPublished;
  }

  if (body.publishedAt) {
    payload.publishedAt = parseDate(body.publishedAt) || undefined;
  }

  return mapSeoDefaults(payload);
}

function validateArticle(payload, { forPublish }) {
  const errors = [];

  if (!payload.slug) errors.push('Slug is required');
  if (!payload.title) errors.push('Title is required');

  if (forPublish) {
    if (!payload.excerpt) errors.push('Excerpt is required to publish');
    if (!payload.author) errors.push('Author is required to publish');
    if (!payload.content || !payload.content.trim()) errors.push('Content is required to publish');
    if (!payload.category) errors.push('Category is required to publish');
  }

  if (!isValidHttpUrl(payload.image)) {
    errors.push('Image must be a valid http or https URL');
  }

  if (payload.metadata?.canonicalUrl && !isValidHttpUrl(payload.metadata.canonicalUrl)) {
    errors.push('Canonical URL must be a valid http or https URL');
  }

  if (payload.metadata?.ogImage && !isValidHttpUrl(payload.metadata.ogImage)) {
    errors.push('OG image must be a valid http or https URL');
  }

  if (payload.metadata?.twitterImage && !isValidHttpUrl(payload.metadata.twitterImage)) {
    errors.push('Twitter image must be a valid http or https URL');
  }

  return errors;
}

router.get('/admin/list', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const page = toPositiveInt(req.query.page, 1, 10000);
    const limit = toPositiveInt(req.query.limit, 30, 200);
    const skip = (page - 1) * limit;
    const status = String(req.query.status || 'all').trim().toLowerCase();
    const includeContent = req.query.includeContent === 'true';

    const query = {};
    if (status === 'published') query.isPublished = true;
    if (status === 'draft') query.isPublished = false;

    const projection = includeContent ? {} : { content: 0, schemaJsonLd: 0 };

    const [items, total] = await Promise.all([
      Article.find(query, projection)
        .sort({ lastModifiedAt: -1, updatedAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Article.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit))
      }
    });
  } catch (error) {
    console.error('Failed to fetch admin article list:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/check-slug/:slug', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const slug = sanitizeSlug(req.params.slug);
    const excludeSlug = sanitizeSlug(req.query.excludeSlug || '');

    if (!slug) {
      return res.status(400).json({ success: false, error: 'Slug is required' });
    }

    const existing = await Article.findOne({ slug }).lean();
    const available = !existing || (excludeSlug && existing.slug === excludeSlug);

    res.json({ success: true, slug, available });
  } catch (error) {
    console.error('Failed slug availability check:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const page = toPositiveInt(req.query.page, 1, 10000);
    const limit = toPositiveInt(req.query.limit, 24, 100);
    const skip = (page - 1) * limit;

    const includeContent = req.query.includeContent === 'true';
    const category = req.query.category ? String(req.query.category).trim() : '';

    const query = { isPublished: true };

    if (category) {
      query.category = category;
    }

    const projection = includeContent ? {} : { content: 0, schemaJsonLd: 0 };

    const [items, total] = await Promise.all([
      Article.find(query, projection)
        .sort({ publishedAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Article.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit))
      }
    });
  } catch (error) {
    console.error('Failed to list articles:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/:slug', async (req, res) => {
  try {
    const slug = sanitizeSlug(req.params.slug);

    if (!slug) {
      return res.status(400).json({ success: false, error: 'Article slug is required' });
    }

    const query = { slug, isPublished: true };

    const article = await Article.findOne(query).lean();

    if (!article) {
      return res.status(404).json({ success: false, error: 'Article not found' });
    }

    res.json({ success: true, data: article });
  } catch (error) {
    console.error('Failed to fetch article:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const payload = buildArticlePayload(req.body);
    const shouldPublish = payload.isPublished === true;
    const errors = validateArticle(payload, { forPublish: shouldPublish });

    if (errors.length > 0) {
      return res.status(400).json({ success: false, error: errors.join(', ') });
    }

    payload.isPublished = shouldPublish;
    payload.publishedAt = shouldPublish ? (payload.publishedAt || new Date()) : undefined;
    payload.lastModifiedAt = new Date();

    const article = await Article.create(payload);
    res.status(201).json({ success: true, data: article });
  } catch (error) {
    console.error('Failed to create article:', error);
    if (error && error.code === 11000) {
      return res.status(409).json({ success: false, error: 'Slug already exists' });
    }
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/:slug', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const targetSlug = sanitizeSlug(req.params.slug);
    if (!targetSlug) {
      return res.status(400).json({ success: false, error: 'Article slug is required' });
    }

    const existing = await Article.findOne({ slug: targetSlug });
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Article not found' });
    }

    const updates = buildArticlePayload(req.body, targetSlug);

    const merged = {
      ...existing.toObject(),
      ...updates,
      metadata: {
        ...(existing.metadata || {}),
        ...(updates.metadata || {})
      }
    };

    const publishState = typeof updates.isPublished === 'boolean' ? updates.isPublished : existing.isPublished;
    const validationErrors = validateArticle(merged, { forPublish: publishState === true });
    if (validationErrors.length > 0) {
      return res.status(400).json({ success: false, error: validationErrors.join(', ') });
    }

    updates.lastModifiedAt = new Date();
    if (publishState === true && !existing.publishedAt && !updates.publishedAt) {
      updates.publishedAt = new Date();
    }

    const updated = await Article.findOneAndUpdate(
      { slug: targetSlug },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, error: 'Article not found' });
    }

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Failed to update article:', error);
    if (error && error.code === 11000) {
      return res.status(409).json({ success: false, error: 'Slug already exists' });
    }
    res.status(500).json({ success: false, error: error.message });
  }
});

router.patch('/:slug/publish', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const slug = sanitizeSlug(req.params.slug);
    if (!slug) {
      return res.status(400).json({ success: false, error: 'Article slug is required' });
    }

    const article = await Article.findOne({ slug });
    if (!article) {
      return res.status(404).json({ success: false, error: 'Article not found' });
    }

    const validationErrors = validateArticle(article.toObject(), { forPublish: true });
    if (validationErrors.length > 0) {
      return res.status(400).json({ success: false, error: validationErrors.join(', ') });
    }

    article.isPublished = true;
    article.publishedAt = article.publishedAt || new Date();
    article.lastModifiedAt = new Date();
    await article.save();

    res.json({ success: true, data: article });
  } catch (error) {
    console.error('Failed to publish article:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.patch('/:slug/unpublish', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const slug = sanitizeSlug(req.params.slug);
    if (!slug) {
      return res.status(400).json({ success: false, error: 'Article slug is required' });
    }

    const article = await Article.findOneAndUpdate(
      { slug },
      { $set: { isPublished: false, lastModifiedAt: new Date() } },
      { new: true }
    );

    if (!article) {
      return res.status(404).json({ success: false, error: 'Article not found' });
    }

    res.json({ success: true, data: article });
  } catch (error) {
    console.error('Failed to unpublish article:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/:slug', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const slug = sanitizeSlug(req.params.slug);
    const removed = await Article.findOneAndDelete({ slug });

    if (!removed) {
      return res.status(404).json({ success: false, error: 'Article not found' });
    }

    res.json({ success: true, message: 'Article deleted' });
  } catch (error) {
    console.error('Failed to delete article:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
