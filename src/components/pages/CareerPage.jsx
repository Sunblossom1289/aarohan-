import React, { useState, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import {
  ArrowRight, Sparkles, Target, Users, Send,
  Linkedin, Github, Link, ChevronDown,
} from 'lucide-react';
import { GlobalStyles, Footer, Navbar } from './BannerPage';
import { API_BASE_URL } from '../../utils/config';

/* ─────────────────────── STYLES ─────────────────────── */
const CareerStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Pinyon+Script&family=Great+Vibes&family=Tangerine:wght@400;700&family=Caveat:wght@400;600;700&display=swap');

    :root {
      --blue-900: #0d2d4a;
      --blue-800: #123d64;
      --blue-700: #1a5276;
      --blue-600: #1f6496;
      --blue-500: #2980b9;
      --blue-400: #3498db;
      --blue-300: #7fb3d3;
      --blue-200: #aed6f1;
      --blue-100: #d6eaf8;
      --blue-50:  #eaf4fb;
      --white:    #ffffff;
      --gray-50:  #f8fafc;
      --gray-100: #f1f5f9;
      --gray-200: #e2e8f0;
      --gray-400: #94a3b8;
      --gray-600: #475569;
      --gray-800: #1e293b;
      --callig-far: 0.03;
      --callig-light: 0.045;
      --callig-mid: 0.06;
      --callig-front: 0.075;
    }

    .cr-root {
      background: var(--white);
      color: var(--gray-800);
      font-family: 'Inter', sans-serif;
      min-height: 100vh;
      overflow-x: hidden;
    }

    .cr-wrap {
      max-width: 1160px;
      margin: 0 auto;
      padding: 0 clamp(20px, 5vw, 60px);
    }

    .cr-hero-wrap {
      width: 100%;
      margin: 0;
      padding: 0 clamp(24px, 6vw, 86px);
    }

    /* Eyebrow chip */
    .cr-eyebrow {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      font-size: 0.68rem;
      font-weight: 600;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: var(--blue-600);
      padding: 5px 13px;
      border: 1.5px solid var(--blue-200);
      border-radius: 100px;
      background: var(--blue-50);
    }

    /* Divider */
    .cr-divider {
      height: 1px;
      background: var(--gray-200);
    }

    /* ── Marquee ── */
    @keyframes marquee-scroll {
      from { transform: translateX(0); }
      to   { transform: translateX(-50%); }
    }
    .cr-marquee-outer {
      overflow: hidden;
      background: var(--blue-50);
      border-top: 1px solid var(--blue-100);
      border-bottom: 1px solid var(--blue-100);
      padding: 13px 0;
    }
    .cr-marquee-track {
      display: flex;
      width: max-content;
      animation: marquee-scroll 26s linear infinite;
      will-change: transform;
    }
    .cr-marquee-track:hover { animation-play-state: paused; }
    .cr-marquee-item {
      display: inline-flex;
      align-items: center;
      gap: 18px;
      padding-right: 36px;
      white-space: nowrap;
    }
    .cr-marquee-dot {
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: var(--blue-400);
      flex-shrink: 0;
    }
    .cr-marquee-text {
      font-size: 0.82rem;
      font-weight: 500;
      color: var(--blue-700);
      letter-spacing: 0.04em;
    }

    /* ── Calligraphy background layers ── */
    .cr-callig {
      position: absolute;
      line-height: 1;
      user-select: none;
      pointer-events: none;
      white-space: nowrap;
    }
    .cr-callig-far { opacity: var(--callig-far); }
    .cr-callig-light { opacity: var(--callig-light); }
    .cr-callig-mid { opacity: var(--callig-mid); }
    .cr-callig-front { opacity: var(--callig-front); }

    /* ── Highlight cards ── */
    .cr-hcard {
      background: var(--white);
      border: 1.5px solid var(--gray-200);
      border-radius: 18px;
      padding: 28px 24px;
      position: relative;
      overflow: hidden;
      transition: border-color 0.25s, box-shadow 0.25s, transform 0.25s;
    }
    .cr-hcard::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 3px;
      background: linear-gradient(90deg, var(--blue-600), var(--blue-400));
      transform: scaleX(0);
      transform-origin: left;
      transition: transform 0.3s;
    }
    .cr-hcard:hover {
      border-color: var(--blue-200);
      box-shadow: 0 12px 32px -8px rgba(26,82,118,0.11);
      transform: translateY(-4px);
    }
    .cr-hcard:hover::before { transform: scaleX(1); }

    .cr-hicon {
      width: 44px; height: 44px;
      border-radius: 11px;
      background: var(--blue-50);
      border: 1.5px solid var(--blue-100);
      display: flex; align-items: center; justify-content: center;
      color: var(--blue-600);
      margin-bottom: 16px;
    }

    /* ── Inputs ── */
    .cr-input {
      width: 100%;
      background: var(--gray-50);
      border: 1.5px solid var(--gray-200);
      border-radius: 10px;
      padding: 12px 15px;
      color: var(--gray-800);
      font-family: 'Inter', sans-serif;
      font-size: 0.875rem;
      outline: none;
      transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
    }
    .cr-input::placeholder { color: var(--gray-400); }
    .cr-input:focus {
      border-color: var(--blue-500);
      background: var(--white);
      box-shadow: 0 0 0 3px rgba(41,128,185,0.1);
    }
    .cr-input:disabled { opacity: 0.55; cursor: not-allowed; }
    textarea.cr-input { resize: vertical; min-height: 128px; }

    /* Icon-prefixed field */
    .cr-field { position: relative; }
    .cr-field-icon {
      position: absolute;
      left: 13px; top: 50%;
      transform: translateY(-50%);
      color: var(--blue-400);
      pointer-events: none;
    }
    .cr-field .cr-input { padding-left: 38px; }

    /* ── Buttons ── */
    .cr-btn {
      display: inline-flex; align-items: center; justify-content: center; gap: 9px;
      padding: 14px 26px;
      background: linear-gradient(135deg, var(--blue-700), var(--blue-500));
      color: var(--white);
      font-family: 'Inter', sans-serif;
      font-weight: 600; font-size: 0.92rem;
      border: none; border-radius: 10px; cursor: pointer;
      letter-spacing: 0.01em;
      transition: all 0.25s;
      box-shadow: 0 8px 24px -6px rgba(26,82,118,0.36);
    }
    .cr-btn:hover {
      background: linear-gradient(135deg, var(--blue-800), var(--blue-600));
      transform: translateY(-2px);
      box-shadow: 0 14px 32px -6px rgba(26,82,118,0.46);
    }
    .cr-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; box-shadow: none; }

    .cr-btn-ghost {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 13px 22px;
      background: transparent;
      border: 1.5px solid var(--gray-200);
      border-radius: 10px;
      color: var(--gray-600);
      font-family: 'Inter', sans-serif;
      font-size: 0.92rem; font-weight: 500;
      cursor: pointer;
      transition: all 0.22s;
    }
    .cr-btn-ghost:hover {
      border-color: var(--blue-200);
      color: var(--blue-700);
      background: var(--blue-50);
    }

    /* ── Alerts ── */
    .cr-success {
      background: #f0fdf4; border: 1.5px solid #86efac; color: #166534;
      border-radius: 10px; padding: 13px 16px;
      font-size: 0.86rem; margin-bottom: 18px; text-align: center;
    }
    .cr-error {
      background: #fff5f5; border: 1.5px solid #fca5a5; color: #991b1b;
      border-radius: 10px; padding: 13px 16px;
      font-size: 0.86rem; margin-bottom: 18px; text-align: center;
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    /* Responsive */
    @media (max-width: 860px) {
      .cr-split { grid-template-columns: 1fr !important; }
      .cr-sticky { position: relative !important; top: 0 !important; }
      .cr-callig-soft-tablet { opacity: var(--callig-far) !important; }
    }
    @media (max-width: 720px) {
      .cr-callig-hide-mobile { display: none !important; }
      .cr-callig {
        transform: scale(0.9);
        transform-origin: center;
      }
    }
    @media (max-width: 600px) {
      .cr-form-grid { grid-template-columns: 1fr !important; }
      .cr-hero-wrap { padding: 0 20px; }
    }
  `}</style>
);

/* ─────────────────────── MARQUEE ─────────────────────── */
const MARQUEE_ITEMS = [
  'Career Guidance', 'Student-First', 'Mentorship',
  'Psychology & Tech', 'Ownership Culture', 'Impact Work',
  'Collaborative Team', 'Fast-Moving', 'Real Outcomes',
];

function MarqueeStrip() {
  const doubled = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];
  return (
    <div className="cr-marquee-outer">
      <div className="cr-marquee-track">
        {doubled.map((item, i) => (
          <span key={i} className="cr-marquee-item">
            <span className="cr-marquee-dot" />
            <span className="cr-marquee-text">{item}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────── PAGE ─────────────────────── */
export function CareerPage({ onNavigate }) {
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', message: '',
    linkedin: '', github: '', resumeDriveLink: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY   = useTransform(scrollYProgress, [0, 1], ['0%', '22%']);
  const heroOpa = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const handleChange = (key) => (e) => setFormData((p) => ({ ...p, [key]: e.target.value }));

  const getCareerApiBaseCandidates = () => {
    const candidates = [];
    const add = (value) => {
      if (!value || typeof value !== 'string') return;
      const cleaned = value.trim().replace(/\/$/, '');
      if (!cleaned || candidates.includes(cleaned)) return;
      candidates.push(cleaned);
    };

    add(API_BASE_URL);

    if (typeof window !== 'undefined') {
      const host = window.location.hostname;
      if (host === 'localhost' || host === '127.0.0.1') {
        add('http://localhost:5000');
        add('http://127.0.0.1:5000');
      }
    }

    return candidates;
  };

  const postCareerApplication = async (payload) => {
    const bases = getCareerApiBaseCandidates();
    let lastError = null;

    for (const base of bases) {
      try {
        const response = await fetch(`${base}/career-applications/submit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        return { response, base };
      } catch (error) {
        lastError = error;
      }
    }

    const tried = bases.join(', ') || 'no configured API base URL';
    throw new Error(
      `Could not reach the career API. Tried: ${tried}. Set VITE_API_BASE_URL to a reachable backend URL.`
    );
  };

  const isValidUrl    = (v) => { try { const u = new URL(v); return u.protocol === 'https:' || u.protocol === 'http:'; } catch { return false; } };
  const isValidDomain = (v, d) => { try { return new URL(v).hostname.includes(d); } catch { return false; } };

  const validate = () => {
    if (!Object.values(formData).every((i) => i.trim()))
      return { valid: false, message: 'Please fill in all fields.' };
    if (!isValidDomain(formData.linkedin, 'linkedin.com'))
      return { valid: false, message: 'Please enter a valid LinkedIn URL.' };
    if (!isValidDomain(formData.github, 'github.com'))
      return { valid: false, message: 'Please enter a valid GitHub URL.' };
    if (!isValidUrl(formData.resumeDriveLink))
      return { valid: false, message: 'Please enter a valid resume drive link.' };
    return { valid: true };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (!v.valid) { setSubmitStatus({ type: 'error', message: v.message }); return; }
    setIsSubmitting(true);
    setSubmitStatus(null);
    try {
      const payload = Object.fromEntries(
        Object.entries(formData).map(([k, val]) => [k, val.trim()])
      );
      const { response: res } = await postCareerApplication(payload);
      const contentType = res.headers.get('content-type') || '';
      const isJson = contentType.includes('application/json');
      const data = isJson ? await res.json() : {};

      if (!isJson) {
        throw new Error('Career API returned a non-JSON response. Check VITE_API_BASE_URL and backend deployment.');
      }

      if (res.ok && data.success !== false) {
        setSubmitStatus({ type: 'success', message: "Application received! We'll be in touch soon." });
        setFormData({ name: '', email: '', phone: '', message: '', linkedin: '', github: '', resumeDriveLink: '' });
        setTimeout(() => setSubmitStatus(null), 6000);
      } else {
        const setupHint = data?.setupUrl ? ` Setup Google Sheets: ${data.setupUrl}` : '';
        const statusHint = data?.statusUrl ? ` Status: ${data.statusUrl}` : '';
        setSubmitStatus({
          type: 'error',
          message: `${data.error || 'Something went wrong. Please try again.'}${setupHint}${statusHint}`,
        });
      }
    } catch (err) {
      setSubmitStatus({
        type: 'error',
        message: err?.message || 'Could not submit application right now. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollToForm = () =>
    document.getElementById('career-application-form')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const highlights = [
    {
      icon: <Sparkles size={19} />, num: '01',
      title: 'Impact-Driven Work',
      text: "Every feature you ship touches the decision of a student at a crossroads. This isn't work you forget at 5 PM.",
    },
    {
      icon: <Target size={19} />, num: '02',
      title: 'Ownership & Growth',
      text: "Titles don't define scope here. Pitch it, build it, own it. Rapid growth for people who take initiative.",
    },
    {
      icon: <Users size={19} />, num: '03',
      title: 'Collaborative Culture',
      text: 'Educators, counselors, builders, and researchers in one room. The best ideas come from cross-disciplinary collision.',
    },
  ];

  return (
    <div className="cr-root">
      <Helmet>
        <title>Careers at Aarohan | Build The Future of Career Guidance</title>
        <meta name="description" content="Join Aarohan and help shape the future of student career guidance through technology, mentorship, and data-driven insights." />
        <link rel="canonical" href="https://myaarohan.com/career" />
      </Helmet>

      <CareerStyles />
      <GlobalStyles />
      <Navbar onNavigate={onNavigate} />

      {/* ══════════════════════ HERO ══════════════════════ */}
      <section
        ref={heroRef}
        style={{
          position: 'relative',
          minHeight: '100svh',
          height: '100svh',
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden',
          background: '#ffffff',
        }}
      >
        {/* ── Parallax bg layer ── */}
        <motion.div style={{ y: heroY, opacity: heroOpa, position: 'absolute', inset: 0, pointerEvents: 'none' }}>

          {/* Subtle dot grid */}
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="cr-dots" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
                <circle cx="1.5" cy="1.5" r="1.2" fill="#2980b9" opacity="0.18" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#cr-dots)" />
          </svg>

          {/* Soft blue radial wash — top right */}
          <div style={{
            position: 'absolute', top: '-120px', right: '-80px',
            width: '700px', height: '700px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(41,128,185,0.09) 0%, transparent 62%)',
          }} />
          {/* Soft teal wash — bottom left */}
          <div style={{
            position: 'absolute', bottom: '-100px', left: '-60px',
            width: '520px', height: '520px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(26,82,118,0.06) 0%, transparent 62%)',
          }} />

          {/* ── Calligraphic script words scattered in background ── */}
          {/* "Aarohan" — large center-right anchor */}
          <div className="cr-callig cr-callig-mid" style={{
            position: 'absolute', top: '50%', right: '-30px',
            transform: 'translateY(-54%) rotate(-8deg)',
            fontFamily: "'Pinyon Script', cursive",
            fontSize: 'clamp(160px, 22vw, 280px)',
            color: 'rgb(41,128,185)',
            lineHeight: 1,
            whiteSpace: 'nowrap',
          }}>Aarohan</div>

          {/* "Build." — top left drift */}
          <div className="cr-callig cr-callig-front" style={{
            position: 'absolute', top: '12%', left: '2%',
            fontFamily: "'Pinyon Script', cursive",
            fontSize: 'clamp(60px, 8vw, 110px)',
            color: 'rgb(26,82,118)',
            transform: 'rotate(-6deg)',
          }}>Build.</div>

          {/* "Grow." — bottom right drift */}
          <div className="cr-callig cr-callig-light" style={{
            position: 'absolute', bottom: '10%', right: '8%',
            fontFamily: "'Pinyon Script', cursive",
            fontSize: 'clamp(50px, 6vw, 90px)',
            color: 'rgb(41,128,185)',
            transform: 'rotate(-4deg)',
          }}>Grow.</div>

          {/* "Dream." — mid-left low */}
          <div className="cr-callig cr-callig-light" style={{
            position: 'absolute', bottom: '22%', left: '4%',
            fontFamily: "'Pinyon Script', cursive",
            fontSize: 'clamp(44px, 5.5vw, 78px)',
            color: 'rgb(26,82,118)',
            transform: 'rotate(-5deg)',
          }}>Dream.</div>

          {/* "Lead." — top right small */}
          <div className="cr-callig cr-callig-light" style={{
            position: 'absolute', top: '18%', right: '14%',
            fontFamily: "'Pinyon Script', cursive",
            fontSize: 'clamp(38px, 4.5vw, 64px)',
            color: 'rgb(41,128,185)',
            transform: 'rotate(-7deg)',
          }}>Lead.</div>

          {/* Mixed-font calligraphy expansion */}
          <div className="cr-callig cr-callig-front cr-callig-soft-tablet" style={{
            top: '6%', left: '28%',
            fontFamily: "'Great Vibes', cursive",
            fontSize: 'clamp(52px, 6.4vw, 98px)',
            color: 'rgb(41,128,185)',
            transform: 'rotate(-2deg)',
          }}>Inspire.</div>

          <div className="cr-callig cr-callig-mid cr-callig-hide-mobile" style={{
            top: '30%', left: '12%',
            fontFamily: "'Tangerine', cursive",
            fontWeight: 700,
            fontSize: 'clamp(82px, 10vw, 150px)',
            color: 'rgb(26,82,118)',
            transform: 'rotate(-9deg)',
          }}>Mentor.</div>

          <div className="cr-callig cr-callig-light" style={{
            top: '20%', right: '31%',
            fontFamily: "'Caveat', cursive",
            fontWeight: 700,
            fontSize: 'clamp(44px, 5vw, 74px)',
            color: 'rgb(41,128,185)',
            transform: 'rotate(4deg)',
          }}>Evolve.</div>

          <div className="cr-callig cr-callig-front cr-callig-hide-mobile" style={{
            top: '58%', right: '24%',
            fontFamily: "'Great Vibes', cursive",
            fontSize: 'clamp(56px, 7vw, 112px)',
            color: 'rgb(41,128,185)',
            transform: 'rotate(-5deg)',
          }}>Discover.</div>

          <div className="cr-callig cr-callig-mid" style={{
            bottom: '36%', right: '4%',
            fontFamily: "'Tangerine', cursive",
            fontWeight: 700,
            fontSize: 'clamp(66px, 8vw, 126px)',
            color: 'rgb(26,82,118)',
            transform: 'rotate(7deg)',
          }}>Rise.</div>

          <div className="cr-callig cr-callig-light cr-callig-hide-mobile" style={{
            bottom: '14%', left: '24%',
            fontFamily: "'Caveat', cursive",
            fontWeight: 600,
            fontSize: 'clamp(40px, 4.8vw, 70px)',
            color: 'rgb(26,82,118)',
            transform: 'rotate(3deg)',
          }}>Guide.</div>

          <div className="cr-callig cr-callig-far cr-callig-soft-tablet" style={{
            top: '42%', left: '-1%',
            fontFamily: "'Great Vibes', cursive",
            fontSize: 'clamp(70px, 9vw, 140px)',
            color: 'rgb(26,82,118)',
            transform: 'rotate(-12deg)',
          }}>Imagine.</div>

          <div className="cr-callig cr-callig-mid" style={{
            bottom: '5%', right: '34%',
            fontFamily: "'Caveat', cursive",
            fontWeight: 700,
            fontSize: 'clamp(42px, 5.2vw, 76px)',
            color: 'rgb(41,128,185)',
            transform: 'rotate(-1deg)',
          }}>Illuminate.</div>

          <div className="cr-callig cr-callig-far cr-callig-hide-mobile" style={{
            top: '72%', left: '8%',
            fontFamily: "'Tangerine', cursive",
            fontWeight: 400,
            fontSize: 'clamp(72px, 9vw, 138px)',
            color: 'rgb(41,128,185)',
            transform: 'rotate(6deg)',
          }}>Unfold.</div>

          <div className="cr-callig cr-callig-light cr-callig-hide-mobile" style={{
            top: '10%', right: '-1%',
            fontFamily: "'Great Vibes', cursive",
            fontSize: 'clamp(48px, 6vw, 92px)',
            color: 'rgb(26,82,118)',
            transform: 'rotate(8deg)',
          }}>Aspire.</div>
        </motion.div>

        {/* ── Hero content ── */}
        <div
          className="cr-hero-wrap"
          style={{
            position: 'relative',
            zIndex: 1,
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            paddingTop: '96px',
            paddingBottom: '74px',
          }}
        >
          {/* ── Editorial headline composition ── */}
          <div style={{ position: 'relative', width: '100%', maxWidth: 'min(1320px, 100%)', textAlign: 'center', marginInline: 'auto' }}>

            {/* Row 1: "Shape" — enormous outlined word */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.75, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 'clamp(7rem, 18vw, 16.2rem)',
                fontWeight: 800,
                lineHeight: 0.88,
                letterSpacing: '-0.045em',
                WebkitTextStroke: '2px #0d2d4a',
                color: 'transparent',
                userSelect: 'none',
              }}
            >Shape</motion.div>

            {/* Row 2: "career journeys" — solid filled, indented */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.75, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 'clamp(3.35rem, 8.2vw, 7.2rem)',
                fontWeight: 800,
                lineHeight: 1.0,
                letterSpacing: '-0.035em',
                color: '#0d2d4a',
                marginTop: '4px',
              }}
            >career journeys</motion.div>

            {/* Row 3: "that" small + "change lives." big blue — mixed sizing */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
              style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 'clamp(10px, 2vw, 24px)', flexWrap: 'wrap', marginTop: '8px' }}
            >
              <span style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 'clamp(1.62rem, 3.8vw, 3.35rem)',
                fontWeight: 300,
                letterSpacing: '-0.02em',
                color: '#94a3b8',
                fontStyle: 'italic',
              }}>that</span>
              <span style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 'clamp(4.1rem, 9.6vw, 8.6rem)',
                fontWeight: 800,
                letterSpacing: '-0.045em',
                color: '#2980b9',
                lineHeight: 0.95,
              }}>change lives.</span>
            </motion.div>
          </div>

          {/* Description + CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.42 }}
            style={{
              width: '100%',
              maxWidth: '900px',
              marginTop: '18px',
              marginInline: 'auto',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '18px',
              flexWrap: 'wrap',
            }}
          >
            <p style={{
              fontSize: 'clamp(1.05rem, 1.6vw, 1.25rem)',
              lineHeight: 1.9,
              color: '#475569',
              maxWidth: '560px',
              fontWeight: 400,
              margin: 0,
              textAlign: 'center',
            }}>
              We're looking for curious people who think deeply, move quickly, and care intensely about helping students make confident life decisions.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap', flexShrink: 0 }}>
              <button className="cr-btn" onClick={scrollToForm}>
                Apply Now <ArrowRight size={15} />
              </button>
              <button
                className="cr-btn-ghost"
                onClick={() => document.getElementById('why-join')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Learn More
              </button>
            </div>
          </motion.div>
        </div>

        {/* Scroll cue */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          style={{
            position: 'absolute', bottom: '32px', left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
          }}
        >
          <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
            <ChevronDown size={18} color="#3498db" />
          </motion.div>
        </motion.div>
      </section>

      {/* ══════════════════════ MARQUEE ══════════════════════ */}
      <MarqueeStrip />

      {/* ══════════════════════ WHY JOIN ══════════════════════ */}
      <section id="why-join" style={{ padding: 'clamp(72px, 9vw, 108px) 0', background: '#ffffff' }}>
        <div className="cr-wrap">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            style={{ marginBottom: 'clamp(36px, 5vw, 54px)' }}
          >
            <span className="cr-eyebrow"><Sparkles size={11} /> Why Join Us</span>
            <h2 style={{
              fontSize: 'clamp(2rem, 4vw, 3.2rem)',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              color: '#0d2d4a',
              marginTop: '16px',
              lineHeight: 1.1,
            }}>
              Work that <span style={{ color: '#2980b9' }}>matters.</span>
            </h2>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
            {highlights.map((item, i) => (
              <motion.div
                key={item.title}
                className="cr-hcard"
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div className="cr-hicon">{item.icon}</div>
                  <span style={{
                    fontSize: '3rem', fontWeight: 800,
                    color: '#e2e8f0', lineHeight: 1,
                    letterSpacing: '-0.04em', userSelect: 'none',
                  }}>
                    {item.num}
                  </span>
                </div>
                <h3 style={{
                  fontSize: '1.05rem', fontWeight: 700,
                  color: '#0d2d4a', margin: '14px 0 8px',
                  letterSpacing: '-0.01em',
                }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: '0.875rem', lineHeight: 1.75, color: '#475569', fontWeight: 400 }}>
                  {item.text}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <div className="cr-divider" />

      {/* ══════════════════════ FORM ══════════════════════ */}
      <section
        id="career-application-form"
        style={{ padding: 'clamp(72px, 9vw, 112px) 0 clamp(80px, 10vw, 130px)', background: '#f8fafc' }}
      >
        <div className="cr-wrap">
          <div className="cr-split" style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: 'clamp(40px, 7vw, 88px)', alignItems: 'start' }}>

            {/* Left — pitch + process */}
            <motion.div
              className="cr-sticky"
              initial={{ opacity: 0, x: -26 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              style={{ position: 'sticky', top: '110px' }}
            >
              <span className="cr-eyebrow"><Send size={11} /> Apply Now</span>

              <h2 style={{
                fontSize: 'clamp(2rem, 4vw, 3.2rem)',
                fontWeight: 800,
                letterSpacing: '-0.03em',
                color: '#0d2d4a',
                lineHeight: 1.08,
                margin: '18px 0 0',
              }}>
                Let's build<br />
                <span style={{ color: '#2980b9' }}>something</span><br />
                together.
              </h2>

              <p style={{
                marginTop: '16px',
                fontSize: '0.9rem',
                lineHeight: 1.8,
                color: '#475569',
                fontWeight: 400,
                maxWidth: '350px',
              }}>
                We read every application ourselves — no bots, no filters. Just real people looking for
                other people who genuinely give a damn.
              </p>

              {/* Hiring process */}
              <div style={{ marginTop: '34px' }}>
                <p style={{
                  fontSize: '0.68rem', fontWeight: 600,
                  letterSpacing: '0.14em', textTransform: 'uppercase',
                  color: '#2980b9', marginBottom: '16px',
                }}>
                  Our Hiring Process
                </p>
                {[
                  'Submit your application',
                  'Short intro call (30 min)',
                  'Work sample / task round',
                  'Final conversation & offer',
                ].map((step, i, arr) => (
                  <div
                    key={step}
                    style={{
                      display: 'flex', gap: '14px', alignItems: 'center',
                      padding: '13px 0',
                      borderBottom: i < arr.length - 1 ? '1px solid #e2e8f0' : 'none',
                    }}
                  >
                    <span style={{
                      minWidth: '28px', height: '28px',
                      borderRadius: '8px',
                      background: '#eaf4fb',
                      border: '1.5px solid #aed6f1',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.7rem', fontWeight: 700,
                      color: '#1f6496', flexShrink: 0,
                    }}>
                      {`0${i + 1}`}
                    </span>
                    <span style={{ fontSize: '0.875rem', color: '#475569', fontWeight: 400 }}>{step}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right — form card */}
            <motion.div
              initial={{ opacity: 0, x: 26 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div style={{
                background: '#ffffff',
                border: '1.5px solid #e2e8f0',
                borderRadius: '20px',
                padding: 'clamp(24px, 4vw, 40px)',
                boxShadow: '0 8px 40px -12px rgba(26,82,118,0.09)',
              }}>
                <AnimatePresence>
                  {submitStatus?.type === 'success' && (
                    <motion.div className="cr-success"
                      initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                      ✓ {submitStatus.message}
                    </motion.div>
                  )}
                  {submitStatus?.type === 'error' && (
                    <motion.div className="cr-error"
                      initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                      {submitStatus.message}
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleSubmit}>
                  <div className="cr-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '11px' }}>

                    <input className="cr-input" type="text"  placeholder="Full Name"     value={formData.name}  onChange={handleChange('name')}  required disabled={isSubmitting} />
                    <input className="cr-input" type="email" placeholder="Email Address" value={formData.email} onChange={handleChange('email')} required disabled={isSubmitting} />

                    <input
                      className="cr-input" type="tel" placeholder="Phone Number"
                      value={formData.phone} onChange={handleChange('phone')}
                      required disabled={isSubmitting}
                      style={{ gridColumn: '1 / -1' }}
                    />

                    <div className="cr-field">
                      <Linkedin size={14} className="cr-field-icon" />
                      <input className="cr-input" type="url" placeholder="LinkedIn Profile URL"
                        value={formData.linkedin} onChange={handleChange('linkedin')}
                        required disabled={isSubmitting} />
                    </div>

                    <div className="cr-field">
                      <Github size={14} className="cr-field-icon" />
                      <input className="cr-input" type="url" placeholder="GitHub Profile URL"
                        value={formData.github} onChange={handleChange('github')}
                        required disabled={isSubmitting} />
                    </div>

                    <div className="cr-field" style={{ gridColumn: '1 / -1' }}>
                      <Link size={14} className="cr-field-icon" />
                      <input className="cr-input" type="url" placeholder="Resume Drive Link"
                        value={formData.resumeDriveLink} onChange={handleChange('resumeDriveLink')}
                        required disabled={isSubmitting} />
                    </div>

                    <textarea
                      className="cr-input" style={{ gridColumn: '1 / -1' }}
                      placeholder="How can you contribute to Aarohan? Tell us about yourself."
                      value={formData.message} onChange={handleChange('message')}
                      required disabled={isSubmitting}
                    />

                    <button
                      type="submit" className="cr-btn" disabled={isSubmitting}
                      style={{ gridColumn: '1 / -1', width: '100%', marginTop: '5px' }}
                    >
                      {isSubmitting ? (
                        <>
                          <span style={{
                            display: 'inline-block', width: '14px', height: '14px',
                            border: '2.5px solid rgba(255,255,255,0.35)',
                            borderTopColor: '#fff', borderRadius: '50%',
                            animation: 'spin 0.7s linear infinite',
                          }} />
                          Submitting…
                        </>
                      ) : (
                        <><Send size={14} /> Submit Application</>
                      )}
                    </button>
                  </div>
                </form>

                <p style={{
                  marginTop: '14px', fontSize: '0.74rem',
                  color: '#94a3b8', textAlign: 'center', lineHeight: 1.6,
                }}>
                  By applying you agree to our privacy policy. We do not share your data with third parties.
                </p>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      <Footer onNavigate={onNavigate} />
    </div>
  );
}
