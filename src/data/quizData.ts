export interface QuizQuestion {
  id: string;
  question: string;
  options: QuizOption[];
  category: 'experience' | 'goals' | 'industry' | 'style';
}

export interface QuizOption {
  id: string;
  text: string;
  value: string;
}

export interface QuizAnswer {
  questionId: string;
  answer: string;
}

export const quizQuestions: QuizQuestion[] = [
  {
    id: 'experience',
    question: "What's your current experience level with product management?",
    options: [
      { id: 'exp-0', text: 'I\'m completely new to PM', value: 'beginner' },
      { id: 'exp-1', text: 'I\'m a career switcher exploring PM', value: 'career_switcher' },
      { id: 'exp-2', text: 'I have 0-1 years of PM experience', value: 'junior' },
      { id: 'exp-3', text: 'I have 1-2 years of PM experience', value: 'intermediate' },
    ],
    category: 'experience'
  },
  {
    id: 'goals',
    question: "What's your primary learning goal right now?",
    options: [
      { id: 'goal-1', text: 'Understanding PM fundamentals', value: 'fundamentals' },
      { id: 'goal-2', text: 'Building technical skills', value: 'technical' },
      { id: 'goal-3', text: 'Developing leadership abilities', value: 'leadership' },
      { id: 'goal-4', text: 'Learning strategy and vision', value: 'strategy' },
      { id: 'goal-5', text: 'Improving user research skills', value: 'research' },
    ],
    category: 'goals'
  },
  {
    id: 'industry',
    question: "What type of product are you most interested in?",
    options: [
      { id: 'ind-1', text: 'B2B/SaaS products', value: 'b2b_saas' },
      { id: 'ind-2', text: 'B2C consumer apps', value: 'b2c' },
      { id: 'ind-3', text: 'Enterprise software', value: 'enterprise' },
      { id: 'ind-4', text: 'Mobile apps', value: 'mobile' },
      { id: 'ind-5', text: 'I\'m not sure yet', value: 'general' },
    ],
    category: 'industry'
  },
  {
    id: 'style',
    question: "How do you prefer to learn?",
    options: [
      { id: 'style-1', text: 'Practical, hands-on examples', value: 'practical' },
      { id: 'style-2', text: 'Theoretical frameworks and concepts', value: 'theoretical' },
      { id: 'style-3', text: 'Real case studies and stories', value: 'case_studies' },
      { id: 'style-4', text: 'Step-by-step guides and processes', value: 'step_by_step' },
    ],
    category: 'style'
  },
  {
    id: 'focus',
    question: "What area do you want to focus on most?",
    options: [
      { id: 'focus-1', text: 'Product strategy and vision', value: 'strategy' },
      { id: 'focus-2', text: 'User experience and design', value: 'ux_design' },
      { id: 'focus-3', text: 'Data analysis and metrics', value: 'analytics' },
      { id: 'focus-4', text: 'Stakeholder management', value: 'stakeholder' },
      { id: 'focus-5', text: 'Agile and development processes', value: 'processes' },
    ],
    category: 'goals'
  }
]; 