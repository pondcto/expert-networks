/**
 * Consolidated Mock Data for Expert Networks Application
 *
 * This file contains all mock/sample data used for UI development.
 * Replace these with real API calls when integrating the backend.
 */

import { Expert, CompletedInterview, Interview, TeamMember, ScreeningQuestion, Vendor } from "../types";

// ============================================================================
// EXPERTS
// ============================================================================

export const mockExperts: Expert[] = [
  {
    id: "1",
    name: "Christopher Mark",
    title: "VP, Sales",
    badge: "GLG",
    badgeColor: "bg-purple-100 text-purple-800",
    avatar: "/images/avatar/Christopher Mark.png"
  },
  {
    id: "2", 
    name: "Daniel Paul",
    title: "VP, Sales",
    badge: "DC",
    badgeColor: "bg-blue-100 text-blue-800",
    avatar: "/images/avatar/Daniel Paul.png"
  },
  {
    id: "3",
    name: "David Charles", 
    title: "Director of Business Development",
    badge: "GLG",
    badgeColor: "bg-purple-100 text-purple-800",
    avatar: "/images/avatar/David Charles.png"
  },
  {
    id: "4",
    name: "James William",
    title: "VP, Sales", 
    badge: "GLG",
    badgeColor: "bg-purple-100 text-purple-800",
    avatar: "/images/avatar/James William.png"
  },
  {
    id: "5",
    name: "John Robert",
    title: "VP, Sales",
    badge: "DC", 
    badgeColor: "bg-blue-100 text-blue-800",
    avatar: "/images/avatar/John Robert.png"
  }
];

// ============================================================================
// COMPLETED INTERVIEWS
// ============================================================================

export const mockCompletedInterviews: CompletedInterview[] = [
  {
    id: "1",
    expertName: "Christopher Mark",
    expertTitle: "VP, Sales Operations",
    avatar: "/images/avatar/Christopher Mark.png",
    interviewDate: "Oct 21, 2025",
    interviewTime: "9:00am - 10:00am EST",
    duration: "1 hour",
    rating: 4.8,
    isActive: true,
    transcriptAvailable: true
  },
  {
    id: "2",
    expertName: "Daniel Paul",
    expertTitle: "Director of Marketing",
    avatar: "/images/avatar/Daniel Paul.png",
    interviewDate: "Oct 22, 2025",
    interviewTime: "2:00pm - 3:30pm EST",
    duration: "1.5 hours",
    rating: 5,
    isActive: true,
    transcriptAvailable: false
  },
  {
    id: "3",
    expertName: "David Charles",
    expertTitle: "Senior Product Manager",
    avatar: "/images/avatar/David Charles.png",
    interviewDate: "Oct 20, 2025",
    interviewTime: "11:00am - 11:45am EST",
    duration: "30 mins",
    rating: 3.7,
    isActive: false,
    transcriptAvailable: true
  },
  {
    id: "4",
    expertName: "James William",
    expertTitle: "Chief Technology Officer",
    avatar: "/images/avatar/James William.png",
    interviewDate: "Oct 23, 2025",
    interviewTime: "10:00am - 11:00am EST",
    duration: "1 hour",
    rating: null,
    isActive: true,
    transcriptAvailable: false
  },
  {
    id: "5",
    expertName: "John Robert",
    expertTitle: "VP, Business Development",
    avatar: "/images/avatar/John Robert.png",
    interviewDate: "Oct 19, 2025",
    interviewTime: "3:00pm - 4:00pm EST",
    duration: "1 hour",
    rating: 5,
    isActive: false,
    transcriptAvailable: true
  },
  {
    id: "6",
    expertName: "Matthew Scott",
    expertTitle: "Head of Customer Success",
    avatar: "/images/avatar/Matthew Scott.png",
    interviewDate: "Oct 21, 2025",
    interviewTime: "1:00pm - 2:30pm EST",
    duration: "1.5 hours",
    rating: 4.3,
    isActive: true,
    transcriptAvailable: true
  },
  {
    id: "7",
    expertName: "Thomas Edward",
    expertTitle: "Senior Data Scientist",
    avatar: "/images/avatar/Thomas Edward.png",
    interviewDate: "Oct 18, 2025",
    interviewTime: "4:00pm - 4:30pm EST",
    duration: "30 mins",
    rating: null,
    isActive: false,
    transcriptAvailable: false
  }
];

// ============================================================================
// INTERVIEWS
// ============================================================================

// Helper function to get dates for current week
const getThisWeekDate = (dayOffset: number): Date => {
  const today = new Date();
  const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const monday = new Date(today);
  monday.setDate(today.getDate() - currentDay + (currentDay === 0 ? -6 : 1)); // Get Monday of current week
  const targetDate = new Date(monday);
  targetDate.setDate(monday.getDate() + dayOffset);
  return targetDate;
};

export const mockInterviews: Interview[] = [
  {
    id: "1",
    expertName: "Emily Rodriguez",
    time: "9:00 AM",
    date: getThisWeekDate(0), // Monday
    status: "confirmed",
    duration: 60,
    endTime: "10:00 AM",
    colorTag: "blue",
    teamMembers: ["John Smith", "Sarah Johnson"]
  },
  {
    id: "2",
    expertName: "Robert James",
    time: "2:00 PM",
    date: getThisWeekDate(1), // Tuesday
    status: "confirmed",
    duration: 120,
    endTime: "4:00 PM",
    colorTag: "green",
    teamMembers: ["John Smith", "Mike Wilson"]
  },
  {
    id: "3",
    expertName: "Jennifer Lee",
    time: "11:00 AM",
    date: getThisWeekDate(2), // Wednesday
    status: "confirmed",
    duration: 60,
    endTime: "12:00 PM",
    colorTag: "purple",
    teamMembers: ["Sarah Johnson"]
  },
  {
    id: "4",
    expertName: "Thomas Edward",
    time: "10:00 AM",
    date: getThisWeekDate(3), // Thursday
    status: "confirmed",
    duration: 60,
    endTime: "11:00 AM",
    colorTag: "orange",
    teamMembers: ["John Smith", "Sarah Johnson", "Mike Wilson"]
  },
  {
    id: "5",
    expertName: "Amanda Wilson",
    time: "3:00 PM",
    date: getThisWeekDate(4), // Friday
    status: "confirmed",
    duration: 120,
    endTime: "5:00 PM",
    colorTag: "red",
    teamMembers: ["Mike Wilson", "Sarah Johnson"]
  },
  {
    id: "6",
    expertName: "Kevin Park",
    time: "1:00 PM",
    date: getThisWeekDate(5), // Saturday
    status: "confirmed",
    duration: 60,
    endTime: "2:00 PM",
    colorTag: "pink",
    teamMembers: ["John Smith"]
  },
  {
    id: "7",
    expertName: "Lisa Martinez",
    time: "4:00 PM",
    date: getThisWeekDate(6), // Sunday
    status: "confirmed",
    duration: 60,
    endTime: "5:00 PM",
    colorTag: "cyan",
    teamMembers: ["Sarah Johnson", "Mike Wilson"]
  }
];

// ============================================================================
// TEAM MEMBERS
// ============================================================================

export const mockTeamMembers: TeamMember[] = [
  {
    id: "1",
    name: "John Smith",
    email: "john.smith@company.com",
    role: "Project Manager",
    avatar: "/images/avatar/Christopher Mark.png"
  },
  {
    id: "2",
    name: "Sarah Johnson",
    email: "sarah.johnson@company.com",
    role: "Research Lead",
    avatar: "/images/avatar/Daniel Paul.png"
  },
  {
    id: "3",
    name: "Mike Wilson",
    email: "mike.wilson@company.com",
    role: "Analyst",
    avatar: "/images/avatar/David Charles.png"
  }
];

