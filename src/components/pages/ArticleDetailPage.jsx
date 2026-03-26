import React, { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Clock3, CalendarDays, UserRound } from 'lucide-react';
import { motion } from 'framer-motion';
import { fetchArticleBySlug } from '../../utils/articleHelpers';

function formatArticleDate(article) {
  if (article.date) return article.date;

  const source = article.publishedAt || article.createdAt;
  if (!source) return '';

  const parsed = new Date(source);
  if (Number.isNaN(parsed.getTime())) return '';

  return parsed.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

export function ArticleDetailPage({ slug, onNavigate }) {
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadArticle() {
      setLoading(true);
      const record = await fetchArticleBySlug(slug);
      if (mounted) {
        setArticle(record);
        setLoading(false);
      }
    }

    loadArticle();

    return () => {
      mounted = false;
    };
  }, [slug]);

  const seo = useMemo(() => {
    if (!article) return null;

    const metadata = article.metadata || {};
    const canonical = metadata.canonicalUrl || `https://myaarohan.com/articles/${article.slug}`;
    const title = metadata.metaTitle || article.title;
    const description = metadata.metaDescription || article.excerpt || '';
    const keywords = Array.isArray(metadata.keywords)
      ? metadata.keywords
      : Array.isArray(article.tags)
        ? article.tags
        : [];

    const schemaJsonLd = article.schemaJsonLd || {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: article.title,
      description,
      image: article.image,
      author: {
        '@type': 'Organization',
        name: article.author || 'MyAarohan Team'
      },
      datePublished: article.publishedAt || article.createdAt,
      dateModified: article.lastModifiedAt || article.updatedAt || article.publishedAt,
      mainEntityOfPage: canonical,
      articleSection: metadata.articleSection || article.category || 'Guidance',
      inLanguage: metadata.locale || 'en-IN'
    };

    return {
      canonical,
      title,
      description,
      keywords,
      ogTitle: metadata.ogTitle || title,
      ogDescription: metadata.ogDescription || description,
      ogImage: metadata.ogImage || article.image,
      ogType: metadata.ogType || 'article',
      twitterCard: metadata.twitterCard || 'summary_large_image',
      twitterTitle: metadata.twitterTitle || title,
      twitterDescription: metadata.twitterDescription || description,
      twitterImage: metadata.twitterImage || article.image,
      schemaJsonLd
    };
  }, [article]);

  if (loading) {
    return (
      <main style={{ minHeight: '100vh', background: 'linear-gradient(145deg, #0b2239 0%, #122b4a 55%, #174773 100%)', display: 'grid', placeItems: 'center' }}>
        <div style={{ color: 'white', fontSize: '1rem', letterSpacing: '0.04em' }}>Loading article...</div>
      </main>
    );
  }

  if (!article) {
    return (
      <main style={{ minHeight: '100vh', background: '#f5f7fb', display: 'grid', placeItems: 'center', padding: '24px' }}>
        <div style={{ maxWidth: '540px', textAlign: 'center' }}>
          <h1 style={{ margin: '0 0 12px', color: '#0e2a47' }}>Article not found</h1>
          <p style={{ margin: 0, color: '#335579', lineHeight: 1.6 }}>The article URL may be outdated or the article is not published yet.</p>
          <button
            type="button"
            onClick={() => onNavigate('/articles')}
            style={{
              marginTop: '20px',
              background: '#174773',
              color: 'white',
              border: 'none',
              borderRadius: '999px',
              padding: '10px 18px',
              cursor: 'pointer',
              fontWeight: 700
            }}
          >
            Back to Articles
          </button>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: '100vh', background: '#f4f7fb', color: '#13233a' }}>
      <Helmet>
        <title>{seo?.title || article.title}</title>
        <meta name="description" content={seo?.description || article.excerpt || ''} />
        <meta name="keywords" content={(seo?.keywords || []).join(', ')} />
        <link rel="canonical" href={seo?.canonical} />

        <meta property="og:type" content={seo?.ogType || 'article'} />
        <meta property="og:url" content={seo?.canonical} />
        <meta property="og:title" content={seo?.ogTitle || article.title} />
        <meta property="og:description" content={seo?.ogDescription || article.excerpt || ''} />
        <meta property="og:image" content={seo?.ogImage || article.image || ''} />

        <meta name="twitter:card" content={seo?.twitterCard || 'summary_large_image'} />
        <meta name="twitter:title" content={seo?.twitterTitle || article.title} />
        <meta name="twitter:description" content={seo?.twitterDescription || article.excerpt || ''} />
        <meta name="twitter:image" content={seo?.twitterImage || article.image || ''} />

        {seo?.schemaJsonLd && (
          <script type="application/ld+json">{JSON.stringify(seo.schemaJsonLd)}</script>
        )}
      </Helmet>

      <style>{`
        .article-shell {
          max-width: 1040px;
          margin: 0 auto;
          padding: 32px 20px 80px;
        }

        .article-panel {
          background: white;
          border-radius: 28px;
          overflow: hidden;
          box-shadow: 0 30px 70px -40px rgba(13, 40, 72, 0.55);
          border: 1px solid rgba(23, 71, 115, 0.08);
        }

        .article-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 14px;
          color: #e7f4ff;
          font-size: 0.92rem;
        }

        .article-content {
          padding: 34px 28px 42px;
          font-family: 'Merriweather', 'Palatino Linotype', serif;
          line-height: 1.92;
          font-size: clamp(1rem, 1.2vw, 1.12rem);
          color: #1d2f46;
        }

        .article-content h2,
        .article-content h3,
        .article-content h4 {
          color: #0b2b4b;
          font-family: 'Plus Jakarta Sans', 'Trebuchet MS', sans-serif;
          line-height: 1.35;
          margin-top: 1.6em;
          margin-bottom: 0.55em;
        }

        .article-content p {
          margin: 0 0 1.1em;
        }

        .article-content ul,
        .article-content ol {
          margin: 0 0 1.2em;
          padding-left: 1.3rem;
        }

        .article-content li {
          margin-bottom: 0.5em;
        }

        .article-content hr {
          border: none;
          border-top: 1px solid #d9e5f2;
          margin: 1.8em 0;
        }

        @media (max-width: 768px) {
          .article-shell {
            padding: 20px 14px 48px;
          }

          .article-content {
            padding: 24px 18px 28px;
          }
        }
      `}</style>

      <div style={{ position: 'relative', background: 'linear-gradient(150deg, #0b2642 0%, #174773 40%, #2297c6 100%)', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', width: '280px', height: '280px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)', top: '-120px', right: '-80px' }} />
        <div style={{ position: 'absolute', width: '220px', height: '220px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)', bottom: '-110px', left: '5%' }} />

        <div className="article-shell" style={{ paddingTop: '24px', paddingBottom: '34px', position: 'relative', zIndex: 1 }}>
          <button
            type="button"
            onClick={() => onNavigate('/articles')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              border: '1px solid rgba(255,255,255,0.35)',
              color: 'white',
              background: 'rgba(255,255,255,0.08)',
              borderRadius: '999px',
              padding: '9px 16px',
              cursor: 'pointer',
              backdropFilter: 'blur(6px)',
              marginBottom: '18px'
            }}
          >
            <ArrowLeft size={17} /> Back to Articles
          </button>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
            <div style={{ display: 'inline-block', padding: '6px 12px', borderRadius: '999px', background: 'rgba(255,255,255,0.18)', color: '#f2fbff', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              {article.category || 'Knowledge Hub'}
            </div>
            <h1 style={{ fontFamily: "'Plus Jakarta Sans', 'Trebuchet MS', sans-serif", fontSize: 'clamp(2rem, 4.8vw, 3.7rem)', lineHeight: 1.05, margin: '14px 0 16px', color: 'white', maxWidth: '900px' }}>
              {article.title}
            </h1>
            <p style={{ margin: 0, color: '#d9efff', maxWidth: '740px', fontSize: 'clamp(1rem, 2vw, 1.2rem)', lineHeight: 1.7 }}>
              {article.excerpt}
            </p>

            <div className="article-meta" style={{ marginTop: '18px' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><UserRound size={14} /> {article.author || 'MyAarohan Team'}</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><CalendarDays size={14} /> {formatArticleDate(article)}</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><Clock3 size={14} /> {article.readTime || '5 min read'}</span>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="article-shell">
        <article className="article-panel">
          {article.image && (
            <div style={{ maxHeight: '480px', overflow: 'hidden', background: '#d9e7f6' }}>
              <img src={article.image} alt={article.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </div>
          )}

          <div className="article-content" dangerouslySetInnerHTML={{ __html: article.content || '' }} />
        </article>
      </div>
    </main>
  );
}
