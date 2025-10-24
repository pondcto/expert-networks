// Shared types and interfaces for the application

export interface Expert {
  id: string;
  name: string;
  title: string;
  avatar: string;
  badge?: string;
  badgeColor?: string;
}

export interface CompletedInterview {
  id: string;
  expertName: string;
  expertTitle: string;
  avatar: string;
  interviewDate: string;
  interviewTime: string;
  duration: string;
  rating: number | null; // null means not rated yet
  isActive: boolean;
  transcriptAvailable: boolean; // true if transcript is ready for download
}

export interface Interview {
  id: string;
  expertName: string;
  time: string;
  date: Date;
  status: "confirmed" | "pending" | "cancelled";
  duration: number; // in minutes (30, 60, or 120)
  endTime?: string; // calculated end time
  colorTag?: string; // color identifier for the expert (e.g., "blue", "green", "purple")
  teamMembers?: string[]; // names of team members assigned to this interview
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
}

export interface ScreeningQuestion {
  id: string;
  question: string;
  type: "text" | "multiple-choice" | "rating";
  options?: string[];
}

export interface Vendor {
  id: string;
  name: string;
  expertise: string;
  rating: number;
  availability: string;
  avatar: string;
  price: string;
  description: string;
}

export interface CampaignData {
  id?: string;
  campaignName?: string;
  industry?: string;
  teamMembers?: TeamMember[];
  screeningQuestions?: ScreeningQuestion[];
  selectedVendors?: string[];
  proposedExperts?: Expert[];
}

// Panel sizing and layout types
export interface PanelSizing {
  chatWidth: number;
  answerWidth: number;
  topHeight: number;
  activitiesWidth: number;
  sourcesWidth: number;
}

export interface FormCompletion {
  campaignBasicsCompleted: boolean;
  scopeRefinementCompleted: boolean;
}

// Navigation types
export interface NavigationItem {
  level1: string;
  level2: string;
  level3: string;
}
