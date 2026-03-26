import { API_BASE_URL } from './config';

function toQueryString(params) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, String(value));
    }
  });

  return searchParams.toString();
}

export async function fetchArticles({ page = 1, limit = 24, includeContent = false, category } = {}) {
  try {
    const query = toQueryString({ page, limit, includeContent, category });
    const response = await fetch(`${API_BASE_URL}/articles?${query}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch articles: ${response.status}`);
    }

    const payload = await response.json();
    return {
      data: Array.isArray(payload.data) ? payload.data : [],
      pagination: payload.pagination || null
    };
  } catch (error) {
    console.error('Failed to fetch articles', error);
    return { data: [], pagination: null };
  }
}

export async function fetchArticleBySlug(slug) {
  try {
    const response = await fetch(`${API_BASE_URL}/articles/${encodeURIComponent(slug)}`);
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`Failed to fetch article: ${response.status}`);
    }

    const payload = await response.json();
    return payload.data || null;
  } catch (error) {
    console.error('Failed to fetch article detail', error);
    return null;
  }
}

export async function fetchLatestArticles(limit = 3) {
  const result = await fetchArticles({ page: 1, limit, includeContent: false });
  return result.data;
}
