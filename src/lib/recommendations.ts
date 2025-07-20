import { QuizAnswers } from '@/types/quiz';
import { BookRecommendation } from '@/types/book';
import { getAirtableBooks } from './airtable';
import { getGPTRecommendations, getMockGPTRecommendations } from './gpt';

export async function getBookRecommendations(answers: QuizAnswers): Promise<BookRecommendation[]> {
  try {
    // Step 1: Rule-based filtering
    const allBooks = await getAirtableBooks();
    console.log(`Total books available: ${allBooks.length}`);
    
    const filteredBooks = filterBooksByAnswers(allBooks, answers);
    console.log(`Books after filtering: ${filteredBooks.length}`, filteredBooks.map(b => b.title));
    
    // If filtering is too strict, use all books
    const booksToRank = filteredBooks.length >= 3 ? filteredBooks : allBooks;
    console.log(`Books to rank: ${booksToRank.length}`);
    
    // Step 2: GPT personalization (if available)
    if (booksToRank.length > 0) {
      try {
        const personalizedRecommendations = await getGPTRecommendations(booksToRank, answers);
        console.log(`GPT recommendations: ${personalizedRecommendations.length}`);
        const result = personalizedRecommendations.slice(0, 5);
        return ensureFiveBooks(result, allBooks);
      } catch (gptError) {
        console.warn('GPT personalization failed, trying mock GPT:', gptError);
        try {
          // Try mock GPT as fallback
          const mockRecommendations = await getMockGPTRecommendations(booksToRank, answers);
          console.log(`Mock GPT recommendations: ${mockRecommendations.length}`);
          const result = mockRecommendations.slice(0, 5);
          return ensureFiveBooks(result, allBooks);
        } catch (mockError) {
          console.warn('Mock GPT also failed, using rule-based ranking:', mockError);
          // Final fallback to rule-based ranking
          const rankedBooks = rankBooksByRules(booksToRank, answers);
          console.log(`Rule-based rankings: ${rankedBooks.length}`);
          const result = rankedBooks.slice(0, 5);
          return ensureFiveBooks(result, allBooks);
        }
      }
    }
    
    // Fallback to mock data if no books found
    console.log('No books found, using mock recommendations');
    return getMockRecommendations();
  } catch (error) {
    console.error('Error in hybrid matching algorithm:', error);
    // Return mock data as final fallback
    return getMockRecommendations();
  }
}

// Helper function to ensure we always return exactly 5 books
function ensureFiveBooks(recommendations: BookRecommendation[], allBooks: BookRecommendation[]): BookRecommendation[] {
  if (recommendations.length >= 5) {
    return recommendations.slice(0, 5);
  }
  
  console.log(`Only ${recommendations.length} recommendations, padding with additional books`);
  
  // Get books that aren't already in recommendations
  const usedIds = new Set(recommendations.map(b => b.id));
  const availableBooks = allBooks.filter(book => !usedIds.has(book.id));
  
  // Add books until we have 5
  const result = [...recommendations];
  for (const book of availableBooks) {
    if (result.length >= 5) break;
    result.push(book);
  }
  
  console.log(`Final result: ${result.length} books`);
  return result.slice(0, 5);
}

function filterBooksByAnswers(books: BookRecommendation[], answers: QuizAnswers): BookRecommendation[] {
  return books.filter(book => {
    // Experience level matching
    const experienceMatch = matchExperienceLevel(book, answers.experience);
    
    // Learning goals matching
    const goalsMatch = matchLearningGoals(book, answers.goals);
    
    // Industry focus matching
    const industryMatch = matchIndustryFocus(book, answers.industry);
    
    // Learning style matching
    const styleMatch = matchLearningStyle(book, answers.learningStyle);
    
    // Return books that match at least 1 criteria (changed from 2)
    const matchCount = [experienceMatch, goalsMatch, industryMatch, styleMatch]
      .filter(Boolean).length;
    
    return matchCount >= 1; // Changed from 2 to 1
  });
}

function matchExperienceLevel(book: BookRecommendation, experience: string): boolean {
  const difficultyMap: Record<string, string[]> = {
    'beginner': ['beginner', 'fundamentals', 'intro'],
    'intermediate': ['intermediate', 'advanced', 'practical'],
    'advanced': ['advanced', 'expert', 'strategic']
  };
  
  const targetDifficulties = difficultyMap[experience] || ['beginner', 'intermediate', 'advanced'];
  const bookText = `${book.tags || ''} ${book.difficultyLevel || ''}`.toLowerCase();
  
  const match = targetDifficulties.some(difficulty => 
    bookText.includes(difficulty)
  );
  
  if (match) {
    console.log(`Experience match for "${book.title}": ${experience} matches ${bookText}`);
  }
  
  return match;
}

function matchLearningGoals(book: BookRecommendation, goals: string): boolean {
  const goalTags: Record<string, string[]> = {
    'fundamentals': ['fundamentals', 'basics', 'intro', 'principles'],
    'technical': ['technical', 'engineering', 'development', 'code'],
    'leadership': ['leadership', 'management', 'team', 'stakeholder'],
    'strategy': ['strategy', 'vision', 'planning', 'business'],
    'research': ['research', 'user research', 'analytics', 'data']
  };
  
  const targetTags = goalTags[goals] || [];
  const bookText = `${book.tags || ''} ${book.summary || ''}`.toLowerCase();
  
  const match = targetTags.some(tag => 
    bookText.includes(tag)
  );
  
  if (match) {
    console.log(`Goals match for "${book.title}": ${goals} matches ${bookText}`);
  }
  
  return match;
}

