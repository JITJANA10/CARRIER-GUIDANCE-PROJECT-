// PATHPILOT — CANONICAL CAREER & ROADMAP CATALOG
// Shared authoritative definitions for all 6 supported career tracks.

export interface CareerSkillSpec {
  name: string;
  requiredScore: number;
  time: string;
  resource: string;
  project: string;
  category: 'Technical' | 'Product' | 'Leadership';
}

export interface RoadmapTaskSpec {
  id: string;
  name: string;
  type: 'learn' | 'project' | 'task';
  time: string;
}

export interface RoadmapPhaseSpec {
  id: string;
  number: string;
  title: string;
  goal: string;
  skills: string[];
  estimatedTime: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  why: string;
  dependencies: string;
  outcome: string;
  tasks: RoadmapTaskSpec[];
}

export interface CanonicalCareerMeta {
  slug: string;
  title: string;
  aliases: string[];
  openings: string;
  demand: 'Very High' | 'High' | 'Medium';
  primarySkills: string[];
  skillRequirements: CareerSkillSpec[];
  phases: RoadmapPhaseSpec[];
}

export const CAREER_CATALOG: CanonicalCareerMeta[] = [
  {
    slug: 'ai-ml-engineer',
    title: 'AI / Machine Learning Engineer',
    aliases: ['ai / machine learning engineer', 'ai/ml engineer', 'ai ml engineer', 'machine learning engineer', 'ai-ml-engineer'],
    openings: '14,800+ roles',
    demand: 'Very High',
    primarySkills: ['Python', 'Machine Learning', 'PyTorch', 'SQL', 'Docker'],
    skillRequirements: [
      {
        name: 'Python',
        requiredScore: 85,
        time: '2 weeks',
        resource: 'Effective Python & NumPy Vectorization',
        project: 'High-Throughput Feature Pipeline in Python',
        category: 'Technical'
      },
      {
        name: 'Machine Learning',
        requiredScore: 80,
        time: '3 weeks',
        resource: 'CS229 Applied ML & Model Evaluation',
        project: 'End-to-End Tabular & Ranking Benchmark',
        category: 'Technical'
      },
      {
        name: 'PyTorch',
        requiredScore: 75,
        time: '3 weeks',
        resource: 'PyTorch Official Internals & Transformers',
        project: 'Custom Multi-Head Attention & Fine-Tuning Suite',
        category: 'Technical'
      },
      {
        name: 'SQL',
        requiredScore: 70,
        time: '2 weeks',
        resource: 'Mode Analytical SQL & Cohort Queries',
        project: 'Training Dataset Extraction & Leakage Audit',
        category: 'Technical'
      },
      {
        name: 'Docker',
        requiredScore: 70,
        time: '2 weeks',
        resource: 'Docker & Reproducible ML Containers',
        project: 'Containerized FastAPI Model Inference Service',
        category: 'Technical'
      },
      {
        name: 'System Design',
        requiredScore: 70,
        time: '2 weeks',
        resource: 'Designing Machine Learning Systems',
        project: 'Low-Latency Feature Store & Serving RFC',
        category: 'Leadership'
      }
    ],
    phases: [
      {
        id: 'phase-1',
        number: '01',
        title: 'Mathematical Foundations & Deep Python',
        goal: 'Master vector calculus, linear algebra, and NumPy/PyTorch tensor manipulations.',
        skills: ['Python', 'Linear Algebra', 'NumPy', 'SQL'],
        estimatedTime: '2–3 Weeks',
        difficulty: 'Medium',
        why: 'Production ML debugging requires fluency in tensor shapes, data pipelines, and numerical stability.',
        dependencies: 'None',
        outcome: 'Clean vectorized feature pipelines and validated training splits.',
        tasks: [
          { id: 'task-1-1', name: 'Master NumPy Vectorization & Tensor Shape Debugging', type: 'learn', time: '4 hrs' },
          { id: 'task-1-2', name: 'Build Reproducible SQL + Python Feature Extraction Pipeline', type: 'project', time: '6 hrs' }
        ]
      },
      {
        id: 'phase-2',
        number: '02',
        title: 'Deep Learning & Neural Architectures',
        goal: 'Build Transformers, CNNs, and fine-tune open LLMs using PyTorch and HuggingFace.',
        skills: ['PyTorch', 'Transformers', 'Evaluation', 'Fine-Tuning'],
        estimatedTime: '3–4 Weeks',
        difficulty: 'Hard',
        why: 'Hands-on training loop architecture separates API wrappers from senior AI engineers.',
        dependencies: 'Phase 01',
        outcome: 'Benchmarked PyTorch model checkpoint with documented evaluation metrics.',
        tasks: [
          { id: 'task-2-1', name: 'Implement Multi-Head Attention from Scratch in PyTorch', type: 'project', time: '6 hrs' },
          { id: 'task-2-2', name: 'Build Automated Prompt & Model Evaluation Harness', type: 'task', time: '5 hrs' }
        ]
      },
      {
        id: 'phase-3',
        number: '03',
        title: 'MLOps, Model Serving & Docker',
        goal: 'Containerize models, construct automated evaluation pipelines, and deploy onto Kubernetes.',
        skills: ['Docker', 'Inference APIs', 'Monitoring', 'System Design'],
        estimatedTime: '2–3 Weeks',
        difficulty: 'Hard',
        why: 'Models only deliver product value once served reliably with latency and drift budgets.',
        dependencies: 'Phase 01, 02',
        outcome: 'Containerized inference endpoint with CI tests and latency telemetry.',
        tasks: [
          { id: 'task-3-1', name: 'Containerize PyTorch Inference Service with Multi-Stage Docker', type: 'project', time: '5 hrs' },
          { id: 'task-3-2', name: 'Draft Production ML Serving Architecture & Latency RFC', type: 'task', time: '4 hrs' }
        ]
      }
    ]
  },
  {
    slug: 'product-manager',
    title: 'Product Manager',
    aliases: ['product manager', 'product-manager', 'pm'],
    openings: '12,400+ roles',
    demand: 'High',
    primarySkills: ['Strategy', 'SQL', 'PRDs & Specs', 'Agile Delivery', 'Communication'],
    skillRequirements: [
      {
        name: 'Strategy',
        requiredScore: 90,
        time: '3 weeks',
        resource: 'Reforge Product Strategy Program',
        project: 'Market Entry & Pricing Strategy Deck',
        category: 'Product'
      },
      {
        name: 'SQL',
        requiredScore: 70,
        time: '2 weeks',
        resource: 'Mode Analytics SQL Mastery',
        project: 'User Retention & Funnel Drop-off Analysis',
        category: 'Technical'
      },
      {
        name: 'PRDs & Specs',
        requiredScore: 85,
        time: '2 weeks',
        resource: 'Product School Portfolio Playbook',
        project: 'End-to-End Feature PRD with Telemetry Plan',
        category: 'Product'
      },
      {
        name: 'Agile Delivery',
        requiredScore: 80,
        time: '1 week',
        resource: 'Atlassian Agile Delivery Guide',
        project: 'Prioritized Sprint Roadmap & Trade-off Matrix',
        category: 'Leadership'
      },
      {
        name: 'Communication',
        requiredScore: 90,
        time: 'Ongoing',
        resource: 'Crucial Conversations Framework',
        project: 'Executive Stakeholder Alignment Brief',
        category: 'Leadership'
      }
    ],
    phases: [
      {
        id: 'phase-1',
        number: '01',
        title: 'Product Discovery & Market Research',
        goal: 'Synthesize quantitative metrics with qualitative user pain points into strategy.',
        skills: ['User Research', 'SQL', 'Problem Framing', 'Market Sizing'],
        estimatedTime: '2–3 Weeks',
        difficulty: 'Medium',
        why: 'Product conviction relies on pairing self-serve cohort SQL with structured customer interviews.',
        dependencies: 'None',
        outcome: 'Evidence-backed opportunity brief with retention cohort metrics.',
        tasks: [
          { id: 'pm-1-1', name: 'Conduct 3 Structured User Discovery Interviews & Synthesize Insights', type: 'task', time: '4 hrs' },
          { id: 'pm-1-2', name: 'Query 30-Day Cohort Retention & Activation Funnel in SQL', type: 'project', time: '5 hrs' }
        ]
      },
      {
        id: 'phase-2',
        number: '02',
        title: 'Technical PRDs & Data Analytics',
        goal: 'Draft specification documents and query product telemetry with advanced SQL.',
        skills: ['PRDs & Specs', 'Analytics', 'A/B Testing', 'API Contracts'],
        estimatedTime: '3–4 Weeks',
        difficulty: 'Hard',
        why: 'Crisp PRDs eliminate engineering ambiguity and anchor launches to measurable KPIs.',
        dependencies: 'Phase 01',
        outcome: 'Production-ready PRD with success metrics and experiment design.',
        tasks: [
          { id: 'pm-2-1', name: 'Author Complete Feature PRD with Edge Cases & Telemetry Events', type: 'project', time: '6 hrs' },
          { id: 'pm-2-2', name: 'Design Hypothesis & Sample-Size Plan for Onboarding A/B Test', type: 'learn', time: '4 hrs' }
        ]
      },
      {
        id: 'phase-3',
        number: '03',
        title: 'Go-to-Market & Executive Leadership',
        goal: 'Manage roadmaps, run A/B growth experiments, and align executive stakeholders.',
        skills: ['Agile Delivery', 'Communication', 'GTM Strategy', 'Prioritization'],
        estimatedTime: '2–3 Weeks',
        difficulty: 'Hard',
        why: 'Senior PM impact is measured by cross-functional velocity and commercial outcomes.',
        dependencies: 'Phase 01, 02',
        outcome: 'Go-to-market launch plan and executive roadmap defense.',
        tasks: [
          { id: 'pm-3-1', name: 'Build Quarterly RICE Roadmap & Engineering Trade-off Brief', type: 'project', time: '4 hrs' },
          { id: 'pm-3-2', name: 'Complete 2 Product Sense & Executive Critique Simulations', type: 'task', time: '3 hrs' }
        ]
      }
    ]
  },
  {
    slug: 'full-stack-developer',
    title: 'Full-Stack Developer',
    aliases: ['full-stack developer', 'full stack developer', 'software engineer', 'full-stack-developer'],
    openings: '24,000+ roles',
    demand: 'Very High',
    primarySkills: ['TypeScript', 'React', 'Node.js', 'SQL', 'System Design'],
    skillRequirements: [
      {
        name: 'TypeScript',
        requiredScore: 85,
        time: '2 weeks',
        resource: 'Effective TypeScript & Strict Type Narrowing',
        project: 'End-to-End Shared API Contract Package',
        category: 'Technical'
      },
      {
        name: 'React',
        requiredScore: 85,
        time: '3 weeks',
        resource: 'React 19 Official Docs & State Architecture',
        project: 'Accessible Real-Time Collaborative Workspace UI',
        category: 'Technical'
      },
      {
        name: 'Node.js',
        requiredScore: 80,
        time: '2 weeks',
        resource: 'Express 5 Reliability & Auth Hardening',
        project: 'JWT-Protected REST API with Zod & Rate Limits',
        category: 'Technical'
      },
      {
        name: 'SQL',
        requiredScore: 75,
        time: '2 weeks',
        resource: 'Prisma Relational Modeling & Indexing',
        project: 'Concurrency-Safe Booking Ledger with Partial Indexes',
        category: 'Technical'
      },
      {
        name: 'System Design',
        requiredScore: 70,
        time: '2 weeks',
        resource: 'System Design Interview Primer',
        project: 'Caching, Observability & Failure Mode Architecture Doc',
        category: 'Leadership'
      }
    ],
    phases: [
      {
        id: 'phase-1',
        number: '01',
        title: 'Frontend Architecture & State Stores',
        goal: 'Master React 19, TypeScript strict mode, and performant state synchronization.',
        skills: ['TypeScript', 'React', 'Accessibility', 'State Synchronization'],
        estimatedTime: '3 Weeks',
        difficulty: 'Medium',
        why: 'Modern full-stack interfaces must stay responsive, strongly typed, and synchronized with server state.',
        dependencies: 'None',
        outcome: 'Component-tested React TypeScript dashboard synced with REST APIs.',
        tasks: [
          { id: 'fs-1-1', name: 'Eliminate Loose Types & Implement Discriminated Union State', type: 'learn', time: '4 hrs' },
          { id: 'fs-1-2', name: 'Build Optimistic UI Mutation Flow with Error Recovery', type: 'project', time: '6 hrs' }
        ]
      },
      {
        id: 'phase-2',
        number: '02',
        title: 'Backend Systems & API Reliability',
        goal: 'Engineer Express/Fastify services with relational database integrity and auth.',
        skills: ['Node.js', 'SQL', 'Authentication', 'Automated Testing'],
        estimatedTime: '3 Weeks',
        difficulty: 'Hard',
        why: 'Production APIs fail under concurrency and weak authorization boundaries unless transactionally tested.',
        dependencies: 'Phase 01',
        outcome: 'Transactional REST backend verified with isolated Supertest suites.',
        tasks: [
          { id: 'fs-2-1', name: 'Design Relational Constraints & Transactional Booking Service', type: 'project', time: '6 hrs' },
          { id: 'fs-2-2', name: 'Write Isolated RBAC & Concurrency Integration Tests', type: 'task', time: '5 hrs' }
        ]
      },
      {
        id: 'phase-3',
        number: '03',
        title: 'Cloud Deployment, CI/CD & Observability',
        goal: 'Automate build pipelines, structured logging, and production reliability checks.',
        skills: ['Docker', 'CI/CD', 'System Design', 'Security'],
        estimatedTime: '2 Weeks',
        difficulty: 'Medium',
        why: 'Shipping safely requires repeatable builds, health checks, and telemetry.',
        dependencies: 'Phase 01, 02',
        outcome: 'Automated CI quality gate with zero-downtime readiness probes.',
        tasks: [
          { id: 'fs-3-1', name: 'Configure Structured Health/Readiness Probes & Secret Hygiene', type: 'task', time: '3 hrs' },
          { id: 'fs-3-2', name: 'Containerize Frontend + Backend Stack for Local Parity', type: 'project', time: '5 hrs' }
        ]
      }
    ]
  },
  {
    slug: 'data-analyst',
    title: 'Data Analyst / BI Engineer',
    aliases: ['data analyst / bi engineer', 'data analyst', 'bi engineer', 'data-analyst'],
    openings: '18,200+ roles',
    demand: 'High',
    primarySkills: ['SQL', 'Python', 'Statistics', 'Tableau', 'Communication'],
    skillRequirements: [
      {
        name: 'SQL',
        requiredScore: 85,
        time: '3 weeks',
        resource: 'Mode Advanced SQL (Window Functions & CTEs)',
        project: 'SaaS MRR & Cohort Retention Warehouse Model',
        category: 'Technical'
      },
      {
        name: 'Python',
        requiredScore: 70,
        time: '2 weeks',
        resource: 'Pandas & Exploratory Data Analysis',
        project: 'Automated Funnel Anomaly Detection Script',
        category: 'Technical'
      },
      {
        name: 'Statistics',
        requiredScore: 75,
        time: '2 weeks',
        resource: 'Trustworthy Online Controlled Experiments',
        project: 'Power Analysis & A/B Experiment Readout Report',
        category: 'Technical'
      },
      {
        name: 'Tableau',
        requiredScore: 80,
        time: '2 weeks',
        resource: 'BI Dimensional Storytelling Patterns',
        project: 'Executive KPI Self-Service Dashboard',
        category: 'Product'
      },
      {
        name: 'Communication',
        requiredScore: 75,
        time: 'Ongoing',
        resource: 'Executive Pyramid Principle',
        project: 'Quarterly Revenue Variance Memo',
        category: 'Leadership'
      }
    ],
    phases: [
      {
        id: 'phase-1',
        number: '01',
        title: 'SQL Analytics & Relational Modeling',
        goal: 'Master window functions, CTEs, and schema dimensional modeling.',
        skills: ['SQL', 'Window Functions', 'CTEs', 'Star Schemas'],
        estimatedTime: '2–3 Weeks',
        difficulty: 'Medium',
        why: 'Clean SQL modeling turns noisy event logs into single-source-of-truth metrics.',
        dependencies: 'None',
        outcome: 'Modular SQL mart computing retention and revenue attribution.',
        tasks: [
          { id: 'da-1-1', name: 'Solve 15 Window Function & Cohort Retention SQL Queries', type: 'learn', time: '4 hrs' },
          { id: 'da-1-2', name: 'Model Fact & Dimension Tables for Product Telemetry', type: 'project', time: '5 hrs' }
        ]
      },
      {
        id: 'phase-2',
        number: '02',
        title: 'BI Dashboards & Experimentation',
        goal: 'Design interactive executive dashboards and evaluate product A/B tests.',
        skills: ['Tableau', 'Statistics', 'A/B Testing', 'Metric Trees'],
        estimatedTime: '3 Weeks',
        difficulty: 'Hard',
        why: 'Decision makers need statistically sound readouts and intuitive visual hierarchy.',
        dependencies: 'Phase 01',
        outcome: 'Executive KPI dashboard paired with A/B significance calculator.',
        tasks: [
          { id: 'da-2-1', name: 'Build Conversion & Churn Executive BI Dashboard', type: 'project', time: '6 hrs' },
          { id: 'da-2-2', name: 'Analyze Sample Experiment for Novelty Effect & Power', type: 'task', time: '4 hrs' }
        ]
      },
      {
        id: 'phase-3',
        number: '03',
        title: 'Executive Storytelling & Forecasting',
        goal: 'Communicate strategic product recommendations with Python forecasts and memos.',
        skills: ['Python', 'Forecasting', 'Communication', 'Stakeholder Alignment'],
        estimatedTime: '2 Weeks',
        difficulty: 'Medium',
        why: 'Impact comes from influencing roadmap priorities clearly without jargon.',
        dependencies: 'Phase 01, 02',
        outcome: 'Board-ready quarterly metric diagnosis & forecast brief.',
        tasks: [
          { id: 'da-3-1', name: 'Build Python Time-Series Forecast for Sign-Up Funnel', type: 'project', time: '5 hrs' },
          { id: 'da-3-2', name: 'Author 1-Page Executive Decision Memo from Data Findings', type: 'task', time: '3 hrs' }
        ]
      }
    ]
  },
  {
    slug: 'cloud-architect',
    title: 'Cloud Solutions Architect',
    aliases: ['cloud solutions architect', 'cloud architect', 'cloud-architect', 'cloud-solutions-architect'],
    openings: '11,200+ roles',
    demand: 'Very High',
    primarySkills: ['Cloud Networking', 'IAM & Security', 'Docker & Kubernetes', 'Terraform / IaC', 'System Design'],
    skillRequirements: [
      {
        name: 'Cloud Networking',
        requiredScore: 85,
        time: '3 weeks',
        resource: 'VPC Subnets, Routing & Load Balancing Deep Dive',
        project: 'Multi-AZ Zero-Public-DB VPC Topology',
        category: 'Technical'
      },
      {
        name: 'IAM & Security',
        requiredScore: 85,
        time: '2 weeks',
        resource: 'Least-Privilege IAM Policy Architecture',
        project: 'Cross-Account Role & KMS Encryption Blueprint',
        category: 'Technical'
      },
      {
        name: 'Terraform / IaC',
        requiredScore: 80,
        time: '2 weeks',
        resource: 'Terraform Modules & State Locking',
        project: 'Reusable Multi-Environment Terraform Module Suite',
        category: 'Technical'
      },
      {
        name: 'Docker & Kubernetes',
        requiredScore: 75,
        time: '3 weeks',
        resource: 'Production Kubernetes Scheduling & Autoscaling',
        project: 'Zero-Downtime Rolling Deployment with Health Probes',
        category: 'Technical'
      },
      {
        name: 'System Design',
        requiredScore: 85,
        time: '2 weeks',
        resource: 'Well-Architected Cost & Disaster Recovery Patterns',
        project: 'Multi-Region Active-Passive Failover Runbook',
        category: 'Leadership'
      }
    ],
    phases: [
      {
        id: 'phase-1',
        number: '01',
        title: 'Networking, VPCs & IAM Governance',
        goal: 'Master CIDR subnetting, secure routing, and least-privilege cloud IAM.',
        skills: ['Cloud Networking', 'IAM & Security', 'DNS', 'TLS'],
        estimatedTime: '3 Weeks',
        difficulty: 'Medium',
        why: 'Every resilient cloud platform starts with segmented private networking and tight IAM.',
        dependencies: 'None',
        outcome: 'Audited VPC + IAM baseline topology with zero wildcard policies.',
        tasks: [
          { id: 'ca-1-1', name: 'Design Public/Private Subnet CIDR Plan & NAT/Egress Routes', type: 'learn', time: '4 hrs' },
          { id: 'ca-1-2', name: 'Author Least-Privilege IAM Policies & KMS Key Hierarchy', type: 'project', time: '5 hrs' }
        ]
      },
      {
        id: 'phase-2',
        number: '02',
        title: 'Infrastructure as Code & Containers',
        goal: 'Provision reproducible clusters and container workloads via Terraform and Kubernetes.',
        skills: ['Terraform / IaC', 'Docker & Kubernetes', 'Autoscaling'],
        estimatedTime: '3 Weeks',
        difficulty: 'Hard',
        why: 'Repeatable IaC prevents configuration drift and accelerates disaster recovery.',
        dependencies: 'Phase 01',
        outcome: 'Versioned Terraform repo deploying containerized services.',
        tasks: [
          { id: 'ca-2-1', name: 'Build Modular Terraform Stack with Remote State Locking', type: 'project', time: '6 hrs' },
          { id: 'ca-2-2', name: 'Configure Kubernetes Readiness Probes & HPA Policies', type: 'task', time: '4 hrs' }
        ]
      },
      {
        id: 'phase-3',
        number: '03',
        title: 'Multi-Region Resilience & FinOps',
        goal: 'Balance high-availability SLAs with cloud unit economics and cost guardrails.',
        skills: ['System Design', 'FinOps', 'Disaster Recovery', 'Observability'],
        estimatedTime: '2 Weeks',
        difficulty: 'Hard',
        why: 'Principal architects optimize both 99.99% uptime and sustainable compute costs.',
        dependencies: 'Phase 01, 02',
        outcome: 'Approved architecture review covering RPO/RTO and cost budgets.',
        tasks: [
          { id: 'ca-3-1', name: 'Simulate Region Failover & Verify Backup Restore RTO', type: 'task', time: '4 hrs' },
          { id: 'ca-3-2', name: 'Author FinOps Cost Allocation & Architecture ADR', type: 'project', time: '4 hrs' }
        ]
      }
    ]
  },
  {
    slug: 'cybersecurity-specialist',
    title: 'Cybersecurity Specialist',
    aliases: ['cybersecurity specialist', 'cybersecurity-specialist', 'security engineer'],
    openings: '15,600+ roles',
    demand: 'Very High',
    primarySkills: ['Network Security', 'AppSec / OWASP', 'Threat Modeling', 'Incident Response', 'IAM & Crypto'],
    skillRequirements: [
      {
        name: 'Network Security',
        requiredScore: 85,
        time: '2 weeks',
        resource: 'Packet Analysis, TLS & Firewall Hardening',
        project: 'Wireshark Intrusion Traffic Triage Report',
        category: 'Technical'
      },
      {
        name: 'AppSec / OWASP',
        requiredScore: 85,
        time: '3 weeks',
        resource: 'OWASP Top 10 & API Security Testing Guide',
        project: 'JWT/RBAC & Injection Remediation Audit',
        category: 'Technical'
      },
      {
        name: 'Threat Modeling',
        requiredScore: 80,
        time: '2 weeks',
        resource: 'STRIDE Threat Modeling in Practice',
        project: 'End-to-End SaaS Architecture Threat Model',
        category: 'Product'
      },
      {
        name: 'Incident Response',
        requiredScore: 75,
        time: '2 weeks',
        resource: 'NIST Incident Handling Playbooks',
        project: 'Simulated Token Leak Containment Runbook',
        category: 'Leadership'
      },
      {
        name: 'IAM & Crypto',
        requiredScore: 75,
        time: '2 weeks',
        resource: 'Applied Cryptography & Secret Management',
        project: 'Secret Rotation & Audit Log Integrity Plan',
        category: 'Technical'
      }
    ],
    phases: [
      {
        id: 'phase-1',
        number: '01',
        title: 'Network Security & Penetration Testing',
        goal: 'Analyze packet captures, audit CVE vulnerabilities, and harden endpoints.',
        skills: ['Network Security', 'Linux Hardening', 'Vulnerability Triage'],
        estimatedTime: '2–3 Weeks',
        difficulty: 'Medium',
        why: 'Detecting lateral movement starts with understanding protocol-level traffic and host posture.',
        dependencies: 'None',
        outcome: 'Annotated packet capture investigation and service hardening report.',
        tasks: [
          { id: 'cs-1-1', name: 'Inspect Malicious HTTP/TLS Captures & Identify Anomaly Indicators', type: 'learn', time: '4 hrs' },
          { id: 'cs-1-2', name: 'Execute Local Container/Service Port & CVE Posture Scan', type: 'project', time: '5 hrs' }
        ]
      },
      {
        id: 'phase-2',
        number: '02',
        title: 'Application Security & Threat Modeling',
        goal: 'Uncover OWASP auth/injection flaws and embed STRIDE threat models into SDLC.',
        skills: ['AppSec / OWASP', 'Threat Modeling', 'JWT & RBAC'],
        estimatedTime: '3 Weeks',
        difficulty: 'Hard',
        why: 'Modern breaches exploit broken object-level authorization and exposed tokens.',
        dependencies: 'Phase 01',
        outcome: 'Verified security review covering IDOR, CSRF, SSRF, and secret redaction.',
        tasks: [
          { id: 'cs-2-1', name: 'Author STRIDE Threat Model for Multi-Role Web Platform', type: 'project', time: '5 hrs' },
          { id: 'cs-2-2', name: 'Write Automated Negative Auth & Ownership Penetration Tests', type: 'task', time: '5 hrs' }
        ]
      },
      {
        id: 'phase-3',
        number: '03',
        title: 'Detection Engineering & Incident Response',
        goal: 'Build actionable security alerts, audit logs, and rapid containment playbooks.',
        skills: ['Incident Response', 'SIEM Logging', 'IAM & Crypto'],
        estimatedTime: '2 Weeks',
        difficulty: 'Hard',
        why: 'Mean time to detect and contain determines business impact when controls are tested.',
        dependencies: 'Phase 01, 02',
        outcome: 'Tested incident containment runbook and alert rule catalog.',
        tasks: [
          { id: 'cs-3-1', name: 'Draft API Key Compromise & Credential Rotation Runbook', type: 'project', time: '4 hrs' },
          { id: 'cs-3-2', name: 'Verify PII & Secret Redaction Across Structured Logs', type: 'task', time: '3 hrs' }
        ]
      }
    ]
  }
];

