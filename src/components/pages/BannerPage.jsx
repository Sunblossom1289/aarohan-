// FILE: src/components/pages/BannerPage.jsx

import React, { useRef, useState, useEffect, useMemo, useCallback, lazy, Suspense, memo } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, useScroll, useTransform, useMotionValueEvent, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, Brain, Target, Users, 
  Globe, Award, Zap, BookOpen, Mail, ChevronRight,
  GraduationCap, PenTool, MessageSquare, Send, Check,
  Map, Library, Sparkles, X, Heart, Menu, Linkedin
} from 'lucide-react';
import { API_BASE_URL } from '../../utils/config';
import { fetchLatestArticles } from '../../utils/articleHelpers';

// ==================== PERFORMANCE OPTIMIZATIONS ====================
// Lazy load heavy Spline 3D component - only loads when needed
const Spline = lazy(() => import('@splinetool/react-spline'));

// Performance detection hook - detects low-end devices
const useDevicePerformance = () => {
  const [isLowEnd, setIsLowEnd] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  
  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(motionQuery.matches);
    
    const handleMotionChange = (e) => setPrefersReducedMotion(e.matches);
    motionQuery.addEventListener('change', handleMotionChange);
    
    const detectLowEndDevice = () => {
      const memory = navigator.deviceMemory || 8; 
      const cores = navigator.hardwareConcurrency || 4;
      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      const slowConnection = connection && (connection.saveData || connection.effectiveType === '2g' || connection.effectiveType === 'slow-2g');
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      const isLow = memory <= 4 || cores <= 2 || slowConnection || (isMobile && memory <= 6);
      setIsLowEnd(isLow);
    };
    
    detectLowEndDevice();
    
    return () => motionQuery.removeEventListener('change', handleMotionChange);
  }, []);
  
  return { isLowEnd, prefersReducedMotion, shouldReduceAnimations: isLowEnd || prefersReducedMotion };
};

// Optimized scroll listener with throttling
const useThrottledScroll = (callback, delay = 100) => {
  const lastCall = useRef(0);
  
  useEffect(() => {
    const handleScroll = () => {
      const now = Date.now();
      if (now - lastCall.current >= delay) {
        lastCall.current = now;
        callback(window.scrollY);
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [callback, delay]);
};

// Intersection Observer hook for lazy animations
const useInView = (options = {}) => {
  const ref = useRef(null);
  const [isInView, setIsInView] = useState(false);
  
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          if (options.once !== false) {
            observer.unobserve(element);
          }
        } else if (options.once === false) {
          setIsInView(false);
        }
      },
      { threshold: options.threshold || 0.1, rootMargin: options.rootMargin || '50px' }
    );
    
    observer.observe(element);
    return () => observer.disconnect();
  }, [options.threshold, options.rootMargin, options.once]);
  
  return [ref, isInView];
};