function matchIndustryFocus(book: BookRecommendation, industry: string): boolean {
  const industryTags: Record<string, string[]> = {
    'b2b': ['b2b', 'enterprise', 'saas', 'business'],
    'b2c': ['b2c', 'consumer', 'mobile', 'user'],
    'saas': ['saas', 'software', 'tech', 'platform'],
    'ecommerce': ['ecommerce', 'retail', 'shopping', 'marketplace'],
    'fintech': ['fintech', 'finance', 'banking', 'payments']
  };
  
  const targetTags = industryTags[industry] || [];
  const bookText = `${book.industryFocus || ''} ${book.tags || ''} ${book.summary || ''}`.toLowerCase();
  
  const match = targetTags.some(tag => 
    bookText.includes(tag)
  );
  
  if (match) {
    console.log(`Industry match for "${book.title}": ${industry} matches ${bookText}`);
  }
  
  return match;
}

function matchLearningStyle(book: BookRecommendation, style: string): boolean {
  const styleTags: Record<string, string[]> = {
    'practical': ['practical', 'hands-on', 'case studies', 'examples'],
    'theoretical': ['theoretical', 'concepts', 'principles', 'framework'],
    'case_studies': ['case studies', 'examples', 'stories', 'real-world'],
    'interactive': ['interactive', 'exercises', 'activities', 'workshop']
  };
  
  const targetTags = styleTags[style] || [];
  const bookText = `${book.learningStyle || ''} ${book.tags || ''} ${book.summary || ''}`.toLowerCase();
  
  const match = targetTags.some(tag => 
    bookText.includes(tag)
  );
  
  if (match) {
    console.log(`Style match for "${book.title}": ${style} matches ${bookText}`);
  }
  
  return match;
}

function rankBooksByRules(books: BookRecommendation[], answers: QuizAnswers): BookRecommendation[] {
  return books.sort((a, b) => {
    // Score based on multiple factors
    const scoreA = calculateBookScore(a, answers);
    const scoreB = calculateBookScore(b, answers);
    return scoreB - scoreA; // Higher score first
  });
}

function calculateBookScore(book: BookRecommendation, answers: QuizAnswers): number {
  let score = 0;
  
  // Base score from rating
  score += (book.goodreadsRating || 0) * 2;
  
  // Bonus for exact matches
  if (matchExperienceLevel(book, answers.experience)) score += 10;
  if (matchLearningGoals(book, answers.goals)) score += 10;
  if (matchIndustryFocus(book, answers.industry)) score += 8;
  if (matchLearningStyle(book, answers.learningStyle)) score += 8;
  
  // Bonus for popular books (higher ratings)
  if (book.goodreadsRating && book.goodreadsRating >= 4.5) score += 5;
  
  return score;
}

function getMockRecommendations(): BookRecommendation[] {
  return [
    {
      id: '1',
      title: 'Inspired: How To Create Products Customers Love',
      author: 'Marty Cagan',
      summary: 'A comprehensive guide to product management from one of the industry\'s most respected leaders.',
      goodreadsRating: 4.3,
      amazonLink: 'https://amazon.com/inspired',
      coverImage: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1348990566i/3243588.jpg',
      personalizedExplanation: 'Perfect for understanding the fundamentals of product management and customer-centric development.',
      tags: 'fundamentals, product management, customer development',
      difficultyLevel: 'beginner',
      industryFocus: 'general',
      learningStyle: 'practical'
    },
    {
      id: '2',
      title: 'The Lean Product Playbook',
      author: 'Dan Olsen',
      summary: 'A practical guide to building products that customers want using lean methodology.',
      goodreadsRating: 4.4,
      amazonLink: 'https://amazon.com/lean-product-playbook',
      coverImage: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1431451785i/25587484.jpg',
      personalizedExplanation: 'Great for learning practical, hands-on approaches to product development and validation.',
      tags: 'lean, validation, practical, product development',
      difficultyLevel: 'intermediate',
      industryFocus: 'general',
      learningStyle: 'practical'
    },
    {
      id: '3',
      title: 'Sprint: How to Solve Big Problems and Test New Ideas in Just Five Days',
      author: 'Jake Knapp',
      summary: 'A step-by-step guide to running design sprints for rapid product innovation.',
      goodreadsRating: 4.2,
      amazonLink: 'https://amazon.com/sprint',
      coverImage: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1451447476i/25814544.jpg',
      personalizedExplanation: 'Excellent for learning rapid prototyping and problem-solving techniques.',
      tags: 'design sprint, innovation, rapid prototyping',
      difficultyLevel: 'intermediate',
      industryFocus: 'general',
      learningStyle: 'practical'
    },
    {
      id: '4',
      title: 'Product-Led Growth: How to Build a Product That Sells Itself',
      author: 'Wes Bush',
      summary: 'A comprehensive guide to building products that drive their own growth through user experience.',
      goodreadsRating: 4.5,
      amazonLink: 'https://amazon.com/product-led-growth',
      coverImage: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1553273605i/44770129.jpg',
      personalizedExplanation: 'Perfect for understanding modern growth strategies and product-led business models.',
      tags: 'growth, product-led, strategy, saas',
      difficultyLevel: 'intermediate',
      industryFocus: 'saas',
      learningStyle: 'theoretical'
    },
    {
      id: '5',
      title: 'The Mom Test: How to talk to customers & learn if your business is a good idea when everyone is lying to you',
      author: 'Rob Fitzpatrick',
      summary: 'A practical guide to customer development and getting honest feedback from potential customers.',
      goodreadsRating: 4.3,
      amazonLink: 'https://amazon.com/mom-test',
      coverImage: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1373639343i/18528861.jpg',
      personalizedExplanation: 'Essential for learning how to conduct effective customer interviews and validation.',
      tags: 'customer development, interviews, validation, research',
      difficultyLevel: 'beginner',
      industryFocus: 'general',
      learningStyle: 'practical'
    }
  ];
} 