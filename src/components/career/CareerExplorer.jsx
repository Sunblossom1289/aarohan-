import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { getCareerIndex, getCategories, getCategoryData } from '../../services/careerDataService';
import CareerDetail from './CareerDetail';

/* ─── Category metadata: images + descriptions for rich display ─── */
const CATEGORY_EXTRA = {
  'technical-and-skill-trades': { themeImage: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?q=80&w=800&auto=format&fit=crop', description: 'The Workshop of Craft and Mastery' },
  'health-and-wellness': { themeImage: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=800&auto=format&fit=crop', description: 'The Healer\'s Province and Medical Frontiers' },
  'arts-media-marketing-and-entertainment': { themeImage: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=800&auto=format&fit=crop', description: 'The Artist\'s Haven and Creative Studios' },
  'engineering': { themeImage: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=800&auto=format&fit=crop', description: 'The Builder\'s Kingdom of Innovation' },
  'research-and-development': { themeImage: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?q=80&w=800&auto=format&fit=crop', description: 'The Academy of Discovery and Innovation' },
  'business-and-finance': { themeImage: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=800&auto=format&fit=crop', description: 'The Merchant\'s Port and Market Dynamics' },
  'government-services': { themeImage: 'https://images.unsplash.com/photo-1555848962-6e79363ec58f?q=80&w=800&auto=format&fit=crop', description: 'The Halls of Governance and Administration' },
  'operations-logistics-and-hospitality': { themeImage: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=800&auto=format&fit=crop', description: 'The Trade Routes of Commerce and Service' },
  'information-technology': { themeImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop', description: 'The City-States of Silicon and AI' },
  'agriculture-and-allied-sciences': { themeImage: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=800&auto=format&fit=crop', description: 'The Green Frontier of Food and Farming' },
  'education-and-training': { themeImage: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=800&auto=format&fit=crop', description: 'The Council of Educators and Mentors' },
  'public-policy-law-and-safety': { themeImage: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=800&auto=format&fit=crop', description: 'The Courts of Justice and Policy' },
  'management': { themeImage: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=800&auto=format&fit=crop', description: 'The Boardroom of Strategy and Leadership' },
};

/* ─── Animations & Shared Styles ─── */
const STYLES = `
  @keyframes ce-fadeUp { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
  @keyframes ce-scaleIn { from { opacity:0; transform:scale(.96); } to { opacity:1; transform:scale(1); } }
  @keyframes ce-pulse { 0%,100%{opacity:.6} 50%{opacity:1} }
  @keyframes ce-shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
  .ce-fade-up { animation: ce-fadeUp .5s ease-out both; }
  .ce-scale-in { animation: ce-scaleIn .4s ease-out both; }
  .ce-shimmer { background: linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%); background-size:200% 100%; animation: ce-shimmer 1.5s infinite; }
  .ce-card { transition: transform .25s ease, box-shadow .25s ease; }
  .ce-card:hover { transform: translateY(-6px); box-shadow: 0 20px 40px -12px rgba(0,0,0,.25); }
  .ce-btn { transition: all .2s ease; }
  .ce-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,.15); }
  .ce-search-input:focus { outline:none; border-color:#818cf8; box-shadow: 0 0 0 3px rgba(99,102,241,.12); }
  .ce-cluster-card { cursor:pointer; }
  .ce-cluster-card .ce-overlay { transition: opacity .4s ease; }
  .ce-cluster-card:hover .ce-overlay { opacity: 0.75 !important; }
  .ce-cluster-card:hover img { transform: scale(1.05); }
  .ce-cluster-card:hover .ce-arrow { transform: translateX(4px); }
  .ce-arrow { transition: transform .2s ease; }
  .ce-role-row { transition: all .2s ease; }
  .ce-role-row:hover { background:#f8fafc; border-color:#c7d2fe; }
  .ce-role-row:hover .ce-role-arrow { opacity:1; transform:translateX(0); }
  .ce-tag { display:inline-block; padding:4px 10px; border-radius:6px; font-size:12px; font-weight:600; }
`;

/* ─── Skeleton Loaders ─── */
const ClusterSkeleton = () => (
  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))', gap:'24px' }}>
    {Array.from({length:6}).map((_,i) => (
      <div key={i} className="ce-shimmer" style={{ height:'340px', borderRadius:'20px' }} />
    ))}
  </div>
);

const CareerListSkeleton = () => (
  <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
    {Array.from({length:8}).map((_,i) => (
      <div key={i} className="ce-shimmer" style={{ height:'100px', borderRadius:'16px' }} />
    ))}
  </div>
);

/* ─── Search Icon ─── */
const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
  </svg>
);

/* ─── Back Button ─── */
const BackButton = ({ onClick, label = 'Back' }) => (
  <button onClick={onClick} className="ce-btn" style={{
    display:'inline-flex', alignItems:'center', gap:'8px',
    padding:'10px 20px', background:'white', border:'1px solid #e2e8f0',
    borderRadius:'12px', fontSize:'14px', fontWeight:600, color:'#475569',
    cursor:'pointer', boxShadow:'0 1px 3px rgba(0,0,0,.04)',
  }}>
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
    {label}
  </button>
);

/* ─── Breadcrumb ─── */
const Breadcrumb = ({ items }) => (
  <nav style={{ display:'flex', alignItems:'center', gap:'8px', flexWrap:'wrap' }}>
    {items.map((item, i) => (
      <React.Fragment key={i}>
        {i > 0 && <span style={{ color:'#cbd5e1', fontSize:'12px' }}>/</span>}
        {item.onClick ? (
          <button onClick={item.onClick} className="ce-btn" style={{
            fontSize:'13px', fontWeight:600, color:'#6366f1',
            background:'none', border:'none', cursor:'pointer', padding:'4px 0',
          }}>{item.label}</button>
        ) : (
          <span style={{ fontSize:'13px', fontWeight:600, color:'#334155' }}>{item.label}</span>
        )}
      </React.Fragment>
    ))}
  </nav>
);

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */
const CareerExplorer = ({
  user,
  onNavigate,
  mapTitle = 'Explore Industries',
  homeLabel = 'Home',
  initialView = 'home',
  homeTarget = '/',
  embeddedDetail = false,
  showFullDetails = false,
  dataScope = 'full',
}) => {
  const [view, setView] = useState(initialView);
  const [categories, setCategories] = useState([]);
  const [careerIndex, setCareerIndex] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryData, setCategoryData] = useState([]);
  const [selectedCareer, setSelectedCareer] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [catFilter, setCatFilter] = useState('');
  const searchTimeout = useRef(null);

  const isStudentDashboardExplorer = homeTarget === 'dashboard';
  const hasPaidProgram = Number(user?.program || 1) >= 2;
  const effectiveScope = isStudentDashboardExplorer && !hasPaidProgram ? 'public' : dataScope;
  const showFullAccessHint = isStudentDashboardExplorer && !hasPaidProgram;

  // Load categories on mount
  useEffect(() => {
    getCategories(effectiveScope)
      .then(setCategories)
      .catch(() => setError('Failed to load categories'));
  }, [effectiveScope]);

  // Load index for search (deferred)
  useEffect(() => {
    if (view === 'home' || view === 'map') {
      getCareerIndex(effectiveScope).then(setCareerIndex).catch(() => {});
    }
  }, [view, effectiveScope]);

  // Search handler with debounce
  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (!query.trim()) { setSearchResults([]); setIsSearching(false); return; }
    setIsSearching(true);
    searchTimeout.current = setTimeout(() => {
      const q = query.toLowerCase().trim();
      const words = q.split(/\s+/);
      const results = careerIndex
        .filter(c => {
          const text = `${c.title} ${c.category} ${c.snippet}`.toLowerCase();
          return words.every(w => text.includes(w));
        })
        .slice(0, 30);
      setSearchResults(results);
      setIsSearching(false);
    }, 200);
  }, [careerIndex]);

  // Load category data
  const loadCategory = useCallback(async (cat) => {
    setSelectedCategory(cat);
    setCatFilter('');
    setView('category');
    setLoading(true);
    setError(null);
    try {
      const data = await getCategoryData(cat.slug, effectiveScope);
      setCategoryData(data);
    } catch {
      setError('Failed to load careers for this category');
      setCategoryData([]);
    } finally {
      setLoading(false);
    }
  }, [effectiveScope]);

  // Load single career detail from search results
  const loadCareerFromSearch = useCallback(async (indexEntry) => {
    const catSlug = categories.find(c => c.name === indexEntry.category)?.slug;
    if (!catSlug) return;
    setLoading(true);
    try {
      const data = await getCategoryData(catSlug, effectiveScope);
      const career = data.find(c => c.id === indexEntry.id);
      if (career) {
        setSelectedCareer(career);
        setSelectedCategory(categories.find(c => c.name === indexEntry.category));
        setView('detail');
      }
    } catch {
      setError('Failed to load career details');
    } finally {
      setLoading(false);
    }
  }, [categories, effectiveScope]);

  const filteredCategoryData = useMemo(() => {
    if (!catFilter.trim()) return categoryData;
    const q = catFilter.toLowerCase();
    return categoryData.filter(c =>
      c.title.toLowerCase().includes(q) ||
      (c.description || '').toLowerCase().includes(q)
    );
  }, [categoryData, catFilter]);

  /* ─────────────────────────────────────────────────────────────
     VIEW: HOME / LANDING
  ───────────────────────────────────────────────────────────── */
  if (view === 'home') {
    return (
      <main role="main" style={{
        position:'relative', minHeight:'100vh', display:'flex', flexDirection:'column',
        alignItems:'center', justifyContent:'center', textAlign:'center', padding:'32px',
        background:'#0f172a', overflow:'hidden', color:'white',
      }}>
        <style>{STYLES}</style>
        <div style={{ position:'absolute', inset:0 }}>
          <img src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop"
               style={{ width:'100%', height:'100%', objectFit:'cover', opacity:.35 }} alt="" />
          <div style={{ position:'absolute', inset:0, background:'linear-gradient(180deg,rgba(15,23,42,.5) 0%,rgba(15,23,42,.85) 70%,#0f172a 100%)' }} />
        </div>

        <div className="ce-fade-up" style={{ position:'relative', zIndex:10, maxWidth:'720px' }}>
          <span style={{
            display:'inline-block', fontSize:'12px', fontWeight:700, letterSpacing:'.2em',
            color:'#a5b4fc', textTransform:'uppercase', marginBottom:'24px',
            background:'rgba(99,102,241,.15)', padding:'8px 20px', borderRadius:'8px',
          }}>Career Encyclopedia</span>

          <h1 style={{ fontSize:'clamp(2.5rem,7vw,4.5rem)', fontWeight:800, lineHeight:1.08, margin:'0 0 24px 0', letterSpacing:'-.02em', color:'white' }}>
            Discover Your{' '}
            <span style={{ background:'linear-gradient(135deg,#818cf8 0%,#c084fc 50%,#f472b6 100%)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
              Future Career
            </span>
          </h1>

          <p style={{ fontSize:'clamp(1rem,2vw,1.2rem)', color:'#94a3b8', lineHeight:1.7, margin:'0 0 40px 0', maxWidth:'520px', marginLeft:'auto', marginRight:'auto' }}>
            Explore across industries and discover paths that match your strengths.
          </p>

          <button onClick={() => setView('map')} className="ce-btn" style={{
            display:'inline-flex', alignItems:'center', gap:'10px',
            padding:'16px 40px', background:'#6366f1', color:'white',
            borderRadius:'14px', fontSize:'16px', fontWeight:700,
            border:'none', cursor:'pointer', boxShadow:'0 4px 24px rgba(99,102,241,.4)',
          }}>
            Start Exploring
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>

        </div>

        <div style={{ position:'absolute', bottom:'28px', animation:'ce-pulse 2s ease-in-out infinite' }}>
          <svg width="20" height="20" viewBox="0 0 16 16" fill="none"><path d="M4 6l4 4 4-4" stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
      </main>
    );
  }

  /* ─────────────────────────────────────────────────────────────
     VIEW: CATEGORY GRID — Dark image cards (like old cluster grid)
  ───────────────────────────────────────────────────────────── */
  if (view === 'map') {
    const showSearchResults = searchQuery.trim().length > 0;

    return (
      <div style={{ minHeight:'100vh', background:'#f8fafc' }}>
        <style>{STYLES}</style>
        <div style={{ maxWidth:'1280px', margin:'0 auto', padding:'40px 24px 80px' }}>

          {/* Header */}
          <header style={{ marginBottom:'48px' }}>
            <div style={{ marginBottom:'32px' }}>
              <BackButton onClick={() => onNavigate && onNavigate(homeTarget)} label={homeLabel} />
            </div>
            <h2 style={{ fontSize:'clamp(1.8rem,4vw,2.8rem)', fontWeight:800, color:'#0f172a', margin:'0 0 12px 0', letterSpacing:'-.02em' }}>
              {mapTitle}
            </h2>
            <p style={{ fontSize:'16px', color:'#64748b', maxWidth:'600px', lineHeight:1.6, margin:'0 0 32px 0' }}>
              Explore career pathways across industries and discover your future.
            </p>

            {showFullAccessHint && (
              <div style={{
                marginBottom:'20px',
                maxWidth:'760px',
                display:'flex',
                alignItems:'center',
                justifyContent:'space-between',
                gap:'12px',
                flexWrap:'wrap',
                padding:'10px 14px',
                borderRadius:'10px',
                border:'1px solid #e0e7ff',
                background:'#f8faff',
              }}>
                <p style={{ margin:0, fontSize:'13px', color:'#475569', lineHeight:1.5 }}>
                  You currently have Partial Access. Upgrade your program to unlock Full Access to the complete Career Encyclopedia.
                </p>
                <button
                  onClick={() => onNavigate && onNavigate('upgrade')}
                  className="ce-btn"
                  style={{
                    border:'none',
                    background:'none',
                    color:'#4f46e5',
                    fontSize:'13px',
                    fontWeight:700,
                    cursor:'pointer',
                    padding:0,
                    whiteSpace:'nowrap',
                  }}
                >
                  View Plans
                </button>
              </div>
            )}

            {/* Search */}
            <div style={{ position:'relative', maxWidth:'560px' }}>
              <div style={{ position:'absolute', left:'16px', top:'50%', transform:'translateY(-50%)', color:'#94a3b8' }}>
                <SearchIcon />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={e => handleSearch(e.target.value)}
                placeholder="Search any career — e.g. Doctor, Engineer, Designer..."
                className="ce-search-input"
                style={{
                  width:'100%', padding:'14px 20px 14px 48px', fontSize:'15px',
                  border:'1px solid #e2e8f0', borderRadius:'14px', background:'white',
                  color:'#1e293b', boxShadow:'0 1px 3px rgba(0,0,0,.04)',
                  transition:'border-color .2s, box-shadow .2s',
                }}
              />
              {searchQuery && (
                <button onClick={() => { setSearchQuery(''); setSearchResults([]); }} style={{
                  position:'absolute', right:'14px', top:'50%', transform:'translateY(-50%)',
                  background:'#f1f5f9', border:'none', borderRadius:'50%', width:'24px', height:'24px',
                  display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer',
                  fontSize:'14px', color:'#64748b',
                }}>×</button>
              )}
            </div>
          </header>

          {/* Search Results */}
          {showSearchResults ? (
            <div>
              <p style={{ fontSize:'14px', color:'#64748b', marginBottom:'20px', fontWeight:600 }}>
                {isSearching ? 'Searching...' : `Results for "${searchQuery}"`}
              </p>
              {searchResults.length > 0 ? (
                <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                  {searchResults.map((career, i) => (
                    <div
                      key={career.id}
                      className="ce-role-row ce-fade-up"
                      onClick={() => loadCareerFromSearch(career)}
                      style={{
                        background:'white', borderRadius:'16px', border:'1px solid #e5e7eb',
                        padding:'20px 24px', cursor:'pointer', display:'flex',
                        alignItems:'center', gap:'16px',
                        boxShadow:'0 1px 2px rgba(0,0,0,.03)',
                        animationDelay:`${i * .03}s`,
                      }}
                    >
                      <div style={{
                        width:'44px', height:'44px', borderRadius:'12px',
                        background: categories.find(c => c.name === career.category)?.gradient || '#6366f1',
                        display:'flex', alignItems:'center', justifyContent:'center',
                        fontSize:'20px', flexShrink:0,
                      }}>
                        {categories.find(c => c.name === career.category)?.icon || '📁'}
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:'16px', fontWeight:700, color:'#111827' }}>{career.title}</div>
                        <div style={{ fontSize:'13px', color:'#6b7280', marginTop:'2px' }}>{career.category}</div>
                      </div>
                      <div style={{ display:'flex', gap:'8px', flexShrink:0, alignItems:'center' }}>
                        {career.hasSalary && <span className="ce-tag" style={{ background:'#eef2ff', color:'#4338ca' }}>💰 Salary</span>}
                        {career.hasInstitutes && <span className="ce-tag" style={{ background:'#f0fdf4', color:'#166534' }}>🎓 Institutes</span>}
                        <span className="ce-role-arrow" style={{ opacity:0, transform:'translateX(-4px)', transition:'all .2s ease', fontSize:'20px', color:'#6366f1', flexShrink:0 }}>→</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : !isSearching ? (
                <div style={{ textAlign:'center', padding:'60px 20px', color:'#94a3b8' }}>
                  <div style={{ fontSize:'48px', marginBottom:'16px' }}>🔍</div>
                  <p style={{ fontSize:'16px', fontWeight:600 }}>No careers found for "{searchQuery}"</p>
                  <p style={{ fontSize:'14px', marginTop:'8px' }}>Try different keywords or browse categories below</p>
                </div>
              ) : null}
            </div>
          ) : (
            /* ── Dark Image Card Grid (old cluster style) ── */
            categories.length === 0 ? <ClusterSkeleton /> : (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))', gap:'24px' }}>
                {categories.map((cat, i) => {
                  const extra = CATEGORY_EXTRA[cat.slug] || {};
                  return (
                    <div
                      key={cat.slug}
                      className="ce-cluster-card ce-card ce-fade-up"
                      onClick={() => loadCategory(cat)}
                      style={{
                        position:'relative', height:'340px', borderRadius:'20px', overflow:'hidden',
                        backgroundColor:'#1e293b',
                        boxShadow:'0 4px 20px -4px rgba(0,0,0,.12)',
                        animationDelay:`${i * .07}s`,
                      }}
                    >
                      {extra.themeImage && (
                        <img
                          src={extra.themeImage} alt={cat.name}
                          style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', transition:'transform .5s ease' }}
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      )}
                      <div className="ce-overlay" style={{
                        position:'absolute', inset:0, opacity:.65,
                        background:'linear-gradient(180deg, transparent 0%, rgba(15,23,42,0.4) 40%, rgba(15,23,42,0.92) 100%)',
                      }} />

                      <div style={{ position:'absolute', bottom:0, left:0, right:0, padding:'28px', color:'white' }}>
                        <div style={{ fontSize:'36px', marginBottom:'12px' }}>{cat.icon}</div>
                        <h3 style={{ fontSize:'22px', fontWeight:700, margin:'0 0 6px 0', color:'white' }}>{cat.name}</h3>
                        <p style={{ color:'rgba(255,255,255,.7)', fontSize:'14px', margin:'0 0 16px 0', lineHeight:1.5 }}>
                          {extra.description || ''}
                        </p>
                        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                          <span className="ce-arrow" style={{ fontSize:'18px', color:'rgba(255,255,255,.6)' }}>→</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}
        </div>
      </div>
    );
  }

  /* ─────────────────────────────────────────────────────────────
     VIEW: CATEGORY DETAIL — Hero image + career role list
  ───────────────────────────────────────────────────────────── */
  if (view === 'category' && selectedCategory) {
    const extra = CATEGORY_EXTRA[selectedCategory.slug] || {};
    const filtered = filteredCategoryData;

    return (
      <div style={{ minHeight:'100vh', background:'#f8fafc' }}>
        <style>{STYLES}</style>

        {/* Compact Hero with image (like old cluster detail) */}
        <div style={{ position:'relative', height:'280px', overflow:'hidden', backgroundColor:'#0f172a' }}>
          {extra.themeImage && (
            <img
              src={extra.themeImage} alt=""
              style={{ width:'100%', height:'100%', objectFit:'cover', opacity:.4 }}
              onError={(e) => { e.target.style.opacity = '0'; }}
            />
          )}
          <div style={{ position:'absolute', inset:0, background:'linear-gradient(180deg, rgba(15,23,42,0.4) 0%, rgba(15,23,42,0.85) 100%)' }} />

          <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', justifyContent:'flex-end', padding:'32px', maxWidth:'1200px', margin:'0 auto', width:'100%', left:0, right:0 }}>
            <div style={{ position:'absolute', top:'24px', left:'32px' }}>
              <BackButton onClick={() => { setView('map'); setSearchQuery(''); }} label="All Industries" />
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:'16px', marginBottom:'8px' }}>
              <span style={{ fontSize:'40px' }}>{selectedCategory.icon}</span>
              <h2 style={{ fontSize:'clamp(1.8rem,4vw,2.8rem)', fontWeight:800, color:'white', margin:0, letterSpacing:'-.01em' }}>
                {selectedCategory.name}
              </h2>
            </div>
            <p style={{ color:'rgba(255,255,255,.6)', fontSize:'14px', fontWeight:500, margin:0 }}>
              {extra.description || ''}
            </p>
          </div>
        </div>

        {/* Career Role List */}
        <div style={{ maxWidth:'960px', margin:'0 auto', padding:'32px 24px 80px' }}>

          {/* Breadcrumb */}
          <div style={{ marginBottom:'24px' }}>
            <Breadcrumb items={[
              { label: 'Industries', onClick: () => { setView('map'); setSearchQuery(''); } },
              { label: selectedCategory.name },
            ]} />
          </div>

          {/* Filter within category */}
          <div style={{ position:'relative', marginBottom:'28px' }}>
            <div style={{ position:'absolute', left:'14px', top:'50%', transform:'translateY(-50%)', color:'#94a3b8' }}>
              <SearchIcon />
            </div>
            <input
              type="text"
              value={catFilter}
              onChange={e => setCatFilter(e.target.value)}
              placeholder="Filter careers..."
              className="ce-search-input"
              style={{
                width:'100%', padding:'12px 16px 12px 44px', fontSize:'14px',
                border:'1px solid #e2e8f0', borderRadius:'12px', background:'white',
                color:'#1e293b', boxShadow:'0 1px 2px rgba(0,0,0,.03)',
              }}
            />
          </div>

          {loading ? <CareerListSkeleton /> : error ? (
            <div style={{ textAlign:'center', padding:'40px', color:'#ef4444' }}>{error}</div>
          ) : (
            <>
              <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
                {filtered.map((career, i) => (
                  <div
                    key={career.id}
                    className="ce-role-row ce-fade-up"
                    onClick={() => { setSelectedCareer(career); setView('detail'); }}
                    style={{
                      background:'white', borderRadius:'16px', border:'1px solid #e5e7eb',
                      padding:'24px 28px', cursor:'pointer',
                      boxShadow:'0 1px 2px rgba(0,0,0,.03)',
                      animationDelay:`${Math.min(i, 15) * .05}s`,
                      display:'flex', flexDirection:'column', gap:'16px',
                    }}
                  >
                    {/* Title + Description row */}
                    <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:'16px' }}>
                      <div style={{ flex:1 }}>
                        <h4 style={{ fontSize:'18px', fontWeight:700, color:'#111827', margin:'0 0 6px 0' }}>{career.title}</h4>
                        {career.description && (
                          <p style={{ fontSize:'14px', color:'#6b7280', lineHeight:1.6, margin:0,
                            display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden',
                          }}>{career.description}</p>
                        )}
                      </div>
                      <span className="ce-role-arrow" style={{
                        opacity:0, transform:'translateX(-4px)', transition:'all .2s ease',
                        fontSize:'20px', color:'#6366f1', flexShrink:0, marginTop:'2px',
                      }}>→</span>
                    </div>

                    {/* Salary + Tags row (like old bucket detail) */}
                    <div style={{ display:'flex', flexWrap:'wrap', gap:'12px', alignItems:'center' }}>
                      {career.expected_salary && (
                        <div style={{
                          display:'flex', alignItems:'center', gap:'6px',
                          background:'#eef2ff', padding:'6px 12px', borderRadius:'8px',
                        }}>
                          <span style={{ fontSize:'12px', color:'#4338ca', fontWeight:600 }}>💰 Salary:</span>
                          <span style={{ fontSize:'13px', color:'#3730a3', fontWeight:700 }}>{career.expected_salary}</span>
                        </div>
                      )}
                      {career.required_stream && (
                        <div style={{
                          display:'flex', alignItems:'center', gap:'6px',
                          background:'#fefce8', padding:'6px 12px', borderRadius:'8px',
                        }}>
                          <span style={{ fontSize:'12px', color:'#a16207', fontWeight:600 }}>🎯 Stream:</span>
                          <span style={{ fontSize:'13px', color:'#92400e', fontWeight:700 }}>{career.required_stream}</span>
                        </div>
                      )}
                      {career.entrance_exams?.slice(0, 2).map(exam => (
                        <span key={exam} style={{
                          fontSize:'12px', color:'#4b5563', background:'#f3f4f6',
                          padding:'5px 10px', borderRadius:'6px', fontWeight:500,
                        }}>
                          {exam}
                        </span>
                      ))}
                      {career.entrance_exams?.length > 2 && (
                        <span style={{ fontSize:'12px', color:'#9ca3af', fontWeight:500 }}>
                          +{career.entrance_exams.length - 2} more exams
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  /* ─────────────────────────────────────────────────────────────
     VIEW: CAREER DETAIL
  ───────────────────────────────────────────────────────────── */
  if (view === 'detail' && selectedCareer) {
    return (
      <CareerDetail
        career={selectedCareer}
        category={selectedCategory}
        onNavigate={onNavigate}
        embedded={embeddedDetail}
        showFullDetails={showFullDetails}
        onBack={() => {
          setSelectedCareer(null);
          setView('category');
        }}
        onBackToMap={() => {
          setSelectedCareer(null);
          setSelectedCategory(null);
          setView('map');
        }}
      />
    );
  }

  return null;
};

export default CareerExplorer;
