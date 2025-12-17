export interface CandidateProfile {
  fullName: string;
  email: string;
  phone: string;
  department: string;
  skills: string[];
  bio: string;
  experienceLevel: "intern" | "fresher";
  portfolioUrl: string;
  education: string;
  subscribeToNewsletter: boolean;
}

export const DEPARTMENTS = [
  "ENGINEERING (CS/SOFTWARE)",
  "ENGINEERING (MECHANICAL)",
  "ENGINEERING (ELECTRICAL)",
  "DESIGN (DIGITAL/PRODUCT)",
  "ART (FINE/CREATIVE)",
  "BUSINESS / MBA",
  "HR / OPERATIONS",
  "MARKETING / SALES",
  "PRODUCT MANAGEMENT",
];

// Map Dept Name -> Suggested Skills
export const SKILL_SUGGESTIONS: Record<string, string[]> = {
  "ENGINEERING (CS/SOFTWARE)": [
    "REACT",
    "TYPESCRIPT",
    "PYTHON",
    "NODE.JS",
    "RUST",
    "AWS",
    "SYSTEM DESIGN",
    "GO",
  ],
  "ENGINEERING (MECHANICAL)": [
    "SOLIDWORKS",
    "AUTOCAD",
    "MATLAB",
    "THERMODYNAMICS",
    "FEA",
    "ROBOTICS",
    "ANSYS",
    "MANUFACTURING",
  ],
  "ENGINEERING (ELECTRICAL)": [
    "CIRCUIT DESIGN",
    "PCB",
    "ARDUINO",
    "VERILOG",
    "SIGNAL PROCESSING",
    "EMBEDDED C",
    "MATLAB",
    "PLC",
  ],
  "DESIGN (DIGITAL/PRODUCT)": [
    "FIGMA",
    "PROTOTYPING",
    "UI/UX",
    "INTERACTION DESIGN",
    "USER RESEARCH",
    "ADOBE SUITE",
    "WEBFLOW",
  ],
  "ART (FINE/CREATIVE)": [
    "ILLUSTRATION",
    "MOTION GRAPHICS",
    "BLENDER",
    "MAYA",
    "PHOTOSHOP",
    "VISUAL ARTS",
    "STORYBOARDING",
  ],
  "BUSINESS / MBA": [
    "FINANCIAL MODELING",
    "STRATEGY",
    "MARKET ANALYSIS",
    "EXCEL",
    "MANAGEMENT",
    "VC/PE",
    "NEGOTIATION",
  ],
  "HR / OPERATIONS": [
    "RECRUITING",
    "PEOPLE OPS",
    "EVENT PLANNING",
    "LOGISTICS",
    "CULTURE BUILDING",
    "ADMINISTRATION",
    "WORKDAY",
  ],
  "MARKETING / SALES": [
    "SEO/SEM",
    "COPYWRITING",
    "SOCIAL MEDIA",
    "LEAD GEN",
    "HUBSPOT",
    "ANALYTICS",
    "BRANDING",
  ],
  "PRODUCT MANAGEMENT": [
    "ROADMAPS",
    "AGILE",
    "USER STORIES",
    "A/B TESTING",
    "SQL",
    "DATA ANALYSIS",
    "STAKEHOLDER MGMT",
  ],
};
