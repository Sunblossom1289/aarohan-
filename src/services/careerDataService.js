/**
 * Career Data Service
 *
 * Source of truth: src/data/career_data_vol1.json + career_data_vol2.json + career_data_vol3.json + career_data_vol4.json
 *
 * Intentionally does not read prebuilt static files so frontend always reflects
 * the latest source dataset edits.
 */

const CATEGORY_META = {
  'Agriculture and Allied Sciences': { icon: '🌾', color: '#16a34a', gradient: 'linear-gradient(135deg,#16a34a,#65a30d)' },
  'Arts, Media, Marketing and Entertainment': { icon: '🎭', color: '#9333ea', gradient: 'linear-gradient(135deg,#9333ea,#ec4899)' },
  'Business and Finance': { icon: '💼', color: '#0891b2', gradient: 'linear-gradient(135deg,#0891b2,#6366f1)' },
  'Education and Training': { icon: '📚', color: '#2563eb', gradient: 'linear-gradient(135deg,#2563eb,#7c3aed)' },
  'Health and Wellness': { icon: '🏥', color: '#dc2626', gradient: 'linear-gradient(135deg,#dc2626,#f97316)' },
  Engineering: { icon: '⚙️', color: '#475569', gradient: 'linear-gradient(135deg,#475569,#6366f1)' },
  'Government Services': { icon: '🏛️', color: '#b45309', gradient: 'linear-gradient(135deg,#b45309,#d97706)' },
  'Information Technology': { icon: '💻', color: '#6366f1', gradient: 'linear-gradient(135deg,#6366f1,#06b6d4)' },
  Management: { icon: '📊', color: '#0d9488', gradient: 'linear-gradient(135deg,#0d9488,#2563eb)' },
  'Operations, Logistics, and Hospitality': { icon: '🚚', color: '#ea580c', gradient: 'linear-gradient(135deg,#ea580c,#eab308)' },
  'Public Policy, Law, and Safety': { icon: '⚖️', color: '#7c3aed', gradient: 'linear-gradient(135deg,#7c3aed,#dc2626)' },
  'Research and Development': { icon: '🔬', color: '#0284c7', gradient: 'linear-gradient(135deg,#0284c7,#7c3aed)' },
  'Technical and Skill Trades': { icon: '🔧', color: '#ca8a04', gradient: 'linear-gradient(135deg,#ca8a04,#ea580c)' },
};

const INSTITUTE_NAME_HINT =
  /\b(university|college|institute|academy|school|polytechnic|training|centre|center|hospital|campus|iit|iim|aiims|iti|nsdc|ignou|council|mission|board)\b/i;

const INSTITUTE_NOISE =
  /\b(information on|distance learning institute|source\s*:|salary|founder|worked as|currently works|years old|i\s+earn|he\s+(is|was|started|joined)|she\s+(is|was|started|joined)|helper\s*[+\->]|intern\s*[+\->])\b/i;

let preparedDataPromisePublic = null;
let preparedDataPromiseFull = null;