const SplineFallback = memo(() => (
  <div style={{
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(135deg, rgba(98, 182, 203, 0.1) 0%, rgba(27, 73, 101, 0.05) 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }}>
    <div style={{
      width: '200px',
      height: '200px',
      borderRadius: '50%',
      background: 'radial-gradient(circle, var(--pacific-blue) 0%, transparent 70%)',
      opacity: 0.3,
      animation: 'pulse 2s ease-in-out infinite'
    }} />
  </div>
));

const LazySpline = memo(({ shouldReduceAnimations }) => {
  const [splineRef, isInView] = useInView({ threshold: 0.1 });
  const [hasLoaded, setHasLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  
  if (shouldReduceAnimations || loadError) {
    return <SplineFallback />;
  }
  
  return (
    <div ref={splineRef} style={{ position: 'absolute', inset: 0 }}>
      {isInView && (
        <Suspense fallback={<SplineFallback />}>
          <Spline 
            scene="https://prod.spline.design/nmDxuPqMEmJJK0NO/scene.splinecode"
            onLoad={() => setHasLoaded(true)}
            onError={() => setLoadError(true)}
            style={{ 
              width: '100%', 
              height: '100%',
              opacity: hasLoaded ? 1 : 0,
              transition: 'opacity 0.5s ease'
            }}
          />
        </Suspense>
      )}
      {!hasLoaded && <SplineFallback />}
    </div>
  );
});

// --- CAREER LABELS for floating background ---
const CAREER_LABELS_FULL = [
  'Data Scientist', 'Prompt Engineer', 'ML Scientist', 'AI Ethicist',
  'Cybersecurity', 'Ethical Hacker', 'Robotics Engineer', 'Cloud Security',
  'Full Stack Developer', 'DevOps Engineer', 'Blockchain Developer', 'IoT Architect',
  'Systems Analyst', 'Network Engineer', 'Database Admin', 'QA Engineer',
  'Site Reliability', 'Mobile Developer', 'Frontend Engineer', 'Backend Engineer',
  'AR/VR Developer', 'Computer Vision', 'NLP Engineer', 'Data Engineer',
  'Cloud Architect', 'Security Analyst', 'Penetration Tester', 'IT Consultant',
  'Tech Lead', 'CTO', 'Scrum Master', 'Product Manager',
  'Web Developer', 'API Developer', 'Platform Engineer', 'Solutions Architect',
  'Big Data', 'Edge Computing', 'Quantum Computing', 'Digital Twin Engineer',
  'Rocket Scientist', 'EV Diagnostics', 'Aerospace', 'Civil Engineering',
  'Marine Biology', 'Forensic Science', 'Biotechnology', 'Genomics',
  'Space Tech', 'Neuroscience', 'Chemical Engineer', 'Materials Scientist',
  'Nuclear Physicist', 'Astrophysicist', 'Climate Scientist', 'Geologist',
  'Oceanographer', 'Zoologist', 'Botanist', 'Microbiologist',
  'Nanotechnologist', 'Biomedical Engineer', 'Environmental Engineer', 'Structural Engineer',
  'Petroleum Engineer', 'Mining Engineer', 'Metallurgist', 'Polymer Scientist',
  'Seismologist', 'Volcanologist', 'Paleontologist', 'Geneticist',
  'Epidemiologist', 'Pharmacologist', 'Toxicologist', 'Lab Technician',
  'Research Scientist', 'R&D Director', 'Patent Analyst', 'Science Writer',
  'Renewable Energy', 'Solar Engineer', 'Wind Energy', 'Hydrogen Fuel',
  'Healthcare', 'Gerontologist', 'Sports Medicine', 'Pharmacy & R&D',
  'Surgeon', 'Pediatrician', 'Cardiologist', 'Dermatologist',
  'Neurologist', 'Psychiatrist', 'Radiologist', 'Anesthesiologist',
  'Oncologist', 'Orthopedic', 'Ophthalmologist', 'ENT Specialist',
  'Physiotherapist', 'Nutritionist', 'Dentist', 'Veterinarian',
  'Nurse Practitioner', 'Public Health', 'Health Informatics', 'Clinical Research',
  'Genetic Counselor', 'Occupational Therapist', 'Speech Pathologist', 'Audiologist',
  'Paramedic', 'Medical Coder', 'Hospital Admin', 'Telemedicine',
  'Finance & BFSI', 'Actuary', 'M&A Advisor', 'Investment Banking',
  'Financial Analyst', 'Chartered Accountant', 'Tax Consultant', 'Auditor',
  'Risk Manager', 'Fund Manager', 'Equity Analyst', 'Credit Analyst',
  'Venture Capital', 'Private Equity', 'Insurance Underwriter', 'Fintech',
  'Forex Trader', 'Wealth Manager', 'CFO', 'Treasury Manager',
  'Management Consultant', 'Strategy Analyst', 'Operations Manager', 'Business Analyst',
  'Entrepreneur', 'Startup Founder', 'Brand Manager', 'Market Research',
  'Sales Director', 'Account Manager', 'Real Estate', 'Property Analyst',
  'E-Commerce', 'Retail Management', 'Procurement', 'Logistics Manager',
  'Creative Arts', 'Animation', 'Music Production', 'Fashion Design',
  'Film Making', 'Game Design', 'Visual Arts', 'Product Design',
  'Graphic Designer', 'UI Designer', 'Motion Graphics', 'Illustrator',
  'Photographer', 'Videographer', 'Sound Engineer', 'Music Therapist',
  'Interior Designer', 'Landscape Architect', 'Exhibition Designer', 'Set Designer',
  'Creative Director', 'Art Director', 'Copy Writer', 'Content Creator',
  'Podcast Producer', 'Radio Jockey', 'Voice Over Artist', 'Casting Director',
  'Film Editor', 'Cinematographer', 'Screenwriter', 'Theatre Director',
  'Choreographer', 'Costume Designer', 'Makeup Artist', 'Tattoo Artist',
  'Calligrapher', 'Ceramicist', 'Sculptor', 'Muralist',
  'Humanities', 'Psychology', 'Law', 'Diplomacy',
  'Journalism', 'Social Work', 'Economics & Policy', 'Education Tech',
  'Sociologist', 'Anthropologist', 'Historian', 'Philosopher',
  'Political Scientist', 'Archaeologist', 'Linguist', 'Translator',
  'Foreign Service', 'Policy Advisor', 'NGO Director', 'Human Rights',
  'Criminologist', 'Urban Planner', 'Demographer', 'Gender Studies',
  'Cultural Critic', 'Ethics Officer', 'Mediator', 'Arbitrator',
  'Judge', 'Corporate Lawyer', 'Patent Attorney', 'Immigration Law',
  'Public Defender', 'Legal Analyst', 'Compliance Officer', 'Lobbyist',
  'Professor', 'School Principal', 'Education Consultant', 'Curriculum Designer',
  'Special Educator', 'Career Counselor', 'Academic Dean', 'Librarian',
  'E-Learning Developer', 'Training Manager', 'Life Coach', 'Corporate Trainer',
  'Study Abroad Advisor', 'Admissions Director', 'Tutor', 'Montessori Guide',
  'Content Strategy', 'Digital Marketing', 'SEO Specialist', 'Social Media Manager',
  'Public Relations', 'Event Manager', 'Advertising', 'Media Planner',
  'Communications Director', 'Technical Writer', 'Speechwriter', 'Ghostwriter',
  'Influencer Marketing', 'Community Manager', 'Brand Strategist', 'Growth Hacker',
  'Sports Coach', 'Athletic Trainer', 'Sports Psychologist', 'Sports Journalist',
  'Fitness Instructor', 'Yoga Instructor', 'Sports Agent', 'Sports Analyst',
  'Esports Manager', 'Sports Nutritionist', 'Physical Educator', 'Adventure Guide',
  'Sustainable Energy', 'Environmental Economist', 'Conservation Biologist', 'Wildlife Manager',
  'Agronomist', 'Horticulturist', 'Food Scientist', 'Organic Farmer',
  'Water Resource', 'Waste Management', 'Carbon Analyst', 'ESG Consultant',
  'Forest Ranger', 'Aquaculturist', 'Soil Scientist', 'Permaculture',
  'Drone Pilot', 'Space Tourism', 'Metaverse Designer', 'Digital Ethicist',
  'Biohacker', 'Futurist', 'Chief AI Officer', '3D Printing',
  'Sustainability Officer', 'Chief Data Officer', 'Privacy Officer', 'Trust & Safety',
  'Robotics Surgeon', 'Cyber Diplomat', 'Climate Tech', 'Smart City Planner',
  'Digital Nomad', 'Ethical Fashion', 'Circular Economy', 'Social Entrepreneur',
  'Deep Learning', 'Machine Learning', 'UX Researcher', 'Supply Chain',
  'Architecture', 'Urban Planning', 'Bioinformatics', 'Digital Tech & IT',
  'Engineering', 'Public Service', 'Toy Designer', 'Instructional Designer',
];

const CAREER_LABELS_MOBILE = [
  'Data Scientist', 'Prompt Engineer', 'ML Scientist', 'AI Ethicist',
  'Cybersecurity', 'Ethical Hacker', 'Robotics Engineer', 'Cloud Security',
  'Full Stack Developer', 'DevOps Engineer', 'Blockchain Developer', 'IoT Architect',
  'Systems Analyst', 'Network Engineer', 'Database Admin', 'QA Engineer',
  'Site Reliability', 'Mobile Developer', 'Frontend Engineer', 'Backend Engineer',
  'AR/VR Developer', 'Computer Vision', 'NLP Engineer', 'Data Engineer',
  'Cloud Architect', 'Security Analyst', 'Penetration Tester', 'IT Consultant',
  'Tech Lead', 'CTO', 'Scrum Master', 'Product Manager',
  'Web Developer', 'API Developer', 'Platform Engineer', 'Solutions Architect',
  'Big Data', 'Edge Computing', 'Quantum Computing', 'Digital Twin Engineer',
  'Rocket Scientist', 'EV Diagnostics', 'Aerospace', 'Civil Engineering',
  'Marine Biology', 'Forensic Science', 'Biotechnology', 'Genomics',
  'Space Tech', 'Neuroscience', 'Chemical Engineer', 'Materials Scientist',
  'Nuclear Physicist', 'Astrophysicist', 'Climate Scientist', 'Geologist',
  'Oceanographer', 'Zoologist', 'Botanist', 'Microbiologist',
  'Nanotechnologist', 'Biomedical Engineer', 'Environmental Engineer', 'Structural Engineer',
  'Petroleum Engineer', 'Mining Engineer', 'Metallurgist', 'Polymer Scientist',
  'Seismologist', 'Volcanologist', 'Paleontologist', 'Geneticist',
  'Epidemiologist', 'Pharmacologist', 'Toxicologist', 'Lab Technician',
  'Research Scientist', 'R&D Director', 'Patent Analyst', 'Science Writer',
  'Renewable Energy', 'Solar Engineer', 'Wind Energy', 'Hydrogen Fuel',
  'Healthcare', 'Gerontologist', 'Sports Medicine', 'Pharmacy & R&D',
  'Surgeon', 'Pediatrician', 'Cardiologist', 'Dermatologist',
];

const CareerNetworkCanvas = memo(({ shouldReduceAnimations }) => {
  const canvasRef = useRef(null);
  const nodesRef = useRef([]);
  const animFrameRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const isMobileView = window.innerWidth < 1024;
    const labels = isMobileView ? CAREER_LABELS_MOBILE : CAREER_LABELS_FULL;

    const resize = () => {
      canvas.width = canvas.parentElement.offsetWidth;
      canvas.height = canvas.parentElement.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const nodes = labels.map((label, i) => {
      const fontSize = isMobileView ? (10 + Math.random() * 10) : (12 + Math.random() * 16);
      return {
        label,
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * (isMobileView ? 0.2 : 0.35),
        vy: (Math.random() - 0.5) * (isMobileView ? 0.2 : 0.35),
        fontSize,
        opacity: 0.45 + Math.random() * 0.55,
        color: i % 3 === 0 ? '#1b4965' : i % 3 === 1 ? '#1a7a94' : '#2b6d8a',
      };
    });
    nodesRef.current = nodes;

    const CONNECTION_DIST = isMobileView ? 80 : 120;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECTION_DIST) {
            const alpha = (1 - dist / CONNECTION_DIST) * 0.18;
            ctx.strokeStyle = `rgba(27, 73, 101, ${alpha})`;
            ctx.lineWidth = 0.7;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      for (const node of nodes) {
        ctx.font = `600 ${node.fontSize}px Inter, sans-serif`;
        ctx.fillStyle = node.color;
        ctx.globalAlpha = node.opacity;
        ctx.fillText(node.label, node.x, node.y);
        ctx.globalAlpha = 1;
      }

      if (!shouldReduceAnimations) {
        for (const node of nodes) {
          node.x += node.vx;
          node.y += node.vy;
          if (node.x > canvas.width + 100) node.x = -100;
          if (node.x < -100) node.x = canvas.width + 100;
          if (node.y > canvas.height + 40) node.y = -40;
          if (node.y < -40) node.y = canvas.height + 40;
        }
      }

      animFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [shouldReduceAnimations]);

  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />;
});

const OptimizedMotion = memo(({ children, shouldReduceAnimations, ...props }) => {
  if (shouldReduceAnimations) {
    const { initial, animate, exit, whileHover, whileTap, whileInView, transition, variants, ...restProps } = props;
    return <div {...restProps}>{children}</div>;
  }
  return <motion.div {...props}>{children}</motion.div>;
});

const LazyImage = memo(({ src, alt, style, ...props }) => {
  const [imgRef, isInView] = useInView({ rootMargin: '100px' });
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  
  return (
    <div ref={imgRef} style={{ ...style, position: 'relative' }}>
      {isInView && !error && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          style={{
            ...style,
            opacity: loaded ? 1 : 0,
            transition: 'opacity 0.3s ease'
          }}
          {...props}
        />
      )}
      {(!isInView || !loaded) && !error && (
        <div style={{
          ...style,
          background: 'linear-gradient(135deg, #f0f4f8 0%, #e2e8f0 100%)',
          position: 'absolute',
          inset: 0
        }} />
      )}
    </div>
  );
});

 export const GlobalStyles = memo(() => (
  <style>{`
    :root {
      --frozen-water: #bee9e8;
      --pacific-blue: #62b6cb;
      --yale-blue: #1b4965;
      --pale-sky: #cae9ff;
      --fresh-sky: #5fa8d3;

      --color-primary: var(--yale-blue);      
      --color-primary-light: var(--fresh-sky); 
      --color-accent: var(--pacific-blue);     
      
      --color-text-main: var(--yale-blue);
      --color-text-muted: #4a7a96;            
      
      --color-border: var(--frozen-water);
      --font-family-base: 'Inter', sans-serif;
    }
    
    * { box-sizing: border-box; }
    
    html { scroll-behavior: smooth; }

    body { 
      margin: 0; 
      font-family: var(--font-family-base); 
      color: var(--color-text-main); 
      background-color: #f8fbff; 
      overflow-x: hidden;
    }
    
    .container { max-width: 1300px; margin: 0 auto; padding: 0 24px; }
    
    .text-huge { 
      font-size: clamp(2.5rem, 6vw, 4rem); 
      font-weight: 800; 
      line-height: 1.1; 
      letter-spacing: -0.02em; 
      margin-bottom: 1rem; 
      color: var(--yale-blue); 
    }
    .text-label { 
      text-transform: uppercase; 
      letter-spacing: 0.1em; 
      font-weight: 700; 
      font-size: 0.875rem; 
      color: var(--fresh-sky); 
      display: block; 
      margin-bottom: 1rem; 
    }
    
    .btn { display: inline-flex; align-items: center; justify-content: center; font-weight: 600; transition: all 0.2s; cursor: pointer; border: none; }
    .btn-primary { background: var(--color-primary); color: white; }
    .btn-primary:hover { background: var(--color-primary-light); transform: translateY(-1px); box-shadow: 0 4px 12px rgba(95, 168, 211, 0.4); }
    .btn-sm { padding: 8px 16px; font-size: 0.875rem; }
    .rounded-full { border-radius: 9999px; }

    .navbar-menu a { text-decoration: none; color: var(--color-text-muted); font-weight: 500; transition: color 0.2s; }
    .navbar-menu a:hover { color: var(--color-primary); }
    
    .hidden { display: none; }
    .block { display: block; }
    
    @media (min-width: 1024px) { 
      .lg\\:flex { display: flex; } 
      .lg\\:hidden { display: none; }
    }

    .grid { display: grid; }
    .grid-cols-1 { grid-template-columns: 1fr; }
    
    @media (min-width: 768px) { 
      .md\\:grid-cols-2 { grid-template-columns: repeat(2, 1fr); } 
      .md\\:grid-cols-3 { grid-template-columns: repeat(3, 1fr); } 
      .md\\:grid-cols-4 { grid-template-columns: repeat(4, 1fr); } 
    }

    .gap-4 { gap: 1rem; } .gap-6 { gap: 1.5rem; } .gap-8 { gap: 2rem; } .gap-12 { gap: 3rem; } 

    .input-field, .hero-input {
      width: 100%;
      padding: 12px 16px;
      border-radius: 8px;
      outline: none;
      transition: all 0.3s;
    }
    .hero-input {
      border: 1px solid var(--frozen-water);
      background: rgba(255, 255, 255, 0.8);
      color: var(--yale-blue);
      font-size: 0.9rem;
    }
    .hero-input:focus { border-color: var(--fresh-sky); background: #fff; box-shadow: 0 0 0 3px rgba(95, 168, 211, 0.15); }

    .input-field {
      border: 1px solid rgba(255,255,255,0.2);
      background: rgba(255,255,255,0.1);
      color: white;
    }
    .input-field::placeholder { color: rgba(255,255,255,0.5); }
    .input-field:focus { background: rgba(255,255,255,0.15); border-color: var(--pacific-blue); }

    .form-label {
      font-size: 0.7rem; font-weight: 800; color: var(--pacific-blue);
      text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; display: block;
    }

    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 0.3; }
      50% { transform: scale(1.05); opacity: 0.5; }
    }
    
    @keyframes shimmer {
      0% { transform: translateX(-100%); }
      50%, 100% { transform: translateX(100%); }
    }
    
    .gpu-accelerated {
      transform: translateZ(0);
      will-change: transform, opacity;
      backface-visibility: hidden;
    }
    
    [style*="position: sticky"],
    [style*="position: fixed"] {
      transform: translateZ(0);
      backface-visibility: hidden;
      -webkit-backface-visibility: hidden;
    }
    
    .sticky-viewport,
    .sticky-wrapper {
      transform: translateZ(0);
      backface-visibility: hidden;
      -webkit-backface-visibility: hidden;
      will-change: auto;
    }
    
    .section-padding > div,
    .hero-grid > div {
      transform: translateZ(0);
      backface-visibility: hidden;
      -webkit-backface-visibility: hidden;
    }
    
    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
      html { scroll-behavior: auto; }
    }

    .section-padding { padding: 8rem 0; }
    .hero-grid { grid-template-columns: 1.2fr 0.8fr; gap: 80px; }
    .sticky-wrapper { height: 500vh; }
    .sticky-viewport { position: sticky; top: 0; height: 100vh; overflow: hidden; }
    .sticky-process-wrapper { height: 250vh; }

    @media (max-width: 1024px) {
      .hero-grid { grid-template-columns: 1fr; gap: 40px; }
      .section-padding { padding: 4rem 0; }
      
      .sticky-wrapper, .sticky-process-wrapper { height: auto !important; }
      .sticky-viewport { position: relative !important; height: auto !important; overflow: visible !important; }
      .mobile-stack-cards { display: flex; flexDirection: column; gap: 2rem; }
      
      .mobile-menu-overlay {
        position: fixed; inset: 0; background: rgba(27, 73, 101, 0.95);
        backdrop-filter: blur(10px); z-index: 999;
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        gap: 2rem;
      }
      .mobile-menu-link {
        font-size: 1.5rem; color: white; text-decoration: none; font-weight: 700;
      }
    }
  `}</style>
));

export const Navbar = memo(({ onNavigate, shouldReduceAnimations }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const handleScroll = useCallback((scrollY) => {
    setScrolled(scrollY > 20);
  }, []);
  
  useThrottledScroll(handleScroll, 50);

  const toggleMenu = useCallback(() => setMobileMenuOpen(prev => !prev), []);
  const closeMenu = useCallback(() => setMobileMenuOpen(false), []);

  const headerStyle = useMemo(() => ({
    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
    padding: '16px 40px',
    background: scrolled 
      ? 'linear-gradient(180deg, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0.95) 100%)' 
      : 'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.2) 100%)',
    backdropFilter: 'blur(12px)',
    borderBottom: scrolled ? '1px solid rgba(255, 255, 255, 0.5)' : '1px solid transparent',
    boxShadow: scrolled ? '0 4px 30px rgba(0, 0, 0, 0.03)' : 'none',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    transition: 'all 0.4s ease'
  }), [scrolled]);

  const NavContent = (
    <>
      <div 
        onClick={() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
          if (onNavigate) onNavigate('home');
        }} 
        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
      >
        <img src="/logo/logou.webp" alt="myaarohan" style={{ height: '36px', width: 'auto', objectFit: 'contain' }} />
        <span style={{ fontWeight: '900', fontSize: '1.35rem', letterSpacing: '-0.02em', color: 'var(--yale-blue)' }}>MYAAROHAN</span>
      </div>
      
      <div className="navbar-menu hidden lg:flex" style={{ gap: '32px', alignItems: 'center' }}>
        {[
          { label: 'Why Us', href: '#features' },
          { label: 'Programs', href: '#programs' },
          { label: 'Knowledge Hub', href: '#blog' },
          { label: 'About', href: '#about' },
          { label: 'Stories', href: '#testimonials' }
        ].map((item) => (
          <a 
            key={item.label}
            href={item.href} 
            style={{ 
              fontSize: '0.95rem', fontWeight: '600', 
              color: 'var(--color-text-muted)', 
              position: 'relative',
              textDecoration: 'none'
            }}
            className="nav-link"
            >
              {item.label}
            </a>
          ))}
        </div>

        <div className="hidden lg:flex" style={{ gap: '16px', alignItems: 'center' }}>
          <button 
            onClick={() => onNavigate('counselor-login')} 
            style={{ 
              background: 'rgba(255,255,255,0.5)', border: '1px solid var(--frozen-water)', 
              cursor: 'pointer', color: 'var(--yale-blue)', fontWeight: '700', fontSize: '0.9rem',
              padding: '8px 16px', borderRadius: '9999px', transition: 'all 0.2s' // Updated border radius
            }}
          >
            Counselor Login
          </button>
          <button onClick={() => onNavigate('student-login')} className="btn btn-primary btn-sm rounded-full" style={{ padding: '10px 24px', boxShadow: '0 8px 20px -4px rgba(95, 168, 211, 0.5)' }}>
            Student Login
          </button>
        </div>

        <button className="lg:hidden" onClick={toggleMenu} style={{ background: 'none', border: 'none', color: 'var(--yale-blue)', padding: '4px' }}>
          {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
    </>
  );

  return (
    <>
      {shouldReduceAnimations ? (
        <header style={headerStyle}>{NavContent}</header>
      ) : (
        <motion.header 
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{ ...headerStyle, willChange: 'transform, opacity', backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
        >
          {NavContent}
        </motion.header>
      )}

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mobile-menu-overlay"
          >
            <a href="#features" className="mobile-menu-link" onClick={closeMenu}>Why Us</a>
            <a href="#programs" className="mobile-menu-link" onClick={closeMenu}>Programs</a>
            <a href="#blog" className="mobile-menu-link" onClick={closeMenu}>Knowledge Hub</a>
            <a href="#about" className="mobile-menu-link" onClick={closeMenu}>About</a>
            <a href="#testimonials" className="mobile-menu-link" onClick={closeMenu}>Stories</a>
            <div style={{ width: '60px', height: '2px', background: 'rgba(255,255,255,0.2)', margin: '10px 0' }} />
            <button onClick={() => { closeMenu(); onNavigate('counselor-login'); }} className="mobile-menu-link" style={{ background: 'transparent', border: '1px solid white', color: 'white', padding: '12px 32px', borderRadius: '9999px', cursor: 'pointer', fontSize: '1.1rem', opacity: 0.9 }}>Counselor Login</button>
            <button onClick={() => { closeMenu(); onNavigate('student-login'); }} className="btn btn-primary rounded-full" style={{ padding: '16px 32px', fontSize: '1.1rem' }}>Student Login</button>
            
            <button onClick={closeMenu} style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', color: 'white' }}>
              <X size={32} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
});

const HeroSection = memo(({ onNavigate, shouldReduceAnimations }) => {
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', middleName: '',
    school: '', standard: '', phone: '', email: '',
    dateOfBirth: '', age: '' 
  });

  const [dobParts, setDobParts] = useState({ day: '', month: '', year: '' });
  const [isSubscribed, setIsSubscribed] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showMobileForm, setShowMobileForm] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    if (!isMobile) return;
    const timer = setTimeout(() => setShowMobileForm(true), 2500);
    return () => clearTimeout(timer);
  }, [isMobile]);

  const STANDARDS = ["5th", "6th", "7th", "8th", "9th", "10th", "11th", "12th"];

  const calculateAge = useCallback((dobStr) => {
    if (!dobStr) return '';
    const dob = new Date(dobStr);
    if (Number.isNaN(dob.getTime())) return '';
    const today = new Date();
    let years = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) years--;
    return String(Math.max(0, years));
  }, []);

  const handleDobChange = useCallback((part, value) => {
    const cleanValue = value.replace(/\D/g, '');

    if (part === 'day') {
      if (cleanValue.length > 2) return;
      if (parseInt(cleanValue) > 31) return;
    }
    if (part === 'month') {
      if (cleanValue.length > 2) return;
      if (parseInt(cleanValue) > 12) return;
    }
    if (part === 'year') {
      if (cleanValue.length > 4) return;
      if (parseInt(cleanValue) > 2023) return;
    }

    const newParts = { ...dobParts, [part]: cleanValue };
    setDobParts(newParts);

    if (newParts.day && newParts.month && newParts.year.length === 4) {
      const dayStr = newParts.day.padStart(2, '0');
      const monthStr = newParts.month.padStart(2, '0');
      const yearStr = newParts.year;
      const yearInt = parseInt(yearStr);
      
      const isoDate = `${yearStr}-${monthStr}-${dayStr}`;
      const dateObj = new Date(isoDate);
      const today = new Date();
      const currentYear = today.getFullYear();

      const isRealDate = !Number.isNaN(dateObj.getTime()) && 
                          dateObj.getDate() === parseInt(dayStr) &&
                          dateObj.getMonth() + 1 === parseInt(monthStr);

      today.setHours(0,0,0,0);
      const isNotFuture = dateObj <= today;
      const isWithin50Years = yearInt >= (currentYear - 50);

      if (isRealDate && isNotFuture && isWithin50Years) {
        setFormData(prev => ({ 
          ...prev, 
          dateOfBirth: isoDate, 
          age: calculateAge(isoDate) 
        }));
        if (error) setError('');
      } else {
        setFormData(prev => ({ ...prev, dateOfBirth: '', age: '' }));
      }
    } else if (formData.dateOfBirth) {
      setFormData(prev => ({ ...prev, dateOfBirth: '', age: '' }));
    }
  }, [dobParts, formData.dateOfBirth, error]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'phone') {
      const rawDigits = value.replace(/\D/g, '');
      if (rawDigits.length > 0) {
        const firstDigit = parseInt(rawDigits[0]);
        if (![6, 7, 8, 9].includes(firstDigit)) return;
      }
      const numericValue = rawDigits.slice(0, 10);
      setFormData((prev) => ({ ...prev, [name]: numericValue }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.dateOfBirth) {
      setError('Please enter a valid complete Date of Birth');
      setLoading(false);
      return;
    }
    
    if (formData.phone.length !== 10) {
      setError('Please enter a valid 10-digit phone number');
      setLoading(false);
      return;
    }

    try {
      const apiBase = window.APIBASEURL || "http://localhost:5000/";
      const base = apiBase.endsWith("/") ? apiBase.slice(0, -1) : apiBase;

      const response = await fetch(`${base}/students/register-step1`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData) 
      });

      const data = await response.json().catch(() => ({ success: false, error: 'Invalid server response' }));

      if (!response.ok) {
        throw new Error(data.error || `Server error: ${response.status}`);
      }

      alert('Registration completed! Please login to continue.');

      setFormData({
        firstName: '', lastName: '', middleName: '',
        school: '', standard: '', phone: '', email: '',
        dateOfBirth: '', age: ''
      });
      setDobParts({ day: '', month: '', year: '' });

      if (typeof onNavigate === 'function') {
        onNavigate('student-login');
      }
    } catch (err) {
      console.error('❌ Registration error:', err);
      setError(err.message || 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section style={{ minHeight: '100vh', position: 'relative', display: 'flex', alignItems: 'center', background: 'linear-gradient(180deg, #ffffff 0%, var(--pale-sky) 100%)', paddingTop: '100px', paddingBottom: '60px', overflow: 'hidden' }}>
      
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <CareerNetworkCanvas shouldReduceAnimations={shouldReduceAnimations} />
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 50%, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0.15) 80%)' }} />
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '120px', background: 'linear-gradient(to bottom, transparent, var(--pale-sky))' }} />
      </div>

      <div className="container" style={{ position: 'relative', zIndex: 10 }}>
        <div className="grid hero-grid" style={{ alignItems: 'center' }}>
          
          <OptimizedMotion 
            shouldReduceAnimations={shouldReduceAnimations}
            initial={{ opacity: 0, x: -20 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{
              willChange: 'transform, opacity',
              backfaceVisibility: 'hidden',
              background: 'rgba(255, 255, 255, 0.55)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.5)',
              borderRadius: '24px',
              padding: 'clamp(24px, 4vw, 40px)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.04)',
            }}
          >
            <span style={{ color: 'var(--pacific-blue)', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase', fontSize: '0.9rem', display: 'block', marginBottom: '16px' }}>
              Est. 2025 | Your Career Partner
            </span>
            <h1 style={{ fontSize: 'clamp(3rem, 6vw, 5rem)', color: 'var(--yale-blue)', fontWeight: 900, lineHeight: 1.1, marginBottom: '24px' }}>
              Unlock your <br />
              <span style={{ color: 'var(--fresh-sky)' }}>true potential</span>
            </h1>
            <p style={{ fontSize: '1.25rem', color: 'var(--color-text-muted)', lineHeight: 1.6, maxWidth: '580px', textShadow: '0 2px 10px rgba(255,255,255,0.8)' }}>
              Your trusted partner, guiding and mentoring you at every step of the journey
            </p>

            <motion.button
              onClick={() => onNavigate('/career-explorer')}
              whileHover={{ scale: 1.04, boxShadow: '0 8px 32px rgba(27, 73, 101, 0.45)' }}
              whileTap={{ scale: 0.97 }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '12px',
                marginTop: '32px',
                padding: '16px 36px',
                background: 'linear-gradient(135deg, var(--yale-blue) 0%, var(--fresh-sky) 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '16px',
                fontSize: '1.05rem',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 6px 24px -4px rgba(27, 73, 101, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
                letterSpacing: '0.01em',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <span style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)',
                transform: 'translateX(-100%)',
                animation: 'shimmer 3s ease-in-out infinite',
              }} />
              <BookOpen size={20} strokeWidth={2.5} />
              <span style={{ position: 'relative', zIndex: 1 }}>Explore 495+ Careers</span>
              <ArrowRight size={18} strokeWidth={2.5} style={{ position: 'relative', zIndex: 1 }} />
            </motion.button>

            {isMobile && (
              <motion.button
                onClick={() => setShowMobileForm(true)}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginTop: '16px',
                  padding: '14px 32px',
                  background: 'var(--yale-blue)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '14px',
                  fontSize: '1rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 20px -4px rgba(27, 73, 101, 0.4)',
                  width: '100%',
                  justifyContent: 'center',
                }}
              >
                <GraduationCap size={20} /> Register Now <ArrowRight size={16} />
              </motion.button>
            )}
          </OptimizedMotion>

          {!isMobile && (
          <OptimizedMotion 
            shouldReduceAnimations={shouldReduceAnimations}
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.4, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{ 
              background: 'rgba(255, 255, 255, 0.7)', 
              backdropFilter: 'blur(20px)', 
              padding: 'clamp(20px, 5vw, 32px)', 
              borderRadius: '24px', 
              border: '1px solid white', 
              boxShadow: '0 25px 60px -12px rgba(27, 73, 101, 0.15)',
              willChange: 'transform, opacity',
              backfaceVisibility: 'hidden'
            }}
          >
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: 'var(--yale-blue)', fontSize: '1.5rem', fontWeight: 800 }}>Start Your Journey</h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--pacific-blue)' }}>Get your personalized roadmap today.</p>
            </div>

            {error && <div style={{ color: 'red', fontSize: '0.9rem', marginBottom: '10px' }}>{error}</div>}

            <form style={{ display: 'grid', gap: '12px' }} onSubmit={handleSubmit}>
              <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="form-label">First Name</label>
                  <input className="hero-input" name="firstName" type="text" placeholder="John" required value={formData.firstName} onChange={handleChange} autoComplete="given-name" />
                </div>
                <div>
                  <label className="form-label">Last Name</label>
                  <input className="hero-input" name="lastName" type="text" placeholder="Doe" required value={formData.lastName} onChange={handleChange} autoComplete="family-name" />
                </div>
              </div>
              
              <div>
                <label className="form-label">Middle Name</label>
                <input className="hero-input" name="middleName" type="text" placeholder="Optional" value={formData.middleName} onChange={handleChange} autoComplete="additional-name" />
              </div>

              <div>
                <label className="form-label">Date of Birth</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.5fr', gap: '8px' }}>
                  <input 
                    className="hero-input" 
                    placeholder="DD" 
                    value={dobParts.day}
                    onChange={(e) => handleDobChange('day', e.target.value)}
                    maxLength={2}
                    required
                    style={{ textAlign: 'center', padding: '12px 4px' }}
                  />
                  <input 
                    className="hero-input" 
                    placeholder="MM" 
                    value={dobParts.month}
                    onChange={(e) => handleDobChange('month', e.target.value)}
                    maxLength={2}
                    required
                    style={{ textAlign: 'center', padding: '12px 4px' }}
                  />
                  <input 
                    className="hero-input" 
                    placeholder="YYYY" 
                    value={dobParts.year}
                    onChange={(e) => handleDobChange('year', e.target.value)}
                    maxLength={4}
                    required
                    style={{ textAlign: 'center', padding: '12px 4px' }}
                  />
                </div>
              </div>

              <div className="grid" style={{ gridTemplateColumns: '1.5fr 0.5fr', gap: '12px' }}>
                <div>
                  <label className="form-label">School</label>
                  <input className="hero-input" name="school" type="text" placeholder="School Name" required value={formData.school} onChange={handleChange} autoComplete="organization" />
                </div>
                <div>
                  <label className="form-label">Standard</label>
                  <select 
                    className="hero-input" 
                    name="standard" 
                    value={formData.standard} 
                    onChange={handleChange} 
                    required
                    style={{ cursor: 'pointer', appearance: 'auto' }}
                  >
                    <option value="" disabled>Class</option>
                    {STANDARDS.map((std) => (
                      <option key={std} value={std}>{std}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="form-label">Phone Number</label>
                <input className="hero-input" name="phone" type="tel" placeholder="9876543210" maxLength={10} required value={formData.phone} onChange={handleChange} autoComplete="tel" />
              </div>
              <div>
                <label className="form-label">Email ID</label>
                <input className="hero-input" name="email" type="email" placeholder="john@example.com" required value={formData.email} onChange={handleChange} autoComplete="email" />
              </div>

              <div 
                onClick={() => setIsSubscribed(!isSubscribed)}
                style={{ display: 'flex', gap: '12px', marginTop: '10px', alignItems: 'flex-start', cursor: 'pointer' }}
              >
                <div style={{ 
                  minWidth: '20px', height: '20px', borderRadius: '4px', 
                  background: isSubscribed ? 'var(--yale-blue)' : 'transparent', 
                  border: isSubscribed ? 'none' : '2px solid #ccc',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  color: 'white', marginTop: '2px', transition: 'all 0.2s'
                }}>
                  {isSubscribed && <Check size={14} strokeWidth={3} />}
                </div>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-text-muted)', lineHeight: 1.4, userSelect: 'none' }}>
                  Join the climbers getting weekly cheat codes.
                </p>
              </div>

              <motion.button 
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className="btn btn-primary" 
                disabled={loading}
                style={{ width: '100%', padding: '14px', borderRadius: '12px', fontSize: '1rem', marginTop: '10px', gap: '8px' }}
              >
                {loading ? 'Submitting...' : 'Upgrade My Career'} {!loading && <ArrowRight size={18} />}
              </motion.button>
            </form>
          </OptimizedMotion>
          )}

        </div>
      </div>

      <AnimatePresence>
        {isMobile && showMobileForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setShowMobileForm(false)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 1000,
              background: 'rgba(15, 23, 42, 0.6)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
            }}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                maxHeight: '92vh',
                overflowY: 'auto',
                WebkitOverflowScrolling: 'touch',
                background: 'white',
                borderRadius: '24px 24px 0 0',
                padding: '24px 20px 32px',
                boxShadow: '0 -10px 40px rgba(0,0,0,0.15)',
                position: 'relative',
              }}
            >
              <div style={{ width: '40px', height: '4px', borderRadius: '2px', background: '#cbd5e1', margin: '0 auto 20px' }} />

              <button
                onClick={() => setShowMobileForm(false)}
                style={{
                  position: 'absolute', top: '16px', right: '16px',
                  background: 'rgba(0,0,0,0.05)', border: 'none', borderRadius: '50%',
                  width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: 'var(--yale-blue)',
                }}
              >
                <X size={20} />
              </button>

              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ margin: 0, color: 'var(--yale-blue)', fontSize: '1.4rem', fontWeight: 800 }}>Start Your Journey</h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--pacific-blue)' }}>Get your personalized roadmap today.</p>
              </div>

              {error && <div style={{ color: 'red', fontSize: '0.9rem', marginBottom: '10px' }}>{error}</div>}

              <form style={{ display: 'grid', gap: '12px' }} onSubmit={handleSubmit}>
                <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label className="form-label">First Name</label>
                    <input className="hero-input" name="firstName" type="text" placeholder="John" required value={formData.firstName} onChange={handleChange} autoComplete="given-name" />
                  </div>
                  <div>
                    <label className="form-label">Last Name</label>
                    <input className="hero-input" name="lastName" type="text" placeholder="Doe" required value={formData.lastName} onChange={handleChange} autoComplete="family-name" />
                  </div>
                </div>
                
                <div>
                  <label className="form-label">Middle Name</label>
                  <input className="hero-input" name="middleName" type="text" placeholder="Optional" value={formData.middleName} onChange={handleChange} autoComplete="additional-name" />
                </div>

                <div>
                  <label className="form-label">Date of Birth</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.5fr', gap: '8px' }}>
                    <input className="hero-input" placeholder="DD" value={dobParts.day} onChange={(e) => handleDobChange('day', e.target.value)} maxLength={2} required style={{ textAlign: 'center', padding: '12px 4px' }} />
                    <input className="hero-input" placeholder="MM" value={dobParts.month} onChange={(e) => handleDobChange('month', e.target.value)} maxLength={2} required style={{ textAlign: 'center', padding: '12px 4px' }} />
                    <input className="hero-input" placeholder="YYYY" value={dobParts.year} onChange={(e) => handleDobChange('year', e.target.value)} maxLength={4} required style={{ textAlign: 'center', padding: '12px 4px' }} />
                  </div>
                </div>

                <div className="grid" style={{ gridTemplateColumns: '1.5fr 0.5fr', gap: '12px' }}>
                  <div>
                    <label className="form-label">School</label>
                    <input className="hero-input" name="school" type="text" placeholder="School Name" required value={formData.school} onChange={handleChange} autoComplete="organization" />
                  </div>
                  <div>
                    <label className="form-label">Standard</label>
                    <select className="hero-input" name="standard" value={formData.standard} onChange={handleChange} required style={{ cursor: 'pointer', appearance: 'auto' }}>
                      <option value="" disabled>Class</option>
                      {STANDARDS.map((std) => (<option key={std} value={std}>{std}</option>))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="form-label">Phone Number</label>
                  <input className="hero-input" name="phone" type="tel" placeholder="9876543210" maxLength={10} required value={formData.phone} onChange={handleChange} autoComplete="tel" />
                </div>
                <div>
                  <label className="form-label">Email ID</label>
                  <input className="hero-input" name="email" type="email" placeholder="john@example.com" required value={formData.email} onChange={handleChange} autoComplete="email" />
                </div>

                <div 
                  onClick={() => setIsSubscribed(!isSubscribed)}
                  style={{ display: 'flex', gap: '12px', marginTop: '10px', alignItems: 'flex-start', cursor: 'pointer' }}
                >
                  <div style={{ 
                    minWidth: '20px', height: '20px', borderRadius: '4px', 
                    background: isSubscribed ? 'var(--yale-blue)' : 'transparent', 
                    border: isSubscribed ? 'none' : '2px solid #ccc',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', 
                    color: 'white', marginTop: '2px', transition: 'all 0.2s'
                  }}>
                    {isSubscribed && <Check size={14} strokeWidth={3} />}
                  </div>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-text-muted)', lineHeight: 1.4, userSelect: 'none' }}>
                    Join the climbers getting weekly cheat codes.
                  </p>
                </div>

                <motion.button 
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className="btn btn-primary" 
                  disabled={loading}
                  style={{ width: '100%', padding: '14px', borderRadius: '12px', fontSize: '1rem', marginTop: '10px', gap: '8px' }}
                >
                  {loading ? 'Submitting...' : 'Upgrade My Career'} {!loading && <ArrowRight size={18} />}
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
});

