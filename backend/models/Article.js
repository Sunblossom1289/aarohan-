const mongoose = require('mongoose');

const { Schema } = mongoose;

const articleMetadataSchema = new Schema(
  {
    metaTitle: { type: String, trim: true, maxlength: 160 },
    metaDescription: { type: String, trim: true, maxlength: 320 },
    keywords: [{ type: String, trim: true }],
    canonicalUrl: { type: String, trim: true },
    ogTitle: { type: String, trim: true, maxlength: 160 },
    ogDescription: { type: String, trim: true, maxlength: 320 },
    ogImage: { type: String, trim: true },
    ogType: { type: String, trim: true, default: 'article' },
    twitterCard: { type: String, trim: true, default: 'summary_large_image' },
    twitterTitle: { type: String, trim: true, maxlength: 160 },
    twitterDescription: { type: String, trim: true, maxlength: 320 },
    twitterImage: { type: String, trim: true },
    articleSection: { type: String, trim: true },
    locale: { type: String, trim: true, default: 'en_IN' }
  },
  { _id: false }
);

const articleSchema = new Schema(
  {
    legacyId: { type: Number },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    title: { type: String, required: true, trim: true, index: true },
    excerpt: { type: String, required: true, trim: true },
    author: { type: String, required: true, trim: true },
    date: { type: String, trim: true },
    readTime: { type: String, trim: true },
    category: { type: String, trim: true, index: true },
    image: { type: String, trim: true },
    content: { type: String, required: true },
    tags: [{ type: String, trim: true, lowercase: true }],
    metadata: { type: articleMetadataSchema, default: () => ({}) },
    schemaJsonLd: { type: Schema.Types.Mixed },
    isPublished: { type: Boolean, default: false, index: true },
    publishedAt: { type: Date, index: true },
    lastModifiedAt: { type: Date }
  },
  { timestamps: true }
);

articleSchema.pre('save', function setDerivedDefaults(next) {
  if (this.slug) {
    this.slug = String(this.slug).toLowerCase().trim();
  }

  if (this.isPublished && !this.publishedAt) {
    this.publishedAt = this.createdAt || new Date();
  }

  if (!this.lastModifiedAt) {
    this.lastModifiedAt = new Date();
  }

  next();
});

articleSchema.index({ isPublished: 1, publishedAt: -1 });
articleSchema.index({ category: 1, isPublished: 1, publishedAt: -1 });

module.exports = mongoose.models.Article || mongoose.model('Article', articleSchema);
