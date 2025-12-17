export interface CandidateProfile {
  fullName: string;
  email: string;
  phone: string;
  department: string;
  skills: string[];
  bio: string;
  experienceLevel: "intern" | "fresher";
  portfolioUrl: string;
  subscribeToNewsletter: boolean;
}

export const DEPARTMENTS = [
  "ENGINEERING",
  "DESIGN",
  "MARKETING",
  "PRODUCT",
  "SALES",
  "OPERATIONS",
];

export const SKILL_CATEGORIES = {
  PROGRAMMING: [
    "REACT",
    "TYPESCRIPT",
    "NODE.JS",
    "PYTHON",
    "JAVA",
    "C++",
    "RUST",
    "GO",
  ],
  CREATIVE_DESIGN: [
    "UI/UX",
    "FIGMA",
    "ADOBE SUITE",
    "BLENDER",
    "THREE.JS",
    "MOTION GRAPHICS",
  ],
  INFRASTRUCTURE_DATA: [
    "AWS",
    "GCP",
    "SQL",
    "MONGODB",
    "DOCKER",
    "KUBERNETES",
    "DATA ANALYSIS",
  ],
  STRATEGY_OPS: [
    "MARKETING",
    "COPYWRITING",
    "SEO/SEM",
    "SOCIAL MEDIA",
    "CONTENT STRATEGY",
    "PROJECT MGMT",
  ],
};