function extractCareers(datasetModule) {
  if (Array.isArray(datasetModule?.default?.careers)) return datasetModule.default.careers;
  if (Array.isArray(datasetModule?.default)) return datasetModule.default;
  return [];
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function truncate(value, len = 100) {
  const text = sanitizeText(value);
  if (!text || text.length <= len) return text;
  return `${text.slice(0, len).replace(/\s+\S*$/, '')}...`;
}

function sanitizeExampleFromField(value, title) {
  if (typeof value !== 'string') return value;
  if (title === 'Applique Artisan' && /Bhatia\s+studied\s+Morphology/i.test(value)) {
    return 'Priya Pattnaik is an accomplished Applique Artisan from Pipli, Odisha, known for preserving and innovating traditional applique craft through community workshops and contemporary product design.';
  }
  return value;
}

function sanitizeText(value, key) {
  if (typeof value !== 'string') return value;

  let cleaned = value
    .replace(/https;\/\//gi, 'https://')
    .replace(/http;\/\//gi, 'http://')
    .replace(/([A-Za-z])\-\s+([A-Za-z])/g, '$1$2')
    .replace(/[ \t]+/g, ' ')
    .replace(/\s+([,.;:!?])/g, '$1')
    .trim();

  if (key === 'example_from_field') {
    cleaned = cleaned
      .replace(/\bInformation on (the )?institute rankings[\s\S]*$/i, '')
      .replace(/\bDISTANCE LEARNING INSTITUTE[\s\S]*$/i, '')
      .replace(/\bSource\s*:\s*https?:\/\/\S+[\s\S]*$/i, '')
      .trim();
  }

  return cleaned;
}

function toStringArray(value) {
  if (Array.isArray(value)) {
    return value
      .map(item => (typeof item === 'string' ? sanitizeText(item) : null))
      .filter(item => item && item.length > 0);
  }

  if (typeof value === 'string') {
    const text = sanitizeText(value);
    if (!text) return [];
    return text
      .split(/\r?\n|\s*[|•;]\s*/g)
      .map(item => item.trim())
      .filter(Boolean);
  }

  return [];
}

function sanitizeInstituteEntries(entries) {
  return toStringArray(entries)
    .filter(entry => !INSTITUTE_NOISE.test(entry))
    .filter(entry => INSTITUTE_NAME_HINT.test(entry) || entry.length <= 70);
}

function formatSalary(salary) {
  if (!salary) return null;
  if (typeof salary === 'string') return sanitizeText(salary);
  if (typeof salary !== 'object') return null;

  const min = salary.min_inr ?? salary.min ?? salary.from;
  const max = salary.max_inr ?? salary.max ?? salary.to;
  const currency = salary.currency || 'INR';
  const period = salary.period || 'per month';

  if (min == null && max == null) return null;

  const toAmount = val => {
    if (val == null || val === '') return null;
    const n = Number(String(val).replace(/,/g, '').trim());
    if (!Number.isFinite(n)) return String(val);
    if (currency === 'INR') return `₹${n.toLocaleString('en-IN')}`;
    return `${n.toLocaleString()} ${currency}`;
  };

  const minText = toAmount(min);
  const maxText = toAmount(max);
  if (minText && maxText) return `${minText} - ${maxText} ${period}`;
  return `${minText || maxText} ${period}`;
}

function normalizeCareer(career, volumeNum) {
  const title = sanitizeText(career?.title) || 'Untitled Career';

  const institutesRaw = career?.institutes && typeof career.institutes === 'object'
    ? career.institutes
    : {};

  return {
    id: sanitizeText(career?.id) || `v${volumeNum}-unknown`,
    title,
    category: sanitizeText(career?.category) || 'Uncategorized',
    description: sanitizeText(career?.description) || null,
    personality_traits: toStringArray(career?.personality_traits),
    required_stream: sanitizeText(career?.required_stream ?? career?.required_stream_10_plus_2) || null,
    entrance_exams: toStringArray(career?.entrance_exams),
    educational_pathway: sanitizeText(career?.educational_pathway) || null,
    course_fee: sanitizeText(career?.course_fee ?? career?.course_fee_inr) || null,
    expected_salary: formatSalary(career?.expected_salary),
    career_growth_path: sanitizeText(career?.career_growth_path) || null,
    work_environment: career?.work_environment && typeof career.work_environment === 'object'
      ? {
          places_of_work: sanitizeText(career.work_environment.places_of_work) || null,
          work_environment: sanitizeText(career.work_environment.work_environment) || null,
          entrepreneurship_opportunity: sanitizeText(career.work_environment.entrepreneurship_opportunity) || null,
          opportunities_for_differently_abled:
            typeof career.work_environment.opportunities_for_differently_abled === 'boolean'
              ? career.work_environment.opportunities_for_differently_abled
              : null,
        }
      : {},
    scholarships: toStringArray(career?.scholarships),
    loans: toStringArray(career?.loans),
    institutes: {
      government: sanitizeInstituteEntries(institutesRaw.government),
      private: sanitizeInstituteEntries(institutesRaw.private),
      distance_learning: sanitizeInstituteEntries(institutesRaw.distance_learning),
    },
    example_from_field: sanitizeExampleFromField(
      sanitizeText(career?.example_from_field, 'example_from_field') || null,
      title,
    ),
    volume: volumeNum,
    source: sanitizeText(career?.source) || null,
  };
}

function derivePreparedData(careers) {
  const normalized = careers.map(item => normalizeCareer(item, item?.volume || 1));

  const byCategoryName = normalized.reduce((acc, career) => {
    if (!acc[career.category]) acc[career.category] = [];
    acc[career.category].push(career);
    return acc;
  }, {});

  const categories = Object.entries(byCategoryName)
    .map(([name, list]) => {
      const meta = CATEGORY_META[name] || {
        icon: '📁',
        color: '#6b7280',
        gradient: 'linear-gradient(135deg,#6b7280,#475569)',
      };
      return {
        slug: slugify(name),
        name,
        count: list.length,
        icon: meta.icon,
        color: meta.color,
        gradient: meta.gradient,
        withDescription: list.filter(c => !!c.description).length,
        withSalary: list.filter(c => !!c.expected_salary).length,
      };
    })
    .sort((a, b) => b.count - a.count);

  const bySlug = categories.reduce((acc, cat) => {
    acc[cat.slug] = byCategoryName[cat.name] || [];
    return acc;
  }, {});

  const index = normalized.map(career => ({
    id: career.id,
    title: career.title,
    category: career.category,
    snippet: truncate(career.description),
    hasDescription: !!career.description,
    hasSalary: !!career.expected_salary,
    hasInstitutes:
      (career.institutes?.government?.length || 0) +
        (career.institutes?.private?.length || 0) >
      0,
  }));

  return { index, categories, bySlug };
}

async function loadFromSourceFiles(scope = 'full') {
  const [vol1, vol2] = await Promise.all([
    import('../data/career_data_vol1.json'),
    import('../data/career_data_vol2.json'),
  ]);

  const vol1Careers = extractCareers(vol1).map(item => ({ ...item, volume: 1 }));
  const vol2Careers = extractCareers(vol2).map(item => ({ ...item, volume: 2 }));

  if (scope === 'public') {
    return derivePreparedData([...vol1Careers, ...vol2Careers]);
  }

  const [vol3, vol4] = await Promise.all([
    import('../data/career_data_vol3.json'),
    import('../data/career_data_vol4.json'),
  ]);

  const vol3Careers = extractCareers(vol3).map(item => ({ ...item, volume: 3 }));
  const vol4Careers = extractCareers(vol4).map(item => ({ ...item, volume: 4 }));

  return derivePreparedData([...vol1Careers, ...vol2Careers, ...vol3Careers, ...vol4Careers]);
}

async function getPreparedData(scope = 'full') {
  const normalizedScope = scope === 'public' ? 'public' : 'full';

  if (normalizedScope === 'public') {
    if (!preparedDataPromisePublic) {
      preparedDataPromisePublic = loadFromSourceFiles('public');
    }
    return preparedDataPromisePublic;
  }

  if (!preparedDataPromiseFull) {
    preparedDataPromiseFull = loadFromSourceFiles('full');
  }
  return preparedDataPromiseFull;
}

export async function getCareerIndex(scope = 'full') {
  const data = await getPreparedData(scope);
  return data.index;
}

export async function getCategories(scope = 'full') {
  const data = await getPreparedData(scope);
  return data.categories;
}

export async function getCategoryData(slug, scope = 'full') {
  const data = await getPreparedData(scope);
  return data.bySlug[slug] || [];
}

export async function getCareerById(id, categorySlug, scope = 'full') {
  const careers = await getCategoryData(categorySlug, scope);
  return careers.find(career => career.id === id) || null;
}
