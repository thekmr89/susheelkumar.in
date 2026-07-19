export interface PersonalInfo {
  name: string;
  role: string;
  tagline: string;
  bio: string;
  location: string;
  email: string;
  phone: string;
  resume: string;
  availability: string;
  githubUrl: string;
  linkedinUrl: string;
  twitterUrl: string;
  resumeUrl: string;
  stats: {
    label: string;
    value: string;
    subtext: string;
  }[];
}

export interface SkillCategory {
  title: string;
  iconName: string;
  skills: {
    name: string;
    level: number; // 0 - 100
    icon?: string;
    badge?: string;
  }[];
}

export interface Project {
  id: string;
  title: string;
  description: string;
  longDescription?: string;
  category: "Full Stack" | "Frontend" | "AI & Cloud" | "Mobile";
  techStack: string[];
  featured: boolean;
  image: string;
  demoUrl?: string;
  githubUrl?: string;
  highlights?: string[];
}

export interface Experience {
  id: string;
  role: string;
  company: string;
  companyUrl?: string;
  location: string;
  period: string;
  type: "Work" | "Education";
  description: string;
  achievements: string[];
  techStack?: string[];
}

export interface Service {
  id: string;
  title: string;
  description: string;
  iconName: string;
  features: string[];
}

export interface PortfolioData {
  personalInfo: PersonalInfo;
  skillCategories: SkillCategory[];
  projects: Project[];
  experiences: Experience[];
  services: Service[];
}
