'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Github, Linkedin, Mail, Phone, ChevronDown, ChevronUp,
  Download, Brain, Cpu, MapPin, Calendar, Building,
  Bot, Server, Code, Cloud, Menu, X, Zap, ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

/* ═══════════════════════════════════════════
   NEURAL CANVAS
═══════════════════════════════════════════ */
function NeuralCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: -9999, y: -9999 });

  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    let id: number;

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);

    const onMouse = (e: MouseEvent) => { mouse.current = { x: e.clientX, y: e.clientY }; };
    window.addEventListener('mousemove', onMouse);

    type P = { x:number; y:number; vx:number; vy:number; r:number };
    const N = 80;
    const pts: P[] = Array.from({ length: N }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5, vy: (Math.random() - 0.5) * 0.5,
      r: Math.random() * 2 + 0.8,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pts.forEach(p => {
        // mouse repulsion
        const dx = p.x - mouse.current.x, dy = p.y - mouse.current.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 120) { p.vx += dx / dist * 0.4; p.vy += dy / dist * 0.4; }
        // dampen
        p.vx *= 0.995; p.vy *= 0.995;
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width)  p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      });

      // lines
      for (let i = 0; i < N; i++) for (let j = i + 1; j < N; j++) {
        const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
        const d = Math.sqrt(dx*dx + dy*dy);
        if (d < 150) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(34,211,238,${(1 - d/150) * 0.15})`;
          ctx.lineWidth = 0.8;
          ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y);
          ctx.stroke();
        }
      }
      // dots
      pts.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
        ctx.fillStyle = 'rgba(34,211,238,0.55)';
        ctx.fill();
      });
      id = requestAnimationFrame(draw);
    };
    draw();
    return () => { window.removeEventListener('resize', resize); window.removeEventListener('mousemove', onMouse); cancelAnimationFrame(id); };
  }, []);

  return <canvas ref={ref} className="absolute inset-0 pointer-events-none" style={{ zIndex:0 }} />;
}

/* ═══════════════════════════════════════════
   CUSTOM CURSOR  (RAF + transform — zero lag)
═══════════════════════════════════════════ */
function CustomCursor() {
  const dot  = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Raw mouse position (updated instantly)
    const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    // Ring position trails behind
    const pos   = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    let rafId: number;

    const onMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const onOver = (e: MouseEvent) => {
      const el = e.target as HTMLElement;
      const hoverable = el.closest('a,button,[role=button],.glow-card,.stat-card,.cert-card');
      ring.current?.classList.toggle('hovering', !!hoverable);
    };

    const tick = () => {
      // Dot: instant follow
      if (dot.current) {
        dot.current.style.transform = `translate(${mouse.x - 4}px, ${mouse.y - 4}px)`;
      }
      // Ring: smooth ease-toward (lerp factor 0.12 = fast but no snap)
      pos.x += (mouse.x - pos.x) * 0.12;
      pos.y += (mouse.y - pos.y) * 0.12;
      if (ring.current) {
        ring.current.style.transform = `translate(${pos.x - 18}px, ${pos.y - 18}px)`;
      }
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mouseover', onOver, { passive: true });

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseover', onOver);
    };
  }, []);

  return (
    <>
      <div ref={dot}  className="cursor-dot"  />
      <div ref={ring} className="cursor-ring" />
    </>
  );
}

/* ═══════════════════════════════════════════
   ANIMATED COUNTER
═══════════════════════════════════════════ */
function AnimatedCounter({ target, suffix='' }: { target:number; suffix?:string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const done = useRef(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !done.current) {
        done.current = true;
        let c = 0; const step = Math.ceil(target / 60);
        const t = setInterval(() => { c = Math.min(c + step, target); setCount(c); if (c >= target) clearInterval(t); }, 25);
      }
    }, { threshold: 0.5 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [target]);
  return <span ref={ref}>{count}{suffix}</span>;
}

/* ═══════════════════════════════════════════
   SKILL BAR (animated fill)
═══════════════════════════════════════════ */
function SkillBar({ label, pct }: { label:string; pct:number }) {
  const ref  = useRef<HTMLDivElement>(null);
  const fill = useRef<HTMLDivElement>(null);
  const done = useRef(false);
  useEffect(() => {
    const el = ref.current; if (!el || !fill.current) return;
    fill.current.style.setProperty('--bar-width', pct + '%');
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !done.current) {
        done.current = true;
        setTimeout(() => fill.current?.classList.add('filled'), 100);
      }
    }, { threshold: 0.5 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [pct]);
  return (
    <div ref={ref} className="mb-3">
      <div className="flex justify-between mb-1">
        <span className="text-slate-300 text-sm">{label}</span>
        <span className="text-cyan-400 text-xs font-mono">{pct}%</span>
      </div>
      <div className="skill-bar-track">
        <div ref={fill} className="skill-bar-fill" />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════ */
export default function Portfolio() {
  const [expandedSkill,   setExpandedSkill]   = useState<string|null>(null);
  const [expandedProject, setExpandedProject] = useState<string|null>(null);
  const [mobileOpen,      setMobileOpen]      = useState(false);
  const [activeSection,   setActiveSection]   = useState('home');
  const [scrolled,        setScrolled]        = useState(false);

  /* typing */
  const titles = ['Software Engineer','Agentic AI Developer','RAG Pipeline Engineer','Full-Stack Developer','Cloud & Backend Engineer'];
  const [typedText, setTypedText]   = useState('');
  const [titleIdx,  setTitleIdx]    = useState(0);
  const [charIdx,   setCharIdx]     = useState(0);
  const [isDeleting,setIsDeleting]  = useState(false);

  useEffect(() => {
    const cur = titles[titleIdx];
    const delay = isDeleting ? 38 : charIdx === cur.length ? 2200 : 80;
    const t = setTimeout(() => {
      if (!isDeleting) {
        if (charIdx < cur.length) { setTypedText(cur.slice(0, charIdx+1)); setCharIdx(c=>c+1); }
        else setIsDeleting(true);
      } else {
        if (charIdx > 0) { setTypedText(cur.slice(0, charIdx-1)); setCharIdx(c=>c-1); }
        else { setIsDeleting(false); setTitleIdx(i=>(i+1)%titles.length); }
      }
    }, delay);
    return () => clearTimeout(t);
  }, [charIdx, isDeleting, titleIdx]);

  /* scroll reveal */
  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('animate-in'); }),
      { threshold: 0.08 }
    );
    document.querySelectorAll('.scroll-animate,.scroll-animate-left,.scroll-animate-right,.scroll-animate-scale').forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  /* active section */
  useEffect(() => {
    const ids = ['home','about','experience','skills','portfolio','certifications','education','services','contact'];
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) setActiveSection(e.target.id); }),
      { threshold: 0.25 }
    );
    ids.forEach(id => { const el = document.getElementById(id); if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, []);

  /* navbar shadow on scroll */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* 3D card tilt */
  const handleTilt = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top  - rect.height / 2;
    card.style.transform = `perspective(900px) rotateY(${x/25}deg) rotateX(${-y/25}deg) translateY(-4px)`;
  }, []);
  const resetTilt = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.transform = '';
  }, []);

  /* ── DATA ── */
  const navLinks = [
    { href:'#home',           label:'Home' },
    { href:'#about',          label:'About' },
    { href:'#experience',     label:'Experience' },
    { href:'#skills',         label:'Skills' },
    { href:'#portfolio',      label:'Projects' },
    { href:'#certifications', label:'Certs' },
    { href:'#education',      label:'Education' },
    { href:'#contact',        label:'Contact' },
  ];

  const stats = [
    { label:'Years Experience', value:3,  suffix:'+', icon:'⚡' },
    { label:'Projects Shipped', value:5,  suffix:'+', icon:'🚀' },
    { label:'AI Systems Built', value:3,  suffix:'',  icon:'🤖' },
    { label:'Cloud Deployments',value:10, suffix:'+', icon:'☁️' },
  ];

  const skillBars = [
    { label:'Python / FastAPI / Django',            pct:90 },
    { label:'Agentic AI / LangGraph / AWS Bedrock', pct:88 },
    { label:'Java / Spring Boot / Microservices',   pct:85 },
    { label:'React / TypeScript / Angular',         pct:82 },
    { label:'AWS Cloud Infrastructure',             pct:83 },
    { label:'RAG / Vector Databases',               pct:86 },
    { label:'Docker / Kubernetes / CI-CD',          pct:80 },
    { label:'PostgreSQL / Redis / MongoDB',         pct:84 },
  ];

  const skillCategories: Record<string,string[]> = {
    'AI & Machine Learning': [
      'Agentic AI','Retrieval-Augmented Generation (RAG)',
      'LangGraph','LangChain','Claude AI API',
      'AWS Bedrock','AWS AgentCore Memory','MediaPipe',
      'PyTorch','TensorFlow','Vector DBs (Pinecone, FAISS, ChromaDB)',
    ],
    'Programming & Scripting': ['Python','Java','JavaScript','TypeScript','SQL','Bash','Shell Scripting'],
    'Backend & API Development': [
      'Spring Boot','Spring MVC','Spring Security','Hibernate','HikariCP',
      'FastAPI','Django','Flask','REST APIs','GraphQL',
      'Microservices','Apache Kafka','Multithreading',
    ],
    'Frontend Development': ['React.js','Angular','Next.js','HTML5','CSS3','Tailwind CSS'],
    'Cloud & DevOps': [
      'AWS Bedrock','AWS AgentCore Memory',
      'AWS EC2','AWS Lambda','AWS S3','AWS RDS',
      'AWS IAM','AWS CloudWatch','AWS Amplify',
      'Docker','Kubernetes','CI/CD (GitHub Actions, Jenkins)',
    ],
    'Databases & Tools': ['PostgreSQL','MySQL','MongoDB','Redis','Elasticsearch','Pinecone','FAISS','ChromaDB','Git','Linux','Data Aggregation'],
  };

  const experience = [
    {
      id:'aalmv',
      company:'AALMV',
      role:'Software Engineer',
      period:'Jan 2026 – Present',
      location:'FL, USA',
      type:'full-time',
      typeLabel:'Full-Time',
      color:'cyan',
      bullets:[
        'Engineered Python-based Agentic AI tutoring workflows using FastAPI, AWS Bedrock, and LangGraph, enabling adaptive reasoning across personalized AP Physics learning sessions daily for students.',
        'Optimized PostgreSQL semantic memory pipelines and Pinecone vector retrieval indexing supporting RAG workflows, improving contextual tutoring relevance by 32% during iterative student assessment sessions.',
        'Implemented FastAPI inference services integrating Claude AI APIs, Redis caching, and asynchronous orchestration pipelines supporting concurrent multimodal tutoring requests across scalable cloud environments.',
        'Constructed React and TypeScript educator dashboards with GraphQL progress services, enabling real-time mastery visualization and configurable recommendation tracking across instructional physics modules.',
        'Engineered highly available AWS infrastructure using EC2, IAM, CloudWatch, and GitHub Actions CI/CD pipelines, supporting reliable 24/7 tutoring platform operations for global students.',
        'Developed LangGraph-driven orchestration workflows integrated with RAG pipelines and Supabase PostgreSQL semantic storage, enabling reliable contextual reasoning across tutoring environments.',
      ],
      tags:['Python','FastAPI','AWS Bedrock','LangGraph','React','TypeScript','PostgreSQL','Redis','Claude AI','RAG'],
    },
    {
      id:'ufl',
      company:'University of Florida',
      role:'Software Engineer (Research)',
      period:'Jun 2025 – Dec 2025',
      location:'FL, USA',
      type:'research',
      typeLabel:'Research',
      color:'blue',
      bullets:[
        'Integrated MediaPipe hand-tracking pipelines with Unity Animation Rigging constraints, improving dual-hand finger articulation stability by 30% during real-time gesture visualization experiments.',
        'Evaluated hand-tracking accuracy metrics through Python and .NET analytics workflows, improving experimental data reliability by 35% across iterative inference validation and testing sessions.',
        'Configured interactive Unity debugging interfaces supporting landmark freeze controls, bevel-angle visualization, and configurable UI states, increasing debugging efficiency by 25%.',
        'Automated multimodal tracking validation through CSV reporting and background inference monitoring pipelines, reducing manual verification workloads by 50% across gesture analysis environments.',
      ],
      tags:['C#','Unity','MediaPipe','Python','.NET','Animation Rigging','Hand Tracking','IK Constraints'],
    },
    {
      id:'phonepe',
      company:'PhonePe',
      role:'Software Engineer',
      period:'Aug 2022 – Dec 2023',
      location:'Remote, India',
      type:'remote',
      typeLabel:'Remote',
      color:'purple',
      bullets:[
        'Designed Java microservices architecture using Spring Boot, Spring MVC, and MySQL for centralized merchant transaction analytics across distributed payment processing environments.',
        'Analyzed transaction bottlenecks through Hibernate query profiling and aggregated reporting datasets, identifying synchronization inconsistencies affecting reconciliation workflows.',
        'Implemented Spring Security authentication, REST APIs, Apache Kafka event streams, and Java multithreading services, improving transaction reporting throughput by 28% during peak settlement operations.',
        'Validated AWS EC2-hosted microservices through Docker-based integration testing and scheduled monitoring pipelines, reducing backend synchronization failures by 24%.',
        'Improved operational payment visibility by integrating HikariCP-optimized backend services with analytics dashboards, accelerating dispute investigation workflows by 31%.',
      ],
      tags:['Java','Spring Boot','Spring Security','Apache Kafka','MySQL','Docker','AWS EC2','HikariCP','Hibernate'],
    },
  ];

  const projects = [
    {
      id:'distributed-systems',
      title:'Distributed Systems Simulation (Gossip & Push-Sum)',
      technologies:['Gleam','OTP Actor Model','Distributed Systems','Functional Programming'],
      domain:'Distributed Computing, Fault-Tolerant Systems',
      duration:'Aug 2024 – Dec 2024',
      image:'https://images.pexels.com/photos/1148820/pexels-photo-1148820.jpeg?auto=compress&cs=tinysrgb&w=800',
      description:'Distributed system simulation using Gleam (OTP actor model) implementing Gossip and Push-Sum algorithms with async message passing, convergence detection, and performance tracking across multiple network topologies.',
      highlights:['Supports 1000+ nodes across full, line, 3D and imperfect topologies','Convergence detection with real-time performance tracking','Fault-tolerant OTP actor-based architecture'],
      detailedContent:`<h3>Overview:</h3><p>Built using Gleam/OTP actor model, exploring information propagation across large distributed networks using Gossip and Push-Sum algorithms.</p><h3>What I Did:</h3><ul><li>Implemented Gossip algorithm for propagation and Push-Sum for distributed average computation.</li><li>Designed async message passing between 1000+ concurrent actor nodes.</li><li>Supported full mesh, line, 3D grid, and imperfect 3D topologies.</li><li>Built convergence detection and performance metrics across all topologies.</li><li>Leveraged OTP supervision trees for fault-tolerance and crash recovery.</li></ul><h3>Impact:</h3><ul><li>Sub-linear convergence time at 1000+ node scale.</li><li>Empirical comparison of gossip convergence across all four topologies.</li></ul>`,
    },
    {
      id:'quickchat',
      title:'Real-Time Chat Application (QuickChat)',
      technologies:['Java','Socket Programming','Multithreading','TCP/IP','Client-Server'],
      domain:'Full-Stack Development, Distributed Systems',
      duration:'Jan 2024 – May 2024',
      image:'https://images.pexels.com/photos/267350/pexels-photo-267350.jpeg?auto=compress&cs=tinysrgb&w=800',
      description:'Real-time chat application using Java socket programming and client-server architecture, supporting 100+ concurrent users with low-latency messaging and optimized multithreaded packet handling.',
      highlights:['100+ concurrent users with low-latency messaging','30% throughput improvement via optimized multithreading','25% delivery reliability boost'],
      detailedContent:`<h3>Overview:</h3><p>High-performance messaging app on raw Java sockets, demonstrating deep knowledge of network protocols and concurrent systems.</p><h3>What I Did:</h3><ul><li>Implemented client-server TCP sockets with thread-per-client model.</li><li>Optimized packet handling for throughput improvement.</li><li>Built graceful disconnect and reconnect handling.</li></ul><h3>Impact:</h3><ul><li>100+ concurrent users with consistent low latency.</li><li>30% throughput improvement, 25% better delivery reliability.</li></ul>`,
    },
    {
      id:'ecg-signal',
      title:'ECG Signal Interpretation Using CWT & CNN',
      technologies:['Python','TensorFlow','Keras','CWT','Jupyter Notebook'],
      domain:'Biomedical Signal Processing, Deep Learning',
      duration:'Sept 2022 – Dec 2022',
      image:'https://images.pexels.com/photos/40568/medical-appointment-doctor-healthcare-40568.jpeg?auto=compress&cs=tinysrgb&w=800',
      description:'Converted 1D ECG signals into 2D scalograms using Continuous Wavelet Transform and applied CNN for arrhythmia classification. 98.7% accuracy on MIT-BIH database. Published in IRJET.',
      highlights:['98.7% accuracy on MIT-BIH arrhythmia database','Published in IRJET — International Research Journal','Signal-to-image transformation using CWT'],
      detailedContent:`<h3>Overview:</h3><p>Research project classifying ECG signals into ARR, CHF, NSR with state-of-the-art accuracy.</p><h3>What I Did:</h3><ul><li>Applied CWT to convert 1D ECG signals into 2D scalograms.</li><li>Designed and trained CNN architecture for biomedical classification.</li><li>Tuned hyperparameters to maximize accuracy on MIT-BIH dataset.</li></ul><h3>Impact:</h3><ul><li>98.7% accuracy — published in IRJET.</li></ul>`,
    },
    {
      id:'agile-tracker',
      title:'Agile Sprint Tracker with CI/CD Integration',
      technologies:['React.js','Node.js','MongoDB','Docker','GitHub Actions','AWS EC2'],
      domain:'DevOps, Full-Stack Development',
      duration:'Aug 2024 – Dec 2024',
      image:'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800',
      description:'Agile productivity dashboard with automated CI/CD pipeline, real-time sprint tracking, and performance analytics — reducing deployment time by 40%.',
      highlights:['CI/CD reduced deployment time by 40%','25% productivity boost','15% fewer missed deadlines'],
      detailedContent:`<h3>Overview:</h3><p>Full-stack agile sprint tracker with automated deployments and real-time analytics.</p><h3>What I Did:</h3><ul><li>React.js frontend with real-time task updates.</li><li>Node.js + MongoDB backend.</li><li>GitHub Actions + Docker → AWS EC2 CI/CD pipeline.</li><li>Sprint burn-down charts and performance visualization.</li></ul><h3>Impact:</h3><ul><li>40% reduction in deployment time. 25% productivity increase.</li></ul>`,
    },
    {
      id:'blockchain-security',
      title:'Decentralized Blockchain Solutions for Data Security',
      technologies:['Java','SQL','Hyperledger Fabric','React.js','Tailwind CSS'],
      domain:'Blockchain, Cybersecurity',
      duration:'Aug 2022 – Apr 2023',
      image:'https://images.pexels.com/photos/844124/pexels-photo-844124.jpeg?auto=compress&cs=tinysrgb&w=800',
      description:'Block-based file transfer with cryptographic hashing and Hyperledger Fabric — 30% reduction in security breaches, 20% improvement in file management.',
      highlights:['30% reduction in security breaches','20% file management improvement','Immutable audit trail via Hyperledger Fabric'],
      detailedContent:`<h3>Overview:</h3><p>Secure, tamper-proof file sharing on Hyperledger Fabric with modern React dashboard.</p><h3>What I Did:</h3><ul><li>Block-based file protocol with cryptographic hashing.</li><li>Hyperledger Fabric for immutability and audit trail.</li><li>React.js + Tailwind CSS file management dashboard.</li></ul><h3>Impact:</h3><ul><li>30% reduction in security breaches. 20% faster file management.</li></ul>`,
    },
  ];

  const certifications = [
    { title:'Introduction to Embedded Systems Software and Development Environments', org:'University of Colorado', date:'Mar 2022', icon:'🎓' },
    { title:'Object-Oriented Data Structures in C++', org:'University of Illinois Urbana-Champaign | Coursera', date:'Jun 2020', icon:'🏛️' },
    { title:'Java Developer', org:'JSpiders — Training & Development Center', date:'Jul 2023', icon:'☕' },
    { title:'Web Development', org:'Teachnook (IIT Bhubaneswar)', date:'Sep 2022', icon:'🌐' },
  ];

  const education = [
    { degree:'Master of Science — Computer and Information Science', school:'University of Florida', period:'Jan 2024 – Dec 2025', location:'FL, USA', gpa:'3.66 / 4.0', icon:'🎓' },
    { degree:'Bachelor of Technology — Computer Science & Engineering', school:'Vellore Institute of Technology', period:'Aug 2019 – May 2023', location:'TN, India', gpa:null, icon:'🏛️' },
  ];

  const services = [
    { title:'Agentic AI Development',    desc:'Autonomous AI agents with multi-step reasoning, tool use and orchestration using LangGraph, Claude AI API, and AWS Bedrock.', icon:<Bot className="text-cyan-400" size={30} /> },
    { title:'RAG Pipeline Engineering',  desc:'Production-grade Retrieval-Augmented Generation systems with Pinecone, FAISS, ChromaDB, semantic memory, and LLM integrations.', icon:<Brain className="text-cyan-400" size={30} /> },
    { title:'Full-Stack Development',    desc:'End-to-end web apps with React, Angular, TypeScript, Spring Boot, and FastAPI — from responsive UI to scalable backend APIs.', icon:<Code className="text-cyan-400" size={30} /> },
    { title:'Cloud Infrastructure (AWS)',desc:'AWS architecture with EC2, Lambda, S3, RDS, IAM, Amplify, CloudWatch, and CI/CD for zero-downtime production deployments.', icon:<Cloud className="text-cyan-400" size={30} /> },
    { title:'Backend & Microservices',   desc:'High-performance APIs and distributed microservices with Spring Boot, FastAPI, Apache Kafka event streaming, Docker, and Kubernetes.', icon:<Server className="text-cyan-400" size={30} /> },
    { title:'Computer Vision & ML',      desc:'Real-time inference with MediaPipe, Unity integration, PyTorch/TensorFlow pipelines, and vector-based similarity search systems.', icon:<Cpu className="text-cyan-400" size={30} /> },
  ];

  /* ══ RENDER ══ */
  return (
    <div className="min-h-screen bg-[#080c1e] text-white overflow-x-hidden">
      <CustomCursor />

      {/* ─── NAV ─── */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-[#080c1e]/90 backdrop-blur-xl border-b border-slate-700/40 shadow-xl shadow-black/30' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <span className="text-2xl font-black gradient-text tracking-tight">BR</span>
              <span className="relative flex h-2.5 w-2.5">
                <span className="online-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
              </span>
              <span className="text-xs text-green-400 hidden sm:inline font-medium">Available for work</span>
            </div>
            <div className="hidden lg:flex items-center space-x-6">
              {navLinks.map(l => (
                <a key={l.href} href={l.href}
                  className={`nav-link text-sm font-medium transition-colors ${activeSection===l.href.slice(1) ? 'text-cyan-400' : 'text-slate-400 hover:text-white'}`}>
                  {l.label}
                </a>
              ))}
              <a href="/BHARGAV_REDDY_BATTU_RESUME.pdf" download
                className="flex items-center gap-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-sm px-5 py-2 rounded-full transition-all font-semibold shadow-lg shadow-cyan-500/25">
                <Download size={13} /> Resume
              </a>
            </div>
            <button className="lg:hidden text-slate-400 hover:text-white" onClick={() => setMobileOpen(o=>!o)}>
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
        {mobileOpen && (
          <div className="lg:hidden mobile-menu bg-[#080c1e]/98 border-t border-slate-700/40 px-5 py-4 space-y-2">
            {navLinks.map(l => (
              <a key={l.href} href={l.href} className="block text-slate-300 hover:text-cyan-400 py-1.5 text-sm font-medium" onClick={() => setMobileOpen(false)}>{l.label}</a>
            ))}
            <a href="/BHARGAV_REDDY_BATTU_RESUME.pdf" download className="flex items-center gap-2 bg-cyan-500 text-white text-sm px-5 py-2.5 rounded-full w-fit mt-3 font-semibold" onClick={() => setMobileOpen(false)}>
              <Download size={13} /> Download Resume
            </a>
          </div>
        )}
      </nav>

      {/* ─── HERO ─── */}
      <section id="home" className="relative pt-16 min-h-screen flex items-center overflow-hidden">
        <NeuralCanvas />
        {/* radial glow */}
        <div className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full bg-cyan-500/5 blur-3xl pointer-events-none" />
        <div className="absolute top-1/4 right-1/4 w-80 h-80 rounded-full bg-violet-500/5 blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#080c1e] pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* LEFT */}
            <div>
              <div className="hero-badge section-badge mb-4">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                Open to opportunities
              </div>

              <h1 className="hero-title text-6xl lg:text-7xl xl:text-8xl font-black mb-5 leading-none tracking-tight">
                Hi, I'm<br />
                <span className="gradient-text">Bhargav</span><br />
                <span className="text-white">Reddy Battu</span>
              </h1>

              <h2 className="hero-subtitle text-xl lg:text-2xl font-light text-slate-300 mb-6 flex items-center gap-1 h-9">
                <span className="text-cyan-400 font-semibold">{typedText}</span>
                <span className="typing-cursor" />
              </h2>

              <p className="hero-desc text-base text-slate-400 mb-9 leading-relaxed max-w-lg">
                Software Engineer with <span className="text-white font-medium">3+ years</span> building scalable backend systems,
                AI-driven applications, and cloud-native infrastructure.
                Specializing in <span className="text-cyan-400 font-medium">Agentic AI</span>,{' '}
                <span className="text-cyan-400 font-medium">RAG pipelines</span>,
                microservices with <span className="text-cyan-400 font-medium">Spring Boot & FastAPI</span>, and{' '}
                <span className="text-cyan-400 font-medium">AWS</span>.
                MS Computer Science — <span className="text-white font-medium">University of Florida</span>.
              </p>

              <div className="hero-buttons flex flex-wrap gap-3">
                <a href="#portfolio" className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-8 py-3.5 rounded-full font-semibold shadow-lg shadow-cyan-500/30 transition-all hover:shadow-cyan-500/50 hover:-translate-y-0.5 text-sm">
                  View Projects <ExternalLink size={14} />
                </a>
                <a href="/BHARGAV_REDDY_BATTU_RESUME.pdf" download
                  className="flex items-center gap-2 border border-cyan-400/40 text-cyan-400 hover:bg-cyan-400/10 px-8 py-3.5 rounded-full transition-all font-semibold text-sm hover:-translate-y-0.5">
                  <Download size={14} /> Resume
                </a>
                <a href="#contact"
                  className="flex items-center gap-2 border border-slate-600 text-slate-300 hover:border-slate-400 hover:text-white px-8 py-3.5 rounded-full transition-all font-semibold text-sm hover:-translate-y-0.5">
                  Get In Touch
                </a>
              </div>
            </div>

            {/* RIGHT — avatar */}
            <div className="hero-image flex justify-center lg:justify-end">
              <div className="relative flex items-center justify-center" style={{ width:420, height:420 }}>
                {/* orbit dots */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div style={{ animation:'orbit 9s linear infinite', position:'absolute' }}
                    className="w-4 h-4 rounded-full bg-cyan-400/80 shadow-lg shadow-cyan-400/50" />
                  <div style={{ animation:'orbitReverse 14s linear infinite', position:'absolute' }}
                    className="w-3 h-3 rounded-full bg-violet-400/80 shadow-lg shadow-violet-400/50" />
                  <div style={{ animation:'orbitSlow 20s linear infinite', position:'absolute' }}
                    className="w-2 h-2 rounded-full bg-blue-400/80" />
                </div>
                {/* rings */}
                <div className="absolute w-80 h-80 rounded-full border border-cyan-400/10 animate-pulse" />
                <div className="absolute w-72 h-72 rounded-full border border-cyan-400/15" />
                {/* photo */}
                <div className="w-64 h-64 lg:w-72 lg:h-72 xl:w-80 xl:h-80 rounded-full overflow-hidden border-2 border-cyan-400/60 animate-float animate-glow relative z-10"
                  style={{ boxShadow:'0 0 60px rgba(34,211,238,0.25), 0 0 120px rgba(34,211,238,0.08)' }}>
                  <img src="https://i.postimg.cc/YCs59skk/Screenshot-2025-06-07-at-1-24-31-PM.png"
                    alt="Bhargav Reddy Battu" className="w-full h-full object-cover object-center" />
                </div>
              </div>
            </div>
          </div>

          {/* STATS */}
          <div className="hero-stats grid grid-cols-2 md:grid-cols-4 gap-4 mt-16">
            {stats.map((s,i) => (
              <div key={s.label} className="stat-card p-5 text-center rounded-2xl" style={{ animationDelay:`${i*0.1}s` }}>
                <div className="text-2xl mb-1">{s.icon}</div>
                <div className="text-4xl font-black text-cyan-400 mb-1 tracking-tight">
                  <AnimatedCounter target={s.value} suffix={s.suffix} />
                </div>
                <div className="text-xs text-slate-400 font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── ABOUT ─── */}
      <section id="about" className="py-28 mesh-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="scroll-animate text-center mb-14">
            <div className="section-badge mx-auto w-fit mb-3">About Me</div>
            <h2 className="text-4xl lg:text-5xl font-black">Who I <span className="gradient-text">Am</span></h2>
          </div>
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-10">
            {/* bio */}
            <div className="scroll-animate-left lg:col-span-3">
              <div className="glow-card rounded-2xl p-8 h-full">
                <div className="space-y-4 text-slate-300 leading-relaxed">
                  <p>I'm a <span className="text-cyan-400 font-semibold">Software Engineer</span> with 3+ years of experience building scalable backend systems, AI-driven applications, and cloud-native infrastructure using <span className="text-white">Python, Java, FastAPI, Spring Boot, and AWS</span>.</p>
                  <p>At <span className="text-cyan-400 font-semibold">AALMV</span>, I engineer Python-based Agentic AI tutoring workflows using FastAPI, AWS Bedrock, and LangGraph — building adaptive reasoning systems with PostgreSQL semantic memory, Pinecone vector retrieval, Claude AI APIs, and Redis caching for concurrent multimodal environments.</p>
                  <p>Previously at <span className="text-cyan-400 font-semibold">PhonePe</span>, I designed Java microservices with Spring Boot, implemented Apache Kafka event streams, and improved transaction reporting throughput by 28% across distributed payment processing environments.</p>
                  <p>My research at <span className="text-cyan-400 font-semibold">University of Florida</span> combined MediaPipe hand-tracking with Unity Animation Rigging for real-time surgical simulation — improving gesture articulation stability by 30% and reducing manual validation workloads by 50%.</p>
                </div>
              </div>
            </div>
            {/* right col */}
            <div className="scroll-animate-right lg:col-span-2 space-y-5">
              <div className="glow-card rounded-2xl p-6 space-y-3">
                {[
                  { icon:<MapPin size={15}/>,     label:'Location',  val:'FL, USA' },
                  { icon:<Building size={15}/>,   label:'Current',   val:'Software Engineer @ AALMV' },
                  { icon:<Brain size={15}/>,      label:'Focus',     val:'Agentic AI & Backend Systems' },
                  { icon:<Zap size={15}/>,        label:'Education', val:'MS CS, UF — GPA 3.66' },
                  { icon:<Mail size={15}/>,       label:'Email',     val:'bhargavreddy@myjobsmail.com' },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-3 py-2 border-b border-slate-700/50 last:border-0">
                    <span className="text-cyan-400 shrink-0">{item.icon}</span>
                    <div>
                      <p className="text-xs text-slate-500">{item.label}</p>
                      <p className="text-sm text-white font-medium">{item.val}</p>
                    </div>
                  </div>
                ))}
              </div>
              <a href="/BHARGAV_REDDY_BATTU_RESUME.pdf" download
                className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-3.5 rounded-full shadow-lg shadow-cyan-500/25 transition-all hover:-translate-y-0.5 text-sm">
                <Download size={15}/> Download Full Resume
              </a>
            </div>
          </div>

          {/* SKILL BARS */}
          <div className="max-w-4xl mx-auto mt-14">
            <div className="scroll-animate text-center mb-8">
              <p className="text-slate-400 text-sm uppercase tracking-widest font-medium">Core Proficiency</p>
            </div>
            <div className="scroll-animate glow-card rounded-2xl p-8 grid grid-cols-1 md:grid-cols-2 gap-x-12">
              {skillBars.map(s => <SkillBar key={s.label} label={s.label} pct={s.pct} />)}
            </div>
          </div>
        </div>
      </section>

      {/* ─── EXPERIENCE ─── */}
      <section id="experience" className="py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="scroll-animate text-center mb-14">
            <div className="section-badge mx-auto w-fit mb-3">Career</div>
            <h2 className="text-4xl lg:text-5xl font-black">Professional <span className="gradient-text">Experience</span></h2>
          </div>
          <div className="max-w-4xl mx-auto">
            {experience.map((job,idx) => (
              <div key={job.id} className="relative flex gap-6 mb-8">
                <div className="flex flex-col items-center pt-2">
                  <div className="timeline-dot" />
                  {idx < experience.length-1 && <div className="timeline-line w-0.5 flex-1 mt-3 min-h-20" />}
                </div>
                <div className={`scroll-animate delay-${(idx+1)*150} flex-1 mb-1`}>
                  <div className="glow-card rounded-2xl"
                    onMouseMove={handleTilt} onMouseLeave={resetTilt}
                    style={{ transition:'transform 0.15s ease, border-color 0.35s, box-shadow 0.35s, transform 0.3s' }}>
                    <div className="p-6">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                        <div>
                          <h3 className="text-xl font-black text-cyan-400">{job.company}</h3>
                          <p className="text-white font-semibold text-base mt-0.5">{job.role}</p>
                        </div>
                        <div className="text-right shrink-0 space-y-1.5">
                          <div className="flex items-center gap-1.5 text-slate-400 text-xs justify-end"><Calendar size={11}/>{job.period}</div>
                          <div className="flex items-center gap-1.5 text-slate-400 text-xs justify-end"><MapPin size={11}/>{job.location}</div>
                          <span className={`exp-type-badge ${job.type}`}>{job.typeLabel}</span>
                        </div>
                      </div>
                      <ul className="space-y-2.5 mb-5">
                        {job.bullets.map((b,i) => (
                          <li key={i} className="flex gap-2.5 text-slate-300 text-sm leading-relaxed">
                            <span className="text-cyan-400 shrink-0 mt-0.5 font-bold">▸</span><span>{b}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="flex flex-wrap gap-1.5 pt-4 border-t border-slate-700/40">
                        {job.tags.map(t => (
                          <span key={t} className="skill-badge text-xs px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 hover:border-cyan-400/40 hover:text-cyan-300 transition-all">{t}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SKILLS ─── */}
      <section id="skills" className="py-28 mesh-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="scroll-animate text-center mb-14">
            <div className="section-badge mx-auto w-fit mb-3">Tech Stack</div>
            <h2 className="text-4xl lg:text-5xl font-black">Skills & <span className="gradient-text">Technologies</span></h2>
          </div>
          <div className="grid gap-3 max-w-5xl mx-auto">
            {Object.entries(skillCategories).map(([cat,skills],idx) => (
              <div key={cat} className={`scroll-animate delay-${Math.min((idx%4+1)*100,400)}`}>
                <div className="glow-card rounded-2xl overflow-hidden">
                  <button
                    className="w-full px-6 py-4 flex justify-between items-center text-left"
                    onClick={() => setExpandedSkill(expandedSkill===cat ? null : cat)}>
                    <span className="text-white font-semibold text-sm">{cat}</span>
                    <span className={`transition-transform duration-300 text-cyan-400 ${expandedSkill===cat?'rotate-180':''}`}>
                      <ChevronDown size={18}/>
                    </span>
                  </button>
                  {expandedSkill===cat && (
                    <div className="px-6 pb-5 border-t border-slate-700/40 pt-4">
                      <div className="flex flex-wrap gap-2">
                        {skills.map((skill,i) => (
                          <span key={i} className="skill-badge text-xs px-3 py-1.5 rounded-full bg-cyan-900/20 border border-cyan-400/25 text-cyan-300 font-medium">{skill}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PROJECTS ─── */}
      <section id="portfolio" className="py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="scroll-animate text-center mb-14">
            <div className="section-badge mx-auto w-fit mb-3">Work</div>
            <h2 className="text-4xl lg:text-5xl font-black">Featured <span className="gradient-text">Projects</span></h2>
          </div>
          <div className="grid gap-6">
            {projects.map((project,idx) => (
              <div key={project.id} className={`scroll-animate delay-${Math.min((idx%3+1)*100,300)}`}>
                <div className="glow-card rounded-2xl overflow-hidden">
                  <div className="grid grid-cols-1 lg:grid-cols-3">
                    <div className="lg:col-span-1 h-52 lg:h-full overflow-hidden">
                      <img src={project.image} alt={project.title} className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"/>
                    </div>
                    <div className="lg:col-span-2 p-6">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1 pr-4">
                          <h3 className="text-lg font-bold text-cyan-400 leading-snug mb-1">{project.title}</h3>
                          <p className="text-slate-500 text-xs">{project.domain} · {project.duration}</p>
                        </div>
                        <a href="https://github.com/19BEC0802" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-cyan-400 transition-colors shrink-0">
                          <Github size={20}/>
                        </a>
                      </div>
                      <p className="text-slate-300 text-sm leading-relaxed mb-4">{project.description}</p>
                      <div className="mb-4 space-y-1">
                        {project.highlights.map((h,i) => (
                          <div key={i} className="flex gap-2 text-sm">
                            <span className="text-green-400 shrink-0">✓</span>
                            <span className="text-slate-300">{h}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-1.5 mb-5">
                        {project.technologies.map((t,i) => (
                          <span key={i} className="skill-badge text-xs px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300">{t}</span>
                        ))}
                      </div>
                      <button onClick={() => setExpandedProject(expandedProject===project.id ? null : project.id)}
                        className="text-xs font-semibold text-cyan-400 hover:text-white border border-cyan-400/30 hover:border-cyan-400 px-4 py-2 rounded-full transition-all hover:bg-cyan-400/10">
                        {expandedProject===project.id ? '▲ Show Less' : '▼ Know More'}
                      </button>
                      {expandedProject===project.id && (
                        <div className="mt-5 p-5 bg-slate-800/60 rounded-xl border border-slate-700/50">
                          <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html:project.detailedContent }}/>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CERTIFICATIONS ─── */}
      <section id="certifications" className="py-28 mesh-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="scroll-animate text-center mb-14">
            <div className="section-badge mx-auto w-fit mb-3">Learning</div>
            <h2 className="text-4xl lg:text-5xl font-black gradient-text">Certifications</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto">
            {certifications.map((cert,idx) => (
              <div key={idx} className={`scroll-animate-scale delay-${(idx%2+1)*150}`}>
                <div className="cert-card h-full">
                  <div className="cert-card-inner flex gap-4 items-start">
                    <span className="text-3xl shrink-0">{cert.icon}</span>
                    <div>
                      <h3 className="text-slate-100 font-bold text-sm leading-snug mb-1">{cert.title}</h3>
                      <p className="text-cyan-400 text-xs mb-2">{cert.org}</p>
                      <div className="flex items-center gap-1.5 text-slate-500 text-xs"><Calendar size={10}/>{cert.date}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── EDUCATION ─── */}
      <section id="education" className="py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="scroll-animate text-center mb-14">
            <div className="section-badge mx-auto w-fit mb-3">Academic</div>
            <h2 className="text-4xl lg:text-5xl font-black gradient-text">Education</h2>
          </div>
          <div className="max-w-3xl mx-auto space-y-5">
            {education.map((edu,idx) => (
              <div key={idx} className={`scroll-animate delay-${(idx+1)*200}`}>
                <div className="glow-card rounded-2xl p-6 flex gap-5 items-center" onMouseMove={handleTilt} onMouseLeave={resetTilt}>
                  <span className="text-4xl shrink-0">{edu.icon}</span>
                  <div className="flex-1">
                    <h3 className="text-cyan-400 font-black text-xl mb-0.5">{edu.school}</h3>
                    <p className="text-white font-semibold text-sm">{edu.degree}</p>
                    <div className="flex flex-wrap items-center gap-4 mt-2">
                      <div className="flex items-center gap-1.5 text-slate-400 text-xs"><Calendar size={11}/>{edu.period}</div>
                      <div className="flex items-center gap-1.5 text-slate-400 text-xs"><MapPin size={11}/>{edu.location}</div>
                      {edu.gpa && (
                        <span className="text-xs px-3 py-1 rounded-full bg-cyan-900/30 border border-cyan-400/30 text-cyan-300 font-bold">GPA: {edu.gpa}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SERVICES ─── */}
      <section id="services" className="py-28 mesh-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="scroll-animate text-center mb-14">
            <div className="section-badge mx-auto w-fit mb-3">Expertise</div>
            <h2 className="text-4xl lg:text-5xl font-black">What I <span className="gradient-text">Build</span></h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map((svc,idx) => (
              <div key={idx} className={`scroll-animate-scale delay-${Math.min((idx%3+1)*100,300)}`}>
                <div className="glow-card rounded-2xl p-6 text-center h-full" onMouseMove={handleTilt} onMouseLeave={resetTilt}>
                  <div className="service-icon-wrap inline-flex p-4 rounded-2xl bg-cyan-900/20 border border-cyan-400/15 mb-4">
                    {svc.icon}
                  </div>
                  <h3 className="text-white font-bold text-base mb-2">{svc.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{svc.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CONTACT ─── */}
      <section id="contact" className="py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="scroll-animate text-center mb-14">
            <div className="section-badge mx-auto w-fit mb-3">Let's Talk</div>
            <h2 className="text-4xl lg:text-5xl font-black">Get In <span className="gradient-text">Touch</span></h2>
            <p className="text-slate-400 mt-3 text-sm">Open to full-time roles, AI engineering projects, and collaborations.</p>
          </div>
          <div className="max-w-xl mx-auto">
            <div className="scroll-animate glow-card rounded-2xl p-8">
              <div className="space-y-3 mb-6">
                {[
                  { icon:<Mail size={18}/>, label:'Email', display:'bhargavreddy@myjobsmail.com', href:'mailto:bhargavreddy@myjobsmail.com' },
                  { icon:<Phone size={18}/>, label:'Phone', display:'+1 (352) 246-3474', href:'tel:+13522463474' },
                  { icon:<Linkedin size={18}/>, label:'LinkedIn', display:'linkedin.com/in/bhargavbattu25', href:'https://www.linkedin.com/in/bhargavbattu25' },
                  { icon:<Github size={18}/>, label:'GitHub', display:'github.com/19BEC0802', href:'https://github.com/19BEC0802' },
                ].map(c => (
                  <a key={c.label} href={c.href} target={c.href.startsWith('http')?'_blank':undefined}
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 hover:border-cyan-400/30 transition-all group">
                    <span className="text-cyan-400 shrink-0 group-hover:scale-110 transition-transform">{c.icon}</span>
                    <div>
                      <p className="text-slate-500 text-xs">{c.label}</p>
                      <p className="text-cyan-400 text-sm font-medium group-hover:text-cyan-300">{c.display}</p>
                    </div>
                  </a>
                ))}
              </div>
              <a href="/BHARGAV_REDDY_BATTU_RESUME.pdf" download
                className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-cyan-500/25 transition-all hover:-translate-y-0.5 hover:shadow-cyan-500/40">
                <Download size={17}/> Download Resume
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="py-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-500 text-sm">© 2026 <span className="text-cyan-400 font-semibold">Bhargav Reddy Battu</span>. All rights reserved.</p>
          <p className="text-slate-700 text-xs mt-1">Software Engineer · Agentic AI · Full-Stack · FL, USA</p>
        </div>
      </footer>
    </div>
  );
}
