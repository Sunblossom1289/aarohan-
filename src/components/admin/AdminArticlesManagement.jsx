import React, { useEffect, useMemo, useRef, useState } from 'react';
import { articleAPI } from '../../services/api';

const CATEGORY_OPTIONS = ['Guidance', 'Science', 'Career', 'Skills', 'Trends', 'Wellness'];

const EMPTY_FORM = {
  title: '',
  slug: '',
  excerpt: '',
  author: 'MyAarohan Team',
  category: 'Guidance',
  readTime: '5 min',
  isPublished: false,
  image: '',
  tags: '',
  content: '<p></p>',
  metadata: {
    metaTitle: '',
    metaDescription: '',
    canonicalUrl: '',
    keywords: '',
    ogTitle: '',
    ogDescription: '',
    ogImage: '',
    twitterTitle: '',
    twitterDescription: '',
    twitterImage: ''
  }
};

function slugify(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function normalizeMetadata(form) {
  return {
    metaTitle: form.metadata.metaTitle || form.title,
    metaDescription: form.metadata.metaDescription || form.excerpt,
    canonicalUrl: form.metadata.canonicalUrl || `https://myaarohan.com/articles/${form.slug}`,
    keywords: form.metadata.keywords
      .split(',')
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean),
    ogTitle: form.metadata.ogTitle || form.title,
    ogDescription: form.metadata.ogDescription || form.excerpt,
    ogImage: form.metadata.ogImage || form.image,
    twitterTitle: form.metadata.twitterTitle || form.title,
    twitterDescription: form.metadata.twitterDescription || form.excerpt,
    twitterImage: form.metadata.twitterImage || form.image
  };
}

function buildPayload(form) {
  return {
    title: form.title.trim(),
    slug: slugify(form.slug),
    excerpt: form.excerpt.trim(),
    author: form.author.trim(),
    category: form.category.trim(),
    readTime: form.readTime.trim(),
    isPublished: form.isPublished === true,
    image: form.image.trim(),
    content: form.content,
    tags: form.tags
      .split(',')
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean),
    metadata: normalizeMetadata(form)
  };
}