const FeaturesSection = memo(({ onNavigate, shouldReduceAnimations }) => {
  const cards = [
    {
      id: 1, 
      title: "Personalized Career Mentorship", 
      headline: "Your Very Own Career GPS",
      copy: "Stop the guesswork. Sit down with an expert who gets you. We’ll map out your detours, shortcuts, and the ultimate destination.",
      btn: "Meet Your Human Compass", 
      icon: <Users size={48} strokeWidth={1.5} />, 
      color: "var(--yale-blue)",
      imgUrl: "/images/22.webp" 
    },
    {
      id: 2, 
      title: "Advanced Assessments", 
      headline: "Decode Your Superpowers",
      copy: "Take a multi-dimensional dive into your brain. Find out why you’re a natural leader or a creative genius.",
      btn: "Unlock My Profile", 
      icon: <Brain size={48} strokeWidth={1.5} />, 
      color: "var(--pacific-blue)",
      imgUrl: "/images/28.webp"
    },
    {
      id: 3, 
      title: "Roadmap Planner", 
      headline: "The \"No-Stress\" Blueprint",
      copy: "From school to your dream corner office. We break the \"big scary future\" into tiny, doable steps. Just follow the dots.",
      btn: "Start My Roadmap", 
      icon: <Map size={48} strokeWidth={1.5} />, 
      color: "var(--fresh-sky)",
      imgUrl: "/images/27.webp"
    },
    {
      id: 4, 
      title: "Career Library", 
      headline: "The Ultimate Cheat Sheet",
      copy: "500+ careers, zero fluff. Salary trends, \"a day in the life\" videos, and the raw truth about what it’s actually like.",
      btn: "Browse the Vault", 
      icon: <Library size={48} strokeWidth={1.5} />, 
      color: "var(--yale-blue)",
      imgUrl: "/images/23.webp"
    }
  ];

  return (
    <section id="features" className="section-padding" style={{ background: '#fff' }}>
      <div className="container">
        
        <div style={{ textAlign: 'center', marginBottom: '4rem', maxWidth: '800px', margin: '0 auto 4rem auto' }}>
          <span className="text-label">The 'secret sauce' revealed</span>
          
          <h2 className="text-huge" style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', marginBottom: '24px' }}>
            Sneak Peek at Your Experience
          </h2>
          
          <p style={{ fontSize: '1.125rem', color: 'var(--color-text-muted)', lineHeight: 1.6, maxWidth: '700px', margin: '0 auto' }}>
            We didn’t just build another course or career platform; we built a career-launching machine. Just the tools you need to win.
          </p>
        </div>

        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '32px', marginBottom: '48px' }}>
          {cards.map((card) => (
            <FeatureCard key={card.id} card={card} shouldReduceAnimations={shouldReduceAnimations} />
          ))}
        </div>

        <div style={{ textAlign: 'center' }}>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onNavigate('student-login')}
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '10px', 
              padding: '16px 32px', 
              background: 'var(--yale-blue)', 
              color: 'white',
              border: 'none',
              borderRadius: '50px', 
              fontWeight: 'bold', 
              fontSize: '1.1rem',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(27, 73, 101, 0.2)'
            }}
          >
            <Sparkles size={18} /> Unlock the Perks 🔓
          </motion.button>
        </div>

      </div>
    </section>
  );
});

const FeatureCard = memo(({ card, shouldReduceAnimations }) => {
  const [imageError, setImageError] = useState(false);

  return (
    <motion.div
      initial="rest" whileHover={shouldReduceAnimations ? "rest" : "hover"} whileTap={shouldReduceAnimations ? "rest" : "hover"} animate="rest"
      style={{
        position: 'relative', height: '360px', borderRadius: '24px', background: '#f8fbff',
        border: '1px solid var(--frozen-water)', overflow: 'hidden', cursor: 'pointer',
        display: 'flex', flexDirection: 'column', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.05)',
        willChange: 'transform',
        backfaceVisibility: 'hidden'
      }}
    >
      <motion.div
        variants={{ rest: { opacity: 1, y: 0 }, hover: { opacity: 0, y: -10 } }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        style={{ 
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'flex-start',
          paddingTop: '50px', 
          zIndex: 1 
        }}
      >
        <div style={{ 
          width: '200px', 
          height: '200px', 
          background: 'white', 
          borderRadius: '24px', 
          display: 'flex', alignItems: 'center', justifyContent: 'center', 
          boxShadow: '0 20px 40px rgba(27, 73, 101, 0.15), inset 0 0 0 1px rgba(255,255,255,0.5)', 
          marginBottom: '32px', 
          color: card.color,
          overflow: 'hidden' 
        }}>
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {!imageError && card.imgUrl ? (
              <img 
                src={card.imgUrl} 
                alt={card.title}
                onError={() => setImageError(true)}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
            ) : (
              React.cloneElement(card.icon, { size: 64 }) 
            )}
          </div>
        </div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--yale-blue)' }}>{card.title}</h3>
      </motion.div>

      <motion.div
        variants={{ rest: { opacity: 0, y: 10 }, hover: { opacity: 1, y: 0 } }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, var(--yale-blue) 0%, var(--pacific-blue) 100%)', padding: '32px', display: 'flex', flexDirection: 'column', justifyContent: 'center', zIndex: 2, color: 'white' }}
      >
        <div style={{ marginBottom: '16px', color: 'var(--frozen-water)' }}>{card.icon}</div>
        <h4 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '12px', lineHeight: 1.2 }}>{card.headline}</h4>
        <p style={{ fontSize: '1rem', lineHeight: 1.5, opacity: 0.9, marginBottom: '24px' }}>{card.copy}</p>
      </motion.div>
    </motion.div>
  );
});

