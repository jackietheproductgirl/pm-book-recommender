import { BookRecommendation } from '@/types/book';
import { QuizAnswers } from '@/types/quiz';

export async function getGPTRecommendations(
  books: BookRecommendation[], 
  answers: QuizAnswers
): Promise<BookRecommendation[]> {
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

  if (!OPENAI_API_KEY) {
    console.warn('OpenAI API key not configured, skipping GPT personalization');
    throw new Error('OpenAI API key not configured');
  }

  try {
    const prompt = createRecommendationPrompt(books, answers);
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful product management book recommendation assistant. You provide personalized book recommendations based on user preferences and learning goals.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const gptResponse = data.choices[0]?.message?.content;

    if (!gptResponse) {
      throw new Error('No response from GPT API');
    }

    return parseGPTResponse(books, gptResponse);
  } catch (error) {
    console.error('Error calling GPT API:', error);
    throw error;
  }
}

function createRecommendationPrompt(books: BookRecommendation[], answers: QuizAnswers): string {
  const bookList = books.map(book => 
    `- "${book.title}" by ${book.author} (ID: ${book.id}, Rating: ${book.goodreadsRating}/5, Tags: ${book.tags || 'none'}, Difficulty: ${book.difficultyLevel || 'unknown'}, Industry: ${book.industryFocus || 'general'}, Style: ${book.learningStyle || 'general'})`
  ).join('\n');

  return `
I need personalized book recommendations for a product manager based on their quiz answers.

User Profile:
- Experience Level: ${answers.experience}
- Learning Goals: ${answers.goals}
- Industry Focus: ${answers.industry}
- Learning Style: ${answers.learningStyle}

Available Books:
${bookList}

Please:
1. Select the top 5 most relevant books for this user
2. Rank them from most to least relevant
3. Provide a unique, personalized explanation for each book (2-3 sentences) explaining why it's perfect for their specific situation
4. Make each explanation different and specific to the book's content and the user's profile
5. Return your response in this exact JSON format:

{
  "recommendations": [
    {
      "bookId": "rec1iCSA8XOuC3TV8",
      "personalizedExplanation": "This book is perfect for you because..."
    }
  ]
}

IMPORTANT: 
- Use the exact book IDs provided (like "rec1iCSA8XOuC3TV8")
- Make each explanation unique and specific to the book's content
- Consider their experience level, learning goals, industry focus, and learning style
- Be encouraging and specific about how each book will help their PM journey
- Focus on practical benefits and real-world applications
`;
}

function parseGPTResponse(books: BookRecommendation[], gptResponse: string): BookRecommendation[] {
  try {
    // Try to extract JSON from the response
    const jsonMatch = gptResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in GPT response');
    }

    const parsed = JSON.parse(jsonMatch[0]);
    const recommendations = parsed.recommendations || [];

    console.log('GPT response parsed:', parsed);
    console.log('Found recommendations:', recommendations.length);

    // Map GPT recommendations back to book objects
    const mappedBooks = recommendations
              .map((rec: Record<string, any>) => {
        console.log('Looking for book with ID:', rec.bookId);
        const book = books.find(b => b.id === rec.bookId);
        if (!book) {
          console.log('Book not found for ID:', rec.bookId);
          return null;
        }

        console.log('Found book:', book.title, 'with explanation:', rec.personalizedExplanation);
        return {
          ...book,
          personalizedExplanation: rec.personalizedExplanation || book.personalizedExplanation,
        };
      })
      .filter(Boolean);

    console.log('Successfully mapped books:', mappedBooks.length);
    return mappedBooks.slice(0, 5); // Ensure we only return top 5
  } catch (error) {
    console.error('Error parsing GPT response:', error);
    console.log('Raw GPT response:', gptResponse);
    
    // Fallback: return books with original explanations
    return books.slice(0, 5);
  }
}

// Mock GPT function for testing without API key
export async function getMockGPTRecommendations(
  books: BookRecommendation[], 
  answers: QuizAnswers
): Promise<BookRecommendation[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Create personalized explanations based on quiz answers
  const personalizedBooks = books.slice(0, 5).map(book => ({
    ...book,
    personalizedExplanation: generatePersonalizedExplanation(book, answers),
  }));

  return personalizedBooks;
}

function generatePersonalizedExplanation(book: BookRecommendation, answers: QuizAnswers): string {
  const explanations: Record<string, string> = {
    'ux_design': 'Perfect for developing design thinking and user experience skills.',
    'leadership': 'Excellent for developing leadership skills and learning how to manage teams and stakeholders.',
    'data_analytics': 'Great for developing data-driven decision making and analytical skills.',
    'strategy': 'Ideal for learning strategic thinking and long-term product vision.',
    'discovery_research': 'Perfect for mastering user research and data-driven decision making.',
    'go_to_market': 'Excellent for learning go-to-market strategies and product launch.',
  };

  const baseExplanation = explanations[answers.primaryFocus] || 'A valuable resource for your product management journey.';
  
  const experienceContext: Record<string, string> = {
    'beginner': 'As someone new to product management, ',
    'junior': 'With your growing experience, ',
    'senior': 'Given your advanced level, ',
  };

  const prefix = experienceContext[answers.experience] || '';

  return `${prefix}${baseExplanation}`;
} 