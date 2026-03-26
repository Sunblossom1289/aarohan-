import React, { useState, useEffect } from 'react';

/* ─── Archetypes (from old personality-fit system) ─── */
const ARCHETYPES = [
  { id: 'wizard', name: 'The Wise Wizard', strength: 'Aptitude & Logic', icon: '🔮', description: 'I love solving puzzles and figuring out how things work.' },
  { id: 'bard', name: 'The Creative Bard', strength: 'Interest & Creativity', icon: '🎨', description: 'I love telling stories, making art, and expressing new ideas.' },
  { id: 'knight', name: 'The Daring Knight', strength: 'Action & Impact', icon: '🛡️', description: 'I love building things, taking action, and seeing real-world results.' },
  { id: 'champion', name: 'The People\'s Champion', strength: 'Personality & Empathy', icon: '🤝', description: 'I love helping people, leading teams, and making a difference.' },
];

/* ─── Auto-assign archetype relevance based on category ─── */
const CATEGORY_ARCHETYPES = {
  'Information Technology': [{ id: 'wizard', r: 1 }, { id: 'knight', r: .7 }, { id: 'bard', r: .4 }],
  'Engineering': [{ id: 'wizard', r: 1 }, { id: 'knight', r: .9 }, { id: 'bard', r: .3 }],
  'Arts, Media, Marketing and Entertainment': [{ id: 'bard', r: 1 }, { id: 'champion', r: .6 }, { id: 'wizard', r: .3 }],
  'Health and Wellness': [{ id: 'champion', r: 1 }, { id: 'wizard', r: .8 }, { id: 'knight', r: .4 }],
  'Business and Finance': [{ id: 'wizard', r: .9 }, { id: 'champion', r: .8 }, { id: 'knight', r: .5 }],
  'Education and Training': [{ id: 'champion', r: 1 }, { id: 'bard', r: .7 }, { id: 'wizard', r: .4 }],
  'Government Services': [{ id: 'champion', r: 1 }, { id: 'knight', r: .7 }, { id: 'wizard', r: .4 }],
  'Management': [{ id: 'champion', r: 1 }, { id: 'wizard', r: .6 }, { id: 'knight', r: .5 }],
  'Operations, Logistics, and Hospitality': [{ id: 'knight', r: 1 }, { id: 'champion', r: .6 }, { id: 'wizard', r: .3 }],
  'Public Policy, Law, and Safety': [{ id: 'champion', r: .9 }, { id: 'wizard', r: .8 }, { id: 'knight', r: .5 }],
  'Research and Development': [{ id: 'wizard', r: 1 }, { id: 'bard', r: .5 }, { id: 'knight', r: .4 }],
  'Agriculture and Allied Sciences': [{ id: 'knight', r: 1 }, { id: 'wizard', r: .6 }, { id: 'champion', r: .5 }],
  'Technical and Skill-based Trades': [{ id: 'knight', r: 1 }, { id: 'wizard', r: .7 }, { id: 'bard', r: .3 }],
};

/* ─── Styles ─── */
const DETAIL_STYLES = `
  @keyframes cd-fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
  .cd-fade-up { animation: cd-fadeUp .45s ease-out both; }
  .cd-btn { transition: all .2s ease; }
  .cd-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,.1); }
  .cd-archetype { transition: all .25s ease; }
  .cd-archetype:hover { transform: translateY(-2px); }
  .cd-input:focus { outline: none; border-color: #818cf8; box-shadow: 0 0 0 3px rgba(99,102,241,.12); }
  .cd-section { background:white; border-radius:16px; border:1px solid #e5e7eb; padding:32px; box-shadow:0 1px 3px rgba(0,0,0,.04); }
  .cd-tab { padding:10px 18px; border-radius:10px; font-size:14px; font-weight:600; border:none; cursor:pointer; transition:all .2s ease; }
  .cd-tab:hover { background:#f1f5f9; }
  .cd-tab-active { background:#eef2ff !important; color:#4338ca !important; }
  .cd-inst-item { padding:10px 14px; border-radius:10px; font-size:13px; color:#374151; background:#f9fafb; border:1px solid #f3f4f6; line-height:1.5; transition:all .2s ease; }
  .cd-inst-item:hover { background:#f1f5f9; border-color:#e2e8f0; }
`;

