/**
 * Build script: processes career_data_vol1.json + vol2.json into
 * optimized static assets for the Career Encyclopedia.
 * 
 * Output (public/data/careers/):
 *   - index.json         — lightweight catalog (id, title, category, snippet)
 *   - categories.json    — category metadata (name, count, icon, color)
 *   - <slug>.json        — full career data per category
 *
 * Run: node scripts/build-career-data.js
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');

// ── Category metadata ──────────────────────────────────────────
const CATEGORY_META = {
  'Agriculture and Allied Sciences': { icon: '🌾', color: '#16a34a', gradient: 'linear-gradient(135deg,#16a34a,#65a30d)' },
  'Arts, Media, Marketing and Entertainment': { icon: '🎭', color: '#9333ea', gradient: 'linear-gradient(135deg,#9333ea,#ec4899)' },
  'Business and Finance': { icon: '💼', color: '#0891b2', gradient: 'linear-gradient(135deg,#0891b2,#6366f1)' },
  'Education and Training': { icon: '📚', color: '#2563eb', gradient: 'linear-gradient(135deg,#2563eb,#7c3aed)' },
  'Health and Wellness': { icon: '🏥', color: '#dc2626', gradient: 'linear-gradient(135deg,#dc2626,#f97316)' },
  'Engineering': { icon: '⚙️', color: '#475569', gradient: 'linear-gradient(135deg,#475569,#6366f1)' },
  'Government Services': { icon: '🏛️', color: '#b45309', gradient: 'linear-gradient(135deg,#b45309,#d97706)' },
  'Information Technology': { icon: '💻', color: '#6366f1', gradient: 'linear-gradient(135deg,#6366f1,#06b6d4)' },
  'Management': { icon: '📊', color: '#0d9488', gradient: 'linear-gradient(135deg,#0d9488,#2563eb)' },
  'Operations, Logistics, and Hospitality': { icon: '🚚', color: '#ea580c', gradient: 'linear-gradient(135deg,#ea580c,#eab308)' },
  'Public Policy, Law, and Safety': { icon: '⚖️', color: '#7c3aed', gradient: 'linear-gradient(135deg,#7c3aed,#dc2626)' },
  'Research and Development': { icon: '🔬', color: '#0284c7', gradient: 'linear-gradient(135deg,#0284c7,#7c3aed)' },
  'Technical and Skill Trades': { icon: '🔧', color: '#ca8a04', gradient: 'linear-gradient(135deg,#ca8a04,#ea580c)' },
};

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function truncate(str, len = 120) {
  if (!str) return '';
  if (str.length <= len) return str;
  return str.slice(0, len).replace(/\s+\S*$/, '') + '…';
}

function cleanInstituteName(name) {
  if (!name) return null;
  // Remove leading dots/numbers and trim
  let cleaned = name.replace(/^[\s.\d]+/, '').trim();
  // Filter out junk entries
  if (cleaned.length < 5) return null;
  if (/^(CON|Source|Earlier|INR |in West|capacity)/i.test(cleaned)) return null;
  return cleaned;
}

function cleanInstitutes(institutes) {
  if (!institutes) return { government: [], private: [], distance_learning: [] };
  return {
    government: (institutes.government || []).map(cleanInstituteName).filter(Boolean),
    private: (institutes.private || []).map(cleanInstituteName).filter(Boolean),
    distance_learning: (institutes.distance_learning || [])
      .map(cleanInstituteName)
      .filter(n => n && !n.startsWith('Source') && n.length > 10),
  };
}

function formatSalary(salary) {
  if (!salary) return null;
  if (typeof salary === 'string') return salary;
  if (typeof salary === 'object' && salary.min_inr) {
    const period = salary.period || 'per month';
    return `₹${Number(salary.min_inr).toLocaleString('en-IN')} - ₹${Number(salary.max_inr).toLocaleString('en-IN')} ${period}`;
  }
  return null;
}

function normalizeCareer(career, volumeNum) {
  const globalId = `v${volumeNum}-${career.id}`;
  return {
    id: globalId,
    title: career.title || 'Untitled Career',
    category: career.category || 'Uncategorized',
    description: career.description || null,
    personality_traits: (career.personality_traits || []).filter(t => t && t.length > 3),
    required_stream: career.required_stream_10_plus_2 || null,
    entrance_exams: (career.entrance_exams || []).filter(Boolean),
    educational_pathway: career.educational_pathway || null,
    course_fee: career.course_fee_inr || null,
    expected_salary: formatSalary(career.expected_salary),
    career_growth_path: career.career_growth_path || null,
    work_environment: career.work_environment || null,
    scholarships: (career.scholarships || []).filter(Boolean),
    loans: (career.loans || []).filter(Boolean),
    institutes: cleanInstitutes(career.institutes),
    example_from_field: career.example_from_field || null,
    volume: volumeNum,
    source: career.source || null,
  };
}

// ── Main ────────────────────────────────────────────────────────
function build() {
  console.log('🔨 Building career data...\n');

  // Load source data
  const vol1 = JSON.parse(readFileSync(join(ROOT, 'src/data/career_data_vol1.json'), 'utf-8'));
  const vol2 = JSON.parse(readFileSync(join(ROOT, 'src/data/career_data_vol2.json'), 'utf-8'));

  // Normalize all careers  
  const allCareers = [
    ...vol1.careers.map(c => normalizeCareer(c, 1)),
    ...vol2.careers.map(c => normalizeCareer(c, 2)),
  ];

  console.log(`  Total careers: ${allCareers.length}`);

  // Group by category
  const byCategory = {};
  for (const career of allCareers) {
    if (!byCategory[career.category]) byCategory[career.category] = [];
    byCategory[career.category].push(career);
  }

  // Output directory
  const outDir = join(ROOT, 'public/data/careers');
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

  // 1. Build index.json (lightweight)
  const index = allCareers.map(c => ({
    id: c.id,
    title: c.title,
    category: c.category,
    snippet: truncate(c.description, 100),
    hasDescription: !!c.description,
    hasSalary: !!c.expected_salary,
    hasInstitutes: (c.institutes.government.length + c.institutes.private.length) > 0,
  }));

  writeFileSync(join(outDir, 'index.json'), JSON.stringify(index));
  console.log(`  ✅ index.json — ${index.length} entries (${(JSON.stringify(index).length / 1024).toFixed(1)}KB)`);

  // 2. Build categories.json
  const categories = Object.entries(byCategory)
    .map(([name, careers]) => {
      const meta = CATEGORY_META[name] || { icon: '📁', color: '#6b7280', gradient: 'linear-gradient(135deg,#6b7280,#475569)' };
      const slug = slugify(name);
      return {
        slug,
        name,
        count: careers.length,
        icon: meta.icon,
        color: meta.color,
        gradient: meta.gradient,
        withDescription: careers.filter(c => c.description).length,
        withSalary: careers.filter(c => c.expected_salary).length,
      };
    })
    .sort((a, b) => b.count - a.count);

  writeFileSync(join(outDir, 'categories.json'), JSON.stringify(categories));
  console.log(`  ✅ categories.json — ${categories.length} categories`);

  // 3. Write per-category files
  for (const [name, careers] of Object.entries(byCategory)) {
    const slug = slugify(name);
    const filename = `${slug}.json`;
    writeFileSync(join(outDir, filename), JSON.stringify(careers));
    const sizeKB = (JSON.stringify(careers).length / 1024).toFixed(1);
    console.log(`  ✅ ${filename} — ${careers.length} careers (${sizeKB}KB)`);
  }

  console.log(`\n✨ Done! Files written to public/data/careers/`);
}

build();