function RichTextEditor({ value, onChange }) {
  const editorRef = useRef(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const runCommand = (command, commandValue = null) => {
    const editor = editorRef.current;
    if (!editor) return;

    editor.focus();
    document.execCommand(command, false, commandValue);
    onChange(editor.innerHTML);
  };

  const askForLink = () => {
    const link = window.prompt('Enter URL (https://...)');
    if (!link) return;
    runCommand('createLink', link);
  };

  return (
    <div style={{ border: '1px solid #d0d9e5', borderRadius: '10px', overflow: 'hidden' }}>
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', padding: '10px', background: '#f7fafc', borderBottom: '1px solid #e2e8f0' }}>
        <button type="button" className="btn btn-sm btn-outline" onClick={() => runCommand('bold')}>Bold</button>
        <button type="button" className="btn btn-sm btn-outline" onClick={() => runCommand('italic')}>Italic</button>
        <button type="button" className="btn btn-sm btn-outline" onClick={() => runCommand('underline')}>Underline</button>
        <button type="button" className="btn btn-sm btn-outline" onClick={() => runCommand('insertUnorderedList')}>Bullets</button>
        <button type="button" className="btn btn-sm btn-outline" onClick={() => runCommand('insertOrderedList')}>Numbers</button>
        <button type="button" className="btn btn-sm btn-outline" onClick={() => runCommand('formatBlock', '<h2>')}>H2</button>
        <button type="button" className="btn btn-sm btn-outline" onClick={() => runCommand('formatBlock', '<h3>')}>H3</button>
        <button type="button" className="btn btn-sm btn-outline" onClick={() => runCommand('formatBlock', '<p>')}>Paragraph</button>
        <button type="button" className="btn btn-sm btn-outline" onClick={askForLink}>Link</button>
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={(event) => onChange(event.currentTarget.innerHTML)}
        style={{ minHeight: '280px', padding: '14px', lineHeight: 1.7, fontSize: '15px', background: 'white' }}
      />
    </div>
  );
}

export function AdminArticlesManagement() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [editorOpen, setEditorOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingSlug, setEditingSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [message, setMessage] = useState(null);

  const loadArticles = async () => {
    setLoading(true);
    const response = await articleAPI.adminList({ status: statusFilter, limit: 250, includeContent: true });
    if (response?.success) {
      setArticles(Array.isArray(response.data) ? response.data : []);
    } else {
      setMessage({ type: 'error', text: response?.error || 'Failed to load articles' });
    }
    setLoading(false);
  };

  useEffect(() => {
    loadArticles();
  }, [statusFilter]);

  const filteredArticles = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    if (!query) return articles;

    return articles.filter((item) => {
      return [item.title, item.slug, item.author, item.category]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
    });
  }, [articles, searchText]);

  const resetEditor = () => {
    setForm(EMPTY_FORM);
    setEditingSlug('');
    setSlugTouched(false);
    setEditorOpen(true);
  };

  const openEditorForArticle = (article) => {
    setForm({
      title: article.title || '',
      slug: article.slug || '',
      excerpt: article.excerpt || '',
      author: article.author || 'MyAarohan Team',
      category: article.category || 'Guidance',
      readTime: article.readTime || '5 min',
      isPublished: article.isPublished === true,
      image: article.image || '',
      tags: Array.isArray(article.tags) ? article.tags.join(', ') : '',
      content: article.content || '<p></p>',
      metadata: {
        metaTitle: article.metadata?.metaTitle || '',
        metaDescription: article.metadata?.metaDescription || '',
        canonicalUrl: article.metadata?.canonicalUrl || '',
        keywords: Array.isArray(article.metadata?.keywords) ? article.metadata.keywords.join(', ') : '',
        ogTitle: article.metadata?.ogTitle || '',
        ogDescription: article.metadata?.ogDescription || '',
        ogImage: article.metadata?.ogImage || '',
        twitterTitle: article.metadata?.twitterTitle || '',
        twitterDescription: article.metadata?.twitterDescription || '',
        twitterImage: article.metadata?.twitterImage || ''
      }
    });
    setEditingSlug(article.slug || '');
    setSlugTouched(true);
    setEditorOpen(true);
  };

  const applyFormPatch = (patch) => {
    setForm((prev) => ({ ...prev, ...patch }));
  };

  const applyMetadataPatch = (patch) => {
    setForm((prev) => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        ...patch
      }
    }));
  };

  const ensureSlugAvailable = async (slug) => {
    const normalized = slugify(slug);
    if (!normalized) {
      setMessage({ type: 'error', text: 'Slug cannot be empty' });
      return false;
    }

    const response = await articleAPI.checkSlug(normalized, editingSlug);
    if (!response?.success) {
      setMessage({ type: 'error', text: response?.error || 'Could not validate slug availability' });
      return false;
    }

    if (!response.available) {
      setMessage({ type: 'error', text: 'Slug already exists. Please choose a different slug.' });
      return false;
    }

    return true;
  };

  const saveDraft = async ({ silent = false } = {}) => {
    setSaving(true);
    const payload = buildPayload(form);

    if (!payload.title) {
      setSaving(false);
      setMessage({ type: 'error', text: 'Title is required.' });
      return null;
    }

    if (!payload.slug) {
      setSaving(false);
      setMessage({ type: 'error', text: 'Slug is required.' });
      return null;
    }

    const slugAvailable = await ensureSlugAvailable(payload.slug);
    if (!slugAvailable) {
      setSaving(false);
      return null;
    }

    const result = editingSlug
      ? await articleAPI.update(editingSlug, payload)
      : await articleAPI.createDraft(payload);

    setSaving(false);

    if (!result?.success) {
      setMessage({ type: 'error', text: result?.error || 'Failed to save draft' });
      return null;
    }

    if (!silent) {
      setMessage({ type: 'success', text: 'Draft saved successfully.' });
    }

    const updatedSlug = result.data?.slug || payload.slug;
    setEditingSlug(updatedSlug);
    setForm((prev) => ({ ...prev, slug: updatedSlug }));
    await loadArticles();
    return result.data;
  };

  const publishCurrentArticle = async () => {
    setPublishing(true);
    const saved = await saveDraft({ silent: true });
    const slug = saved?.slug || form.slug;

    if (!slug) {
      setPublishing(false);
      return;
    }

    const result = await articleAPI.publish(slug);
    setPublishing(false);

    if (!result?.success) {
      setMessage({ type: 'error', text: result?.error || 'Publish failed. Check required fields.' });
      return;
    }

    setMessage({ type: 'success', text: 'Article published successfully.' });
    await loadArticles();
    openEditorForArticle(result.data);
  };

  const setPublishedState = async (slug, nextState) => {
    const response = nextState ? await articleAPI.publish(slug) : await articleAPI.unpublish(slug);
    if (!response?.success) {
      setMessage({ type: 'error', text: response?.error || 'Failed to update publish state' });
      return;
    }

    setMessage({ type: 'success', text: nextState ? 'Article published.' : 'Article moved to draft.' });
    await loadArticles();
  };

  const deleteArticle = async (slug) => {
    const confirmed = window.confirm('Delete this article permanently? This cannot be undone.');
    if (!confirmed) return;

    const response = await articleAPI.remove(slug);
    if (!response?.success) {
      setMessage({ type: 'error', text: response?.error || 'Delete failed' });
      return;
    }

    setMessage({ type: 'success', text: 'Article deleted.' });
    if (editingSlug === slug) {
      setEditorOpen(false);
      setEditingSlug('');
    }
    await loadArticles();
  };

  return (
    <div>
      <div className="page-header" style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div>
            <h1 className="page-title">Articles Management</h1>
            <p className="page-subtitle">Create drafts, edit content, and publish articles to the website.</p>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button className="btn btn-outline" onClick={loadArticles}>Refresh</button>
            <button className="btn btn-primary" onClick={resetEditor}>+ New Article</button>
          </div>
        </div>
      </div>

      {message && (
        <div
          style={{
            marginBottom: '12px',
            borderRadius: '8px',
            padding: '10px 12px',
            fontSize: '13px',
            border: `1px solid ${message.type === 'error' ? '#fca5a5' : '#86efac'}`,
            background: message.type === 'error' ? '#fff1f2' : '#f0fdf4',
            color: message.type === 'error' ? '#b91c1c' : '#166534'
          }}
        >
          {message.text}
        </div>
      )}

      <div className="card" style={{ marginBottom: '18px' }}>
        <div className="card-body" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="text"
            className="form-control"
            placeholder="Search by title, slug, author, category"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            style={{ maxWidth: '360px' }}
          />
          <select className="form-control" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} style={{ maxWidth: '180px' }}>
            <option value="all">All statuses</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
          <span style={{ marginLeft: 'auto', fontSize: '13px', color: '#64748b' }}>
            {loading ? 'Loading...' : `${filteredArticles.length} article(s)`}
          </span>
        </div>
      </div>

      <div className="card" style={{ overflowX: 'auto', marginBottom: '20px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              <th style={tableHeadStyle}>Title</th>
              <th style={tableHeadStyle}>Slug</th>
              <th style={tableHeadStyle}>Status</th>
              <th style={tableHeadStyle}>Category</th>
              <th style={tableHeadStyle}>Updated</th>
              <th style={tableHeadStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredArticles.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '28px', textAlign: 'center', color: '#94a3b8' }}>
                  {loading ? 'Loading articles...' : 'No articles found'}
                </td>
              </tr>
            ) : (
              filteredArticles.map((item) => (
                <tr key={item._id || item.slug} style={{ borderTop: '1px solid #eef2f7' }}>
                  <td style={tableCellStyle}>{item.title}</td>
                  <td style={{ ...tableCellStyle, color: '#0f4a7f' }}>/articles/{item.slug}</td>
                  <td style={tableCellStyle}>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '4px 9px',
                        borderRadius: '999px',
                        color: item.isPublished ? '#166534' : '#9a3412',
                        background: item.isPublished ? '#dcfce7' : '#ffedd5'
                      }}
                    >
                      {item.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td style={tableCellStyle}>{item.category || '-'}</td>
                  <td style={tableCellStyle}>
                    {item.lastModifiedAt ? new Date(item.lastModifiedAt).toLocaleString() : '-'}
                  </td>
                  <td style={tableCellStyle}>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      <button className="btn btn-sm btn-outline" onClick={() => openEditorForArticle(item)}>Edit</button>
                      {item.isPublished ? (
                        <button className="btn btn-sm btn-outline" onClick={() => setPublishedState(item.slug, false)}>Unpublish</button>
                      ) : (
                        <button className="btn btn-sm btn-primary" onClick={() => setPublishedState(item.slug, true)}>Publish</button>
                      )}
                      <button
                        className="btn btn-sm btn-outline"
                        onClick={() => deleteArticle(item.slug)}
                        style={{ borderColor: '#fca5a5', color: '#b91c1c' }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {editorOpen && (
        <div className="card" style={{ marginTop: '20px' }}>
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <h3 className="card-title" style={{ margin: 0 }}>{editingSlug ? 'Edit Article' : 'Create New Article'}</h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-outline" onClick={() => setEditorOpen(false)}>Close</button>
              <button className="btn btn-outline" onClick={() => saveDraft()} disabled={saving || publishing}>
                {saving ? 'Saving...' : (form.isPublished ? 'Save Changes' : 'Save Draft')}
              </button>
              <button className="btn btn-primary" onClick={publishCurrentArticle} disabled={publishing || saving}>
                {publishing ? 'Publishing...' : 'Publish'}
              </button>
            </div>
          </div>
          <div className="card-body" style={{ display: 'grid', gap: '14px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label required">Title</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.title}
                  onChange={(event) => {
                    const value = event.target.value;
                    applyFormPatch({
                      title: value,
                      slug: slugTouched ? form.slug : slugify(value)
                    });
                  }}
                />
              </div>
              <div className="form-group">
                <label className="form-label required">Slug</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.slug}
                  onChange={(event) => {
                    setSlugTouched(true);
                    applyFormPatch({ slug: slugify(event.target.value) });
                  }}
                />
              </div>
              <div className="form-group">
                <label className="form-label required">Author</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.author}
                  onChange={(event) => applyFormPatch({ author: event.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label required">Category</label>
                <select
                  className="form-control"
                  value={form.category}
                  onChange={(event) => applyFormPatch({ category: event.target.value })}
                >
                  {CATEGORY_OPTIONS.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Read Time</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.readTime}
                  onChange={(event) => applyFormPatch({ readTime: event.target.value })}
                  placeholder="e.g. 6 min"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Image URL</label>
                <input
                  type="url"
                  className="form-control"
                  value={form.image}
                  onChange={(event) => applyFormPatch({ image: event.target.value })}
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label required">Excerpt</label>
              <textarea
                className="form-control"
                rows={3}
                value={form.excerpt}
                onChange={(event) => applyFormPatch({ excerpt: event.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Tags (comma separated)</label>
              <input
                type="text"
                className="form-control"
                value={form.tags}
                onChange={(event) => applyFormPatch({ tags: event.target.value })}
                placeholder="career, aptitude, guidance"
              />
            </div>

            <div className="form-group">
              <label className="form-label required">Article Content</label>
              <RichTextEditor value={form.content} onChange={(content) => applyFormPatch({ content })} />
            </div>

            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '12px' }}>
              <h4 style={{ margin: '0 0 10px', fontSize: '15px', color: '#1e293b' }}>SEO Metadata</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Meta Title</label>
                  <input type="text" className="form-control" value={form.metadata.metaTitle} onChange={(event) => applyMetadataPatch({ metaTitle: event.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Meta Description</label>
                  <input type="text" className="form-control" value={form.metadata.metaDescription} onChange={(event) => applyMetadataPatch({ metaDescription: event.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Canonical URL</label>
                  <input type="url" className="form-control" value={form.metadata.canonicalUrl} onChange={(event) => applyMetadataPatch({ canonicalUrl: event.target.value })} placeholder="https://..." />
                </div>
                <div className="form-group">
                  <label className="form-label">SEO Keywords</label>
                  <input type="text" className="form-control" value={form.metadata.keywords} onChange={(event) => applyMetadataPatch({ keywords: event.target.value })} placeholder="keyword1, keyword2" />
                </div>
                <div className="form-group">
                  <label className="form-label">OG Title</label>
                  <input type="text" className="form-control" value={form.metadata.ogTitle} onChange={(event) => applyMetadataPatch({ ogTitle: event.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">OG Description</label>
                  <input type="text" className="form-control" value={form.metadata.ogDescription} onChange={(event) => applyMetadataPatch({ ogDescription: event.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">OG Image URL</label>
                  <input type="url" className="form-control" value={form.metadata.ogImage} onChange={(event) => applyMetadataPatch({ ogImage: event.target.value })} placeholder="https://..." />
                </div>
                <div className="form-group">
                  <label className="form-label">Twitter Title</label>
                  <input type="text" className="form-control" value={form.metadata.twitterTitle} onChange={(event) => applyMetadataPatch({ twitterTitle: event.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Twitter Description</label>
                  <input type="text" className="form-control" value={form.metadata.twitterDescription} onChange={(event) => applyMetadataPatch({ twitterDescription: event.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Twitter Image URL</label>
                  <input type="url" className="form-control" value={form.metadata.twitterImage} onChange={(event) => applyMetadataPatch({ twitterImage: event.target.value })} placeholder="https://..." />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const tableHeadStyle = {
  textAlign: 'left',
  padding: '10px 12px',
  fontWeight: 600,
  color: '#475569',
  fontSize: '12px',
  textTransform: 'uppercase',
  letterSpacing: '0.4px'
};

const tableCellStyle = {
  padding: '10px 12px',
  verticalAlign: 'top'
};
