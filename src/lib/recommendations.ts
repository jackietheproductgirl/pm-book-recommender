import { QuizAnswers } from '@/types/quiz';
import { BookRecommendation } from '@/types/book';
import { getAirtableBooks } from './airtable';
import { getGPTRecommendations, getMockGPTRecommendations } from './gpt';

export async function getBookRecommendations(answers: QuizAnswers): Promise<BookRecommendation[]> {
  console.log('Getting book recommendations for answers:', answers);
  
  const books = await getAirtableBooks();
  console.log(`Total books available: ${books.length}`);
  
  // Calculate weighted scores for all books
  const scoredBooks = books.map(book => {
    const score = calculateWeightedScore(book, answers);
    console.log(`"${book.title}" - Final weighted score: ${score}`);
    return { ...book, score };
  });
  
  // Sort by score (highest first) and take top 5
  const topBooks = scoredBooks
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
  
  console.log('Top 5 books by weighted score:', topBooks.map(book => `${book.title} (score: ${book.score})`));
  
  // Return books with scores for debugging
  return topBooks.map(book => ({
    ...book,
    score: book.score
  }));
}

function calculateWeightedScore(book: BookRecommendation, answers: QuizAnswers): number {
  const bookTags = book.tags?.split(', ').map(t => t.trim().toLowerCase()) || [];
  
  // Calculate scores for each matching category
  const primaryScore = calculatePrimaryScore(book, answers, bookTags);
  const secondaryScore = calculateSecondaryScore(book, answers, bookTags);
  const contextScore = calculateContextScore(book, answers, bookTags);
  const careerStageScore = calculateCareerStageScore(book, answers, bookTags);
  
  // Apply weights (40-30-20-10)
  const weightedScore = 
    (primaryScore * 0.4) + 
    (secondaryScore * 0.3) + 
    (contextScore * 0.2) + 
    (careerStageScore * 0.1);
  
  console.log(`"${book.title}" - Primary: ${primaryScore}, Secondary: ${secondaryScore}, Context: ${contextScore}, Career: ${careerStageScore}, Weighted: ${weightedScore}`);
  
  return weightedScore;
}

// Primary Matching (40% weight) - Exact tag matching for primary focus area
function calculatePrimaryScore(book: BookRecommendation, answers: QuizAnswers, bookTags: string[]): number {
  let score = 0;
  
  // Map primary focus to book tags
  const focusTagMap: Record<string, string[]> = {
    'ux_design': ['design & ux', 'design', 'ux', 'user experience'],
    'leadership': ['leadership', 'management', 'stakeholder management'],
    'data_analytics': ['data & analytics', 'analytics', 'metrics', 'data science'],
    'strategy': ['product strategy', 'strategy', 'vision', 'planning'],
    'discovery_research': ['discovery', 'user research', 'research', 'design & ux'],
    'go_to_market': ['go-to-market', 'marketing', 'growth', 'launch']
  };
  
  const targetTags = focusTagMap[answers.primaryFocus] || [];
  
  // Exact tag matches (highest priority)
  bookTags.forEach(tag => {
    if (targetTags.includes(tag)) {
      score += 30; // High score for exact primary focus matches
      console.log(`Primary focus match for "${book.title}": ${tag} (score: +30)`);
    }
  });
  
  // Partial matches
  bookTags.forEach(tag => {
    targetTags.forEach(targetTag => {
      if (tag.includes(targetTag) || targetTag.includes(tag)) {
        score += 15; // Medium score for partial matches
        console.log(`Primary focus partial match for "${book.title}": ${tag} ~ ${targetTag} (score: +15)`);
      }
    });
  });
  
  return score;
}