// ============================================================================
// SCREENING QUESTIONS
// ============================================================================

export const mockScreeningQuestions: ScreeningQuestion[] = [
  {
    id: "1",
    question: "What is your experience with market research?",
    type: "text"
  },
  {
    id: "2",
    question: "How would you rate your expertise in this field?",
    type: "rating"
  },
  {
    id: "3",
    question: "Which industries have you worked in?",
    type: "multiple-choice",
    options: ["Technology", "Healthcare", "Finance", "Manufacturing"]
  }
];

// ============================================================================
// INDIVIDUAL EXPERT VENDORS
// ============================================================================

export const mockVendors: Vendor[] = [
  {
    id: "1",
    name: "Dr. Sarah Johnson",
    expertise: "Market Research",
    rating: 4.8,
    availability: "Available",
    avatar: "/images/avatar/Christopher Mark.png",
    price: "$500/hour",
    description: "Expert in market research with 10+ years experience"
  },
  {
    id: "2",
    name: "Prof. Michael Chen",
    expertise: "Data Analysis",
    rating: 4.9,
    availability: "Available",
    avatar: "/images/avatar/Daniel Paul.png",
    price: "$600/hour",
    description: "Data science expert specializing in business analytics"
  },
  {
    id: "3",
    name: "Dr. Emily Rodriguez",
    expertise: "Consumer Behavior",
    rating: 4.7,
    availability: "Available",
    avatar: "/images/avatar/David Charles.png",
    price: "$450/hour",
    description: "Consumer psychology expert with focus on digital markets"
  }
];

// ============================================================================
// EXPERT NETWORK PLATFORMS (Previously called "Vendors" in lib/mockData.ts)
// ============================================================================

export interface VendorPlatform {
  id: string;
  rank: number;
  name: string;
  logo: string;
  location: string;
  overallScore: number;
  avgCostPerCall: string;
  status: "Pending" | "Not enrolled" | "Enrolled";
  description: string;
  tags: string[];
}