/* ─── Archetype Selector (like old CareerDetail) ─── */
const ArchetypeSelector = ({ suitability, onSelect, selectedId }) => (
  <div style={{ display:'flex', gap:'16px', flexWrap:'wrap' }}>
    {suitability.map((item) => {
      const archetype = ARCHETYPES.find(a => a.id === item.id);
      if (!archetype) return null;
      const isSelected = selectedId === archetype.id;
      const matchPct = Math.round(item.r * 100);

      return (
        <button
          key={item.id}
          className="cd-archetype"
          onClick={() => onSelect(archetype)}
          style={{
            display:'flex', alignItems:'center', gap:'12px',
            padding:'12px 20px', borderRadius:'12px', cursor:'pointer',
            background: isSelected ? '#eef2ff' : 'white',
            border: isSelected ? '2px solid #6366f1' : '1px solid #e5e7eb',
            boxShadow: isSelected ? '0 4px 12px rgba(99,102,241,.12)' : '0 1px 2px rgba(0,0,0,.04)',
          }}
        >
          <span style={{ fontSize:'24px' }}>{archetype.icon}</span>
          <div style={{ textAlign:'left' }}>
            <div style={{ fontSize:'14px', fontWeight:700, color: isSelected ? '#4338ca' : '#1e293b' }}>
              {archetype.name}
            </div>
            <div style={{ fontSize:'12px', color: isSelected ? '#6366f1' : '#9ca3af', fontWeight:600 }}>
              {matchPct}% match
            </div>
          </div>
        </button>
      );
    })}
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   CAREER DETAIL COMPONENT
   ═══════════════════════════════════════════════════════════════ */
const CareerDetail = ({ career, category, onBack, onBackToMap, embedded = false, showFullDetails = false }) => {
  const suitability = CATEGORY_ARCHETYPES[career.category] || CATEGORY_ARCHETYPES['Information Technology'];
  const initialChar = ARCHETYPES.find(a => a.id === suitability[0]?.id) || ARCHETYPES[0];

  const [selectedChar, setSelectedChar] = useState(initialChar);
  const [insight, setInsight] = useState(null);
  const [loading, setLoading] = useState(false);
  const [chatQuestion, setChatQuestion] = useState('');
  const [chatResponse, setChatResponse] = useState('');
  const showAskCareerBlock = false; // Feature flag to control visibility of Ask About This Career section
  const [instTab, setInstTab] = useState('government');

  const toList = (value) => {
    if (Array.isArray(value)) return value.filter(Boolean);
    if (typeof value === 'string' && value.trim()) return [value.trim()];
    return [];
  };

  const formatEducationPathway = (value) => {
    if (!value) return '';
    if (typeof value === 'string') return value;
    if (Array.isArray(value)) return value.filter(Boolean).join(' ');
    if (typeof value === 'object') {
      const parts = [];
      const courses = toList(value.courses);
      if (courses.length > 0) parts.push(courses.join(' '));
      if (typeof value.duration_note === 'string' && value.duration_note.trim()) {
        parts.push(value.duration_note.trim());
      }
      const keyExams = toList(value.key_entrance_exams);
      if (keyExams.length > 0) {
        parts.push(`Key entrance exams: ${keyExams.join(', ')}`);
      }
      return parts.join(' ').trim();
    }
    return '';
  };

  const educationalPathwayText = formatEducationPathway(career.educational_pathway);

  const govInst = career.institutes?.government || [];
  const pvtInst = career.institutes?.private || [];
  const dlInst = career.institutes?.distance_learning || [];
  const totalInstitutes = govInst.length + pvtInst.length + dlInst.length;

  const instTabs = [
    { key:'government', label:`Government (${govInst.length})`, data: govInst },
    { key:'private', label:`Private (${pvtInst.length})`, data: pvtInst },
    ...(dlInst.length > 0 ? [{ key:'distance', label:`Distance (${dlInst.length})`, data: dlInst }] : []),
  ];
  const currentInstData = instTabs.find(t => t.key === instTab)?.data || [];

  useEffect(() => {
    if (selectedChar) {
      setLoading(true);
      const timer = setTimeout(() => {
        setInsight(`As a ${selectedChar.name}, you possess natural talents that align perfectly with ${career.title}. Your ${selectedChar.strength.toLowerCase()} will be your greatest asset in this field. ${career.personality_traits?.length > 0 ? `Key traits like "${career.personality_traits[0]}" complement your archetype.` : 'Success comes from combining your innate abilities with dedicated skill development.'}`);
        setLoading(false);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [career.id, selectedChar]);

  const handleAsk = () => {
    if (!chatQuestion) return;
    setLoading(true);
    setTimeout(() => {
      setChatResponse(`Great question about ${career.title}! This career requires dedication and continuous learning. ${educationalPathwayText ? `The typical path is: ${educationalPathwayText.slice(0, 120)}...` : 'Focus on building strong fundamentals.'} ${career.personality_traits?.length > 0 ? `Key traits needed include ${career.personality_traits.slice(0, 2).join(' and ')}.` : ''}`);
      setLoading(false);
    }, 800);
  };

  /* ── Parse salary into entry/senior if possible ── */
  const parseSalary = (salaryStr) => {
    if (!salaryStr) return null;
    if (typeof salaryStr === 'object') {
      const min = salaryStr.min_inr ?? salaryStr.min ?? salaryStr.from;
      const max = salaryStr.max_inr ?? salaryStr.max ?? salaryStr.to;
      const currency = salaryStr.currency || 'INR';
      const period = salaryStr.period ? ` ${salaryStr.period}` : '';

      const formatAmount = (value) => {
        if (value === null || value === undefined || value === '') return null;
        const cleaned = String(value).replace(/,/g, '').trim();
        const n = Number(cleaned);
        if (Number.isFinite(n)) {
          return currency === 'INR' ? `₹${n.toLocaleString('en-IN')}${period}` : `${n.toLocaleString()} ${currency}${period}`;
        }
        return String(value);
      };

      const minText = formatAmount(min);
      const maxText = formatAmount(max);
      if (minText && maxText) return { entry: minText, senior: maxText };
      if (minText || maxText) return { entry: minText || maxText, senior: null };
      return null;
    }

    const s = String(salaryStr);
    // Try to split "X - Y LPA" or "Entry: X, Senior: Y" patterns
    const rangeMatch = s.match(/(\d[\d.,]*\s*(lakh|LPA|k|L)).*?(\d[\d.,]*\s*(lakh|LPA|k|L|Cr))/i);
    if (rangeMatch) {
      return { entry: rangeMatch[1].trim(), senior: rangeMatch[3].trim() };
    }
    return { entry: s, senior: null };
  };
  const salary = parseSalary(career.expected_salary);

  const entranceExams = toList(career.entrance_exams);
  const scholarships = toList(career.scholarships);
  const loans = toList(career.loans);

  const growthPathSteps = String(career.career_growth_path || '')
    .split(/\s*(?:→|->|>|\|)\s*/)
    .map((s) => s.trim())
    .filter(Boolean);

  const workEnv = career.work_environment || {};
  const hasWorkEnvironment = Boolean(
    workEnv.places_of_work ||
    workEnv.work_environment ||
    workEnv.entrepreneurship_opportunity ||
    typeof workEnv.opportunities_for_differently_abled === 'boolean'
  );

  const hasInstitutes = totalInstitutes > 0;
  const hasExpandedDetails = Boolean(
    entranceExams.length ||
    growthPathSteps.length ||
    hasWorkEnvironment ||
    scholarships.length ||
    loans.length ||
    hasInstitutes ||
    career.example_from_field
  );

  const containerStyle = embedded
    ? { position:'relative', overflowY:'visible', background:'#f8fafc', fontFamily:'system-ui,-apple-system,sans-serif' }
    : { position:'fixed', inset:0, zIndex:110, overflowY:'auto', background:'#f8fafc', fontFamily:'system-ui,-apple-system,sans-serif' };

  return (
    <div style={containerStyle}>
      <style>{DETAIL_STYLES}</style>

      {/* ── Sticky Header (old style) ── */}
      <header style={{
        position:'sticky', top:0, zIndex:20,
        background:'rgba(255,255,255,.92)', backdropFilter:'blur(12px)',
        borderBottom:'1px solid #e5e7eb', padding:'16px 24px',
        display:'flex', alignItems:'center', gap:'16px',
      }}>
        <button onClick={onBack} className="cd-btn" style={{
          display:'flex', alignItems:'center', gap:'6px',
          padding:'8px 16px', background:'#f9fafb', border:'1px solid #e5e7eb',
          borderRadius:'10px', fontSize:'14px', fontWeight:600,
          color:'#475569', cursor:'pointer',
        }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Back
        </button>
        <div style={{ height:'20px', width:'1px', background:'#e5e7eb' }} />
        <h2 style={{ fontSize:'18px', fontWeight:700, color:'#111827', margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{career.title}</h2>
      </header>

      <main className="cd-fade-up" style={{ maxWidth:'880px', margin:'0 auto', padding:'32px 24px 120px', display:'flex', flexDirection:'column', gap:'32px' }}>

        {/* ── Overview Card (old style: description + salary boxes + skills/education grid) ── */}
        <section className="cd-section">
          {/* Category badge */}
          <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'16px' }}>
            <span style={{ fontSize:'20px' }}>{category?.icon || '📁'}</span>
            <span style={{ fontSize:'12px', fontWeight:700, color:'#6366f1', textTransform:'uppercase', letterSpacing:'.06em' }}>
              {career.category}
            </span>
          </div>

          {/* Description */}
          <p style={{ fontSize:'20px', fontWeight:600, color:'#1e293b', lineHeight:1.5, margin:'0 0 28px 0' }}>
            {career.description || 'A rewarding career path with excellent growth potential.'}
          </p>

          {/* ── Salary Boxes (old style: entry=blue, senior=amber) ── */}
          {salary && (
            <div style={{ display:'flex', gap:'16px', flexWrap:'wrap', marginBottom:'28px' }}>
              <div style={{
                flex:1, minWidth:'200px', background:'#eef2ff', border:'1px solid #e0e7ff',
                borderRadius:'12px', padding:'20px',
              }}>
                <div style={{ fontSize:'12px', fontWeight:600, color:'#4338ca', textTransform:'uppercase', letterSpacing:'.05em', marginBottom:'6px' }}>
                  {salary.senior ? 'Entry-Level Salary' : 'Expected Salary'}
                </div>
                <div style={{ fontSize:'22px', fontWeight:800, color:'#3730a3' }}>
                  {salary.entry}
                </div>
              </div>
              {salary.senior && (
                <div style={{
                  flex:1, minWidth:'200px', background:'#fffbeb', border:'1px solid #fef3c7',
                  borderRadius:'12px', padding:'20px',
                }}>
                  <div style={{ fontSize:'12px', fontWeight:600, color:'#a16207', textTransform:'uppercase', letterSpacing:'.05em', marginBottom:'6px' }}>
                    Senior Level (10yr)
                  </div>
                  <div style={{ fontSize:'22px', fontWeight:800, color:'#92400e' }}>
                    {salary.senior}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Key Info + Education Grid (old style) ── */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))', gap:'20px' }}>
            {/* Personality Traits as "Key Skills" */}
            {career.personality_traits?.length > 0 && (
              <div style={{ background:'#f8fafc', borderRadius:'12px', padding:'24px', border:'1px solid #f1f5f9' }}>
                <h4 style={{ fontSize:'13px', fontWeight:700, color:'#6b7280', textTransform:'uppercase', letterSpacing:'.05em', margin:'0 0 16px 0' }}>
                  Key Traits & Skills
                </h4>
                <div style={{ display:'flex', flexWrap:'wrap', gap:'8px' }}>
                  {career.personality_traits.map((trait, i) => (
                    <span key={i} style={{
                      background:'white', padding:'6px 14px', borderRadius:'8px',
                      fontSize:'13px', fontWeight:600, color:'#4338ca',
                      border:'1px solid #e0e7ff',
                    }}>
                      {trait}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Education Path */}
            {(career.educational_pathway || career.required_stream) && (
              <div style={{ background:'#f8fafc', borderRadius:'12px', padding:'24px', border:'1px solid #f1f5f9' }}>
                <h4 style={{ fontSize:'13px', fontWeight:700, color:'#6b7280', textTransform:'uppercase', letterSpacing:'.05em', margin:'0 0 16px 0' }}>
                  Education Path
                </h4>
                {career.required_stream && (
                  <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'12px' }}>
                    <span style={{ fontSize:'12px', fontWeight:600, color:'#4338ca', background:'#eef2ff', padding:'4px 10px', borderRadius:'6px' }}>
                      🎯 {career.required_stream}
                    </span>
                  </div>
                )}
                <p style={{ fontSize:'15px', color:'#374151', fontWeight:600, lineHeight:1.6, margin:0 }}>
                  {educationalPathwayText || 'Consult your school guidance counselor for specific educational pathways.'}
                </p>
              </div>
            )}
          </div>

          {/* Course Fee row */}
          {career.course_fee && (
            <div style={{ marginTop:'20px', display:'flex', gap:'16px', flexWrap:'wrap' }}>
              <div style={{
                flex:1, minWidth:'200px', background:'#fefce8', border:'1px solid #fef3c7',
                borderRadius:'12px', padding:'16px',
              }}>
                <div style={{ fontSize:'12px', fontWeight:600, color:'#a16207', textTransform:'uppercase', letterSpacing:'.05em', marginBottom:'4px' }}>
                  📖 Course Fee
                </div>
                <div style={{ fontSize:'16px', fontWeight:700, color:'#92400e' }}>{career.course_fee}</div>
              </div>
            </div>
          )}
        </section>















        {showFullDetails && hasExpandedDetails && (
          <section className="cd-section">
            {entranceExams.length > 0 && (
              <div style={{ marginBottom:'20px', background:'#f8fafc', borderRadius:'12px', padding:'20px', border:'1px solid #f1f5f9' }}>
                <h4 style={{ fontSize:'13px', fontWeight:700, color:'#6b7280', textTransform:'uppercase', letterSpacing:'.05em', margin:'0 0 12px 0' }}>
                  Entrance Exams
                </h4>
                <div style={{ display:'flex', flexWrap:'wrap', gap:'8px' }}>
                  {entranceExams.map((exam, i) => (
                    <span key={`${exam}-${i}`} style={{ background:'white', padding:'6px 12px', borderRadius:'8px', fontSize:'13px', color:'#334155', border:'1px solid #e2e8f0', fontWeight:600 }}>
                      {exam}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {growthPathSteps.length > 0 && (
              <div style={{ marginBottom:'20px', background:'#f8fafc', borderRadius:'12px', padding:'20px', border:'1px solid #f1f5f9' }}>
                <h4 style={{ fontSize:'13px', fontWeight:700, color:'#6b7280', textTransform:'uppercase', letterSpacing:'.05em', margin:'0 0 12px 0' }}>
                  Career Growth Path
                </h4>
                <div style={{ display:'flex', flexWrap:'wrap', gap:'8px' }}>
                  {growthPathSteps.map((step, i) => (
                    <span key={`${step}-${i}`} style={{ background:'#eef2ff', padding:'6px 12px', borderRadius:'999px', fontSize:'13px', color:'#3730a3', border:'1px solid #e0e7ff', fontWeight:600 }}>
                      {step}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {hasWorkEnvironment && (
              <div style={{ marginBottom:'20px', background:'#f8fafc', borderRadius:'12px', padding:'20px', border:'1px solid #f1f5f9' }}>
                <h4 style={{ fontSize:'13px', fontWeight:700, color:'#6b7280', textTransform:'uppercase', letterSpacing:'.05em', margin:'0 0 12px 0' }}>
                  Work Environment
                </h4>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(240px, 1fr))', gap:'12px' }}>
                  {workEnv.places_of_work && (
                    <div style={{ background:'white', border:'1px solid #e5e7eb', borderRadius:'10px', padding:'14px' }}>
                      <div style={{ fontSize:'12px', fontWeight:700, color:'#475569', marginBottom:'6px', textTransform:'uppercase', letterSpacing:'.04em' }}>Places of Work</div>
                      <div style={{ fontSize:'14px', color:'#334155', lineHeight:1.6 }}>{workEnv.places_of_work}</div>
                    </div>
                  )}
                  {workEnv.work_environment && (
                    <div style={{ background:'white', border:'1px solid #e5e7eb', borderRadius:'10px', padding:'14px' }}>
                      <div style={{ fontSize:'12px', fontWeight:700, color:'#475569', marginBottom:'6px', textTransform:'uppercase', letterSpacing:'.04em' }}>Typical Work Setup</div>
                      <div style={{ fontSize:'14px', color:'#334155', lineHeight:1.6 }}>{workEnv.work_environment}</div>
                    </div>
                  )}
                  {workEnv.entrepreneurship_opportunity && (
                    <div style={{ background:'white', border:'1px solid #e5e7eb', borderRadius:'10px', padding:'14px' }}>
                      <div style={{ fontSize:'12px', fontWeight:700, color:'#475569', marginBottom:'6px', textTransform:'uppercase', letterSpacing:'.04em' }}>Entrepreneurship</div>
                      <div style={{ fontSize:'14px', color:'#334155', lineHeight:1.6 }}>{workEnv.entrepreneurship_opportunity}</div>
                    </div>
                  )}
                  {typeof workEnv.opportunities_for_differently_abled === 'boolean' && (
                    <div style={{ background:'white', border:'1px solid #e5e7eb', borderRadius:'10px', padding:'14px' }}>
                      <div style={{ fontSize:'12px', fontWeight:700, color:'#475569', marginBottom:'6px', textTransform:'uppercase', letterSpacing:'.04em' }}>Inclusive Opportunities</div>
                      <div style={{ fontSize:'14px', color:'#334155', lineHeight:1.6 }}>
                        {workEnv.opportunities_for_differently_abled ? 'Available for differently-abled candidates' : 'Limited information available'}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {(scholarships.length > 0 || loans.length > 0) && (
              <div style={{ marginBottom:'20px', display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))', gap:'14px' }}>
                {scholarships.length > 0 && (
                  <div style={{ background:'#f0fdf4', border:'1px solid #dcfce7', borderRadius:'12px', padding:'20px' }}>
                    <h4 style={{ fontSize:'13px', fontWeight:700, color:'#166534', textTransform:'uppercase', letterSpacing:'.05em', margin:'0 0 10px 0' }}>
                      Scholarships
                    </h4>
                    <ul style={{ margin:0, paddingLeft:'18px', display:'grid', gap:'8px' }}>
                      {scholarships.slice(0, 8).map((item, i) => (
                        <li key={`sch-${i}`} style={{ fontSize:'14px', color:'#14532d', lineHeight:1.5 }}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {loans.length > 0 && (
                  <div style={{ background:'#eff6ff', border:'1px solid #dbeafe', borderRadius:'12px', padding:'20px' }}>
                    <h4 style={{ fontSize:'13px', fontWeight:700, color:'#1e40af', textTransform:'uppercase', letterSpacing:'.05em', margin:'0 0 10px 0' }}>
                      Education Loans
                    </h4>
                    <ul style={{ margin:0, paddingLeft:'18px', display:'grid', gap:'8px' }}>
                      {loans.slice(0, 8).map((item, i) => (
                        <li key={`loan-${i}`} style={{ fontSize:'14px', color:'#1e3a8a', lineHeight:1.5 }}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {hasInstitutes && (
              <div style={{ marginBottom:'20px', background:'#f8fafc', borderRadius:'12px', padding:'20px', border:'1px solid #f1f5f9' }}>
                <h4 style={{ fontSize:'13px', fontWeight:700, color:'#6b7280', textTransform:'uppercase', letterSpacing:'.05em', margin:'0 0 12px 0' }}>
                  Institutes
                </h4>
                <div style={{ display:'flex', gap:'8px', flexWrap:'wrap', marginBottom:'14px' }}>
                  {instTabs.map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setInstTab(tab.key)}
                      className={`cd-tab ${instTab === tab.key ? 'cd-tab-active' : ''}`}
                      style={{ background: instTab === tab.key ? '#eef2ff' : 'white', color: instTab === tab.key ? '#4338ca' : '#475569', border:'1px solid #e5e7eb' }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {currentInstData.length > 0 ? (
                  <div style={{ display:'grid', gap:'10px' }}>
                    {currentInstData.map((inst, i) => (
                      <div key={`${inst}-${i}`} className="cd-inst-item">
                        {inst}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ margin:0, fontSize:'14px', color:'#64748b' }}>No institutes listed in this category.</p>
                )}
              </div>
            )}

            {career.example_from_field && (
              <div style={{ background:'#fff7ed', border:'1px solid #ffedd5', borderRadius:'12px', padding:'20px' }}>
                <h4 style={{ fontSize:'13px', fontWeight:700, color:'#9a3412', textTransform:'uppercase', letterSpacing:'.05em', margin:'0 0 10px 0' }}>
                  Real-World Example
                </h4>
                <p style={{ margin:0, fontSize:'14px', color:'#7c2d12', lineHeight:1.7 }}>
                  {career.example_from_field}
                </p>
              </div>
            )}
          </section>
        )}

        {/* ── Personality Fit / Archetype Compatibility (old style) ── */}
        <section className="cd-section">
          <h3 style={{ fontSize:'18px', fontWeight:700, color:'#111827', margin:'0 0 8px 0' }}>
            Personality Fit
          </h3>
          <p style={{ fontSize:'14px', color:'#6b7280', margin:'0 0 24px 0', lineHeight:1.5 }}>
            Select an archetype to see how your personality type maps to this role.
          </p>

          <ArchetypeSelector
            suitability={suitability}
            onSelect={(char) => setSelectedChar(char)}
            selectedId={selectedChar?.id}
          />

          {/* Insight panel */}
          <div style={{
            marginTop:'24px', padding:'24px', borderRadius:'12px',
            background:'#f5f3ff', border:'1px solid #ede9fe',
          }}>
            <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'12px' }}>
              <span style={{ fontSize:'20px' }}>{selectedChar?.icon}</span>
              <span style={{ fontSize:'14px', fontWeight:700, color:'#5b21b6' }}>{selectedChar?.name}</span>
              <span style={{ fontSize:'12px', color:'#7c3aed', fontWeight:500 }}>— {selectedChar?.strength}</span>
            </div>
            <p style={{ fontSize:'15px', color:'#374151', lineHeight:1.7, margin:0, fontStyle:'italic' }}>
              {loading ? 'Generating insight...' : (insight || 'Select an archetype above to see your personalized insight.')}
            </p>
          </div>
        </section>

        {/* ── Ask About This Career (temporarily hidden) ── */}
        {showAskCareerBlock && (
          <section className="cd-section">
          <h3 style={{ fontSize:'18px', fontWeight:700, color:'#111827', margin:'0 0 8px 0' }}>
            Ask About This Career
          </h3>
          <p style={{ fontSize:'14px', color:'#6b7280', margin:'0 0 20px 0' }}>
            Have a specific question? Ask and get guidance.
          </p>

          <div style={{ display:'flex', gap:'12px', flexWrap:'wrap' }}>
            <input
              type="text"
              value={chatQuestion}
              onChange={(e) => setChatQuestion(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
              placeholder={`e.g., What's a typical day like as a ${career.title}?`}
              className="cd-input"
              style={{
                flex:1, minWidth:'260px', background:'#f9fafb',
                border:'1px solid #e5e7eb', borderRadius:'12px',
                padding:'14px 20px', fontSize:'15px', color:'#1e293b',
                transition:'border-color .2s, box-shadow .2s',
              }}
            />
            <button
              onClick={handleAsk}
              disabled={loading || !chatQuestion}
              className="cd-btn"
              style={{
                background:'#6366f1', color:'white', borderRadius:'12px',
                padding:'14px 28px', fontWeight:700, fontSize:'14px',
                border:'none', cursor:'pointer',
                opacity: (loading || !chatQuestion) ? .5 : 1,
              }}
            >
              {loading ? 'Thinking...' : 'Ask'}
            </button>
          </div>

          {chatResponse && (
            <div className="cd-fade-up" style={{
              marginTop:'20px', padding:'20px', borderRadius:'12px',
              background:'#f9fafb', border:'1px solid #f3f4f6',
            }}>
              <p style={{ fontSize:'15px', color:'#374151', lineHeight:1.7, margin:0 }}>
                {chatResponse}
              </p>
            </div>
          )}
          </section>
        )}
      </main>
    </div>
  );
};

export default CareerDetail;
