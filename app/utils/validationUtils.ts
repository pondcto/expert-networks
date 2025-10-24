import { CampaignData, TeamMember, ScreeningQuestion } from "../types";

export function validateCampaignBasics(data: Partial<CampaignData>): boolean {
  return !!(data.campaignName && data.campaignName.trim().length > 0);
}

export function validateScopeRefinement(data: Partial<CampaignData>): boolean {
  // Add your Campaign Scope validation logic here
  return true;
}

export function validateTeamMembers(teamMembers: TeamMember[]): boolean {
  return teamMembers.length > 0 && teamMembers.every(member => 
    member.name.trim().length > 0 && 
    member.email.trim().length > 0
  );
}

export function validateScreeningQuestions(questions: ScreeningQuestion[]): boolean {
  return questions.length > 0 && questions.every(question => 
    question.question.trim().length > 0
  );
}

export function validateVendorSelection(selectedVendors: string[]): boolean {
  return selectedVendors.length > 0;
}

export function generateCampaignId(): string {
  return Math.random().toString(16).substring(2, 18);
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateRequired(value: string | undefined | null): boolean {
  return !!(value && value.trim().length > 0);
}
