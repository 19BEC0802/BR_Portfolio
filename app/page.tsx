'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Github, Linkedin, Mail, Phone, ChevronDown, ChevronUp,
  Code, Database, Cloud, Shield, Download, Brain, Cpu,
  MapPin, Calendar, Building, Bot, Server, Layers, Menu, X, Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

/* ─────────────────────────────────────────────────────────
   Neural-network particle canvas background
───────────────────────────────────────────────────────── */
function NeuralCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const N = 70;
    type P = { x:number; y:number; vx:number; vy:number; r:number };
    const pts: P[] = Array.from({ length: N }, () => ({
      x:  Math.random() * canvas.width,
      y:  Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r:  Math.random() * 2.5 + 1,
    }));

    const LINK = 140;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width)  p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      });

      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          const dx = pts[i].x - pts[j].x;
          const dy = pts[i].y - pts[j].y;
          const d  = Math.sqrt(dx*dx + dy*dy);
          if (d < LINK) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(34,211,238,${(1 - d/LINK) * 0.18})`;
            ctx.lineWidth = 1;
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.stroke();
          }
        }
      }

      pts.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(34,211,238,0.55)';
        ctx.fill();
      });

      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}

/* ─────────────────────────────────────────────────────────
   Animated counter
───────────────────────────────────────────────────────── */
function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        let cur = 0;
        const step = Math.ceil(target / 60);
        const t = setInterval(() => {
          cur = Math.min(cur + step, target);
          setCount(cur);
          if (cur >= target) clearInterval(t);
        }, 25);
      }
    }, { threshold: 0.5 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [target]);

  return <span ref={ref}>{count}{suffix}</span>;
}

/* ─────────────────────────────────────────────────────────
   Main portfolio component
───────────────────────────────────────────────────────── */
export default function Portfolio() {
  const [expandedSkill,   setExpandedSkill]   = useState<string | null>(null);
  const [expandedProject, setExpandedProject] = useState<string | null>(null);
  const [mobileOpen,      setMobileOpen]      = useState(false);
  const [activeSection,   setActiveSection]   = useState('home');

  /* ── Typing effect ── */
  const titles = [
    'Full-Stack Software Engineer',
    'AI & Agentic Systems Engineer',
    'Cloud Infrastructure Engineer',
    'RAG Pipeline Developer',
  ];
  const [typedText,   setTypedText]   = useState('');
  const [titleIdx,    setTitleIdx]    = useState(0);
  const [charIdx,     setCharIdx]     = useState(0);
  const [isDeleting,  setIsDeleting]  = useState(false);

  useEffect(() => {
    const current = titles[titleIdx];
    const delay = isDeleting ? 40 : charIdx === current.length ? 1800 : 90;
    const t = setTimeout(() => {
      if (!isDeleting) {
        if (charIdx < current.length) {
          setTypedText(current.slice(0, charIdx + 1));
          setCharIdx(c => c + 1);
        } else {
          setIsDeleting(true);
        }
      } else {
        if (charIdx > 0) {
          setTypedText(current.slice(0, charIdx - 1));
          setCharIdx(c => c - 1);
        } else {
          setIsDeleting(false);
          setTitleIdx(i => (i + 1) % titles.length);
        }
      }
    }, delay);
    return () => clearTimeout(t);
  }, [charIdx, isDeleting, titleIdx]);

  /* ── Scroll-reveal via IntersectionObserver ── */
  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('animate-in');
      }),
      { threshold: 0.12 }
    );
    document.querySelectorAll(
      '.scroll-animate, .scroll-animate-left, .scroll-animate-right'
    ).forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  /* ── Active nav section tracking ── */
  useEffect(() => {
    const sections = ['home','about','experience','skills','portfolio','services','contact'];
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) setActiveSection(e.target.id);
      }),
      { threshold: 0.35 }
    );
    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  /* ── Data ── */
  const skillCategories: Record<string, string[]> = {
    'AI & Machine Learning': [
      'Agentic AI', 'Retrieval-Augmented Generation (RAG)',
      'AWS Bedrock', 'AWS AgentCore Memory', 'LangGraph',
      'MediaPipe Hand Tracking', 'Prompt Engineering',
      'TensorFlow', 'Keras', 'Scikit-learn',
    ],
    'Programming Languages': [
      'Python', 'Java 17 (Core & Advanced)', 'TypeScript', 'C#', 'JavaScript',
    ],
    'Backend Technologies': [
      'Spring Boot 3.x', 'Spring MVC', 'FastAPI', 'REST APIs',
      'Node.js', 'Express.js', 'Hibernate / JPA', 'LangGraph',
    ],
    'Frontend Development': [
      'React.js', 'Next.js', 'TypeScript', 'HTML5', 'CSS3', 'Bootstrap',
    ],
    'Cloud & DevOps': [
      'AWS EC2', 'AWS ECS / ECR', 'AWS S3', 'AWS IAM',
      'AWS Amplify', 'AWS CloudWatch', 'AWS SES',
      'Docker', 'CI/CD Pipelines', 'GitHub Actions', 'systemd',
    ],
    'Databases & Storage': [
      'PostgreSQL', 'MySQL', 'Supabase', 'MongoDB',
      'pgvector', 'Pinecone', 'Vector Databases',
    ],
    'Specialized Technologies': [
      'Unity Engine', 'Animation Rigging (IK)', 'MediaPipe',
      'Blockchain / Hyperledger Fabric', 'Socket.IO',
      'MLflow', 'Weights & Biases',
    ],
    'CS Fundamentals & Practices': [
      'Data Structures & Algorithms', 'Operating Systems',
      'Computer Networks', 'SDLC', 'Agile / Scrum',
    ],
  };

  const experience = [
    {
      id: 'aalmv',
      company: 'AALMV INC',
      role: 'Software Engineer',
      period: 'January 2025 – Present',
      location: 'Tampa, Florida',
      type: 'Full-Time',
      bullets: [
        'Engineered a production Agentic AI tutoring backend from scratch using Python, FastAPI, AWS Bedrock, boto3 and AWS AgentCore Memory — implementing a 5-node reasoning pipeline with RAG, per-student semantic memory, and mastery-driven teaching mode adaptation; IAM-authenticated, Dockerized, and monitored via CloudWatch, improving response quality by 60%.',
        'Migrated a hardcoded Supabase Edge Function into a fully stateful LangGraph multi-node AI agent, replacing static rule-based responses with a dynamic, mastery-aware session orchestration system driven by real-time per-student performance data.',
        'Provisioned and maintained end-to-end AWS cloud infrastructure (EC2, IAM role-based access control, security groups, AWS Amplify CI/CD pipelines), achieving automated zero-downtime deployments and 24/7 uptime via systemd service automation.',
        'Developed a full-stack React + TypeScript web application from scratch with multi-role JWT authentication across 3 user roles (student / educator / admin), real-time performance tracking, equation rendering, and interactive kinematic motion graphs.',
        'Architected a scalable Supabase PostgreSQL backend with normalized multi-table schema, row-level security (RLS) for per-student data isolation, real-time subscriptions, and persistent mastery analytics across 9 AP Physics topics.',
      ],
      tags: ['Python', 'FastAPI', 'AWS Bedrock', 'LangGraph', 'React', 'TypeScript', 'Supabase', 'Docker'],
    },
    {
      id: 'ufl',
      company: 'University of Florida',
      role: 'Software Engineer (Research)',
      period: 'June 2025 – December 2025',
      location: 'Gainesville, Florida',
      type: 'Research',
      bullets: [
        'Integrated MediaPipe 21-landmark hand tracking with Unity\'s Animation Rigging system in C#, implementing dual-hand multi-layer dead-zone filtering and inverse kinematics constraints (MultiPositionConstraint, ChainIKConstraint, MultiRotationConstraint) for real-time finger articulation and bevel orientation detection — improving frame stability by 30% and reducing visualization latency by 20%.',
        'Built a multi-layer smoothing pipeline (Base 0.85 + 8-frame avg → Enhanced 0.88 + 12-frame avg → Final Stabilizer 0.92) with adaptive dead-zone filtering to eliminate tracking jitter while preserving natural hand movement for precision surgical simulation.',
        'Developed a Python / .NET real-time data analytics pipeline capturing hand-tracking accuracy metrics (timestamps, attempt numbers, error distances), applying statistical computation (mean error, standard deviation, max/average residuals) and automating CSV report generation — eliminating 50% of manual validation tasks and improving data reliability by 35%.',
        'Built an interactive Unity debugging interface with landmark freeze controls (pausing visualization while inference continues in background), real-time bevel angle display, dual-hand visualization, and configurable UI state — improving debugging efficiency by 25% and team productivity by 40%.',
        'Implemented dynamic scale calibration by measuring thumb metacarpal distance (landmarks 0–1) with a 1000× multiplier, anatomically-correct wrist rotation via cross-product vectors between index/middle metacarpals, and real-time gesture analysis for bracing status, finger extension states, and bevel angles.',
      ],
      tags: ['C#', 'Unity', 'MediaPipe', 'Python', '.NET', 'Animation Rigging', 'Hand Tracking', 'IK'],
    },
  ];

  const projects = [
    {
      id: 'distributed-systems',
      title: 'Distributed Systems Simulation (Gossip & Push-Sum Algorithms)',
      technologies: ['Gleam', 'OTP Actor Model', 'Distributed Systems', 'Functional Programming'],
      domain: 'Distributed Computing, Fault-Tolerant Systems',
      duration: 'Aug 2024 – Dec 2024',
      image: 'https://images.pexels.com/photos/1148820/pexels-photo-1148820.jpeg?auto=compress&cs=tinysrgb&w=800',
      description: 'Developed a distributed system simulation using Gleam (OTP actor model) implementing Gossip and Push-Sum algorithms with asynchronous message passing, convergence detection, and performance tracking across multiple network topologies.',
      highlights: [
        'Supports 1000+ nodes across full, line, 3D and imperfect topologies',
        'Convergence detection with real-time performance tracking',
        'Fault-tolerant, scalable actor-based architecture',
      ],
      detailedContent: `
        <h3>Overview:</h3>
        <p>Built a scalable distributed system simulation using the Gleam programming language and OTP actor model, exploring how information and aggregated values propagate through large distributed networks.</p>
        <h3>What I Did:</h3>
        <ul>
          <li>Implemented Gossip algorithm for information propagation and Push-Sum for distributed average computation.</li>
          <li>Designed asynchronous message passing between 1000+ concurrent actor nodes.</li>
          <li>Supported multiple network topologies: full mesh, line, 3D grid, and imperfect 3D.</li>
          <li>Built convergence detection logic and performance metrics tracking across all topologies.</li>
          <li>Leveraged OTP supervision trees for fault-tolerance and crash recovery.</li>
        </ul>
        <h3>Impact:</h3>
        <ul>
          <li>Demonstrated sub-linear convergence time even at 1000+ node scale.</li>
          <li>Provided empirical comparison of gossip convergence across all four topologies.</li>
          <li>Fault-tolerant architecture: nodes recover gracefully from simulated failures.</li>
        </ul>
      `,
    },
    {
      id: 'quickchat',
      title: 'Real-Time Chat Application (QuickChat)',
      technologies: ['Java', 'Socket Programming', 'Client-Server', 'Multithreading', 'TCP/IP'],
      domain: 'Full-Stack Development, Distributed Systems',
      duration: 'Jan 2024 – May 2024',
      image: 'https://images.pexels.com/photos/267350/pexels-photo-267350.jpeg?auto=compress&cs=tinysrgb&w=800',
      description: 'Developed a real-time chat application using Java socket programming and client-server architecture, supporting 100+ concurrent users with low-latency messaging and optimized multithreaded packet handling.',
      highlights: [
        '100+ concurrent users with low-latency messaging',
        '30% throughput improvement via optimized multithreading',
        '25% delivery reliability boost through packet optimization',
      ],
      detailedContent: `
        <h3>Overview:</h3>
        <p>QuickChat is a high-performance real-time messaging application built on raw Java socket programming, demonstrating deep knowledge of network protocols and concurrent systems.</p>
        <h3>What I Did:</h3>
        <ul>
          <li>Implemented client-server architecture using Java TCP sockets with thread-per-client model.</li>
          <li>Optimized packet handling and multithreading for throughput improvement.</li>
          <li>Built connection management with graceful disconnect and reconnect handling.</li>
          <li>Designed protocol-level communication for reliable message ordering and delivery.</li>
        </ul>
        <h3>Impact:</h3>
        <ul>
          <li>Supported 100+ concurrent users with consistent low-latency performance.</li>
          <li>Improved throughput by 30% and delivery reliability by 25% via optimized multithreading.</li>
        </ul>
      `,
    },
    {
      id: 'ecg-signal',
      title: 'ECG Signal Interpretation Using CWT & CNN',
      technologies: ['Python', 'TensorFlow', 'Keras', 'Continuous Wavelet Transform', 'Jupyter Notebook'],
      domain: 'Biomedical Signal Processing, Deep Learning',
      duration: 'Sept 2022 – Dec 2022',
      image: 'https://images.pexels.com/photos/40568/medical-appointment-doctor-healthcare-40568.jpeg?auto=compress&cs=tinysrgb&w=800',
      description: 'Converted 1D ECG time-series data into 2D scalograms using Continuous Wavelet Transform and applied CNN for arrhythmia classification. Achieved 98.7% accuracy on the MIT-BIH database. Published in IRJET.',
      highlights: [
        '98.7% classification accuracy on MIT-BIH arrhythmia database',
        'Published in IRJET (International Research Journal)',
        'Signal-to-image transformation pipeline using CWT',
      ],
      detailedContent: `
        <h3>Overview:</h3>
        <p>Research project combining signal processing and deep learning to classify ECG signals into heart conditions (ARR, CHF, NSR) with state-of-the-art accuracy.</p>
        <h3>What I Did:</h3>
        <ul>
          <li>Applied Continuous Wavelet Transform (CWT) to convert 1D ECG signals into 2D scalograms.</li>
          <li>Designed and trained a CNN architecture specifically optimized for biomedical scalogram classification.</li>
          <li>Tuned hyperparameters and architecture layers to maximize accuracy on the MIT-BIH dataset.</li>
        </ul>
        <h3>Impact:</h3>
        <ul>
          <li>Achieved 98.7% accuracy — results published in IRJET.</li>
          <li>Demonstrated viability of signal-to-image deep learning for clinical ECG interpretation.</li>
        </ul>
      `,
    },
    {
      id: 'agile-tracker',
      title: 'Agile Sprint Tracker with CI/CD Integration',
      technologies: ['React.js', 'Node.js', 'MongoDB', 'Docker', 'GitHub Actions', 'AWS EC2'],
      domain: 'DevOps, Full-Stack Development',
      duration: 'Aug 2024 – Dec 2024',
      image: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800',
      description: 'Developed a productivity dashboard for agile teams with automated CI/CD pipeline, real-time sprint tracking, and performance analytics — reducing deployment time by 40%.',
      highlights: [
        'CI/CD pipeline reduced deployment time by 40%',
        '25% productivity boost for development teams',
        '15% fewer missed deadlines via automated tracking',
      ],
      detailedContent: `
        <h3>Overview:</h3>
        <p>Full-stack agile sprint tracker that streamlines task management, automates deployments, and provides real-time team performance analytics.</p>
        <h3>What I Did:</h3>
        <ul>
          <li>Built React.js frontend with real-time task updates and sprint analytics dashboards.</li>
          <li>Implemented Node.js + MongoDB backend for task storage and retrieval.</li>
          <li>Set up GitHub Actions + Docker CI/CD pipeline with automatic deployment to AWS EC2.</li>
          <li>Integrated sprint performance visualization and burn-down charts.</li>
        </ul>
        <h3>Impact:</h3>
        <ul>
          <li>40% reduction in deployment time through full CI/CD automation.</li>
          <li>25% team productivity increase; 15% fewer missed sprint deadlines.</li>
        </ul>
      `,
    },
    {
      id: 'blockchain-security',
      title: 'Decentralized Blockchain Solutions for Data Security',
      technologies: ['Java', 'SQL', 'Hyperledger Fabric', 'React.js', 'Tailwind CSS'],
      domain: 'Blockchain, Cybersecurity',
      duration: 'Aug 2022 – Apr 2023',
      image: 'https://images.pexels.com/photos/844124/pexels-photo-844124.jpeg?auto=compress&cs=tinysrgb&w=800',
      description: 'Created a block-based file transfer system with cryptographic hashing and Hyperledger Fabric integration achieving a 30% reduction in security breaches and 20% improvement in file management.',
      highlights: [
        '30% reduction in security breaches',
        '20% improvement in file management efficiency',
        'Immutable audit trail via Hyperledger Fabric',
      ],
      detailedContent: `
        <h3>Overview:</h3>
        <p>Secure, tamper-proof file sharing platform built on Hyperledger Fabric blockchain with cryptographic validation and a modern React dashboard.</p>
        <h3>What I Did:</h3>
        <ul>
          <li>Designed block-based file transfer protocol with cryptographic hashing for data validation.</li>
          <li>Integrated Hyperledger Fabric for data immutability and audit trail.</li>
          <li>Built React.js + Tailwind CSS dashboard for file management operations.</li>
          <li>Developed Java backend with SQL for metadata storage and query optimization.</li>
        </ul>
        <h3>Impact:</h3>
        <ul>
          <li>30% reduction in potential security breaches with zero data tampering incidents.</li>
          <li>20% improvement in file management speed and usability.</li>
        </ul>
      `,
    },
  ];

  const services = [
    {
      title: 'Agentic AI Development',
      description: 'Design and build autonomous AI agents with multi-step reasoning, tool use, and task orchestration using LangGraph and AWS Bedrock.',
      icon: <Bot className="text-cyan-400" size={32} />,
    },
    {
      title: 'RAG Pipeline Engineering',
      description: 'Implement production-grade Retrieval-Augmented Generation pipelines with vector databases, semantic search, and LLM memory systems.',
      icon: <Brain className="text-cyan-400" size={32} />,
    },
    {
      title: 'Full-Stack Development',
      description: 'End-to-end web applications with React, TypeScript, Spring Boot, and FastAPI — from responsive UI to scalable backend APIs.',
      icon: <Code className="text-cyan-400" size={32} />,
    },
    {
      title: 'Cloud Infrastructure (AWS)',
      description: 'AWS cloud architecture with EC2, ECS, S3, IAM, Amplify CI/CD and CloudWatch monitoring for zero-downtime production deployments.',
      icon: <Cloud className="text-cyan-400" size={32} />,
    },
    {
      title: 'Backend API Engineering',
      description: 'High-performance APIs and microservices with Spring Boot 3.x, FastAPI, database design (PostgreSQL, Supabase), and secure authentication.',
      icon: <Server className="text-cyan-400" size={32} />,
    },
    {
      title: 'Computer Vision & ML',
      description: 'Real-time inference systems with MediaPipe hand tracking, Unity integration, and deep learning pipelines for specialized domains.',
      icon: <Cpu className="text-cyan-400" size={32} />,
    },
  ];

  const navLinks = [
    { href: '#home',       label: 'Home' },
    { href: '#about',      label: 'About' },
    { href: '#experience', label: 'Experience' },
    { href: '#skills',     label: 'Skills' },
    { href: '#portfolio',  label: 'Projects' },
    { href: '#services',   label: 'Services' },
    { href: '#contact',    label: 'Contact' },
  ];

  /* ── stats ── */
  const stats = [
    { label: 'Years Experience', value: 2, suffix: '+' },
    { label: 'Projects Shipped', value: 5, suffix: '+' },
    { label: 'AI Systems Built', value: 3, suffix: '' },
    { label: 'Cloud Deployments', value: 10, suffix: '+' },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white overflow-x-hidden">

      {/* ─── Navigation ─── */}
      <nav className="fixed top-0 w-full bg-slate-900/85 backdrop-blur-md z-50 border-b border-slate-700/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo + online indicator */}
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold gradient-text">BR</span>
              <span className="relative flex h-3 w-3">
                <span className="online-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
              </span>
              <span className="text-xs text-green-400 hidden sm:inline">Available for work</span>
            </div>

            {/* Desktop links */}
            <div className="hidden md:flex items-center space-x-6">
              {navLinks.map(l => (
                <a
                  key={l.href}
                  href={l.href}
                  className={`nav-link text-sm transition-colors ${
                    activeSection === l.href.slice(1)
                      ? 'text-cyan-400'
                      : 'text-slate-300 hover:text-cyan-400'
                  }`}
                >
                  {l.label}
                </a>
              ))}
              <a
                href="/BHARGAV_REDDY_BATTU_RESUME.pdf"
                download
                className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-white text-sm px-4 py-2 rounded-lg transition-colors font-medium"
              >
                <Download size={14} /> Resume
              </a>
            </div>

            {/* Mobile hamburger */}
            <button
              className="md:hidden text-slate-300 hover:text-cyan-400"
              onClick={() => setMobileOpen(o => !o)}
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden mobile-menu bg-slate-900/95 border-t border-slate-700/60 px-4 py-4 space-y-3">
            {navLinks.map(l => (
              <a
                key={l.href}
                href={l.href}
                className="block text-slate-300 hover:text-cyan-400 transition-colors py-1"
                onClick={() => setMobileOpen(false)}
              >
                {l.label}
              </a>
            ))}
            <a
              href="/BHARGAV_REDDY_BATTU_RESUME.pdf"
              download
              className="flex items-center gap-2 bg-cyan-500 text-white text-sm px-4 py-2 rounded-lg w-fit"
              onClick={() => setMobileOpen(false)}
            >
              <Download size={14} /> Download Resume
            </a>
          </div>
        )}
      </nav>

      {/* ─── Hero ─── */}
      <section
        id="home"
        className="relative pt-16 min-h-screen flex items-center overflow-hidden"
      >
        <NeuralCanvas />
        {/* gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-transparent to-slate-900 pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Text column */}
            <div>
              <p className="hero-title text-cyan-400 font-mono text-sm mb-3 tracking-widest uppercase">
                &lt; Hello World /&gt;
              </p>
              <h1 className="hero-title text-5xl lg:text-7xl font-bold mb-4 leading-tight">
                Hi, I'm <br />
                <span className="gradient-text">Bhargav Reddy</span>
                <br />Battu
              </h1>

              {/* Typing subtitle */}
              <h2 className="hero-subtitle text-xl lg:text-2xl text-slate-300 mb-5 h-8 flex items-center">
                <span>{typedText}</span>
                <span className="typing-cursor" />
              </h2>

              <p className="hero-desc text-base text-slate-400 mb-8 leading-relaxed max-w-xl">
                Full-Stack Software &amp; AI Engineer building production-grade Agentic AI systems,
                RAG pipelines, and scalable cloud-native applications using AWS, Python, React
                and Java. MS Computer Science — University of Florida.
              </p>

              <div className="hero-buttons flex flex-wrap gap-4">
                <Button className="bg-cyan-500 hover:bg-cyan-600 text-white px-8 py-3 text-base font-medium">
                  <a href="#portfolio">View Projects</a>
                </Button>
                <a
                  href="/BHARGAV_REDDY_BATTU_RESUME.pdf"
                  download
                  className="flex items-center gap-2 border border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-slate-900 px-8 py-3 rounded-lg transition-all font-medium"
                >
                  <Download size={16} /> Download Resume
                </a>
                <Button variant="outline" className="border-slate-600 text-slate-300 hover:border-cyan-400 hover:text-cyan-400 px-8 py-3">
                  <a href="#contact">Get In Touch</a>
                </Button>
              </div>
            </div>

            {/* Image column */}
            <div className="hero-image flex justify-center lg:justify-end">
              <div className="relative">
                {/* orbit dots */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div style={{ animation: 'orbit 8s linear infinite' }} className="absolute w-3 h-3 rounded-full bg-cyan-400/70" />
                  <div style={{ animation: 'orbitReverse 12s linear infinite' }} className="absolute w-2 h-2 rounded-full bg-blue-400/70" />
                </div>

                {/* profile image */}
                <div className="w-72 h-72 lg:w-88 lg:h-88 rounded-full overflow-hidden border-4 border-cyan-400 animate-float animate-glow relative z-10"
                  style={{ width: '340px', height: '340px' }}>
                  <img
                    src="https://i.postimg.cc/YCs59skk/Screenshot-2025-06-07-at-1-24-31-PM.png"
                    alt="Bhargav Reddy Battu"
                    className="w-full h-full object-cover object-center"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Stat counters */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20">
            {stats.map((s, i) => (
              <div
                key={s.label}
                className={`scroll-animate delay-${(i + 1) * 100} stat-card text-center p-5 rounded-xl bg-slate-800/60 border border-slate-700/50 hover:border-cyan-400/40 transition-colors`}
              >
                <div className="text-4xl font-bold text-cyan-400 mb-1">
                  <AnimatedCounter target={s.value} suffix={s.suffix} />
                </div>
                <div className="text-sm text-slate-400">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── About ─── */}
      <section id="about" className="py-24 bg-slate-800/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="scroll-animate text-4xl font-bold text-center mb-16">
            About <span className="text-cyan-400">Me</span>
          </h2>
          <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="scroll-animate-left lg:col-span-2">
              <Card className="glow-card bg-slate-800 border-slate-700 h-full">
                <CardContent className="p-8 space-y-5 text-slate-300 leading-relaxed text-base">
                  <p>
                    I'm a <span className="text-cyan-400 font-semibold">Full-Stack Software & AI Engineer</span> with
                    a Master of Science in Computer Science from the <span className="text-cyan-400 font-semibold">University of Florida</span>.
                    I specialize in building production-grade Agentic AI systems, RAG pipelines, and scalable cloud-native
                    applications that solve real problems.
                  </p>
                  <p>
                    At <span className="text-cyan-400 font-semibold">AALMV INC</span>, I engineer AI tutoring backends
                    powered by <span className="text-cyan-400">AWS Bedrock</span>, <span className="text-cyan-400">LangGraph</span>,
                    and <span className="text-cyan-400">AWS AgentCore Memory</span> — building 5-node reasoning pipelines with
                    per-student semantic memory that adapt in real-time to learner mastery. I own the full stack:
                    Python / FastAPI backends, React + TypeScript frontends, and the entire AWS infrastructure.
                  </p>
                  <p>
                    My research at <span className="text-cyan-400 font-semibold">UF</span> involved integrating
                    MediaPipe 21-landmark hand tracking with Unity's Animation Rigging for real-time surgical
                    simulation — combining computer vision, IK constraints, and statistical data analytics pipelines.
                  </p>
                  <p>
                    I thrive at the intersection of <span className="text-cyan-400">AI engineering</span> and
                    <span className="text-cyan-400"> full-stack development</span> — designing systems that are
                    intelligent, observable, and production-ready.
                  </p>
                </CardContent>
              </Card>
            </div>
            <div className="scroll-animate-right space-y-4">
              {[
                { icon: <MapPin size={18} />, label: 'Location', value: 'Tampa, Florida' },
                { icon: <Building size={18} />, label: 'Current Role', value: 'Software Engineer @ AALMV INC' },
                { icon: <Brain size={18} />, label: 'Specialization', value: 'Agentic AI & Full-Stack' },
                { icon: <Zap size={18} />, label: 'Education', value: 'MS Computer Science, UF (GPA: 3.66)' },
              ].map(item => (
                <Card key={item.label} className="glow-card bg-slate-800 border-slate-700">
                  <CardContent className="p-4 flex items-start gap-3">
                    <span className="text-cyan-400 mt-0.5">{item.icon}</span>
                    <div>
                      <p className="text-xs text-slate-500 mb-0.5">{item.label}</p>
                      <p className="text-slate-200 text-sm font-medium">{item.value}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
              <a
                href="/BHARGAV_REDDY_BATTU_RESUME.pdf"
                download
                className="flex items-center justify-center gap-2 w-full bg-cyan-500 hover:bg-cyan-600 text-white font-medium py-3 rounded-xl transition-colors"
              >
                <Download size={16} /> Download Full Resume
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Experience ─── */}
      <section id="experience" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="scroll-animate text-4xl font-bold text-center mb-16">
            Professional <span className="text-cyan-400">Experience</span>
          </h2>
          <div className="max-w-4xl mx-auto">
            {experience.map((job, idx) => (
              <div key={job.id} className="relative flex gap-6 mb-12">
                {/* Timeline spine */}
                <div className="flex flex-col items-center">
                  <div className="timeline-dot mt-2" />
                  {idx < experience.length - 1 && (
                    <div className="timeline-line w-0.5 flex-1 mt-2 min-h-[120px]" />
                  )}
                </div>

                {/* Card */}
                <div className={`scroll-animate delay-${(idx + 1) * 200} flex-1 mb-2`}>
                  <Card className="glow-card bg-slate-800 border-slate-700">
                    <CardHeader className="pb-3">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                        <div>
                          <CardTitle className="text-xl text-cyan-400">{job.company}</CardTitle>
                          <CardDescription className="text-slate-200 font-semibold text-base mt-1">
                            {job.role}
                          </CardDescription>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="flex items-center gap-1.5 text-slate-400 text-sm justify-end">
                            <Calendar size={14} />
                            <span>{job.period}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-400 text-sm justify-end mt-1">
                            <MapPin size={14} />
                            <span>{job.location}</span>
                          </div>
                          <Badge className="mt-2 bg-cyan-900/40 text-cyan-300 border-cyan-400/30 text-xs">
                            {job.type}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3 mb-4">
                        {job.bullets.map((b, i) => (
                          <li key={i} className="flex gap-2 text-slate-300 text-sm leading-relaxed">
                            <span className="text-cyan-400 shrink-0 mt-0.5">▸</span>
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="flex flex-wrap gap-2 mt-4">
                        {job.tags.map(t => (
                          <Badge key={t} variant="outline" className="skill-badge border-cyan-400/30 text-cyan-300 text-xs">
                            {t}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Skills ─── */}
      <section id="skills" className="py-24 bg-slate-800/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="scroll-animate text-4xl font-bold text-center mb-16">
            Skills & <span className="text-cyan-400">Technologies</span>
          </h2>
          <div className="grid gap-4 max-w-5xl mx-auto">
            {Object.entries(skillCategories).map(([category, skills], idx) => (
              <div key={category} className={`scroll-animate delay-${Math.min((idx % 4 + 1) * 100, 400)}`}>
                <Card className="glow-card bg-slate-800 border-slate-700">
                  <CardHeader className="py-4 px-6">
                    <div
                      className="flex justify-between items-center cursor-pointer select-none"
                      onClick={() => setExpandedSkill(expandedSkill === category ? null : category)}
                    >
                      <CardTitle className="text-cyan-400 text-lg">{category}</CardTitle>
                      {expandedSkill === category
                        ? <ChevronUp className="text-cyan-400 shrink-0" />
                        : <ChevronDown className="text-slate-400 shrink-0" />}
                    </div>
                  </CardHeader>
                  {expandedSkill === category && (
                    <CardContent className="px-6 pb-5">
                      <div className="flex flex-wrap gap-2">
                        {skills.map((skill, i) => (
                          <Badge
                            key={i}
                            variant="secondary"
                            className="skill-badge bg-cyan-900/20 text-cyan-300 border border-cyan-400/30 px-3 py-1 cursor-default"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  )}
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Projects ─── */}
      <section id="portfolio" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="scroll-animate text-4xl font-bold text-center mb-16">
            Featured <span className="text-cyan-400">Projects</span>
          </h2>
          <div className="grid gap-8">
            {projects.map((project, idx) => (
              <div key={project.id} className={`scroll-animate delay-${Math.min((idx % 3 + 1) * 100, 300)}`}>
                <Card className="glow-card bg-slate-800 border-slate-700">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
                    <div className="lg:col-span-1">
                      <div className="h-56 lg:h-full rounded-t-lg lg:rounded-l-lg lg:rounded-tr-none overflow-hidden">
                        <img
                          src={project.image}
                          alt={project.title}
                          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                        />
                      </div>
                    </div>
                    <div className="lg:col-span-2">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <CardTitle className="text-xl text-cyan-400 mb-1 leading-tight">
                              {project.title}
                            </CardTitle>
                            <CardDescription className="text-slate-400 text-xs">
                              {project.domain} &nbsp;|&nbsp; {project.duration}
                            </CardDescription>
                          </div>
                          <a
                            href="https://github.com/19BEC0802"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-400 hover:text-cyan-400 transition-colors ml-3 shrink-0"
                          >
                            <Github size={22} />
                          </a>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-slate-300 mb-4 text-sm leading-relaxed">{project.description}</p>

                        <div className="mb-4">
                          <h4 className="text-green-400 font-semibold mb-2 text-sm">Key Achievements:</h4>
                          <ul className="space-y-1">
                            {project.highlights.map((h, i) => (
                              <li key={i} className="text-slate-300 text-sm flex gap-2">
                                <span className="text-green-400 shrink-0">✓</span>{h}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="mb-5">
                          <div className="flex flex-wrap gap-2">
                            {project.technologies.map((tech, i) => (
                              <Badge key={i} variant="outline" className="skill-badge border-cyan-400/30 text-cyan-300 text-xs">
                                {tech}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <Button
                          onClick={() => setExpandedProject(expandedProject === project.id ? null : project.id)}
                          variant="outline"
                          className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-slate-900 text-sm"
                        >
                          {expandedProject === project.id ? 'Show Less' : 'Know More'}
                        </Button>

                        {expandedProject === project.id && (
                          <div className="mt-5 p-5 bg-slate-700/50 rounded-xl border border-slate-600">
                            <div
                              className="prose prose-invert max-w-none text-sm"
                              dangerouslySetInnerHTML={{ __html: project.detailedContent }}
                            />
                          </div>
                        )}
                      </CardContent>
                    </div>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Services ─── */}
      <section id="services" className="py-24 bg-slate-800/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="scroll-animate text-4xl font-bold text-center mb-16">
            What I <span className="text-cyan-400">Build</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((svc, idx) => (
              <div key={idx} className={`scroll-animate delay-${Math.min((idx % 3 + 1) * 100, 300)}`}>
                <Card className="glow-card bg-slate-800 border-slate-700 text-center h-full">
                  <CardHeader className="pb-3">
                    <div className="flex justify-center mb-4">
                      <div className="p-4 rounded-full bg-cyan-900/20 border border-cyan-400/20">
                        {svc.icon}
                      </div>
                    </div>
                    <CardTitle className="text-cyan-400 text-lg">{svc.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-300 text-sm leading-relaxed">{svc.description}</p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Contact ─── */}
      <section id="contact" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="scroll-animate text-4xl font-bold text-center mb-16">
            Get In <span className="text-cyan-400">Touch</span>
          </h2>
          <div className="max-w-2xl mx-auto">
            <Card className="scroll-animate glow-card bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-2xl text-cyan-400 text-center">Contact Information</CardTitle>
                <p className="text-slate-400 text-center text-sm mt-1">
                  Open to full-time roles, AI engineering projects, and collaborations.
                </p>
              </CardHeader>
              <CardContent className="space-y-5">
                {[
                  {
                    icon: <Mail className="text-cyan-400 shrink-0" size={22} />,
                    label: 'Email',
                    display: 'bhargavreddybattu11@gmail.com',
                    href: 'mailto:bhargavreddybattu11@gmail.com',
                  },
                  {
                    icon: <Phone className="text-cyan-400 shrink-0" size={22} />,
                    label: 'Phone',
                    display: '(352) 246-3474',
                    href: 'tel:3522463474',
                  },
                  {
                    icon: <Linkedin className="text-cyan-400 shrink-0" size={22} />,
                    label: 'LinkedIn',
                    display: 'linkedin.com/in/bhargavbattu25',
                    href: 'https://www.linkedin.com/in/bhargavbattu25',
                  },
                  {
                    icon: <Github className="text-cyan-400 shrink-0" size={22} />,
                    label: 'GitHub',
                    display: 'github.com/19BEC0802',
                    href: 'https://github.com/19BEC0802',
                  },
                ].map(c => (
                  <div key={c.label} className="flex items-center gap-4 p-4 rounded-xl bg-slate-700/30 hover:bg-slate-700/50 transition-colors">
                    {c.icon}
                    <div>
                      <p className="text-slate-400 text-xs mb-0.5">{c.label}</p>
                      <a
                        href={c.href}
                        target={c.href.startsWith('http') ? '_blank' : undefined}
                        rel="noopener noreferrer"
                        className="text-cyan-400 hover:underline text-sm font-medium"
                      >
                        {c.display}
                      </a>
                    </div>
                  </div>
                ))}

                <a
                  href="/BHARGAV_REDDY_BATTU_RESUME.pdf"
                  download
                  className="flex items-center justify-center gap-2 w-full bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-4 rounded-xl transition-colors mt-2 text-base"
                >
                  <Download size={18} /> Download Resume
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="py-8 border-t border-slate-700/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-slate-400 text-sm">
            © 2026 <span className="text-cyan-400 font-medium">Bhargav Reddy Battu</span>. All rights reserved.
          </p>
          <p className="text-slate-600 text-xs mt-1">
            Full-Stack Software & AI Engineer · Tampa, FL
          </p>
        </div>
      </footer>
    </div>
  );
}