// Secondary Matching (30% weight) - Multi-select skills, challenges, and learning style
function calculateSecondaryScore(book: BookRecommendation, answers: QuizAnswers, bookTags: string[]): number {
  let score = 0;
  
  // Map secondary skills to exact tag groupings
  const skillTagMap: Record<string, string[]> = {
    'user_research': ['user research', 'usability testing', 'user interviews', 'user personas', 'customer discovery', 'market validation', 'surveys', 'focus groups', 'ethnographic research', 'jobs-to-be-done', 'problem validation'],
    'data_analysis': ['metrics & kpis', 'a/b testing', 'data analysis', 'user analytics', 'conversion optimization', 'funnel analysis', 'cohort analysis', 'business intelligence', 'data visualization', 'experimentation'],
    'team_management': ['team management', 'stakeholder management', 'cross-functional collaboration', 'executive communication', 'conflict resolution', 'mentoring', 'decision making', 'influence without authority', 'change management', 'strategic leadership', 'product leadership', 'organizational design'],
    'product_strategy': ['product positioning', 'go-to-market strategy', 'business model', 'pricing strategy', 'product roadmap', 'feature prioritization', 'product-market fit', 'value proposition', 'strategic thinking'],
    'stakeholder_management': ['stakeholder management', 'executive communication', 'influence without authority', 'cross-functional collaboration', 'conflict resolution'],
    'prototyping': ['wireframing', 'prototyping', 'visual design', 'interaction design', 'information architecture', 'design thinking', 'design systems', 'design sprint'],
    'metrics': ['metrics & kpis', 'a/b testing', 'data analysis', 'user analytics', 'conversion optimization', 'funnel analysis', 'cohort analysis', 'business intelligence', 'data visualization', 'experimentation'],
    'storytelling': ['presentation skills', 'storytelling', 'written communication', 'public speaking']
  };
  
  // Map challenges to exact tag groupings
  const challengeTagMap: Record<string, string[]> = {
    'user_adoption': ['user research', 'usability testing', 'user interviews', 'user personas', 'user experience', 'accessibility', 'design thinking'],
    'team_alignment': ['team management', 'stakeholder management', 'cross-functional collaboration', 'executive communication', 'conflict resolution', 'mentoring', 'change management'],
    'data_insights': ['metrics & kpis', 'a/b testing', 'data analysis', 'user analytics', 'conversion optimization', 'funnel analysis', 'cohort analysis', 'business intelligence', 'data visualization', 'experimentation'],
    'stakeholder_buy_in': ['stakeholder management', 'executive communication', 'influence without authority', 'cross-functional collaboration', 'presentation skills', 'storytelling'],
    'product_market_fit': ['customer discovery', 'market validation', 'product-market fit', 'problem validation', 'jobs-to-be-done', 'value proposition'],
    'scaling_processes': ['agile methodology', 'scrum', 'kanban', 'lean startup', 'continuous discovery', 'continuous delivery', 'product development lifecycle']
  };
  
  // Map learning style to book learning style
  const learningStyleMap: Record<string, string[]> = {
    'narrative': ['narrative'],
    'framework-driven': ['framework-driven'],
    'reference-style': ['reference-style'],
    'case studies': ['case studies'],
    'theoretical': ['theoretical']
  };
  
  // Calculate skill matches with partial credit
  if (answers.secondarySkills) {
    answers.secondarySkills.forEach(skill => {
      const targetTags = skillTagMap[skill] || [];
      let skillScore = 0;
      
      bookTags.forEach(tag => {
        if (targetTags.includes(tag)) {
          skillScore += 20; // Exact match
        } else {
          targetTags.forEach(targetTag => {
            if (tag.includes(targetTag) || targetTag.includes(tag)) {
              skillScore += 10; // Partial match
            }
          });
        }
      });
      
      // Add partial credit for each skill
      score += skillScore / answers.secondarySkills.length;
    });
  }
  
  // Calculate challenge matches with partial credit
  if (answers.currentChallenges) {
    answers.currentChallenges.forEach(challenge => {
      const targetTags = challengeTagMap[challenge] || [];
      let challengeScore = 0;
      
      bookTags.forEach(tag => {
        if (targetTags.includes(tag)) {
          challengeScore += 15; // Exact match
        } else {
          targetTags.forEach(targetTag => {
            if (tag.includes(targetTag) || targetTag.includes(tag)) {
              challengeScore += 8; // Partial match
            }
          });
        }
      });
      
      // Add partial credit for each challenge
      score += challengeScore / answers.currentChallenges.length;
    });
  }
  
  // Calculate learning style match
  if (answers.learningStyle) {
    const targetLearningStyles = learningStyleMap[answers.learningStyle] || [];
    const bookLearningStyle = book.learningStyle?.toLowerCase() || '';
    
    if (targetLearningStyles.includes(bookLearningStyle)) {
      score += 25; // High score for learning style match
      console.log(`Learning style match for "${book.title}": ${bookLearningStyle} (score: +25)`);
    }
  }
  
  return score;
}