export const mockVendorPlatforms: VendorPlatform[] = [
  {
    id: "1",
    rank: 1,
    name: "AlphaSights",
    logo: "/images/vendors/AlphaSights.jpg",
    location: "New York, USA",
    overallScore: 4.8,
    avgCostPerCall: "$800 - 1500",
    status: "Not enrolled",
    description: "AlphaSights is a top-tier global expert network renowned for its high-speed, high-touch service model, primarily serving leading investment firms, consultancies, and Fortune 500 companies. They heavily invest in training their associates to deeply understand client needs and manage the expert engagement process meticulously. The firm is often praised for its consistent quality and responsiveness on time-sensitive business questions.",
    tags: ["High-touch client service", "Rapid expert recruitment", "Deep-dive business due diligence", "Strategy consulting support", "Global coverage"]
  },
  {
    id: "2",
    rank: 2,
    name: "GLG",
    logo: "/images/vendors/GLG.png",
    location: "New York, USA",
    overallScore: 4.5,
    avgCostPerCall: "$800 - 1500",
    status: "Enrolled",
    description: "GLG is the largest and most established expert network in the world, offering an unparalleled global network of experts across every imaginable industry and discipline. They provide the most comprehensive suite of services, including phone consultations, surveys, custom panels, and long-term engagements. Their scale and breadth make them a default choice for many of the world's largest corporations and financial institutions.",
    tags: ["Unmatched scale & breadth", "Diverse service offerings", "Global reach", "Compliance rigor"]
  },
  {
    id: "3",
    rank: 3,
    name: "Guidepoint",
    logo: "/images/vendors/Guidepoint.png",
    location: "New York, USA",
    overallScore: 4.5,
    avgCostPerCall: "$800 - 1500",
    status: "Not enrolled",
    description: "Guidepoint is a leading global expert network known for its tenacious 'Get to Yes' approach to fulfilling client requests. They are a major competitor to AlphaSights and GLG, with a strong reputation for efficiency and persistence, particularly within the investment and professional services communities. Their service model is designed to be highly responsive and results-oriented.",
    tags: ["Tenacious expert sourcing", "Efficient service delivery", "Investment community focus", "Global project execution"]
  },
  {
    id: "4",
    rank: 4,
    name: "Tegus",
    logo: "/images/vendors/Tegus.jpg",
    location: "Chicago, USA",
    overallScore: 4.5,
    avgCostPerCall: "$800 - 1500",
    status: "Not enrolled",
    description: "Tegus has disrupted the market intelligence space with its powerful platform that combines a high-quality expert network with a vast library of fully transcripted expert call recordings. While users can schedule live expert calls, the core value is the ability to instantly search and gain insights from the existing transcript library, dramatically speeding up research.",
    tags: ["Expert call transcript library", "Platform-based research", "Instant access to historical insights", "Financial due diligence"]
  },
  {
    id: "5",
    rank: 5,
    name: "Atheneum",
    logo: "/images/vendors/Atheneum.png",
    location: "New York, USA",
    overallScore: 4.0,
    avgCostPerCall: "$800 - 1500",
    status: "Not enrolled",
    description: "Atheneum is a major global expert network known for its strong presence in both North America and Europe. They emphasize personalized service and have developed deep sector expertise, particularly in life sciences, industrial goods, and market entry strategies. The company often handles complex, multi-phase projects that require nuanced expert matching and project management.",
    tags: ["Global project execution", "Sector-specific expertise", "Long-term project support", "Qualitative interviews"]
  },
  {
    id: "6",
    rank: 6,
    name: "Dialectica",
    logo: "/images/vendors/Dialectica.jpg",
    location: "Athens, Greece",
    overallScore: 4.0,
    avgCostPerCall: "$800 - 1500",
    status: "Not enrolled",
    description: "Dialectica is a fast-growing expert network known for its bespoke, in-depth research support and investment in its research associate teams. They go beyond simple expert matching by providing synthesized intelligence and building strong, long-term client partnerships. Their rapid growth is fueled by a commitment to delivering comprehensive answers to complex business questions.",
    tags: ["Bespoke research support", "Intelligence synthesis", "Client partnership model", "Deep-dive due diligence"]
  },
  {
    id: "7",
    rank: 7,
    name: "ThirdBridge",
    logo: "/images/vendors/ThirdBridge.jpg",
    location: "London, UK",
    overallScore: 4.0,
    avgCostPerCall: "$800 - 1500",
    status: "Not enrolled",
    description: "ThirdBridge is a primary research firm that specializes in creating detailed 'Interviews' (transcripts of exclusive expert interviews) and 'Forums' (moderated roundtables). They provide a blend of custom primary research and off-the-shelf content, with a particularly strong foothold in the investment sector. Their model is ideal for clients who value deep, documented research outputs.",
    tags: ["Transcripted interviews", "Expert roundtables", "Off-the-shelf & custom research", "Investment sector focus"]
  },
  {
    id: "8",
    rank: 8,
    name: "NewtonX",
    logo: "/images/vendors/NewtonX.jpg",
    location: "New York, USA",
    overallScore: 4.0,
    avgCostPerCall: "$800 - 1500",
    status: "Not enrolled",
    description: "NewtonX distinguishes itself with its proprietary 'B2B Access Graph' and AI-driven sourcing technology, which aims to find the single most relevant expert for a query, even beyond pre-vetted databases. This approach is designed for highly specific, technical, or niche requests where traditional networks may not have immediate coverage. They position themselves as the solution for finding the 'needle in the haystack.'",
    tags: ["AI-driven expert sourcing", "Highly specific/technical recruiting", "Custom search technology", "Niche market expertise"]
  },
  {
    id: "9",
    rank: 9,
    name: "Arbolus",
    logo: "/images/vendors/default.png",
    location: "London, UK",
    overallScore: 3.5,
    avgCostPerCall: "$800 - 1500",
    status: "Not enrolled",
    description: "Arbolus is a technology-driven expert network that leverages its platform and AI to make the insight-gathering process more efficient. They focus on streamlining expert matching and onboarding to reduce overhead. Their model is particularly attractive for clients looking for a blend of traditional expert network service with modern, scalable technology.",
    tags: ["Platform-based matching", "AI-driven sourcing", "Efficient project workflow", "Global expert onboarding"]
  },
  {
    id: "10",
    rank: 10,
    name: "Maven Research",
    logo: "/images/vendors/MavenResearch.png",
    location: "London, UK",
    overallScore: 3.5,
    avgCostPerCall: "$800 - 1500",
    status: "Not enrolled",
    description: "Maven Research is a global expert network that emphasizes quality, compliance, and building long-term client relationships. They offer a full suite of primary research services and have developed a strong reputation for reliability. Their focus is on being a strategic partner rather than just a transactional service provider.",
    tags: ["Client relationship management", "Compliance-focused approach", "Full-service primary research", "Global network"]
  },
  {
    id: "11",
    rank: 11,
    name: "proSapient",
    logo: "/images/vendors/proSapient.jpg",
    location: "London, UK",
    overallScore: 3.5,
    avgCostPerCall: "$800 - 1500",
    status: "Not enrolled",
    description: "proSapient is a platform-based expert network challenger that emphasizes transparency and efficiency. Their platform gives clients direct visibility into the expert sourcing workflow, aiming to reduce administrative friction and cost. They compete by offering a modern user experience combined with traditional expert network service delivery.",
    tags: ["Platform transparency", "Workflow efficiency", "Cost-effective model", "Direct project tracking"]
  },
  {
    id: "12",
    rank: 12,
    name: "Coleman-Research-VisasQ",
    logo: "/images/vendors/ColemanResearch.png",
    location: "New York, USA",
    overallScore: 3.5,
    avgCostPerCall: "$800 - 1500",
    status: "Not enrolled",
    description: "This entity merges Coleman Research's strong heritage in serving the financial sector with VisasQ's community-driven, tech-enabled platform. The combined company offers a hybrid model, providing traditional expert network services alongside a platform where users can directly manage their own expert communities. They have a particularly strong footprint in the Asia-Pacific region.",
    tags: ["Financial sector expertise", "Community management platform", "APAC regional strength", "Hybrid service model"]
  },
  {
    id: "13",
    rank: 13,
    name: "Catalant",
    logo: "/images/vendors/Catalant.jpg",
    location: "Boston, USA",
    overallScore: 3.5,
    avgCostPerCall: "$800 - 1500",
    status: "Not enrolled",
    description: "Catalant operates a platform that connects businesses with on-demand expert talent and teams for project-based work, blending elements of expert networks and flexible consulting. Rather than just one-off calls, they facilitate longer-term engagements like market analysis, strategy development, and interim executive roles. This model is ideal for clients needing hands-on execution, not just advisory insights.",
    tags: ["On-demand project execution", "Flexible talent sourcing", "Interim management", "Strategy development projects"]
  },
  {
    id: "14",
    rank: 14,
    name: "FirstThought",
    logo: "/images/vendors/FirstThought.png",
    location: "New York, USA",
    overallScore: 3.0,
    avgCostPerCall: "$800 - 1500",
    status: "Not enrolled",
    description: "FirstThought is a specialized expert network focusing exclusively on the life sciences and healthcare industries. They leverage deep domain expertise to connect clients with highly specialized experts like clinicians, KOLs, and pharmaceutical executives. This focus allows them to provide high-quality, technically accurate insights that generalist networks may struggle to source.",
    tags: ["Life Sciences & Healthcare specialization", "Access to medical professionals", "Clinical trial insights", "Regulatory expertise"]
  },
  {
    id: "15",
    rank: 15,
    name: "PreScouter",
    logo: "/images/vendors/PreScouter.jpg",
    location: "Chicago, USA",
    overallScore: 3.0,
    avgCostPerCall: "$800 - 1500",
    status: "Not enrolled",
    description: "PreScouter acts as a research and intelligence partner, helping companies scout new technologies and market opportunities. They utilize a global community of PhD researchers and experts to deliver customized research projects. Their model is less about one-off calls and more about delivering synthesized, project-based intelligence, often with a scientific or technical bent.",
    tags: ["Technology scouting", "Academic & research expertise", "Custom research projects", "Innovation strategy"]
  },
  {
    id: "16",
    rank: 16,
    name: "Primary Insight",
    logo: "/images/vendors/PrimaryInsight.jpg",
    location: "New York, USA",
    overallScore: 3.0,
    avgCostPerCall: "$800 - 1500",
    status: "Not enrolled",
    description: "Primary Insight is an expert network that focuses exclusively on the investment community. They specialize in the specific due diligence and ongoing monitoring needs of hedge funds, mutual funds, and private equity firms. Their focused model allows them to offer highly tailored and responsive service to a niche client base.",
    tags: ["Investment community focus", "Channel checks", "Due diligence support", "Ongoing market monitoring"]
  },
  {
    id: "17",
    rank: 17,
    name: "Zintro",
    logo: "/images/vendors/Zintro.png",
    location: "Boston, USA",
    overallScore: 2.5,
    avgCostPerCall: "$800 - 1500",
    status: "Not enrolled",
    description: "Zintro is a self-service online marketplace that connects clients directly with experts. Clients post projects and receive bids from experts, minimizing the intermediary role of a traditional expert network. This model offers lower costs and direct contact but lacks the high-touch service, vetting, and project management of full-service providers.",
    tags: ["Self-service marketplace", "Cost-effective model", "Direct client-expert connection", "Broad expert database"]
  },
  {
    id: "18",
    rank: 18,
    name: "Arches",
    logo: "/images/vendors/Arches.png",
    location: "San Francisco, USA",
    overallScore: 4.2,
    avgCostPerCall: "$700 - 1200",
    status: "Not enrolled",
    description: "Arches is a modern expert network platform that combines AI-powered expert matching with personalized service delivery. They focus on providing rapid access to industry experts while maintaining high quality standards through rigorous vetting processes. Their technology-first approach enables efficient project management and seamless client experience.",
    tags: ["AI-powered matching", "Technology platform", "Rapid expert access", "Quality vetting", "Modern UX"]
  }
];

// ============================================================================
// EXPERT PROFILE
// ============================================================================

export interface ExpertProfile {
  id: string;
  name: string;
  affiliation: string;
  avatar: string;
  rating: number;
  about: string;
  workHistory: string;
  skills: string[];
  screeningResponse: {
    question: string;
    answer?: string;
  };
}

export const mockExpertProfile: ExpertProfile = {
  id: "expert-1",
  name: "David Charles",
  affiliation: "GLG",
  avatar: "/images/avatar/David Charles.png",
  rating: 4.8,
  about: "David Charles is a seasoned technology consultant with over 12 years of experience in enterprise software development and cloud architecture. He specializes in helping organizations modernize their technology stack and implement scalable solutions.",
  workHistory: "Former Senior Solutions Architect at Microsoft, Lead Developer at Amazon Web Services, Principal Engineer at Google Cloud Platform",
  skills: ["Cloud Architecture", "Enterprise Software", "DevOps", "Microservices", "Kubernetes", "Docker"],
  screeningResponse: {
    question: "What is your experience with cloud migration projects?",
    answer: "I have led over 50 successful cloud migration projects for Fortune 500 companies, including complex lift-and-shift and cloud-native transformations. My expertise spans AWS, Azure, and GCP platforms."
  }
};