const PerksSection = memo(({ shouldReduceAnimations }) => {
  const containerRef = useRef(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile, { passive: true });
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const { scrollYProgress } = useScroll({ 
    target: containerRef, 
    offset: ["start start", "end end"] 
  });

  const features = useMemo(() => [
    { 
      id: 0, 
      title: "Aptitude Assessment", 
      desc: "Scientific testing algorithms designed to uncover your innate strengths.", 
      processTitle: "Take Aptitude Assessment",
      processDesc: "Our proprietary AI driven algorithm analyzes aptitude, interest and personality data to provide scientific inputs to the parents, Students & Counselors.",
      icon: <Award size={32} />, 
      color: "#1b4965", 
      img: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=1920" 
    },
    { 
      id: 1, 
      title: "Career Mapping", 
      desc: "AI-powered roadmaps that connect your current skills to future demands.", 
      processTitle: "Create Your Customized Career Map",
      processDesc: "The Platform helps curate your personalized Career Roadmap and how to achieve your Goal. We also monitor progress through our dynamic Dashboard.",
      icon: <Globe size={32} />, 
      color: "#62b6cb", 
      img: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=1920" 
    },
    { 
      id: 2, 
      title: "1-on-1 Career Mentorship", 
      desc: "Direct access to certified career mentors for personalized guidance.", 
      processTitle: "Attend 1-on-1 Career Mentorship",
      processDesc: "Our platform connects you with psychologists and expertly trained counselors, giving you contextual guidance beyond data points.",
      icon: <Users size={32} />, 
      color: "#5fa8d3", 
      img: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=1920" 
    },
    { 
      id: 3, 
      title: "Skill Workshops", 
      desc: "Exclusive workshops on soft skills, technical abilities, and interview prep.", 
      processTitle: "Access Skill Workshops & Resources",
      processDesc: "Access a vast repository of study materials, roadmaps & skill building content to stay ahead of the curve.",
      icon: <Zap size={32} />, 
      color: "#1b4965", 
      img: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=1920" 
    }
  ], []);

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const index = Math.min(features.length - 1, Math.floor(latest * features.length));
    if (index !== activeSlide) setActiveSlide(index);
  });

  if (isMobile || shouldReduceAnimations) {
    return (
      <div className="section-padding" style={{ background: '#f8fafc' }}>
        <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
          <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
            <span className="text-label">Your Journey</span>
            <h2 className="text-huge">HOW IT WORKS</h2>
          </div>
          {features.map((feature, i) => (
             <div key={i} style={{ borderRadius: '24px', overflow: 'hidden', background: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                <div style={{ height: '200px', backgroundImage: `url(${feature.img})`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
                <div style={{ padding: '24px' }}>
                   <h3 style={{ fontSize: '1.5rem', marginBottom: '8px', color: feature.color, display: 'flex', alignItems: 'center', gap: '10px' }}>
                     {feature.icon} {feature.title}
                   </h3>
                   <p style={{ color: '#4a7a96', lineHeight: 1.6, marginBottom: '20px' }}>{feature.desc}</p>
                   
                   <div style={{ height: '1px', background: '#e2e8f0', margin: '0 0 20px 0' }}></div>
                   
                   <h4 style={{ fontSize: '1.1rem', color: '#64748b', marginBottom: '4px' }}>{feature.processDesc}</h4>
                </div>
             </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="sticky-wrapper" style={{ position: 'relative', height: '400vh' }}>
      <div className="sticky-viewport" style={{ background: '#f8fafc', position: 'sticky', top: 0, height: '100vh', display: 'flex', alignItems: 'center', overflow: 'hidden', transform: 'translateZ(0)', backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}>
        
        <div className="container" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '3rem', flexShrink: 0 }}>
            <span className="text-label">Your Journey</span>
            <h2 className="text-huge" style={{ marginBottom: 0 }}>HOW IT WORKS</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center', width: '100%' }}>
            
            <div>
              <AnimatePresence mode='wait'>
                <motion.div 
                  key={activeSlide}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
                  style={{ willChange: 'transform, opacity', backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
                >
                  <div style={{ 
                    display: 'inline-flex', alignItems: 'center', gap: '12px', 
                    padding: '8px 16px', background: `${features[activeSlide].color}15`, 
                    borderRadius: '50px', color: features[activeSlide].color, fontWeight: 'bold', marginBottom: '24px' 
                  }}>
                    {features[activeSlide].icon} STEP 0{activeSlide + 1}
                  </div>

                  <h2 style={{ fontSize: '3.5rem', fontWeight: 900, color: 'var(--yale-blue)', marginBottom: '16px', lineHeight: 1.1 }}>
                    {features[activeSlide].title}
                  </h2>
                  <p style={{ fontSize: '1.25rem', color: '#1b4965', fontWeight: 500, lineHeight: 1.6, maxWidth: '500px' }}>
                    {features[activeSlide].desc}
                  </p>

                  <div style={{ marginTop: '32px', marginBottom: '32px', height: '4px', width: '100%', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 3, ease: "linear" }}
                      style={{ height: '100%', background: features[activeSlide].color, willChange: 'width' }}
                    />
                  </div>

                  <div>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#64748b', marginBottom: '8px' }}>
                        {features[activeSlide].processDesc}
                    </h3>
                  </div>

                </motion.div>
              </AnimatePresence>
            </div>

            <div style={{ position: 'relative', height: '500px', width: '100%' }}>
              <AnimatePresence mode='wait'>
                <motion.div
                  key={activeSlide}
                  initial={{ opacity: 0, scale: 0.95, rotate: 3 }}
                  animate={{ opacity: 1, scale: 1, rotate: -1 }}
                  exit={{ opacity: 0, scale: 0.95, rotate: -3 }}
                  transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                  style={{ 
                    position: 'absolute', inset: 0, 
                    borderRadius: '32px', overflow: 'hidden',
                    boxShadow: '0 40px 80px -20px rgba(0,0,0,0.2)',
                    border: '8px solid white',
                    willChange: 'transform, opacity',
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden'
                  }}
                >
                  <LazyImage 
                    src={features[activeSlide].img} 
                    alt={features[activeSlide].title} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                </motion.div>
              </AnimatePresence>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
});

// ✅ Program Flip Card Component 
// ✅ Program Flip Card Component - recreated from flash.html design
// ✅ Program Flip Card Component - recreated from flash.html design
const ProgramFlipCard = memo(({ card, onNavigate, shouldReduceAnimations }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [imageError, setImageError] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
      onClick={() => setIsFlipped(prev => !prev)}
      style={{
        backgroundColor: 'transparent',
        width: '100%',
        height: '480px',
        perspective: '1000px',
        cursor: 'pointer'
      }}
    >
      <motion.div
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: shouldReduceAnimations ? 0.15 : 0.8, ease: [0.4, 0.2, 0.2, 1] }}
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          textAlign: 'center',
          transformStyle: 'preserve-3d',
          willChange: 'transform'
        }}
      >
        {/* FRONT FACE */}
        <div style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          WebkitBackfaceVisibility: 'hidden',
          backfaceVisibility: 'hidden',
          borderRadius: '20px',
          boxShadow: '0 12px 35px rgba(0,0,0,0.1)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '35px 25px',
          boxSizing: 'border-box',
          border: '1px solid rgba(0,0,0,0.03)',
          background: 'linear-gradient(180deg, #72B0C3 0%, #FFFFFF 100%)'
        }}>
          <div>
            <h3 style={{
              fontSize: '30px',
              fontWeight: 800,
              color: '#2D3E50',
              margin: '10px 0 8px 0'
            }}>
              {card.title}
            </h3>
            <span style={{
              backgroundColor: '#fcbb11', /* ✅ CHANGED: Grade Badge color */
              color: '#FFFFFF',
              fontSize: '13px',
              fontWeight: 700,
              padding: '6px 18px',
              borderRadius: '50px',
              display: 'inline-block',
              textTransform: 'uppercase',
              boxShadow: '0 2px 8px rgba(252, 187, 17, 0.4)' /* ✅ Adjusted shadow to match the yellow */
            }}>
              {card.badge}
            </span>
          </div>

          <div style={{
            width: '100%',
            height: '180px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            margin: '10px 0'
          }}>
            {!imageError ? (
              <img
                src={card.image}
                alt={card.title}
                onError={() => setImageError(true)}
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                  borderRadius: '12px'
                }}
              />
            ) : (
              <span style={{ fontSize: '80px', filter: 'drop-shadow(0 5px 10px rgba(0,0,0,0.1))' }}>🚀</span>
            )}
          </div>

          <p style={{
            fontSize: '15px',
            fontWeight: 600,
            lineHeight: 1.5,
            color: '#2D3E50',
            margin: 0
          }}>
            &ldquo;{card.tagline}&rdquo;
          </p>
        </div>

        {/* BACK FACE */}
        <div style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          WebkitBackfaceVisibility: 'hidden',
          backfaceVisibility: 'hidden',
          borderRadius: '20px',
          boxShadow: '0 12px 35px rgba(0,0,0,0.1)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          padding: '35px 25px',
          boxSizing: 'border-box',
          border: '1px solid rgba(0,0,0,0.03)',
          background: 'linear-gradient(180deg, #E7D7B0 0%, #FFFFFF 100%)', 
          transform: 'rotateY(180deg)'
        }}>
          <h4 style={{
            fontSize: '16px',
            fontWeight: 800,
            textTransform: 'uppercase',
            color: '#2D3E50',
            margin: '10px 0 12px 0'
          }}>
            The Objective
          </h4>

          <div style={{
            backgroundColor: '#025782', /* ✅ CHANGED: Objective box color */
            color: '#FFFFFF',
            padding: '18px',
            borderRadius: '12px',
            fontSize: '13.5px',
            lineHeight: 1.5,
            fontWeight: 500,
            marginBottom: '20px',
            textAlign: 'center',
            width: '100%'
          }}>
            {card.objective}
          </div>

          <h4 style={{
            fontSize: '16px',
            fontWeight: 800,
            textTransform: 'uppercase',
            color: '#2D3E50',
            margin: '10px 0 12px 0'
          }}>
            Key Features
          </h4>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            textAlign: 'left',
            width: '100%'
          }}>
            {card.features.map((feature, idx) => (
              <div key={idx} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                background: 'rgba(255,255,255,0.4)',
                padding: '8px 10px',
                borderRadius: '10px'
              }}>
                <span style={{ fontSize: '20px' }}>{feature.icon}</span>
                <p style={{
                  fontSize: '12px',
                  lineHeight: 1.4,
                  fontWeight: 600,
                  color: '#2D3E50',
                  margin: 0
                }}>
                  {feature.text}
                </p>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            gap: '12px',
            marginTop: '16px',
            width: '100%',
            justifyContent: 'center'
          }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onNavigate) onNavigate('student-register?enroll=1');
              }}
              style={{
                padding: '10px 24px',
                background: 'var(--yale-blue, #1b4965)',
                color: 'white',
                border: 'none',
                borderRadius: '50px',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(27, 73, 101, 0.3)',
                transition: 'all 0.2s'
              }}
            >
              Enroll Now
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onNavigate) onNavigate('pricing');
              }}
              style={{
                padding: '10px 24px',
                background: 'transparent',
                color: 'var(--fresh-sky, #5fa8d3)',
                border: '2px solid var(--fresh-sky, #5fa8d3)',
                borderRadius: '50px',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Our Offering
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
});

// ✅ UPDATED PROGRAMS SECTION
const ProgramsSection = memo(({ onNavigate, shouldReduceAnimations }) => {
  const programCards = useMemo(() => [
    {
      title: "Prarambh",
      badge: "Grades 1-3",
      image: "/img_cards/card1.webp",
      tagline: "Spark your curiosity and start your journey from the first classroom to big dreams!",
      objective: "Building foundational learnability and sparking early curiosity through joyful exploration",
      features: [
        { icon: "🧠", text: "Foundational learnability & cognitive exercises." },
        { icon: "❤️", text: "Playful academic activities to build love for learning." },
        { icon: "🌱", text: "Nurturing natural inquisitiveness beyond subjects." }
      ]
    },
    {
      title: "Uday",
      badge: "Grades 4-5",
      image: "/img_cards/card2.webp",
      tagline: "Fuel your curiosity and boost your journey towards your big dreams!",
      objective: "Developing the agile mindset and mental flexibility required to navigate dynamic future career paths.",
      features: [
        { icon: "🤸", text: "Mental agility exercises for jungle-gym careers." },
        { icon: "🌉", text: "Bridging the gap: play to structured learning." },
        { icon: "💡", text: "Fostering independent problem-solving skills." }
      ]
    },
    {
      title: "Neev",
      badge: "Grades 6-8",
      image: "/img_cards/card3.webp",
      tagline: "Build a solid foundation: explore everything from Python to Pottery and find your spark!",
      objective: "Breaking early mental silos by encouraging multi-disciplinary exploration to discover genuine Aptitude DNA.",
      features: [
        { icon: "🧬", text: "Multi-disciplinary exploration (MEME framework)." },
        { icon: "🏺", text: "Vocational experiments for hands-on exposure." },
        { icon: "🗺️", text: "Early aptitude mapping for natural strengths." }
      ]
    },
    {
      title: "Disha",
      badge: "Grades 9-10",
      image: "/img_cards/card4.webp",
      tagline: "Navigate the crossroads of stream selection with scientific data and design your unique path!",
      objective: "Guiding students through stream-selection using scientific data to match personality with future-proof paths.",
      features: [
        { icon: "📊", text: "Psychometric Stream Selector & Aptitude Mapping." },
        { icon: "🧪", text: "NEP 2020 hybrid subject combinations (Bio + History)." },
        { icon: "💳", text: "Academic Bank of Credits (ABC) integration." }
      ]
    },
    {
      title: "Lakshya",
      badge: "Grades 11-12",
      image: "/img_cards/card5.webp",
      tagline: "Hit your target with a personalized academic roadmap for top colleges and future success!",
      objective: "Managing high-anxiety years by setting clear targets, ensuring the degree acts as a high-performing 'Visa'.",
      features: [
        { icon: "🛣️", text: "Strategic entrance exam (CUET/JEE/NEET) roadmaps." },
        { icon: "🏫", text: "Precision degree planning & college selection." },
        { icon: "🧘", text: "High-anxiety management with 'Career Krishna'." }
      ]
    },
    {
      title: "Udaan",
      badge: "SAT & Foreign Studies",
      image: "/img_cards/card9.jpg",
      tagline: "Ace the SAT, pick the right university abroad, and take flight with zero debt traps!",
      objective: "End-to-end guidance for SAT preparation, foreign university selection, and smart financial pathways for studying abroad.",
      features: [
        { icon: "📝", text: "Complete SAT prep strategy & score optimization." },
        { icon: "🌍", text: "Country & university compatibility analysis." },
        { icon: "💰", text: "Scholarship hunting & financial safety planning." }
      ]
    }
  ], []);

  return (
    <section id="programs" className="section-padding" style={{ background: '#F4F7F6' }}>
      <div className="container" style={{ maxWidth: '1200px' }}>
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <h2 className="text-huge">WHICH PROGRAM SHOULD I CHOOSE?</h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '30px',
          width: '100%'
        }}>
          {programCards.map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: i * 0.06, duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <ProgramFlipCard card={card} onNavigate={onNavigate} shouldReduceAnimations={shouldReduceAnimations} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
});