// Context Matching (20% weight) - Business model alignment
function calculateContextScore(book: BookRecommendation, answers: QuizAnswers, bookTags: string[]): number {
  // If user doesn't care about business model, return 0
  if (answers.businessModel === 'doesnt_matter') {
    console.log(`Business model doesn't matter for user, context score: 0`);
    return 0;
  }
  
  let score = 0;
  
  // Map business model to book tags
  const businessTagMap: Record<string, string[]> = {
    'b2b': ['b2b', 'enterprise', 'saas', 'business'],
    'b2c': ['b2c', 'consumer', 'mobile', 'user'],
    'enterprise': ['enterprise', 'b2b', 'saas', 'business'],
    'startup': ['startup', 'lean startup', 'growth', 'launch']
  };
  
  const targetTags = businessTagMap[answers.businessModel] || [];
  
  // Exact matches
  bookTags.forEach(tag => {
    if (targetTags.includes(tag)) {
      score += 25; // High score for business model matches
      console.log(`Business model match for "${book.title}": ${tag} (score: +25)`);
    }
  });
  
  // Partial matches
  bookTags.forEach(tag => {
    targetTags.forEach(targetTag => {
      if (tag.includes(targetTag) || targetTag.includes(tag)) {
        score += 12; // Medium score for partial matches
        console.log(`Business model partial match for "${book.title}": ${tag} ~ ${targetTag} (score: +12)`);
      }
    });
  });
  
  return score;
}

// Career Stage Matching (10% weight) - Experience-appropriate content
function calculateCareerStageScore(book: BookRecommendation, answers: QuizAnswers, bookTags: string[]): number {
  let score = 0;
  
  // Map career stage to book tags and difficulty
  const careerTagMap: Record<string, { tags: string[], difficulty: string[] }> = {
    'individual_contributor': {
      tags: ['fundamentals', 'technical skills', 'product strategy'],
      difficulty: ['beginner', 'intermediate']
    },
    'team_lead': {
      tags: ['leadership', 'management', 'stakeholder management', 'product strategy'],
      difficulty: ['intermediate']
    },
    'manager': {
      tags: ['leadership', 'management', 'stakeholder management', 'strategy'],
      difficulty: ['intermediate', 'advanced']
    },
    'director': {
      tags: ['leadership', 'strategy', 'stakeholder management'],
      difficulty: ['advanced']
    },
    'executive': {
      tags: ['leadership', 'strategy', 'vision'],
      difficulty: ['advanced']
    }
  };
  
  // Map experience level to difficulty preferences
  const experienceDifficultyMap: Record<string, string[]> = {
    'beginner': ['beginner'],
    'junior': ['beginner', 'intermediate'],
    'senior': ['intermediate', 'advanced']
  };
  
  const careerInfo = careerTagMap[answers.careerStage];
  const experienceDifficulties = experienceDifficultyMap[answers.experience] || [];
  
  // Tag matches from career stage
  if (careerInfo) {
    bookTags.forEach(tag => {
      if (careerInfo.tags.includes(tag)) {
        score += 15; // Exact career stage match
        console.log(`Career stage match for "${book.title}": ${tag} (score: +15)`);
      }
    });
  }
  
  // Difficulty level matching based on experience level
  const bookDifficulty = book.difficultyLevel?.toLowerCase() || '';
  if (experienceDifficulties.includes(bookDifficulty)) {
    score += 20; // Higher score for appropriate difficulty level
    console.log(`Experience difficulty match for "${book.title}": ${bookDifficulty} (score: +20)`);
  }
  
  return score;
}

// Helper function to ensure we always return exactly 5 books
function ensureFiveBooks(recommendations: BookRecommendation[], allBooks: BookRecommendation[]): BookRecommendation[] {
  if (recommendations.length >= 5) {
    return recommendations.slice(0, 5);
  }
  
  // If we don't have enough recommendations, add some fallback books
  const usedIds = new Set(recommendations.map(book => book.id));
  const fallbackBooks = allBooks
    .filter(book => !usedIds.has(book.id))
    .sort((a, b) => (b.goodreadsRating || 0) - (a.goodreadsRating || 0))
    .slice(0, 5 - recommendations.length);
  
  const result = [...recommendations, ...fallbackBooks];
  return result.slice(0, 5);
} 