// ============================================================================
// PROPOSED EXPERTS
// ============================================================================

export interface ProposedExpert {
  id: string;
  number: number;
  vendor_id: string;
  company: string;
  initials: string;
  name: string;
  title: string;
  avatar: string;
  isNew: boolean;
  history: string;
  rating: number;
  aiFitScore: number;
  status: "Awaiting Review" | "Reviewed";
  description: string;
  skills: string[];
  screeningResponses: {
    question: string;
    answer: string;
  }[];
}

export const mockProposedExperts: ProposedExpert[] = [
  {
    id: "1",
    number: 1,
    vendor_id: "1",
    company: "AlphaSights",
    initials: "AS",
    name: "Emily Rodriguez",
    title: "Senior Research Director",
    avatar: "/images/avatar/John Robert.png",
    isNew: true,
    history: "Emily Rodriguez has 8+ years of experience in healthcare market research and competitive intelligence. She started her career at McKinsey & Company as a Business Analyst, where she focused on pharmaceutical market access and drug pricing strategies. She then moved to IQVIA as a Senior Research Manager, leading market research projects for top 10 pharmaceutical companies including Pfizer, Merck, and Johnson & Johnson. At IQVIA, she developed proprietary frameworks for analyzing competitor pipelines and market positioning that helped clients identify over $2 billion in market opportunities. She has extensive experience with FDA regulations, HIPAA compliance, and international regulatory frameworks, having worked on real-world evidence studies and post-market surveillance requirements. Emily holds an MBA from Wharton and a PhD in Pharmaceutical Sciences from Johns Hopkins University.",
    rating: 4,
    aiFitScore: 9,
    status: "Awaiting Review",
    description: "Senior Research Director with 8+ years of experience in healthcare market research and competitive intelligence. Former McKinsey consultant and IQVIA Senior Research Manager specializing in pharmaceutical market access, drug pricing strategies, and regulatory compliance. Expert in FDA regulations, HIPAA compliance, and international regulatory frameworks with deep knowledge of oncology, rare diseases, and digital therapeutics markets.",
    skills: ["Pharmaceutical Market Research", "Drug Pricing & Market Access", "FDA Regulatory Compliance", "Oncology & Rare Disease Analysis", "Real-World Evidence Studies", "HIPAA Compliance", "Competitive Pipeline Analysis", "Healthcare Data Analytics", "Post-Market Surveillance", "International Regulatory Frameworks"],
    screeningResponses: [
      {
        question: "What is your experience with pharmaceutical market research?",
        answer: "I have 8+ years of experience in pharmaceutical market research, including 3 years at McKinsey focusing on drug pricing strategies and market access. I've led research projects for top 10 pharma companies on oncology, rare diseases, and digital therapeutics."
      },
      {
        question: "How do you approach competitive intelligence in healthcare?",
        answer: "I use a multi-source approach combining primary research, secondary data analysis, and expert interviews. I've developed proprietary frameworks for analyzing competitor pipelines, pricing strategies, and market positioning that have helped clients identify $2B+ in market opportunities."
      },
      {
        question: "What regulatory challenges have you navigated in healthcare research?",
        answer: "I've worked extensively with FDA regulations, HIPAA compliance, and international regulatory frameworks. I've helped clients navigate complex approval processes and have experience with real-world evidence studies and post-market surveillance requirements."
      }
    ]
  },
  {
    id: "2",
    number: 2,
    vendor_id: "3",
    company: "Guidepoint",
    initials: "GP",
    name: "Robert James",
    title: "VP, Strategy",
    avatar: "/images/avatar/Matthew Scott.png",
    isNew: true,
    history: "Robert James has 12+ years of strategic consulting experience in financial services and digital transformation. He began his career at McKinsey & Company as a Business Analyst, rising to Associate Principal over 6 years, where he focused on financial services strategy and digital transformation. He led the $500M digital banking platform implementation for a top-5 bank, resulting in 40% improvement in customer satisfaction and 25% reduction in operational costs. After McKinsey, he joined Edmonds Consulting as a Principal, where he advised 3 major banks and 2 fintech companies on digital transformation initiatives. He has deep expertise in change management, having successfully managed transformations affecting 50,000+ employees with 90%+ adoption rates. Robert holds an MBA from Harvard Business School and a Bachelor's in Economics from Princeton University.",
    rating: 5,
    aiFitScore: 8,
    status: "Awaiting Review",
    description: "VP of Strategy with 12+ years of experience in financial services digital transformation and fintech innovation. Former McKinsey Associate Principal and Edmonds Consulting Principal specializing in digital banking platforms, fintech strategy, and large-scale change management. Expert in embedded finance, open banking, and AI-driven personalization with proven track record of leading $500M+ digital transformation projects.",
    skills: ["Digital Banking Platform Implementation", "Fintech Strategy & Innovation", "Embedded Finance Solutions", "Open Banking & API Integration", "Large-Scale Change Management", "Enterprise Digital Transformation", "Financial Services Consulting", "B2B Fintech Partnerships", "Regulatory Compliance (Financial)", "Customer Experience Optimization"],
    screeningResponses: [
      {
        question: "Describe your experience with digital transformation in financial services.",
        answer: "I've led digital transformation initiatives for 3 major banks and 2 fintech companies. At McKinsey, I helped a top-5 bank implement a $500M digital banking platform, resulting in 40% improvement in customer satisfaction and 25% reduction in operational costs."
      },
      {
        question: "How do you approach change management in large organizations?",
        answer: "I use a structured approach combining stakeholder analysis, communication strategies, and training programs. I've successfully managed change for 50,000+ employees across multiple organizations, achieving 90%+ adoption rates for new systems and processes."
      },
      {
        question: "What fintech trends are you most excited about?",
        answer: "I'm particularly interested in embedded finance, open banking, and AI-driven personalization. I've advised 5 fintech startups on go-to-market strategies and have deep insights into regulatory trends and consumer adoption patterns in digital financial services."
      }
    ]
  },
  {
    id: "3",
    number: 3,
    vendor_id: "4",
    company: "Tegus",
    initials: "TG",
    name: "Jennifer Lee",
    title: "Investment Analyst",
    avatar: "/images/avatar/Michael David.png",
    isNew: true,
    history: "Jennifer Lee is an Investment Analyst with 6+ years of experience in private equity and venture capital. She started her career at Goldman Sachs as an Investment Banking Analyst in the Technology, Media & Telecommunications (TMT) group, where she worked on 15+ M&A transactions worth over $10 billion. She then joined KKR as a Private Equity Associate, focusing on technology and healthcare investments. At KKR, she conducted due diligence on 50+ companies and helped execute 8 investments totaling $2.5 billion. She has deep expertise in financial modeling, valuation, and sector analysis, with particular strength in SaaS metrics, customer acquisition costs, and lifetime value analysis. Jennifer holds a Bachelor's in Finance from Wharton and is a CFA charterholder.",
    rating: 4,
    aiFitScore: 7,
    status: "Awaiting Review",
    description: "Investment Analyst with 6+ years of experience in private equity and venture capital. Former Goldman Sachs Investment Banking Analyst and KKR Private Equity Associate specializing in technology and healthcare investments. Expert in financial modeling, valuation, and sector analysis with deep knowledge of SaaS metrics, customer acquisition costs, and lifetime value analysis. CFA charterholder with experience in $2.5B+ in PE investments.",
    skills: ["Private Equity Due Diligence", "Venture Capital Investment Analysis", "SaaS Metrics & Unit Economics", "Healthcare Investment Research", "Technology Sector Analysis", "Financial Modeling & Valuation", "Customer Acquisition Cost Analysis", "Lifetime Value (LTV) Modeling", "Investment Banking (M&A)", "CFA Charterholder"],
    screeningResponses: [
      {
        question: "What is your experience with healthcare investment due diligence?",
        answer: "I've conducted due diligence on 50+ healthcare companies, including medtech, biotech, and digital health startups. I've worked with 3 major PE firms and have deep expertise in FDA approval processes, reimbursement models, and market sizing for healthcare technologies."
      },
      {
        question: "How do you evaluate technology companies for investment?",
        answer: "I focus on market size, competitive moats, team quality, and unit economics. I've developed proprietary frameworks for assessing SaaS metrics, customer acquisition costs, and lifetime value. My analysis has influenced $1B+ in investment decisions across 100+ technology companies."
      },
      {
        question: "What sectors are you most bullish on for 2024-2025?",
        answer: "I'm particularly excited about AI/ML applications, climate tech, and digital health. I've been tracking these sectors closely and have identified several emerging opportunities in enterprise AI, carbon capture technologies, and personalized medicine platforms."
      }
    ]
  },
  {
    id: "4",
    number: 4,
    vendor_id: "5",
    company: "Atheneum",
    initials: "AT",
    name: "Thomas Edward",
    title: "Industry Expert",
    avatar: "/images/avatar/Richard Alan.png",
    isNew: false,
    history: "Thomas Edward is a former CTO with 15+ years of experience in enterprise software and cloud infrastructure. He began his career as a Software Engineer at Microsoft, where he worked on Azure cloud services for 4 years. He then joined Amazon Web Services as a Senior Solutions Architect, helping enterprise clients migrate to the cloud. After AWS, he became VP of Engineering at Salesforce, where he led a team of 200+ engineers building the Salesforce Platform. Most recently, he served as CTO at a Fortune 500 manufacturing company, where he led a $100M digital transformation project that modernized their entire IT infrastructure. He has deep expertise in AI/ML implementation, having built ML pipelines serving 10M+ users and implemented MLOps practices. Thomas holds a Master's in Computer Science from Stanford and a Bachelor's in Electrical Engineering from MIT.",
    rating: 5,
    aiFitScore: 10,
    status: "Awaiting Review",
    description: "Former CTO with 15+ years of experience in enterprise software and cloud infrastructure. Former Microsoft Software Engineer, AWS Senior Solutions Architect, and Salesforce VP of Engineering. Expert in AI/ML implementation, cloud architecture, and digital transformation with experience leading $100M+ projects and teams of 200+ engineers. Built ML pipelines serving 10M+ users with expertise in AWS, Azure, and GCP platforms.",
    skills: ["Enterprise Cloud Architecture (AWS/Azure/GCP)", "AI/ML Pipeline Development", "MLOps & Model Deployment", "Microservices Architecture", "Kubernetes & Containerization", "Large-Scale System Design", "Engineering Team Leadership (200+ people)", "Digital Transformation Strategy", "DevOps & CI/CD Implementation", "Real-Time ML Systems"],
    screeningResponses: [
      {
        question: "Describe your experience with AI/ML implementation in enterprise environments.",
        answer: "I've led AI/ML implementations at 2 Fortune 500 companies, including a $100M digital transformation project. I've built ML pipelines serving 10M+ users, implemented MLOps practices, and have experience with AWS, Azure, and GCP cloud platforms."
      },
      {
        question: "How do you approach cloud architecture for large-scale applications?",
        answer: "I design for scalability, security, and cost optimization. I've architected systems handling 100M+ daily transactions using microservices, containerization, and auto-scaling. My architectures have reduced infrastructure costs by 40% while improving performance by 60%."
      },
      {
        question: "What are the biggest challenges in leading technical teams?",
        answer: "The main challenges are balancing technical debt with feature delivery, managing remote teams effectively, and keeping up with rapidly evolving technologies. I've successfully led 50+ person engineering teams and have developed frameworks for technical decision-making and team productivity."
      }
    ]
  },
  {
    id: "5",
    number: 5,
    vendor_id: "7",
    company: "ThirdBridge",
    initials: "TB",
    name: "Amanda Wilson",
    title: "Market Research Lead",
    avatar: "/images/avatar/Robert James.png",
    isNew: false,
    history: "Amanda Wilson is a Market Research Lead with 10+ years of experience in consumer behavior and market research. She started her career at Nielsen as a Consumer Insights Analyst, where she analyzed consumer behavior data for major CPG brands. She then joined Procter & Gamble as a Senior Market Research Manager, leading consumer research for the Beauty and Personal Care division. At P&G, she developed omnichannel strategies for 5 major brands, including a Fortune 100 company's digital transformation that increased online sales by 60%. She has conducted 200+ consumer studies and developed proprietary models for predicting purchase behavior and brand loyalty. Amanda holds a Master's in Marketing Research from the University of Georgia and a Bachelor's in Psychology from Duke University.",
    rating: 4,
    aiFitScore: 6,
    status: "Reviewed",
    description: "Market Research Lead with 10+ years of experience in consumer behavior and omnichannel retail strategies. Former Nielsen Consumer Insights Analyst and P&G Senior Market Research Manager specializing in CPG brands and digital transformation. Expert in consumer behavior analysis, omnichannel strategy, and digital marketing with proven track record of increasing online sales by 60% through integrated digital campaigns.",
    skills: ["Consumer Behavior Analysis", "Omnichannel Retail Strategy", "CPG Market Research", "Digital Marketing & E-commerce", "Brand Positioning & Strategy", "Customer Journey Mapping", "Personalization at Scale", "Social Commerce & Influencer Marketing", "Privacy-Compliant Data Strategies", "Retail Analytics & Insights"],
    screeningResponses: [
      {
        question: "What is your experience with omnichannel retail strategies?",
        answer: "I've developed omnichannel strategies for 5 major CPG brands, including a Fortune 100 company's digital transformation that increased online sales by 60%. I have deep expertise in customer journey mapping, channel integration, and personalization at scale."
      },
      {
        question: "How do you approach consumer behavior analysis?",
        answer: "I use a combination of quantitative data analysis, qualitative research, and behavioral psychology principles. I've conducted 200+ consumer studies and have developed proprietary models for predicting purchase behavior and brand loyalty across different demographic segments."
      },
      {
        question: "What digital marketing trends are most impactful for CPG brands?",
        answer: "I'm seeing significant impact from social commerce, influencer partnerships, and AI-driven personalization. I've helped brands achieve 3x ROI improvements through integrated digital campaigns and have expertise in privacy-compliant customer data strategies."
      }
    ]
  },
  {
    id: "6",
    number: 6,
    vendor_id: "8",
    company: "NewtonX",
    initials: "NX",
    name: "Kevin Park",
    title: "Data Science Director",
    avatar: "/images/avatar/Thomas Edward.png",
    isNew: false,
    history: "Kevin Park is a Data Science Director with 8+ years of experience in machine learning and e-commerce AI systems. He earned his PhD in Machine Learning from Stanford University, where his research on collaborative filtering was published in top ML conferences including ICML and NeurIPS. After his PhD, he joined Amazon as a Senior Applied Scientist, where he built recommendation systems for Amazon's e-commerce platform serving 50M+ users. He then moved to Netflix as a Principal Data Scientist, leading the development of their content recommendation engine. At Netflix, he implemented real-time recommendation systems that increased conversion rates by 35% and average order value by 20%. He has designed and executed 100+ A/B tests for ML models and built MLOps pipelines that monitor model performance in real-time. Kevin holds a PhD in Machine Learning from Stanford and a Bachelor's in Computer Science from UC Berkeley.",
    rating: 5,
    aiFitScore: 9,
    status: "Awaiting Review",
    description: "Data Science Director with 8+ years of experience in machine learning and e-commerce AI systems. Former Amazon Senior Applied Scientist and Netflix Principal Data Scientist with PhD in ML from Stanford. Expert in recommendation systems, personalization algorithms, and MLOps with proven track record of increasing conversion rates by 35% and building systems serving 50M+ users.",
    skills: ["Machine Learning & Deep Learning", "Recommendation Systems Engineering", "E-commerce AI & Personalization", "Python & ML Frameworks (TensorFlow/PyTorch)", "A/B Testing & Statistical Analysis", "MLOps & Model Deployment", "Real-Time ML Systems", "Collaborative Filtering Algorithms", "E-commerce Analytics & Metrics", "PhD in Machine Learning (Stanford)"],
    screeningResponses: [
      {
        question: "Describe your experience with recommendation systems in e-commerce.",
        answer: "I've built recommendation systems for 3 major e-commerce platforms serving 50M+ users. My PhD research on collaborative filtering was published in top ML conferences. I've implemented real-time recommendation engines that increased conversion rates by 35% and average order value by 20%."
      },
      {
        question: "How do you approach A/B testing for ML models?",
        answer: "I use rigorous statistical methods including multi-armed bandits and Bayesian optimization. I've designed and executed 100+ A/B tests for ML models, ensuring statistical significance and proper control for confounding variables. My testing frameworks have improved model performance by 25% on average."
      },
      {
        question: "What are the biggest challenges in production ML systems?",
        answer: "The main challenges are model drift, data quality issues, and maintaining consistency between training and inference. I've built MLOps pipelines that monitor model performance in real-time and have experience with automated retraining and rollback strategies."
      }
    ]
  },
  {
    id: "7",
    number: 7,
    vendor_id: "2",
    company: "GLG",
    initials: "GLG",
    name: "Lisa Martinez",
    title: "Business Development Manager",
    avatar: "/images/avatar/Christopher Mark.png",
    isNew: false,
    history: "Lisa Martinez is a Business Development Manager with 7+ years of experience in B2B sales and partnerships. She started her career at Salesforce as a Business Development Representative, where she generated $2M in pipeline in her first year. She then joined HubSpot as a Senior Business Development Manager, leading the launch of their CRM platform that reached $10M ARR in 18 months. At HubSpot, she built and managed a team of 15 BDRs and developed enterprise sales strategies that closed deals worth $50M+ with Fortune 500 companies. She has extensive experience with complex enterprise sales cycles, channel partnerships, and customer success programs that achieved 95%+ retention rates. Lisa holds a Bachelor's in Business Administration from the University of Texas at Austin.",
    rating: 4,
    aiFitScore: 7,
    status: "Reviewed",
    description: "Business Development Manager with 7+ years of experience in B2B sales and SaaS product launches. Former Salesforce BDR and HubSpot Senior Business Development Manager specializing in enterprise sales and channel partnerships. Expert in go-to-market strategy, customer success, and partnership management with proven track record of reaching $10M ARR in 18 months.",
    skills: ["SaaS Go-to-Market Strategy", "Enterprise B2B Sales", "Channel Partnership Development", "Customer Success & Retention", "Salesforce & HubSpot CRM", "Revenue Operations & Analytics", "Product Launch Management", "Enterprise Sales Cycles", "Partnership Program Development", "Customer Acquisition & Growth"],
    screeningResponses: [
      {
        question: "What is your experience with SaaS product launches?",
        answer: "I've led go-to-market strategies for 4 SaaS products, including a CRM platform that reached $10M ARR in 18 months. I have experience with enterprise sales cycles, channel partnerships, and customer success programs that achieved 95%+ retention rates."
      },
      {
        question: "How do you approach B2B sales strategy for enterprise clients?",
        answer: "I focus on understanding customer pain points, building relationships with key stakeholders, and demonstrating clear ROI. I've closed deals worth $50M+ with Fortune 500 companies and have developed frameworks for complex enterprise sales cycles that average 6-12 months."
      },
      {
        question: "What partnership strategies work best for SaaS companies?",
        answer: "I've built successful partnerships with system integrators, technology vendors, and channel partners. The key is aligning incentives, providing proper training, and creating co-marketing opportunities. My partnership programs have generated 40% of total revenue for the companies I've worked with."
      }
    ]
  },
  {
    id: "8",
    number: 8,
    vendor_id: "1",
    company: "AlphaSights",
    initials: "AS",
    name: "Alex Thompson",
    title: "Senior Consultant",
    avatar: "/images/avatar/Daniel Paul.png",
    isNew: false,
    history: "Alex Thompson is a Senior Consultant with 10+ years of experience in management consulting and strategic planning. He began his career at Bain & Company as a Consultant, where he worked on operational efficiency projects for Fortune 500 companies across manufacturing, retail, and healthcare sectors. He then joined Deloitte as a Senior Manager, leading digital transformation initiatives that achieved average cost savings of 20-30%. At Deloitte, he specialized in lean methodologies, Six Sigma, and process optimization, helping clients reduce cycle times by 40% and improve quality metrics by 25%. He has successfully managed change initiatives affecting 100,000+ employees and has developed custom frameworks for different organizational cultures. Alex holds an MBA from INSEAD and a Bachelor's in Industrial Engineering from Georgia Tech.",
    rating: 5,
    aiFitScore: 8,
    status: "Awaiting Review",
    description: "Senior Management Consultant with 10+ years of experience in operational efficiency and strategic planning. Former Bain & Company Consultant and Deloitte Senior Manager specializing in lean methodologies, Six Sigma, and digital transformation. Expert in process optimization and change management with proven track record of achieving 20-30% cost savings and managing transformations affecting 100,000+ employees.",
    skills: ["Management Consulting & Strategic Planning", "Lean Manufacturing & Six Sigma", "Operational Excellence & Process Optimization", "Digital Transformation Strategy", "Change Management & Organizational Development", "Performance Improvement & Cost Reduction", "Supply Chain Optimization", "Quality Management Systems", "MBA from INSEAD", "Industrial Engineering"],
    screeningResponses: [
      {
        question: "What is your experience with operational efficiency improvements?",
        answer: "I've led operational efficiency projects for 15+ Fortune 500 companies, achieving average cost savings of 20-30%. I specialize in lean methodologies, Six Sigma, and digital transformation. My most recent project helped a manufacturing client reduce operational costs by $50M annually."
      },
      {
        question: "How do you approach process optimization in complex organizations?",
        answer: "I use a data-driven approach combining process mapping, value stream analysis, and stakeholder interviews. I've optimized processes across 20+ organizations, reducing cycle times by 40% and improving quality metrics by 25%. I focus on sustainable improvements that align with business strategy."
      },
      {
        question: "What change management methodologies do you use?",
        answer: "I combine Kotter's 8-step process with agile change management principles. I've successfully managed change initiatives affecting 100,000+ employees and have developed custom frameworks for different organizational cultures and industries."
      }
    ]
  },
  {
    id: "9",
    number: 9,
    vendor_id: "3",
    company: "Guidepoint",
    initials: "GP",
    name: "Maria Garcia",
    title: "Research Director",
    avatar: "/images/avatar/David Charles.png",
    isNew: false,
    history: "Maria Garcia is a Research Director with 12+ years of experience in market analysis and competitive intelligence. She started her career at McKinsey & Company as a Business Analyst in the Consumer Goods practice, where she conducted market research for Fortune 100 CPG companies. She then joined BCG as a Principal, leading competitive intelligence studies for 20+ consumer goods brands. At BCG, she developed market entry strategies, pricing analyses, and brand positioning studies that helped clients gain 15-25% market share in new categories. She has conducted 500+ consumer studies and developed proprietary frameworks for understanding purchase drivers and brand perception. Maria holds an MBA from Kellogg and a Bachelor's in Economics from the University of Chicago.",
    rating: 4,
    aiFitScore: 7,
    status: "Reviewed",
    description: "Research Director with 12+ years of experience in market analysis and competitive intelligence. Former McKinsey Business Analyst and BCG Principal specializing in consumer goods and retail sectors. Expert in market entry strategies, brand positioning, and consumer insights with proven track record of helping clients gain 15-25% market share in new categories.",
    skills: ["Consumer Goods Market Research", "Competitive Intelligence & Analysis", "Brand Strategy & Positioning", "Retail Analytics & Insights", "Market Entry Strategy Development", "Consumer Behavior & Purchase Drivers", "Pricing Strategy & Analysis", "Brand Perception Studies", "MBA from Kellogg", "Economics & Market Analysis"],
    screeningResponses: [
      {
        question: "Describe your experience with competitive intelligence in consumer goods.",
        answer: "I've conducted competitive intelligence studies for 20+ consumer goods brands, including 3 Fortune 100 companies. I've developed market entry strategies, pricing analyses, and brand positioning studies that helped clients gain 15-25% market share in new categories."
      },
      {
        question: "How do you approach consumer insights research?",
        answer: "I use a multi-method approach combining surveys, focus groups, ethnography, and behavioral data analysis. I've conducted 500+ consumer studies and have developed proprietary frameworks for understanding purchase drivers and brand perception across different segments."
      },
      {
        question: "What retail analytics trends are most important for brands?",
        answer: "I'm seeing significant impact from real-time inventory optimization, predictive demand forecasting, and personalized pricing strategies. I've helped brands improve inventory turnover by 30% and reduce stockouts by 50% through advanced analytics and machine learning models."
      }
    ]
  },
  {
    id: "10",
    number: 10,
    vendor_id: "4",
    company: "Tegus",
    initials: "TG",
    name: "David Kim",
    title: "Investment Research Lead",
    avatar: "/images/avatar/James William.png",
    isNew: false,
    history: "David Kim is an Investment Research Lead with 9+ years of experience in equity research and financial modeling. He began his career at Goldman Sachs as an Equity Research Analyst covering technology companies, where his research was featured in major financial publications including The Wall Street Journal and Bloomberg. He then joined a $2B hedge fund as a Senior Analyst, where he specialized in SaaS, fintech, and AI companies. At the hedge fund, he built financial models for 100+ companies and developed frameworks for valuing high-growth companies with negative cash flows. His analysis has influenced $500M+ in investment decisions and $1B+ worth of transactions. David holds a Bachelor's in Finance from Wharton and is a CFA charterholder.",
    rating: 5,
    aiFitScore: 9,
    status: "Awaiting Review",
    description: "Investment Research Lead with 9+ years of experience in equity research and financial modeling. Former Goldman Sachs Equity Research Analyst and $2B hedge fund Senior Analyst specializing in technology and healthcare sectors. Expert in SaaS metrics, financial modeling, and valuation with proven track record of influencing $500M+ in investment decisions and $1B+ in transactions.",
    skills: ["Equity Research & Financial Analysis", "Technology & Healthcare Investment", "Financial Modeling & Valuation", "SaaS & Fintech Sector Analysis", "High-Growth Company Valuation", "Investment Banking (M&A)", "Hedge Fund Analysis", "CFA Charterholder", "Goldman Sachs Experience", "Financial Publications & Research"],
    screeningResponses: [
      {
        question: "What is your experience with technology sector investment analysis?",
        answer: "I've covered 50+ technology companies as a sell-side analyst at Goldman Sachs and buy-side analyst at a $2B hedge fund. I specialize in SaaS, fintech, and AI companies. My research has been featured in major financial publications and has influenced $500M+ in investment decisions."
      },
      {
        question: "How do you approach financial modeling for high-growth companies?",
        answer: "I focus on unit economics, customer acquisition costs, and lifetime value metrics. I've built models for 100+ companies and have developed frameworks for valuing companies with negative cash flows but strong growth potential. My models have been used in $1B+ worth of transactions."
      },
      {
        question: "What healthcare investment themes are you most excited about?",
        answer: "I'm particularly interested in digital therapeutics, precision medicine, and value-based care models. I've analyzed 30+ healthcare companies and have deep insights into regulatory trends, reimbursement changes, and technological disruptions in the healthcare sector."
      }
    ]
  },
  {
    id: "11",
    number: 11,
    vendor_id: "5",
    company: "Atheneum",
    initials: "AT",
    name: "Sarah Johnson",
    title: "Industry Specialist",
    avatar: "/images/avatar/John Robert.png",
    isNew: false,
    history: "Sarah Johnson is an Industry Specialist with 8+ years of experience in manufacturing and supply chain optimization. She started her career at Toyota as a Manufacturing Engineer, where she learned lean manufacturing principles and implemented continuous improvement initiatives. She then joined General Electric as a Supply Chain Manager, where she optimized supply chains for 10+ global manufacturing facilities, reducing costs by 15-25% and improving delivery times by 30%. At GE, she led lean manufacturing implementations at 15+ facilities, achieving 40% reduction in lead times and 25% improvement in quality metrics. She has extensive experience with digital transformation in manufacturing, including IoT sensors, predictive maintenance, and digital twins. Sarah holds a Master's in Industrial Engineering from Georgia Tech and a Bachelor's in Mechanical Engineering from Purdue University.",
    rating: 4,
    aiFitScore: 6,
    status: "Reviewed",
    description: "Industry Specialist with 8+ years of experience in manufacturing and supply chain optimization. Former Toyota Manufacturing Engineer and GE Supply Chain Manager specializing in lean manufacturing, Six Sigma, and digital transformation. Expert in supply chain optimization, process improvement, and Industry 4.0 technologies with proven track record of reducing costs by 15-25% and improving delivery times by 30%.",
    skills: ["Supply Chain Optimization & Management", "Lean Manufacturing & Toyota Production System", "Six Sigma & Quality Management", "Manufacturing Process Improvement", "Industry 4.0 & Digital Manufacturing", "IoT Sensors & Predictive Maintenance", "Digital Twins & Smart Manufacturing", "Operations Strategy & Planning", "Cost Reduction & Efficiency Improvement", "Master's in Industrial Engineering (Georgia Tech)"],
    screeningResponses: [
      {
        question: "Describe your experience with supply chain optimization in manufacturing.",
        answer: "I've optimized supply chains for 10+ global manufacturing companies, reducing costs by 15-25% and improving delivery times by 30%. I have expertise in lean manufacturing, Six Sigma, and digital supply chain technologies. I've led projects across automotive, electronics, and consumer goods sectors."
      },
      {
        question: "How do you approach lean manufacturing implementation?",
        answer: "I use a systematic approach starting with value stream mapping and waste identification. I've implemented lean methodologies at 15+ facilities, achieving 40% reduction in lead times and 25% improvement in quality metrics. I focus on building sustainable lean cultures that drive continuous improvement."
      },
      {
        question: "What digital technologies are transforming manufacturing operations?",
        answer: "I'm seeing significant impact from IoT sensors, predictive maintenance, and digital twins. I've led digital transformation projects that improved equipment uptime by 20% and reduced maintenance costs by 30%. I have experience with Industry 4.0 technologies and their practical implementation challenges."
      }
    ]
  },
  {
    id: "12",
    number: 12,
    vendor_id: "7",
    company: "ThirdBridge",
    initials: "TB",
    name: "Michael Chen",
    title: "Senior Analyst",
    avatar: "/images/avatar/Matthew Scott.png",
    isNew: false,
    history: "Michael Chen is a Senior Analyst with 7+ years of experience in financial services and risk management. He began his career at JPMorgan Chase as a Risk Analyst, where he developed credit risk models for the bank's $50B+ loan portfolio. He then joined Bank of America as a Senior Risk Manager, specializing in Basel III regulations, stress testing, and machine learning applications in credit scoring. At Bank of America, he designed stress tests for 5 major banks and has experience with CCAR, CECL, and IFRS 9 requirements. His risk models have improved default prediction accuracy by 25% and reduced regulatory capital requirements by 15%. He has helped banks navigate complex regulatory changes and developed frameworks for maintaining compliance while optimizing capital allocation. Michael holds a Master's in Financial Engineering from Columbia University and a Bachelor's in Mathematics from MIT.",
    rating: 5,
    aiFitScore: 8,
    status: "Awaiting Review",
    description: "Senior Financial Analyst with 7+ years of experience in risk management and regulatory compliance. Former JPMorgan Chase Risk Analyst and Bank of America Senior Risk Manager specializing in credit risk assessment, Basel III regulations, and stress testing. Expert in financial modeling, regulatory compliance, and machine learning applications in credit scoring with proven track record of improving default prediction accuracy by 25%.",
    skills: ["Credit Risk Assessment & Modeling", "Basel III & Regulatory Compliance", "Stress Testing & Scenario Analysis", "Machine Learning in Credit Scoring", "CCAR & CECL Implementation", "IFRS 9 & Accounting Standards", "Financial Risk Management", "Banking & Financial Services", "JPMorgan Chase & Bank of America Experience", "Master's in Financial Engineering (Columbia)"],
    screeningResponses: [
      {
        question: "What is your experience with credit risk assessment in banking?",
        answer: "I've developed credit risk models for 3 major banks, covering $50B+ in loan portfolios. I have deep expertise in Basel III regulations, stress testing, and machine learning applications in credit scoring. My models have improved default prediction accuracy by 25% and reduced regulatory capital requirements by 15%."
      },
      {
        question: "How do you approach stress testing for financial institutions?",
        answer: "I use scenario-based stress testing combined with sensitivity analysis and Monte Carlo simulations. I've designed stress tests for 5 major banks and have experience with CCAR, CECL, and IFRS 9 requirements. My stress testing frameworks have helped banks better prepare for economic downturns."
      },
      {
        question: "What are the biggest challenges in regulatory compliance for banks?",
        answer: "The main challenges are keeping up with evolving regulations, data quality issues, and cross-border compliance requirements. I've helped banks navigate complex regulatory changes and have developed frameworks for maintaining compliance while optimizing capital allocation and risk management practices."
      }
    ]
  }
];