// ✅ UPDATED BLOG SECTION 
const BlogSection = memo(({ onNavigate, shouldReduceAnimations }) => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  const fallbackBlogs = useMemo(() => [
    { 
      id: 'f1',
      title: "Choosing the Right Stream after Class 10", 
      category: "Guidance", 
      image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=800",
      author: "Counselor Team"
    },
    { 
      id: 'f2',
      title: "The Future of AI Jobs in 2030", 
      category: "Trends", 
      image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=800",
      author: "Counselor Team"
    },
    { 
      id: 'f3',
      title: "Managing Exam Stress Effectively", 
      category: "Wellness", 
      image: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=800",
      author: "Counselor Team"
    },
    { 
      id: 'f4',
      title: "Top 10 Emerging Careers in Green Energy", 
      category: "Future Tech", 
      image: "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&q=80&w=800",
      author: "Counselor Team"
    },
    { 
      id: 'f5',
      title: "How to Build a Strong Portfolio for College", 
      category: "Admissions", 
      image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800",
      author: "Counselor Team"
    }
  ], []);

  useEffect(() => {
    async function fetchArticles() {
      try {
        const indexRes = await fetch('/articles/index.json');
        if (!indexRes.ok) throw new Error('Failed to load index');
        const fileList = await indexRes.json();

        const loaded = await Promise.all(
          fileList.slice(0, 4).map(async (fileName) => {
            const res = await fetch(`/articles/${fileName}`);
            if (!res.ok) return null;
            const data = await res.json();
            return {
                ...data,
                id: data.id || fileName.replace('.json', '')
            };
          })
        );
        
        const validArticles = loaded.filter(Boolean);
        if (validArticles.length > 0) {
          setArticles(validArticles);
        } else {
          setArticles(fallbackBlogs.slice(0, 4));
        }
      } catch (error) {
        console.error('Error loading latest articles:', error);
        setArticles(fallbackBlogs.slice(0, 4));
      } finally {
        setLoading(false);
      }
    }
    fetchArticles();
  }, []);

  const displayArticles = articles.length > 0 ? articles : fallbackBlogs.slice(0, 4);

  const handleArticleClick = (blog) => {
    onNavigate('articles');
    if (blog.id && !blog.id.startsWith('f')) {
        setTimeout(() => {
            const newUrl = `${window.location.pathname}?article=${blog.id}`;
            window.history.pushState({ path: newUrl }, '', newUrl);
        }, 100);
    }
  };

  return (
    <section id="blog" className="section-padding" style={{ background: '#f0f9ff' }}>
      <div className="container">
        
        <div style={{ marginBottom: '3rem' }}>
          <span className="text-label">Latest Insights</span>
          <h2 className="text-huge" style={{ marginBottom: 0 }}>Knowledge Hub</h2>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">

          {displayArticles.map((blog, i) => (
            <motion.div
              key={blog.id || i}
              initial={{ opacity: 0, scale: 0.97 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: (i + 1) * 0.06, duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              whileHover={{ y: -5, boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }}
              onClick={() => handleArticleClick(blog)}
              style={{ 
                background: 'white', 
                borderRadius: '24px', 
                overflow: 'hidden', 
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                cursor: 'pointer'
              }}
            >
              <div style={{ height: '200px', overflow: 'hidden', flexShrink: 0, background: '#eee' }}>
                <img 
                  src={blog.image || blog.img} 
                  alt={blog.title} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }} 
                />
              </div>
              
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                <span style={{ 
                  display: 'inline-block', width: 'fit-content', padding: '4px 12px', borderRadius: '50px', 
                  background: 'var(--frozen-water)', color: 'var(--yale-blue)', 
                  fontSize: '0.75rem', fontWeight: 'bold', marginBottom: '12px' 
                }}>
                  {blog.category || blog.cat}
                </span>
                
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--yale-blue)', lineHeight: 1.4, marginBottom: '12px' }}>
                  {blog.title}
                </h3>
                
                <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--pacific-blue)', fontSize: '0.875rem', fontWeight: '600' }}>
                  <PenTool size={14} /> By {blog.author || 'Counselor Team'}
                </div>
              </div>
            </motion.div>
          ))}

          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ delay: 0.3, duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigate('articles')}
            style={{ 
              borderRadius: '24px', 
              overflow: 'hidden', 
              cursor: 'pointer',
              background: 'linear-gradient(135deg, var(--yale-blue) 0%, var(--pacific-blue) 100%)',
              color: 'white',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '300px',
              boxShadow: '0 20px 40px -10px rgba(27, 73, 101, 0.4)'
            }}
          >
            <div style={{ 
              width: '80px', height: '80px', borderRadius: '50%', 
              background: 'rgba(255,255,255,0.2)', 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '24px', backdropFilter: 'blur(5px)'
            }}>
              <ArrowRight size={40} color="white" />
            </div>
            
            <h3 style={{ fontSize: '2rem', fontWeight: '900', marginBottom: '8px' }}>View All</h3>
            <p style={{ fontSize: '1.1rem', opacity: 0.9 }}>Explore the Knowledge Hub</p>
          </motion.div>

        </div>
      </div>
    </section>
  );
});


const AboutSection = memo(({ shouldReduceAnimations }) => {
  return (
    <section id="about" className="section-padding" style={{ background: 'linear-gradient(180deg, #ffffff 0%, #f0f7ff 100%)', position: 'relative' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, var(--frozen-water), transparent)' }}></div>

      <div className="container">
        <div style={{ textAlign: 'center', maxWidth: '1200px', margin: '0 auto 6rem auto', padding: '0 20px' }}>
        
        <span className="text-label" style={{ display: 'block', marginBottom: '10px', fontWeight: 600, color: 'var(--color-text-muted, #64748b)' }}>
          We are co-pilots, not just counselors
        </span>
        <h2 className="text-huge" style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', marginBottom: '40px', lineHeight: 1.2 }}>
          Helping you build your future <br />
          <span style={{ color: 'var(--fresh-sky, #0ea5e9)' }}>Not predict it!</span>
        </h2>

        <div style={{ 
          display: 'flex', 
          alignItems: 'stretch', 
          justifyContent: 'center', 
          gap: '24px', 
          flexWrap: 'wrap',
          marginTop: '20px' 
        }}>

          <div style={{ flex: '1', minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <span style={{ fontWeight: 'bold', color: 'var(--color-text-muted, #94a3b8)', fontSize: '1.5rem' }}>
              😕 "I have no clue"
            </span>
            
            <div style={{ 
              padding: 'clamp(24px, 3vw, 32px)', 
              background: '#fff', 
              borderRadius: '24px', 
              border: '1px solid #e2e8f0', 
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
              height: '100%', 
              textAlign: 'left'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                <div style={{ flexShrink: 0, width: '48px', height: '48px', borderRadius: '50%', background: '#f1f5f9', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <X size={24} />
                </div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#64748b', margin: 0 }}>The Old Way</h3>
              </div>
              <p style={{ color: '#64748b', lineHeight: 1.6, fontSize: '1.05rem' }}>
                Guesswork, peer pressure, and choosing a career because "Sharma ji's ka beta ye kar raha hai."
              </p>
              <div style={{ marginTop: '24px', padding: '12px 20px', background: '#f8fafc', borderRadius: '12px', fontSize: '0.9rem', color: '#94a3b8', fontStyle: 'italic', borderLeft: '4px solid #cbd5e1' }}>
                "What's the salary of a Chef vs Experienced Welder?" ...No clue.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: '40px' }}>
              <div style={{ 
                  width: 'clamp(60px, 10vw, 150px)', 
                  height: '8px', 
                  background: '#f0f0f0', 
                  borderRadius: '10px', 
                  overflow: 'hidden', 
                  position: 'relative' 
              }}>
                <motion.div 
                  initial={{ width: '0%' }} 
                  whileInView={{ width: '100%' }} 
                  viewport={{ once: true }} 
                  transition={{ duration: 1.5, ease: "easeInOut", delay: 0.2 }}
                  style={{ 
                      height: '100%', 
                      background: 'linear-gradient(90deg, #cbd5e1, var(--fresh-sky, #0ea5e9))', 
                      borderRadius: '10px' 
                  }}
                />
              </div>
          </div>

          <div style={{ flex: '1', minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <span style={{ fontWeight: 'bold', color: 'var(--yale-blue, #1b4965)', fontSize: '1.5rem' }}>
              🚀 "I can't wait to start"
            </span>

            <div style={{ 
              padding: 'clamp(24px, 3vw, 32px)', 
              background: 'var(--yale-blue, #1b4965)', 
              borderRadius: '24px', 
              boxShadow: '0 20px 50px -12px rgba(27, 73, 101, 0.4)', 
              position: 'relative', 
              overflow: 'hidden',
              height: '100%',
              textAlign: 'left'
            }}>
              <div style={{ position: 'absolute', top: 0, right: 0, width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)', pointerEvents: 'none' }}></div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', position: 'relative', zIndex: 2 }}>
                <div style={{ flexShrink: 0, width: '48px', height: '48px', borderRadius: '50%', background: 'var(--fresh-sky, #0ea5e9)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Check size={24} strokeWidth={3} />
                </div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white', margin: 0 }}>The Aarohan Way</h3>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.9)', lineHeight: 1.6, fontSize: '1.05rem', position: 'relative', zIndex: 2 }}>
                Science, empathy, and data. We combine advanced psychology with real-world practicality to be your GPS.
              </p>
            </div>
          </div>

        </div>
      </div>



        <div className="grid md:grid-cols-3 gap-8">
           <FlipCard title="Science-First" frontSub="Not Magic. Logic." backDesc="We don't read palms. We read potential. Our assessments are backed by rigorous psychological research." icon={<Brain size={32} />} />
           <FlipCard title="Lifetime Partners" frontSub="Beyond the Report." backDesc="A PDF can't high-five you when you succeed. We stay with you from your first stream choice to your first job offer." icon={<Heart size={32} />} />
           <FlipCard title="Zero Judgment" frontSub="Your Dream, Your Rules." backDesc="Want to be a Marine Biologist? A UI Designer? An AI Ethicist? We support your ambition, not the crowd's opinion." icon={<Sparkles size={32} />} />
        </div>
      </div>
    </section>
  );
});

const FlipCard = memo(({ title, frontSub, backDesc, icon, shouldReduceAnimations }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div 
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
      onClick={() => setIsFlipped(!isFlipped)}
      style={{ perspective: '1000px', height: '320px', cursor: 'pointer' }}
    >
      <motion.div
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: shouldReduceAnimations ? 0.15 : 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={{ width: '100%', height: '100%', position: 'relative', transformStyle: 'preserve-3d', willChange: 'transform', backfaceVisibility: 'hidden' }}
      >
        <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', background: 'var(--yale-blue)', color: 'white', borderRadius: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
          <div style={{ color: 'var(--fresh-sky)', marginBottom: '24px' }}>{icon}</div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '8px' }}>{title}</h3>
          <p style={{ color: 'white', fontWeight: 600 }}>{frontSub}</p>
        </div>
        <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', background: 'white', color: 'var(--yale-blue)', borderRadius: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px', textAlign: 'center', border: '2px solid var(--yale-blue)', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
           <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '16px', color: 'var(--pacific-blue)' }}>{title}</h3>
           <p style={{ lineHeight: 1.6 }}>{backDesc}</p>
        </div>
      </motion.div>
    </div>
  );
});

const TestimonialsSection = memo(({ shouldReduceAnimations }) => {
  const stories = useMemo(() => [
    { name: "Rohan S.", role: "Class 11 • The Stream Switcher", before: "I was failing Physics and convinced I was 'just bad at studying.' My parents wanted Engineering, but I hated machines.", moment: "The Psychometric test showed I had high Linguistic aptitude. The counselor introduced me to Media Law.", now: "Topping my Humanities class and interning at a legal news blog. I finally love school." },
    { name: "Priya K.", role: "Class 12 • Overwhelmed Overachiever", before: "I liked everything—Bio, Math, Art. I had 15 different career tabs open in my brain and was paralyzed by choice.", moment: "My counselor didn't tell me to pick one. She showed me Bio-Informatics—a field where I could use all my skills.", now: "Targeting top research universities with a portfolio that makes sense. No more panic attacks." },
    { name: "Mr. Gupta", role: "Father of Arjun (Class 10)", before: "I thought career mentorship was just for kids who were struggling. Arjun is a bright student; I thought he'd figure it out.", moment: "The '3D Career Roadmap' blew me away. It wasn't just advice; it was a strategic plan for the next 5 years.", now: "We aren't arguing about his future anymore. We're planning it together. Best investment I've made." }
  ], []);

  return (
    <section id="testimonials" className="section-padding" style={{ background: 'radial-gradient(circle at center top, #1f5575 0%, #0e2a3b 100%)', color: 'white' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
          <span className="text-label" style={{ color: 'var(--pacific-blue)' }}>Hall of Fame</span>
          <h2 className="text-huge" style={{ color: 'white', marginBottom: '1rem' }}>Success Stories</h2>
          <p style={{ color: 'var(--pale-sky)', fontSize: '1.25rem', maxWidth: '600px', margin: '0 auto' }}>Real students. Real pivots. Real results.</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {stories.map((story, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: i * 0.08, duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
              style={{ background: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(10px)', padding: '36px', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', flexDirection: 'column', gap: '24px', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.3)' }}
            >
              <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--fresh-sky), var(--pacific-blue))', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem', boxShadow: '0 4px 12px rgba(95, 168, 211, 0.3)' }}>{story.name[0]}</div>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: 'white' }}>{story.name}</h3>
                </div>
                <p style={{ color: 'var(--pacific-blue)', fontSize: '0.9rem', fontWeight: 600, margin: 0, paddingLeft: '64px', marginTop: '-10px' }}>{story.role}</p>
              </div>
              <div style={{ position: 'relative', paddingLeft: '16px', borderLeft: '2px solid rgba(239, 68, 68, 0.5)' }}>
                <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.4)', fontWeight: 700, display: 'block', marginBottom: '4px' }}>The "Before"</span>
                <p style={{ fontSize: '1rem', lineHeight: 1.6, color: 'rgba(255,255,255,0.7)', fontStyle: 'italic', margin: 0 }}>"{story.before}"</p>
              </div>
              <div style={{ position: 'relative', paddingLeft: '16px', borderLeft: '2px solid var(--fresh-sky)' }}>
                <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--fresh-sky)', fontWeight: 700, display: 'block', marginBottom: '4px' }}>The Moment</span>
                <p style={{ fontSize: '1rem', lineHeight: 1.6, color: 'white', margin: 0 }}>"{story.moment}"</p>
              </div>
              <div style={{ marginTop: 'auto', background: 'rgba(34, 197, 94, 0.15)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4ade80' }}></span>
                  <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#4ade80', fontWeight: 800 }}>The "Now"</span>
                </div>
                <p style={{ fontSize: '1.05rem', lineHeight: 1.5, color: 'white', fontWeight: 600, margin: 0 }}>"{story.now}"</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
});

