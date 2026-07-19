export interface PersonalInfo {
  name: string;
  role: string;
  tagline: string;
  location: string;
  email: string;
  phone: string;
  resume: string;
}

export interface PortfolioData {
  personalInfo: PersonalInfo;
}