export function normalizeSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function resolveCareerMeta(careerInput: string | null | undefined): CanonicalCareerMeta | null {
  if (!careerInput || typeof careerInput !== 'string') return null;
  const trimmed = careerInput.trim();
  if (!trimmed) return null;

  const lower = trimmed.toLowerCase();
  const slugified = normalizeSlug(trimmed);

  return (
    CAREER_CATALOG.find(
      (c) =>
        c.slug === lower ||
        c.slug === slugified ||
        c.title.toLowerCase() === lower ||
        c.aliases.includes(lower) ||
        c.aliases.some((alias) => normalizeSlug(alias) === slugified)
    ) || null
  );
}

export function getCanonicalCareerTitle(careerInput: string | null | undefined): string | null {
  const meta = resolveCareerMeta(careerInput);
  return meta ? meta.title : careerInput?.trim() || null;
}

export function enrichRoadmapPhases(
  careerSlugOrTitle: string,
  dbPhasesJson?: string | null
): RoadmapPhaseSpec[] {
  const meta = resolveCareerMeta(careerSlugOrTitle);
  const catalogPhases = meta ? meta.phases : [];

  let parsedDbPhases: Array<Record<string, unknown>> = [];
  if (dbPhasesJson) {
    try {
      const parsed = JSON.parse(dbPhasesJson);
      if (Array.isArray(parsed)) {
        parsedDbPhases = parsed.filter((p): p is Record<string, unknown> => Boolean(p && typeof p === 'object'));
      }
    } catch {
      parsedDbPhases = [];
    }
  }

  if (parsedDbPhases.length === 0) {
    return catalogPhases;
  }

  const merged: RoadmapPhaseSpec[] = parsedDbPhases.map((dbPhase, idx) => {
    const dbId = typeof dbPhase.id === 'string' && dbPhase.id.trim() ? dbPhase.id.trim() : `phase-${idx + 1}`;
    const fallback = catalogPhases.find((p) => p.id.toLowerCase() === dbId.toLowerCase()) || catalogPhases[idx];

    return {
      id: dbId,
      number:
        typeof dbPhase.number === 'string' && dbPhase.number.trim()
          ? dbPhase.number.trim()
          : fallback?.number || String(idx + 1).padStart(2, '0'),
      title:
        typeof dbPhase.title === 'string' && dbPhase.title.trim()
          ? dbPhase.title.trim()
          : fallback?.title || `Phase ${idx + 1}`,
      goal:
        typeof dbPhase.goal === 'string' && dbPhase.goal.trim()
          ? dbPhase.goal.trim()
          : fallback?.goal || '',
      skills: Array.isArray(dbPhase.skills)
        ? (dbPhase.skills.filter((s): s is string => typeof s === 'string'))
        : fallback?.skills || [],
      estimatedTime:
        typeof dbPhase.estimatedTime === 'string' && dbPhase.estimatedTime.trim()
          ? dbPhase.estimatedTime
          : fallback?.estimatedTime || '2–3 Weeks',
      difficulty:
        dbPhase.difficulty === 'Easy' || dbPhase.difficulty === 'Medium' || dbPhase.difficulty === 'Hard'
          ? dbPhase.difficulty
          : fallback?.difficulty || 'Medium',
      why:
        typeof dbPhase.why === 'string' && dbPhase.why.trim()
          ? dbPhase.why
          : fallback?.why || '',
      dependencies:
        typeof dbPhase.dependencies === 'string' && dbPhase.dependencies.trim()
          ? dbPhase.dependencies
          : fallback?.dependencies || (idx === 0 ? 'None' : `Phase 0${idx}`),
      outcome:
        typeof dbPhase.outcome === 'string' && dbPhase.outcome.trim()
          ? dbPhase.outcome
          : fallback?.outcome || '',
      tasks:
        Array.isArray(dbPhase.tasks) && dbPhase.tasks.length > 0
          ? (dbPhase.tasks as RoadmapTaskSpec[])
          : fallback?.tasks || []
    };
  });

  // Append follow-up catalog phases if DB seed only defined initial phase(s)
  for (const catPhase of catalogPhases) {
    if (!merged.some((m) => m.id.toLowerCase() === catPhase.id.toLowerCase())) {
      merged.push(catPhase);
    }
  }

  return merged;
}