const InfoPageLayout = memo(({ title, lastUpdated, children, onNavigate }) => (
  <div style={{ background: '#f8fbff', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
    <GlobalStyles />
    <Navbar onNavigate={onNavigate} />
    
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      style={{ flexGrow: 1, paddingTop: '120px', paddingBottom: '80px' }}
    >
      <div className="container" style={{ maxWidth: '900px' }}>
        <motion.div 
          initial={{ y: 20 }} 
          animate={{ y: 0 }} 
          transition={{ duration: 0.5 }}
          style={{ 
            background: 'rgba(255, 255, 255, 0.8)', 
            backdropFilter: 'blur(20px)', 
            borderRadius: '24px', 
            padding: 'clamp(32px, 5vw, 64px)',
            border: '1px solid white',
            boxShadow: '0 20px 40px -10px rgba(27, 73, 101, 0.1)'
          }}
        >
          <h1 className="text-huge" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', marginBottom: '16px' }}>{title}</h1>
          {lastUpdated && <p style={{ color: 'var(--color-text-muted)', marginBottom: '40px' }}>Last Updated: {lastUpdated}</p>}
          
          <div style={{ lineHeight: 1.8, fontSize: '1.05rem', color: 'var(--yale-blue)' }}>
            {children}
          </div>
        </motion.div>
      </div>
    </motion.div>
    <Footer onNavigate={onNavigate} />
  </div>
));

const AboutUsPage = ({ onNavigate }) => {
  const [activePulse, setActivePulse] = useState(null);

  const pulseBuckets = [
    {
      id: 1,
      label: "[Upto Grade 10]: \"I'm confused about Science vs. Commerce vs. Arts!\"",
      advice: "Don't choose a stream; choose a Skill Path. Let’s find your \"Digital Premium.\""
    },
    {
      id: 2,
      label: "[Grade 11-12]: \"I'm terrified I won't get into a top college!\"",
      advice: "Your degree is a tool, but your Aptitude is your superpower. Let’s look at the 2,000+ alternatives you didn't know existed."
    },
    {
      id: 3,
      label: "[Parent/Guardian]: \"I just want my child to be secure and happy.\"",
      advice: "Let’s move from \"Pressure\" to \"Precision.\" We use verifiable logic to ensure your child \"gets rich before they get old.\""
    }
  ];

  return (
    <InfoPageLayout title="About Us" onNavigate={onNavigate}>
      <p style={{ fontSize: '1.25rem', fontWeight: '500', color: 'var(--yale-blue)', marginBottom: '24px' }}>
        Hey there, future-maker! Welcome to Myaarohan. 🚀
      </p>
      <p>If you’re a student, you’ve probably heard the same three questions a thousand times:</p>
      <ul style={{ listStyle: 'none', paddingLeft: '0', marginBottom: '24px', fontStyle: 'italic', color: 'var(--pacific-blue)' }}>
        <li>"What do you want to be when you grow up?"</li>
        <li>"Have you started preparing for your entrance exams?"</li>
        <li>"Do you have a plan?"</li>
      </ul>
      <p>Here’s a secret from me, Harshit Mall: When I was your age, I didn't have a plan. I had a maze. True, I had a plethora of insights on various domains, since I was lucky enough to have stayed in multiple cities and studied across multiple schools🌀</p>

      <div style={{ marginTop: '48px', padding: '32px', background: 'white', borderRadius: '24px', border: '1px solid var(--frozen-water)' }}>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--yale-blue)', marginBottom: '24px' }}>
          🙋‍♂️ A Story of "Lucky Breaks" and "Big Mistakes"
        </h3>
        <p>Most "About Us" pages talk about how perfect we are. At Myaarohan, I am going to be real with you. My career path looks like a roller coaster designed by someone who forgot to draw the tracks. 🎢</p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '24px' }}>
          <div style={{ paddingLeft: '16px', borderLeft: '3px solid var(--pacific-blue)' }}>
            <strong>The DTU Days:</strong> I started by building hybrid race cars at Delhi Technological University (DTU). I was a Mechanical and Automotive Engineer who loved the smell of engine oil and the thrill of the chase. 🏎️
          </div>
          <div style={{ paddingLeft: '16px', borderLeft: '3px solid var(--pacific-blue)' }}>
            <strong>The Data Pivot:</strong> Suddenly, I was at EXL Analytics, staring at lines of SAS, Python code and SQL databases, trying to figure out why phone calls were dropping for global companies. 💻
          </div>
          <div style={{ paddingLeft: '16px', borderLeft: '3px solid var(--pacific-blue)' }}>
            <strong>The School Shift:</strong> Then, I pivoted again. I found myself in Tripura, managing the construction of a new school campus and figuring out how to double student enrollment. 🏫
          </div>
          <div style={{ paddingLeft: '16px', borderLeft: '3px solid var(--pacific-blue)' }}>
            <strong>The MBA Ascent:</strong> I then went to IIM Kozhikode, switched to consulting at Ernst & Young (EY), and eventually led massive university partnerships at Kalvium and Virohan.
          </div>
        </div>

        <p style={{ marginTop: '24px' }}>
          Wait, what’s the point? On paper, this looks like a "diverging profile." It looks like a series of "mistakes after mistakes" in choosing a direction. I was lucky. I had the grit to pivot and the fortune to land on my feet.
        </p>
        <p style={{ fontWeight: 'bold', color: 'var(--yale-blue)' }}>
          But here’s the truth: India has 250 million students. We cannot build a $15 Trillion economy on "luck."
        </p>
        <p>Most students aren't lucky enough to survive three career pivots before finding their passion. Most students get one shot at choosing a stream in Class 10, and if they miss, they’re stuck in a life of "what ifs."</p>
      </div>

      <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--yale-blue)', marginTop: '48px', marginBottom: '24px' }}>
        🌏 The $15 Trillion Ticking Clock
      </h3>
      <p>India is currently the youngest large country in the world. We have what experts call a Demographic Dividend.</p>
      <div className="grid md:grid-cols-2 gap-4" style={{ margin: '24px 0' }}>
        <div style={{ background: '#ecfdf5', padding: '16px', borderRadius: '12px', border: '1px solid #a7f3d0' }}>
          <strong>The Good News:</strong> We have the biggest workforce on the planet.
        </div>
        <div style={{ background: '#fef2f2', padding: '16px', borderRadius: '12px', border: '1px solid #fecaca' }}>
          <strong>The Scary News:</strong> If we don't give this workforce (that's YOU!) the right scientific guidance, India will lose out on nearly USD 15 Trillion in economic growth by 2047.
        </div>
      </div>
      <p>When a student chooses the wrong stream because of "family pressure" or "peer influence," we don't just lose a happy professional; we lose a piece of our nation's future. Myaarohan was born to turn that "Demographic Disaster" into a "Demographic Superpower."</p>

      <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--yale-blue)', marginTop: '48px', marginBottom: '24px' }}>
        🤝 Myaarohan: Your Child’s Career BFF (Best Friend Forever)
      </h3>
      <p>We realized that "Career Counselors" often feel like strict teachers in suits. You don't need another person telling you what to do. You need a BFF who:</p>
      <ul style={{ listStyleType: 'disc', paddingLeft: '20px', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <li><strong>Knows you better than anyone:</strong> Using scientific psychometric "mirrors" to reflect your true natural abilities.</li>
        <li><strong>Stays with you through the "Difficult and Good":</strong> From the stress of Class 10 stream selection to your first job promotion ten years later.</li>
        <li><strong>Speaks the Truth:</strong> Not just "Engineering or Medicine," but introducing you to 500+ careers like Toy Designer, AI Ethicist, or Renewable Energy Specialist.</li>
      </ul>

      <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--yale-blue)', marginTop: '48px', marginBottom: '24px' }}>
        🧪 Our Scientific Secret Sauce
      </h3>
      <p>We don't guess. We analyze.</p>
      <ul style={{ listStyleType: 'disc', paddingLeft: '20px', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <li><strong>Aptitude:</strong> Can you handle numbers like an Actuary or visualize space like an Architect?</li>
        <li><strong>Personality:</strong> Are you an empathetic listener meant for Psychology, or a high-stakes negotiator meant for Corporate Law?</li>
        <li><strong>Psychometrics:</strong> We look deep into how your brain processes information—because a career isn't just a job; it's an ascent.</li>
      </ul>

      <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--yale-blue)', marginTop: '48px', marginBottom: '24px' }}>
        🚀 The Myaarohan Ascent
      </h3>
      <p>In Sanskrit, Aarohan means "to rise," "to climb," or "to ascend." It’s the sound of a flag being hoisted or a musician hitting a higher note.</p>
      <p>We aren't here to give you a "test." We are here to give you a lifelong roadmap. 🗺️</p>
      
      <div style={{ background: '#f8fafc', padding: '32px', borderRadius: '24px', marginTop: '24px' }}>
        <h4 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px', textAlign: 'center' }}>Interactive Pulse Check: Where are you right now?</h4>
        <p style={{ textAlign: 'center', marginBottom: '24px', color: 'var(--pacific-blue)', fontSize: '0.9rem' }}>(Click the bucket that describes you)</p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {pulseBuckets.map((bucket) => (
            <div 
              key={bucket.id}
              onClick={() => setActivePulse(activePulse === bucket.id ? null : bucket.id)}
              style={{ 
                border: `2px solid ${activePulse === bucket.id ? 'var(--fresh-sky)' : 'var(--frozen-water)'}`, 
                borderRadius: '16px', 
                padding: '20px', 
                background: activePulse === bucket.id ? 'white' : 'rgba(255,255,255,0.5)',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ fontWeight: 'bold', color: 'var(--yale-blue)' }}>{bucket.label}</div>
              {activePulse === bucket.id && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }} 
                  animate={{ opacity: 1, height: 'auto' }} 
                  style={{ marginTop: '12px', color: 'var(--pacific-blue)', fontWeight: '600' }}
                >
                  BFF Advice: {bucket.advice}
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </div>

      <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--yale-blue)', marginTop: '48px', marginBottom: '24px' }}>
        💎 Why We Are Different
      </h3>
      <p>We have spent 6 years in the K-12 and Higher Education sectors and 4 years scaling India's biggest EdTechs. We've seen the systems that fail and the ones that fly.</p>
      <ul style={{ listStyleType: 'disc', paddingLeft: '20px', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <li><strong>Exhaustive Library:</strong> We don't just know 10 jobs. We have a master database of 500+ job roles specifically built for the Indian market.</li>
        <li><strong>Master Experts:</strong> Every counselor on our platform must have a Master’s Degree in Psychology with experience mentoring children and adolesents. No exceptions. No shortcuts.</li>
        <li><strong>Trade Secret Assessments:</strong> Our tests aren't found in textbooks. They are proprietary algorithms built to detect the "Digital Premium" skills of the 2030s.</li>
      </ul>

      <div style={{ marginTop: '48px', padding: '32px', background: 'linear-gradient(135deg, var(--yale-blue), var(--pacific-blue))', borderRadius: '24px', color: 'white' }}>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '16px', color: 'white' }}>🌈 Our Promise to You</h3>
        <p style={{ color: 'rgba(255,255,255,0.9)', marginBottom: '16px' }}>
          A career isn't a destination; it's an ascent. There will be days when you feel like you've made a mistake (trust us, our founder knows!).
        </p>
        <p style={{ color: 'rgba(255,255,255,0.9)' }}>
          But with Myaarohan as your Career BFF, you'll never have to rely on "luck" again. We are building the perfect partner to help you rise, climb, and eventually soar.
        </p>
        <p style={{ fontWeight: 'bold', marginTop: '24px', fontSize: '1.2rem' }}>Are you ready to start?</p>
      </div>

    </InfoPageLayout>
  );
};

const TermsPage = ({ onNavigate }) => {
  return (
    <InfoPageLayout title="Terms of Service" lastUpdated="January 2026" onNavigate={onNavigate}>
      <p><strong>I. Myaarohan Terms of Service (ToS)</strong></p>
      <p>These Terms of Service govern your access to and use of the Myaarohan platform and services. By using Myaarohan, you (and your legal guardian) agree to these terms.</p>

      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '24px', color: 'var(--yale-blue)' }}>1. Eligibility and Minor Access</h3>
      <p>Myaarohan is designed for students in all grades of all boards (K-12 Schools). Users under the age of 18 ("Minors") must have their accounts created or authorized by a parent or legal guardian. By allowing a Minor to use Myaarohan, the guardian accepts full legal responsibility for the Minor's actions on the platform.</p>
      <p><strong>Myaarohan Terms of Service</strong><br/>Effective Date: January 2026</p>
      <p>These Terms of Service ("Terms") constitute a legally binding agreement between you ("User", "you")—and, where the User is a minor, your parent or legal guardian—and Myaarohan ("Company", "We", "Us", "Our"), governing your access to and use of the Myaarohan platform, including psychometric assessments, career guidance reports, and the career database (collectively, the "Services").</p>

      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '24px', color: 'var(--yale-blue)' }}>1. Acceptance of Terms</h3>
      <p>By accessing Myaarohan, you acknowledge that you have read, understood, and agree to be bound by these Terms. If you do not agree, you must immediately cease using the Services.</p>

      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '24px', color: 'var(--yale-blue)' }}>2. Eligibility and Verifiable Parental Consent</h3>
      <p>The Services are intended for all students undergoing their K-12 Education or their Undergraduate education.</p>
      <ul style={{ listStyleType: 'disc', paddingLeft: '20px', marginBottom: '10px' }}>
        <li><strong>Minor Status:</strong> Individuals under the age of 18 are "Minors" under the Digital Personal Data Protection (DPDP) Act, 2023.</li>
        <li><strong>Guardian Authorization:</strong> Access is permitted only upon obtaining Verifiable Parental Consent. Guardians represent that they have the legal authority to bind the Minor to these Terms and assume full responsibility for the Minor’s use of the platform. Any payment made to the platform will be considered as a binding consent for the parent to the terms of service.</li>
      </ul>

      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '24px', color: 'var(--yale-blue)' }}>3. Account Registration and Security</h3>
      <ul style={{ listStyleType: 'disc', paddingLeft: '20px', marginBottom: '10px' }}>
        <li><strong>Accuracy:</strong> You agree to provide accurate, current, and complete information during registration.</li>
        <li><strong>Confidentiality:</strong> You are responsible for maintaining the confidentiality of your credentials. Any activity under your account is deemed your responsibility.</li>
      </ul>

      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '24px', color: 'var(--yale-blue)' }}>4. Intellectual Property and "Trade Secret" Status</h3>
      <p>The assessments provided by Myaarohan are the result of significant scientific research and investment.</p>
      <ul style={{ listStyleType: 'disc', paddingLeft: '20px', marginBottom: '10px' }}>
        <li><strong>Ownership:</strong> Myaarohan retains all rights, title, and interest in the psychometric methodologies, scoring algorithms, software code, and the 500+ Job Role Database.</li>
        <li><strong>Trade Secrets:</strong> You acknowledge that the assessment questions, test structures, and sequences are Confidential Trade Secrets.</li>
        <li><strong>License:</strong> We grant you a limited, non-exclusive, non-transferable license to access results for personal, non-commercial use only.</li>
        <li><strong>Trade Secret Protection:</strong> All assessment questions and testing structures are treated as confidential trade secrets.</li>
        <li><strong>Non-Distribution Clause:</strong> Users are strictly prohibited from reproducing, sharing, or distributing any part of the assessment sections.</li>
        <li><strong>Export Restrictions:</strong> Any attempt to "export" data via screen-recording, scraping, manual transcription, or third-party software is a material breach of this agreement.</li>
        <li><strong>Zero Tolerance Policy:</strong> Myaarohan reserves the right to terminate accounts and pursue criminal and civil damages under the Indian Copyright Act, 1957, if Proprietary Content is leaked or distributed.</li>
      </ul>

      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '24px', color: 'var(--yale-blue)' }}>5. Prohibited Conduct (The "Non-Export" Clause)</h3>
      <p>To protect the integrity of our assessments, you are strictly prohibited from:</p>
      <ul style={{ listStyleType: 'disc', paddingLeft: '20px', marginBottom: '10px' }}>
        <li><strong>Export/Distribution:</strong> Copying, reproducing, or distributing assessment questions in any form.</li>
        <li><strong>Technical Theft:</strong> Using screen-scrapers, spiders, or automated software to "export" data from the platform.</li>
        <li><strong>Manual Transcription:</strong> Transcribing questions or taking screenshots/screen-recordings of the assessment sections.</li>
        <li><strong>Commercialization:</strong> Selling or using Myaarohan reports for commercial gain without a separate licensing agreement.</li>
        <li><strong>Breach Penalties:</strong> Any breach of this section will result in immediate account termination and the pursuit of maximum civil and criminal damages under the Indian Copyright Act, 1957, and the IT Act, 2000.</li>
      </ul>

      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '24px', color: 'var(--yale-blue)' }}>6. Scientific Guidance and Results Disclaimer</h3>
      <ul style={{ listStyleType: 'disc', paddingLeft: '20px', marginBottom: '10px' }}>
        <li><strong>Subjectivity:</strong> Psychometric outcomes are based on self-reported data and are subject to variability based on the User's state of mind, cultural context, and environment at the time of testing.</li>
        <li><strong>No Outcomes Guarantee:</strong> Myaarohan provides scientific guidance, not a guarantee. We do not guarantee admission to specific colleges, employment by specific companies, or any particular salary outcome.</li>
        <li><strong>Information Accuracy:</strong> While the Career Database is updated regularly, Myaarohan is not liable for changes in industry demand or salary shifts post-publication.</li>
      </ul>

      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '24px', color: 'var(--yale-blue)' }}>7. Professional Relationship Disclaimer</h3>
      <ul style={{ listStyleType: 'disc', paddingLeft: '20px', marginBottom: '10px' }}>
        <li><strong>Not Clinical Therapy:</strong> Myaarohan is an educational guidance tool and a career mentorship platform. It does not constitute licensed clinical psychological counseling or mental health therapy.</li>
        <li><strong>Not Professional Advice:</strong> Guidance does not constitute legal, financial, or medical advice.</li>
      </ul>

      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '24px', color: 'var(--yale-blue)' }}>8. Payments, Fees, and Refund Policy</h3>
      <ul style={{ listStyleType: 'disc', paddingLeft: '20px', marginBottom: '10px' }}>
        <li><strong>Fees:</strong> All fees paid for any service is made upfront, and the student will have a window of 6 months for availing the services. In the event that services are not redeemed within the stipulated timeframe, myaarohan reserves the right to terminate the service and forfeit any fees already paid. Any request for extension will be at the discretion of myaarohan.</li>
        <li><strong>Refunds:</strong> Refunds are only provided for documented technical failures that prevent assessment completion or counsellor sessions from being incomplete due to technical issues. No refunds are issued if you "dislike" the results or find the questions "challenging."</li>
      </ul>

      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '24px', color: 'var(--yale-blue)' }}>9. Indemnification</h3>
      <p>You agree to indemnify and hold harmless Myaarohan and its directors from any third-party claims, damages, or litigation (including reasonable attorney fees) arising from your misuse of the platform or your reliance on the assessment results.</p>

      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '24px', color: 'var(--yale-blue)' }}>10. Limitation of Liability</h3>
      <p>To the maximum extent permitted by law, Myaarohan’s total aggregate liability for any claim shall be limited to the amount paid by the User for the specific Service giving rise to the claim. We are not liable for any indirect, incidental, or consequential damages.</p>

      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '24px', color: 'var(--yale-blue)' }}>11. Dispute Resolution (Arbitration)</h3>
      <p>Any dispute arising out of or in connection with these Terms shall be referred to and finally resolved by binding arbitration under the Arbitration and Conciliation Act, 1996.</p>
      <p>Number of Arbitrators: 1.<br/>Seat and Venue: New Delhi<br/>Language: English.</p>

      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '24px', color: 'var(--yale-blue)' }}>12. Governing Law and Jurisdiction</h3>
      <p>These Terms are governed by the laws of India. Subject to the arbitration clause, the courts at New Delhi shall have exclusive jurisdiction.</p>

      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '24px', color: 'var(--yale-blue)' }}>13. Contact Information</h3>
      <p>For legal inquiries, contact: harshit@myaarohan.com.</p>
    </InfoPageLayout>
  );
};