// ============================================================================
// CHAT HISTORY
// ============================================================================

export interface ChatHistoryItem {
  title: string;
  time: string;
  messages: number;
}

export const mockChatHistory: ChatHistoryItem[] = [
  { title: "AI Market Analysis", time: "2h ago", messages: 15 },
  { title: "Competitive Research", time: "4h ago", messages: 23 },
  { title: "Technology Trends", time: "1d ago", messages: 8 },
  { title: "Investment Research", time: "2d ago", messages: 31 },
];

// ============================================================================
// EXPERT NETWORKS CHAT
// ============================================================================

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export const mockChatMessages: ChatMessage[] = [
  {
    id: "1",
    role: "assistant",
    content:
      "Hi! I'm ready to help with your expert networks research. What would you like me to investigate?",
  },
  {
    id: "2",
    role: "user",
    content:
      "Can you analyze the current AI market trends and identify key opportunities?",
  },
  {
    id: "3",
    role: "assistant",
    content:
      "I'll analyze the AI market trends for you. Let me start by gathering data from multiple sources and running my research agents.\n\nInitiating:\n• Research Planner Agent\n• Web Scraping API calls\n• Market data analysis\n\nThis may take a few moments...",
  },
];

// ============================================================================
// RESEARCH ACTIVITIES
// ============================================================================

