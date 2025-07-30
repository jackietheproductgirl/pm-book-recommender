export interface QuizQuestion {
  id: string;
  question: string;
  options: QuizOption[];
  category: 'experience' | 'focus' | 'business' | 'style' | 'career' | 'skills' | 'challenges';
  type: 'single' | 'multi';
  maxSelections?: number;
}

export interface QuizOption {
  id: string;
  text: string;
  value: string;
}

export interface QuizAnswer {
  questionId: string;
  answer: string | string[];
}

export const quizQuestions: QuizQuestion[] = [
  {
    id: 'experience',
    question: "What's your current experience level with product management?",
    options: [
      { id: 'exp-0', text: 'I\'m completely new to PM', value: 'beginner' },
      { id: 'exp-1', text: 'I have 0-2 years of PM experience', value: 'junior' },
      { id: 'exp-2', text: 'I have 3+ years of PM experience', value: 'senior' },
    ],
    category: 'experience',
    type: 'single'
  },
  {
    id: 'primaryFocus',
    question: "What's your primary focus area right now?",
    options: [
      { id: 'focus-1', text: 'UX/Design', value: 'ux_design' },
      { id: 'focus-2', text: 'Leadership', value: 'leadership' },
      { id: 'focus-3', text: 'Data/Analytics', value: 'data_analytics' },
      { id: 'focus-4', text: 'Strategy', value: 'strategy' },
      { id: 'focus-5', text: 'Discovery/Research', value: 'discovery_research' },
      { id: 'focus-6', text: 'Go-to-Market', value: 'go_to_market' },
    ],
    category: 'focus',
    type: 'single'
  },
  {
    id: 'businessModel',
    question: "What type of business model are you working with?",
    options: [
      { id: 'biz-1', text: 'B2B', value: 'b2b' },
      { id: 'biz-2', text: 'B2C', value: 'b2c' },
      { id: 'biz-3', text: 'Enterprise', value: 'enterprise' },
      { id: 'biz-4', text: 'Startup', value: 'startup' },
      { id: 'biz-5', text: 'Doesn\'t matter', value: 'doesnt_matter' },
    ],
    category: 'business',
    type: 'single'
  },
  {
    id: 'learningStyle',
    question: "How do you prefer to learn?",
    options: [
      { id: 'style-1', text: 'Narrative stories and real examples', value: 'narrative' },
      { id: 'style-2', text: 'Framework-driven approaches', value: 'framework-driven' },
      { id: 'style-3', text: 'Reference-style guides and manuals', value: 'reference-style' },
      { id: 'style-4', text: 'Case studies and practical examples', value: 'case studies' },
      { id: 'style-5', text: 'Theoretical concepts and principles', value: 'theoretical' },
    ],
    category: 'style',
    type: 'single'
  },
  {
    id: 'careerStage',
    question: "What's your current career stage?",
    options: [
      { id: 'career-1', text: 'Individual Contributor', value: 'individual_contributor' },
      { id: 'career-2', text: 'Team Lead', value: 'team_lead' },
      { id: 'career-3', text: 'Manager', value: 'manager' },
      { id: 'career-4', text: 'Director', value: 'director' },
      { id: 'career-5', text: 'Executive', value: 'executive' },
    ],
    category: 'career',
    type: 'single'
  },
  {
    id: 'secondarySkills',
    question: "What secondary skills do you want to develop? (Select 2-3)",
    options: [
      { id: 'skill-1', text: 'User Research', value: 'user_research' },
      { id: 'skill-2', text: 'Data Analysis', value: 'data_analysis' },
      { id: 'skill-3', text: 'Team Management', value: 'team_management' },
      { id: 'skill-4', text: 'Product Strategy', value: 'product_strategy' },
      { id: 'skill-5', text: 'Stakeholder Management', value: 'stakeholder_management' },
      { id: 'skill-6', text: 'Prototyping', value: 'prototyping' },
      { id: 'skill-7', text: 'Metrics', value: 'metrics' },
      { id: 'skill-8', text: 'Storytelling', value: 'storytelling' },
    ],
    category: 'skills',
    type: 'multi',
    maxSelections: 3
  },
  {
    id: 'currentChallenges',
    question: "What are your biggest current challenges? (Select 1-2)",
    options: [
      { id: 'challenge-1', text: 'User Adoption', value: 'user_adoption' },
      { id: 'challenge-2', text: 'Team Alignment', value: 'team_alignment' },
      { id: 'challenge-3', text: 'Data Insights', value: 'data_insights' },
      { id: 'challenge-4', text: 'Stakeholder Buy-in', value: 'stakeholder_buy_in' },
      { id: 'challenge-5', text: 'Product-Market Fit', value: 'product_market_fit' },
      { id: 'challenge-6', text: 'Scaling Processes', value: 'scaling_processes' },
    ],
    category: 'challenges',
    type: 'multi',
    maxSelections: 2
  }
]; 