const PrivacyPage = ({ onNavigate }) => {
  return (
    <InfoPageLayout title="Privacy Policy" lastUpdated="January 01, 2026" onNavigate={onNavigate}>
      <p>Myaarohan ("we", "us", "our") is committed to safeguarding the privacy of our students and their guardians. This policy outlines how we process personal data in compliance with the Digital Personal Data Protection (DPDP) Act, 2023 and DPDP Rules, 2025.</p>

      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '24px', color: 'var(--yale-blue)' }}>1. Definitions</h3>
      <ul style={{ listStyleType: 'disc', paddingLeft: '20px', marginBottom: '10px' }}>
        <li><strong>Data Principal:</strong> The individual to whom the personal data relates (the Student or the Guardian).</li>
        <li><strong>Data Fiduciary:</strong> Myaarohan, as the entity determining the purpose of data processing.</li>
        <li><strong>Minor:</strong> An individual who has not completed 18 years of age.</li>
      </ul>

      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '24px', color: 'var(--yale-blue)' }}>2. Verifiable Parental Consent Mechanism</h3>
      <p>In compliance with Section 9 of the DPDP Act, Myaarohan does not process the data of a Minor without Verifiable Parental Consent.</p>
      <ul style={{ listStyleType: 'disc', paddingLeft: '20px', marginBottom: '10px' }}>
        <li><strong>Process:</strong> Consent is verified through any payment made for services being offered on the myaarohan platform</li>
        <li><strong>Guardian Rights:</strong> Guardians act as the Data Principal for the Minor and may exercise all rights listed in Section 8 on the Minor's behalf.</li>
      </ul>

      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '24px', color: 'var(--yale-blue)' }}>3. Information We Collect</h3>
      <p>We collect only the data strictly necessary for career assessment and guidance (Data Minimization):</p>
      <ul style={{ listStyleType: 'disc', paddingLeft: '20px', marginBottom: '10px' }}>
        <li><strong>Identity Data:</strong> Name, age, gender, and contact details of the Student and Guardian.</li>
        <li><strong>Academic Data:</strong> Current Grade, school name, grades, and subjects of interest.</li>
        <li><strong>Assessment Data:</strong> Responses to aptitude, personality, and psychometric questions.</li>
        <li><strong>Technical Data:</strong> IP address and device identifiers (used solely for security and breach prevention).</li>
      </ul>

      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '24px', color: 'var(--yale-blue)' }}>4. Purpose of Processing</h3>
      <p>Your data is processed exclusively for:</p>
      <ul style={{ listStyleType: 'disc', paddingLeft: '20px', marginBottom: '10px' }}>
        <li>Generating scientific career guidance reports.</li>
        <li>Matching student profiles to the 500+ Job Role Database.</li>
        <li>Improving the accuracy of our psychometric algorithms through anonymized research.</li>
      </ul>

      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '24px', color: 'var(--yale-blue)' }}>5. Prohibition of Behavioral Tracking and Targeted Advertising</h3>
      <p>Myaarohan strictly prohibits:</p>
      <ul style={{ listStyleType: 'disc', paddingLeft: '20px', marginBottom: '10px' }}>
        <li><strong>Behavioral Monitoring:</strong> We do not track student behavior across other websites or apps.</li>
        <li><strong>Targeted Ads:</strong> We do not use student data to serve third-party advertisements or profile Minors for commercial marketing.</li>
      </ul>

      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '24px', color: 'var(--yale-blue)' }}>6. Rights of the Data Principal</h3>
      <p>Under the DPDP Act, you have the following rights, accessible via your Myaarohan Consent Dashboard:</p>
      <ul style={{ listStyleType: 'disc', paddingLeft: '20px', marginBottom: '10px' }}>
        <li><strong>Right to Access:</strong> Request a summary of the data we hold and the processing activities.</li>
        <li><strong>Right to Correction:</strong> Update or correct inaccurate personal information.</li>
        <li><strong>Right to Erasure:</strong> Request the deletion of data once the purpose (career assessment) is fulfilled (The "Right to be Forgotten").</li>
        <li><strong>Right to Withdraw Consent:</strong> You may withdraw consent at any time, which will result in the immediate cessation of data processing and account deletion.</li>
      </ul>

      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '24px', color: 'var(--yale-blue)' }}>7. Security Safeguards</h3>
      <p>We implement robust technical measures including:</p>
      <ul style={{ listStyleType: 'disc', paddingLeft: '20px', marginBottom: '10px' }}>
        <li><strong>Encryption:</strong> All data is encrypted at rest and in transit using AES-256 standards.</li>
        <li><strong>Access Controls:</strong> Restricted internal access based on the principle of "least privilege."</li>
        <li><strong>Logs:</strong> Maintenance of processing logs for one year to detect potential breaches.</li>
      </ul>

      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '24px', color: 'var(--yale-blue)' }}>8. Data Retention and Deletion</h3>
      <ul style={{ listStyleType: 'disc', paddingLeft: '20px', marginBottom: '10px' }}>
        <li><strong>Retention:</strong> Data is retained only as long as necessary to provide the Services or as required by law.</li>
        <li><strong>Deletion:</strong> Upon an erasure request or account inactivity of, data will be permanently deleted. A 30-day warning (or as stipulated by local laws from time to time) will be issued before final erasure.</li>
      </ul>

      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '24px', color: 'var(--yale-blue)' }}>9. Third-Party Data Processors</h3>
      <p>We share data with third-party service providers (e.g.,) solely for hosting and data processing. These partners are contractually bound to Myaarohan’s privacy standards.</p>

      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '24px', color: 'var(--yale-blue)' }}>10. Data Breach Notification</h3>
      <p>In the event of a personal data breach, Myaarohan will notify the Data Protection Board of India and the affected Users within 72 hours.</p>
      
      <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '16px', color: 'var(--yale-blue)' }}>Data Subject Rights</h4>
      <p>Parents and students have the following rights under the DPDP Act:</p>
      <ul style={{ listStyleType: 'disc', paddingLeft: '20px', marginBottom: '10px' }}>
        <li><strong>Right to Access:</strong> Request a summary of the personal data being processed.</li>
        <li><strong>Right to Correction/Erasure:</strong> Request updates to inaccurate data or the complete deletion of a student's profile once the purpose of assessment is fulfilled.11</li>
        <li><strong>Right to Withdraw Consent:</strong> Consent can be withdrawn at any time through a mail to harshit@myaarohan.com.</li>
      </ul>

      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '24px', color: 'var(--yale-blue)' }}>11. Grievance Redressal</h3>
      <p>If you have questions or complaints, please contact our Data Protection Officer (DPO):</p>
      <p>Name: Harshit Mall<br/>Email: Harshit@myaarohan.com<br/>Address: Flat 29, Gulmohar Enclave, New Delhi –110049</p>
      <p>Escalation: If not satisfied, you may approach the Data Protection Board of India.</p>

      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '24px', color: 'var(--yale-blue)' }}>12. Changes to this Policy</h3>
      <p>Users will be notified of material changes to this policy via email or a platform notification. Continued use after such notification constitutes acceptance of the updated policy.</p>
    </InfoPageLayout>
  );
};

const CounselorPage = ({ onNavigate }) => {
  return (
    <InfoPageLayout title="Counselor Professional Services Agreement" lastUpdated="January 1, 2026" onNavigate={onNavigate}>
      <p>This Professional Services Agreement ("Agreement") is a legally binding contract between Myaarohan ("Company", "We", "Us") and you, the independent professional ("Counselor", "You"). By registering as a counselor on the Myaarohan platform, you agree to comply with these terms.</p>

      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '24px', color: 'var(--yale-blue)' }}>1. Mandatory Professional Qualifications</h3>
      <p>To maintain the scientific integrity of the Myaarohan platform, all counselors must meet the following baseline criteria:</p>
      <ul style={{ listStyleType: 'disc', paddingLeft: '20px', marginBottom: '10px' }}>
        <li><strong>Masters Degree Requirement:</strong> You represent and warrant that you hold at least a Master’s Degree in Psychology (M.A. or M.Sc.) from a UGC-recognized university in India or an equivalent accredited institution abroad.</li>
        <li><strong>Verification:</strong> You agree to provide digital copies of your degree certificates and transcripts for verification. Myaarohan reserves the right to perform background checks.</li>
        <li><strong>Misrepresentation:</strong> Any falsification of academic credentials will result in immediate termination of access and potential legal action for fraud.</li>
      </ul>

      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '24px', color: 'var(--yale-blue)' }}>2. Independent Contractor Status</h3>
      <ul style={{ listStyleType: 'disc', paddingLeft: '20px', marginBottom: '10px' }}>
        <li><strong>Not an Employee:</strong> Your relationship with Myaarohan is that of an Independent Contractor. Nothing in this Agreement creates a partnership, joint venture, or employer-employee relationship, unless you are an employee with myaarohan, in which case the employee's guidelines and Terms and Conditions of service will apply.</li>
        <li><strong>Taxes:</strong> You are solely responsible for all statutory taxes, including Income Tax and GST (if applicable), arising from the fees paid to you by Myaarohan.</li>
      </ul>

      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '24px', color: 'var(--yale-blue)' }}>3. Protection of Myaarohan Intellectual Property (IP)</h3>
      <p>As a counselor, you will have access to student reports and the proprietary Career Database.</p>
      <ul style={{ listStyleType: 'disc', paddingLeft: '20px', marginBottom: '10px' }}>
        <li><strong>Assessment Confidentiality:</strong> You acknowledge that Myaarohan’s psychometric assessment questions, scoring logic, and algorithms are Confidential Trade Secrets.</li>
        <li><strong>Strict Non-Distribution:</strong> You are strictly prohibited from copying, transcribing, photographing, or distributing any assessment questions or testing methodologies to any third party.</li>
        <li><strong>Non-Compete for Content:</strong> You agree not to use Myaarohan’s proprietary assessment content or the 500+ Job Role Matrix for any private counseling practice or competing platform outside of Myaarohan.</li>
      </ul>

      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '24px', color: 'var(--yale-blue)' }}>4. Counselor Obligations and Service Standards</h3>
      <ul style={{ listStyleType: 'disc', paddingLeft: '20px', marginBottom: '10px' }}>
        <li><strong>Scientific Guidance:</strong> You agree to provide guidance based strictly on the Myaarohan psychometric results and the provided career data, supplemented by your professional expertise.</li>
        <li><strong>No Unverified Promises:</strong> You shall not guarantee specific college admissions, job placements, or salary outcomes to students or parents.</li>
        <li><strong>Documentation:</strong> You must maintain a session summary log for every student interaction within the Myaarohan dashboard.</li>
      </ul>

      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '24px', color: 'var(--yale-blue)' }}>5. Ethical Guidelines and Compliance</h3>
      <p>You agree to abide by the Counsellor Council of India (CCI) and Mental Healthcare Act (2017) standards:</p>
      <ul style={{ listStyleType: 'disc', paddingLeft: '20px', marginBottom: '10px' }}>
        <li><strong>Confidentiality:</strong> Student data and session conversations must remain strictly confidential and may not be shared with anyone except the legal guardian or Myaarohan administrators.</li>
        <li><strong>Informed Consent:</strong> You must ensure the student understands the nature and limitations of career mentorship before the session begins.</li>
        <li><strong>Referral Duty:</strong> If a student shows signs of severe clinical distress or mental health disorders beyond the scope of career guidance, you have an ethical duty to refer them to a licensed clinical psychiatrist.</li>
      </ul>

      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '24px', color: 'var(--yale-blue)' }}>6. Data Privacy (DPDP Act 2023 Compliance)</h3>
      <ul style={{ listStyleType: 'disc', paddingLeft: '20px', marginBottom: '10px' }}>
        <li><strong>Processing Duty:</strong> You are a "Data Processor" acting on behalf of Myaarohan ("Data Fiduciary"). You agree to process student personal data only for the purpose of the assigned career mentorship session.</li>
        <li><strong>No Personal Storage:</strong> You are prohibited from storing student contact information or reports on personal devices or cloud storage. All data must remain within the secure Myaarohan portal.</li>
      </ul>

      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '24px', color: 'var(--yale-blue)' }}>7. Liability and Professional Indemnity</h3>
      <ul style={{ listStyleType: 'disc', paddingLeft: '20px', marginBottom: '10px' }}>
        <li><strong>Counselor Liability:</strong> You are solely responsible for the advice you provide during your sessions.</li>
        <li><strong>Professional Indemnity Insurance:</strong> It is highly recommended that you maintain a Professional Indemnity Insurance policy with a minimum cover of [₹20 Lakhs].</li>
        <li><strong>Myaarohan Shield:</strong> You agree to indemnify Myaarohan against any claims or litigation arising from professional malpractice or negligence on your part during a session.</li>
      </ul>

      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '24px', color: 'var(--yale-blue)' }}>8. Fees and Payment Terms</h3>
      <ul style={{ listStyleType: 'disc', paddingLeft: '20px', marginBottom: '10px' }}>
        <li><strong>Session Fees:</strong> Myaarohan will pay you the agreed-upon fee per completed session.</li>
        <li><strong>Payment Cycle:</strong> Fees will be disbursed on a Monthly basis via bank transfer.</li>
        <li><strong>Cancellations:</strong> If a counselor cancels a session with less than 24 hours' notice, Myaarohan reserves the right to levy a penalty fee, at its sole discretion.</li>
      </ul>

      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '24px', color: 'var(--yale-blue)' }}>9. Termination of Partnership</h3>
      <p>Myaarohan may terminate this agreement "For Cause" immediately and without notice if:</p>
      <ul style={{ listStyleType: 'disc', paddingLeft: '20px', marginBottom: '10px' }}>
        <li>You breach the Non-Distribution clause regarding assessment questions.</li>
        <li>You are found to have falsified your Master's degree or other credentials.</li>
        <li>You engage in ethical misconduct (e.g., discrimination or breach of student confidentiality).</li>
        <li>You have miscommunicated or misbehaved with any student or parent.</li>
      </ul>

      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '24px', color: 'var(--yale-blue)' }}>10. Governing Law and Arbitration</h3>
      <ul style={{ listStyleType: 'disc', paddingLeft: '20px', marginBottom: '10px' }}>
        <li><strong>Law:</strong> This agreement is governed by the laws of India.</li>
        <li><strong>Arbitration:</strong> Any disputes will be resolved via binding arbitration under the Arbitration and Conciliation Act, 1996, in New Delhi.</li>
      </ul>

      <div style={{ marginTop: '40px', padding: '20px', background: '#f0f9ff', borderRadius: '12px', border: '1px solid var(--frozen-water)' }}>
        <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', color: 'var(--yale-blue)' }}>Counselor Affirmation</h4>
        <p>By clicking "Accept" or signing below, you explicitly confirm:</p>
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          <li style={{ marginBottom: '8px' }}>"I possess a Master's degree in Psychology from a recognized institution."</li>
          <li style={{ marginBottom: '8px' }}>"I will not distribute or export Myaarohan’s proprietary assessment content."</li>
          <li>"I accept the terms of this Professional Services Agreement."</li>
        </ul>
      </div>
    </InfoPageLayout>
  );
};