export interface ResearchActivity {
  name: string;
  status: "completed" | "processing" | "queued";
  confidence?: number;
}

export const mockResearchActivities: ResearchActivity[] = [
  { name: "Research Planner Agent", status: "completed", confidence: 98 },
  { name: "Web Scraping API Call", status: "processing" },
  { name: "Content Analysis Agent", status: "processing", confidence: 82 },
  { name: "Data Synthesis Task", status: "queued" },
];

// ============================================================================
// SOURCES STREAM
// ============================================================================

export interface Source {
  name: string;
  type: string;
  status: "scraped" | "processing" | "failed";
  size: string;
}

export const mockSources: Source[] = [
  {
    name: "techcrunch.com/ai-market-trends",
    type: "URL",
    status: "scraped",
    size: "142 KB",
  },
  {
    name: "linkedin.com/company/openai",
    type: "URL",
    status: "processing",
    size: "89 KB",
  },
  {
    name: "github.com/microsoft/generative-ai",
    type: "URL",
    status: "scraped",
    size: "256 KB",
  },
  {
    name: "arxiv.org/abs/2308.12345",
    type: "URL",
    status: "scraped",
    size: "78 KB",
  },
];

// ============================================================================
// ANSWER CANVAS
// ============================================================================

export interface AnswerSection {
  title: string;
  content: string;
}

