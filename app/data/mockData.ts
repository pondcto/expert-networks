import { Expert, CompletedInterview, Interview, TeamMember, ScreeningQuestion, Vendor } from "../types";

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