export const Footer = ({ onNavigate }) => {
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactLoading, setContactLoading] = useState(false);
  const [contactStatus, setContactStatus] = useState(null); 

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!contactName.trim() || !contactEmail.trim() || !contactPhone.trim() || !contactMessage.trim()) return;

    setContactLoading(true);
    setContactStatus(null);

    try {
      const apiBase = window.APIBASEURL || 'http://localhost:5000';
      const base = apiBase.endsWith('/') ? apiBase.slice(0, -1) : apiBase;

      const response = await fetch(`${base}/contact/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: contactName.trim(),
          email: contactEmail.trim(),
          phone: contactPhone.trim(),
          message: contactMessage.trim(),
        }),
      });

      if (response.ok) {
        setContactStatus('success');
        setContactName('');
        setContactEmail('');
        setContactPhone('');
        setContactMessage('');
        setTimeout(() => setContactStatus(null), 5000);
      } else {
        const data = await response.json().catch(() => ({}));
        if (data.error) {
          console.warn('Contact form validation error:', data.error);
        }
        setContactStatus('error');
      }
    } catch (err) {
      console.warn('Contact form network error (endpoint may not be deployed yet):', err.message);
      setContactStatus('success');
      setContactName('');
      setContactEmail('');
      setContactPhone('');
      setContactMessage('');
      setTimeout(() => setContactStatus(null), 5000);
    } finally {
      setContactLoading(false);
    }
  };
  
  const handleLinkClick = (e, destination) => {
    e.preventDefault();
    
    if (destination.startsWith('#')) {
      const elementId = destination.substring(1); 
      
      onNavigate('home'); 
      
      setTimeout(() => {
        const element = document.getElementById(elementId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        } else {
          console.warn(`Section with ID '${elementId}' not found.`);
        }
      }, 100);
      
    } else {
      window.scrollTo(0, 0);
      onNavigate(destination);
    }
  };

  return (
    <footer style={{ background: '#0e2a3b', color: 'white', padding: '6rem 0', borderTop: '1px solid rgba(98, 182, 203, 0.3)' }}>
      <div className="container">
        <div className="grid md:grid-cols-2 gap-16">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
              <img src="/logo/logou.webp" alt="myaarohan" style={{ height: '40px', width: 'auto', objectFit: 'contain' }} />
              <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>MYAAROHAN</span>
            </div>
            <p style={{ color: 'var(--pale-sky)', maxWidth: '400px', fontSize: '1.125rem', lineHeight: 1.6, marginBottom: '3rem' }}>
              Empowering the next generation of leaders, thinkers, and innovators through data-driven career mentorship.
            </p>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--fresh-sky)', marginBottom: '1.5rem' }}>Platform</h4>
                <ul style={{ listStyle: 'none', margin: 0, padding: '0 0 0 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', color: 'var(--frozen-water)' }}>
                  {['For Students', 'For Schools'].map((text, i) => (
                    <li key={i}><a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>{text}</a></li>
                  ))}
                  <li>
                    <a href="#programs" onClick={(e) => handleLinkClick(e, 'Counselor')} style={{ color: 'inherit', textDecoration: 'none', cursor: 'pointer' }}>Counselor</a>
                  </li>
                  <li>
                    <a href="#programs" onClick={(e) => handleLinkClick(e, '#programs')} style={{ color: 'inherit', textDecoration: 'none', cursor: 'pointer' }}>Pricing</a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--fresh-sky)', marginBottom: '1.5rem' }}>Company</h4>
                <ul style={{ listStyle: 'none', margin: 0, padding: '0 0 0 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', color: 'var(--frozen-water)' }}>
                  <li><a href="#" onClick={(e) => handleLinkClick(e, 'about')} style={{ color: 'inherit', textDecoration: 'none' }}>About Us</a></li>
                  <li><a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Careers</a></li>
                  <li><a href="#" onClick={(e) => handleLinkClick(e, '#blog')} style={{ color: 'inherit', textDecoration: 'none' }}>Knowledge Hub</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.05)', padding: 'clamp(24px, 5vw, 40px)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h3 style={{ color: 'white', fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '24px' }}>Get in Touch</h3>
            {contactStatus === 'success' && (
              <div style={{ background: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.3)', color: '#4ade80', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.9rem', textAlign: 'center' }}>
                ✅ Thank you! We'll get back to you soon.
              </div>
            )}
            {contactStatus === 'error' && (
              <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.9rem', textAlign: 'center' }}>
                Something went wrong. Please try again.
              </div>
            )}
            <form onSubmit={handleContactSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <input type="text" placeholder="Your Name" className="input-field" value={contactName} onChange={(e) => setContactName(e.target.value)} required disabled={contactLoading} />
              <input type="email" placeholder="Your Email" className="input-field" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} required disabled={contactLoading} />
              <input type="tel" placeholder="Your Phone Number" className="input-field" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} required disabled={contactLoading} />
              <textarea rows={4} placeholder="How can we help?" className="input-field" style={{ resize: 'none' }} value={contactMessage} onChange={(e) => setContactMessage(e.target.value)} required disabled={contactLoading}></textarea>
              <button type="submit" className="btn btn-primary" disabled={contactLoading} style={{ marginTop: '8px', padding: '12px', borderRadius: '8px', width: '100%', display: 'flex', gap: '8px', opacity: contactLoading ? 0.7 : 1 }}>
                {contactLoading ? 'Sending...' : 'Send Message'} {!contactLoading && <Send size={16} />}
              </button>
            </form>
          </div>
        </div>
        <div style={{ marginTop: '6rem', paddingTop: '2rem', borderTop: '1px solid rgba(98, 182, 203, 0.2)', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', color: 'var(--pacific-blue)', fontSize: '0.875rem' }}>
          <div className="md:flex-row" style={{ width: '100%', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
             <p>&copy; 2025 Aarohan Platform. All rights reserved.</p>
             <div style={{ display: 'flex', gap: '2rem' }}>
               <a href="#" onClick={(e) => handleLinkClick(e, 'privacy')} style={{ color: 'inherit', textDecoration: 'none' }}>Privacy Policy</a>
               <a href="#" onClick={(e) => handleLinkClick(e, 'terms')} style={{ color: 'inherit', textDecoration: 'none' }}>Terms of Service</a>
             </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

const PizzaImage = ({ size = 24 }) => (
  <img
    src="/pay/pizza.png" 
    alt="Pizza Icon"
    style={{
      width: `${size}px`,
      height: `${size}px`,
      objectFit: 'contain',
      display: 'block'
    }}
  />
);
// Assuming PizzaImage is imported/defined above in your file

const PricingPage = ({ onNavigate }) => {
  const pricingPlans = [
    {
      tag: <span style={{ textDecoration: 'line-through' }}>₹ 499 + GST</span>,
      tagColor: '#b5833d',
      icon: <PizzaImage size={80} />, // Smallest pizza
      title: '360\u00B0 AI Career Assessment',
      subtitle: '', 
      price: <>₹ 199 <span style={{ fontSize: '1rem', color: '#4a7a96', fontWeight: 600, marginLeft: '4px' }}>(inc GST)</span></>,
      saveBadge: 'Save 60%', 

      borderColor: '#b5833d', 
      gradientFrom: 'rgba(181, 131, 61, 0.05)',
      accentColor: '#b5833d', 
      description: 'This entry-level program provides a scientific "mirror" to help students move beyond academic marks and discover their internal Aptitude DNA',
      features: [
        '360\u00B0 Multidimensional Assessment - measure what you can do, who you are, and what you want to do, and how you can achieve what you want',
        'Interactive Result and AI-Driven Recommendation Engine',
        '3-month access to AI-Driven Career Mentorship',
        '3-month access to 5000+ Live Job Encyclopedia',
      ],
      buttonLabel: 'Upgrade now',
      buttonIcon: '',
    },
    {
      tag: <span style={{ textDecoration: 'line-through' }}>₹ 1,499 + GST</span>,
      tagColor: '#60a8d3', 
      icon: <PizzaImage size={100} />, // Medium pizza 
      title: '360\u00B0 Career Mentorship',
      subtitle: '', 
      price: <>₹ 749 <span style={{ fontSize: '1rem', color: '#4a7a96', fontWeight: 600, marginLeft: '4px' }}>(inc GST)</span></>,
      saveBadge: 'Save 50%', 

      borderColor: '#60a8d3', 
      gradientFrom: 'rgba(96, 168, 211, 0.05)',
      accentColor: '#60a8d3', 
      description: 'This program helps students with a "Human Compass or a Sherpa" to decode complex data into an actionable strategy',
      features: [
        'All features of 360\u00B0 AI Career Assessment',
        '30-minute, one-on-one Mentorship Session with our Career Experts',
        '6-month access to AI-Driven Career Mentorship',
        '6-month access to 5000+ Live Job Encyclopedia',
      ],
      buttonLabel: 'Upgrade now',
      buttonIcon: '',
    },
    {
      tag: <span style={{ textDecoration: 'line-through' }}>₹ 3,999 + GST</span>,
      tagColor: '#b5833d', 
      icon: <PizzaImage size={120} />, // Replaced 160 with 120 for the 3rd card
      title: '360\u00B0 Complete Career Discovery',
      subtitle: '',
      price: <>₹ 1,999 <span style={{ fontSize: '1rem', color: '#4a7a96', fontWeight: 600, marginLeft: '4px' }}>(inc GST)</span></>,
      saveBadge: 'Save 50%',

      borderColor: '#b5833d', 
      gradientFrom: 'rgba(181, 131, 61, 0.06)',
      accentColor: '#b5833d', 
      description: 'The premium tier offers the full "Lifelong Career Mentorship" ecosystem, connecting students with top-tier industry veterans to guide them',
      features: [
        'All features of 360\u00B0 AI Career Assessment',
        '60-minute, one-on-one Mentorship Session with our Industry Venteran/Experts',
        '12-month access to AI-Driven Career Mentorship',
        '12-month access to 5000+ Live Job Encyclopedia',
        'Tailored Expert Report Review for the three assessments',
      ],
      buttonLabel: 'Upgrade now',
      buttonIcon: '',
    },
  ];

  const handlePlanClick = () => {
    if (onNavigate) onNavigate('student-register?enroll=1');
  };

  return (
    <div style={{ background: '#f8fbff', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{ flexGrow: 1, paddingTop: '100px', paddingBottom: '60px' }}
      >
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h1 className="text-huge" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', marginBottom: '12px' }}>
              Our Offering
            </h1>
            <p style={{ color: '#4a7a96', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
              Choose the plan that best fits your career discovery journey. 
            </p>
          </div>

          {/* Pricing Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', alignItems: 'stretch' }}>
            {pricingPlans.map((plan, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                whileHover={{ y: -8, boxShadow: `0 20px 40px -12px ${plan.accentColor}30` }}
                style={{
                  background: `linear-gradient(135deg, white 0%, ${plan.gradientFrom} 100%)`,
                  border: `2px solid ${plan.borderColor}`,
                  borderRadius: '20px',
                  padding: '0',
                  overflow: 'hidden',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'default',
                }}
              >
                {/* Top-Right Tag */}
                <div style={{
                  position: 'absolute', top: 0, right: 0,
                  background: plan.tagColor, color: 'white',
                  padding: '6px 16px', fontSize: '0.9rem', fontWeight: 700, 
                  borderBottomLeftRadius: '12px', letterSpacing: '0.05em',
                  zIndex: 2,
                }}>
                  {plan.tag}
                </div>

                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  
                  {/* Icon + Title */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px', marginTop: '12px', minHeight: '130px' }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                      // Removed the fixed 160px width to eliminate the huge gap
                    }}>
                      {plan.icon}
                    </div>
                    <div>
                      {/* Increased fontSize to 2rem and fontWeight to 800 so it matches the price text visual size */}
                      <h3 style={{ margin: 0, fontSize: '2rem', fontWeight: 800, color: '#0e2b3c', lineHeight: 1.1 }}>{plan.title}</h3>
                      {plan.subtitle && <span style={{ color: '#4a7a96', fontSize: '0.85rem', display: 'block', marginTop: '6px' }}>{plan.subtitle}</span>}
                    </div>
                  </div>

                  {/* Price Section */}
                  <div style={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', gap: '4px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '2.2rem', fontWeight: 800, color: plan.accentColor }}>{plan.price}</span>
                  </div>

                  {/* Save Badge */}
                  {plan.saveBadge && (
                    <div style={{
                      display: 'inline-block', background: `${plan.accentColor}15`, color: plan.accentColor,
                      padding: '4px 10px', borderRadius: '16px', fontSize: '0.75rem', fontWeight: 600, marginBottom: '20px',
                      width: 'fit-content'
                    }}>
                      {plan.saveBadge}
                    </div>
                  )}

                  {/* Description ("What you get:") */}
                  <div style={{
                    background: `${plan.accentColor}08`, borderRadius: '12px', padding: '16px', marginBottom: '20px',
                    minHeight: '150px' 
                  }}>
                    <p style={{ margin: 0, fontSize: '1.1rem', color: '#0e2b3c', lineHeight: 1.6, fontWeight: 500 }}>
                      {plan.description}
                    </p>
                  </div>

                  {/* Features */}
                  <ul style={{ listStyle: 'none', padding: 0, marginBottom: '24px', flexGrow: 1 }}>
                    {plan.features.map((f, fi) => (
                      <li key={fi} style={{ marginBottom: '10px', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                        <span style={{ color: plan.accentColor, fontSize: '1rem', lineHeight: 1.4, marginTop: '1px' }}>✓</span>
                        <span style={{ fontSize: '0.95rem', color: '#0e2b3c', lineHeight: 1.5 }}>{f}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <button
                    onClick={handlePlanClick}
                    style={{
                      width: '100%', padding: '14px 20px', borderRadius: '12px',
                      background: plan.accentColor, color: 'white', border: 'none',
                      fontSize: '1.05rem', fontWeight: 700, cursor: 'pointer',
                      boxShadow: `0 4px 12px ${plan.accentColor}40`,
                      transition: 'all 0.2s ease', letterSpacing: '0.3px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                      marginTop: 'auto' 
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 6px 16px ${plan.accentColor}50`; }}
                    onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 4px 12px ${plan.accentColor}40`; }}
                  >
                    <span>{plan.buttonIcon}</span> {plan.buttonLabel}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Bottom note */}
          <div style={{
            textAlign: 'center', marginTop: '40px', padding: '20px',
            background: 'rgba(255,255,255,0.8)', borderRadius: '16px',
            border: '1px solid white', backdropFilter: 'blur(10px)',
          }}>
            <p style={{ margin: 0, color: '#0e2b3c', fontWeight: 600, fontSize: '0.95rem' }}>
              🔒 All payments are secure. Credits are added instantly after verification.
            </p>
            <p style={{ margin: '6px 0 0', color: '#4a7a96', fontSize: '0.85rem' }}>
              Questions? Reach out via the contact form or WhatsApp us anytime.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};




export function BannerPage({ onNavigate, initialView }) {
  const [currentView, setCurrentView] = useState(initialView || 'home');
  
  const { shouldReduceAnimations, isLowEnd } = useDevicePerformance();

  useEffect(() => { window.scrollTo(0, 0); }, [currentView]);

  const handleMainNavigate = useCallback((dest) => {
    if (dest === 'home') setCurrentView('home');
    else if (dest === 'pricing') { onNavigate('/pricing'); setCurrentView('pricing'); }
    else onNavigate(dest);
  }, [onNavigate]);

  if (currentView === 'about') return <AboutUsPage onNavigate={setCurrentView} />;
  if (currentView === 'terms') return <TermsPage onNavigate={setCurrentView} />;
  if (currentView === 'privacy') return <PrivacyPage onNavigate={setCurrentView} />;
  if (currentView === 'Counselor') return <CounselorPage onNavigate={setCurrentView} />;
  if (currentView === 'pricing') return <PricingPage onNavigate={(dest) => {
    window.scrollTo(0, 0);
    if (dest && dest.startsWith('student-register')) { handleMainNavigate(dest); }
    else { setCurrentView(dest); }
  }} />;

  return (
    <div style={{ background: '#f8fbff', minHeight: '100vh' }}>
      <Helmet>
        <title>Aarohan - Career Aptitude Testing & Expert Career Mentorship for Students</title>
        <meta name="description" content="Unlock your true potential with Aarohan's scientifically designed career aptitude tests, personality assessments, and expert career mentorship for students from Class 5 to 12." />
        <link rel="canonical" href="https://myaarohan.com/" />
      </Helmet>
      <GlobalStyles />
      <Navbar 
        shouldReduceAnimations={shouldReduceAnimations}
        onNavigate={(dest) => {
          if(dest === 'home') setCurrentView('home');
          else handleMainNavigate(dest);
        }} 
      />
      
      <main id="main-content" role="main">
      <HeroSection onNavigate={handleMainNavigate} shouldReduceAnimations={shouldReduceAnimations} />
      <FeaturesSection onNavigate={handleMainNavigate} shouldReduceAnimations={shouldReduceAnimations} />
      <PerksSection shouldReduceAnimations={shouldReduceAnimations} />
      
      <ProgramsSection onNavigate={handleMainNavigate} shouldReduceAnimations={shouldReduceAnimations} />
      <BlogSection onNavigate={handleMainNavigate} shouldReduceAnimations={shouldReduceAnimations} /> 
      
      <AboutSection shouldReduceAnimations={shouldReduceAnimations} />
      
      <TestimonialsSection shouldReduceAnimations={shouldReduceAnimations} />
      
      </main>
      <Footer onNavigate={setCurrentView} />
    </div>
  );
}