export const mockAnswerSections: AnswerSection[] = [
  {
    title: "Market Analysis Summary",
    content: "Based on the research data, the AI market shows:\n• 45% growth in enterprise adoption\n• $127B projected market size by 2025\n• Key players: OpenAI, Google, Microsoft",
  },
  {
    title: "Key Insights",
    content:
      "Competitive landscape analysis reveals emerging opportunities in specialized AI applications...",
  },
];

// ============================================================================
// API INTEGRATION NOTES
// ============================================================================

/**
 * INTEGRATION GUIDE FOR BACKEND ENGINEER
 *
 * Replace mock data with API calls in the following locations:
 *
 * 1. ChatHistoryPanel
 *    - Import: mockChatHistory
 *    - Replace with: GET /api/chat/history
 *    - Returns: ChatHistoryItem[]
 *
 * 2. ScreeningQuestionsPanel
 *    - Import: mockChatMessages
 *    - Replace with: GET /api/chat/messages?session_id={id}
 *    - Returns: ChatMessage[]
 *    - POST endpoint: /api/chat/send for sending new messages
 *
 * 3. ResearchActivitiesPanel
 *    - Import: mockResearchActivities
 *    - Replace with: GET /api/research/activities?session_id={id}
 *    - Returns: ResearchActivity[]
 *    - Consider WebSocket for real-time updates
 *
 * 4. SourcesStreamPanel
 *    - Import: mockSources
 *    - Replace with: GET /api/research/sources?session_id={id}
 *    - Returns: Source[]
 *    - Consider WebSocket for streaming updates
 *
 * 5. AnswerCanvasPanel
 *    - Import: mockAnswerSections
 *    - Replace with: GET /api/research/answers?session_id={id}
 *    - Returns: AnswerSection[]
 *
 * All components accept their data via props, so you can:
 * 1. Fetch data at the parent level (DeepResearchWorkspace)
 * 2. Pass down as props to each panel component
 * 3. Use React Query, SWR, or similar for data fetching
 */
