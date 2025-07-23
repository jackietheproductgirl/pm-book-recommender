import { BookRecommendation } from '@/types/book';

// Cache for Airtable data
let cachedBooks: BookRecommendation[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

export async function getAirtableBooks(): Promise<BookRecommendation[]> {
  // Check cache first
  if (cachedBooks && Date.now() - cacheTimestamp < CACHE_DURATION) {
    console.log('Using cached Airtable books:', cachedBooks.length);
    return cachedBooks;
  }

  try {
    // Try real Airtable API first
    console.log('Fetching from real Airtable API...');
    const books = await fetchFromAirtable();
    console.log('Real Airtable data received:', books.length, 'books');
    console.log('Sample book:', books[0]);
    
    // Update cache
    cachedBooks = books;
    cacheTimestamp = Date.now();
    return books;
  } catch (error) {
    console.error('Error fetching Airtable books, falling back to mock data:', error);
    // Fallback to mock data
    console.log('Using mock Airtable data as fallback');
    const books = await getMockAirtableData();
    cachedBooks = books;
    cacheTimestamp = Date.now();
    return books;
  }
}

async function getMockAirtableData(): Promise<BookRecommendation[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
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
    },
    {
      id: '6',
      title: 'Hooked: How to Build Habit-Forming Products',
      author: 'Nir Eyal',
      summary: 'A guide to building products that create user habits and drive engagement.',
      goodreadsRating: 4.1,
      amazonLink: 'https://amazon.com/hooked',
      coverImage: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1407123964i/22668729.jpg',
      personalizedExplanation: 'Great for understanding user psychology and building engaging products.',
      tags: 'psychology, engagement, habits, user behavior',
      difficultyLevel: 'intermediate',
      industryFocus: 'b2c',
      learningStyle: 'theoretical'
    },
    {
      id: '7',
      title: 'The Design of Everyday Things',
      author: 'Don Norman',
      summary: 'A foundational book on design thinking and user experience principles.',
      goodreadsRating: 4.2,
      amazonLink: 'https://amazon.com/design-everyday-things',
      coverImage: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1328831036i/840.jpg',
      personalizedExplanation: 'Essential for understanding design principles and user-centered thinking.',
      tags: 'design, ux, user experience, design thinking',
      difficultyLevel: 'beginner',
      industryFocus: 'general',
      learningStyle: 'theoretical'
    },
    {
      id: '8',
      title: 'Measure What Matters',
      author: 'John Doerr',
      summary: 'A guide to OKRs (Objectives and Key Results) for goal setting and measurement.',
      goodreadsRating: 4.0,
      amazonLink: 'https://amazon.com/measure-what-matters',
      coverImage: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1527005719i/39286958.jpg',
      personalizedExplanation: 'Perfect for learning how to set and measure goals effectively.',
      tags: 'okrs, goals, measurement, strategy',
      difficultyLevel: 'intermediate',
      industryFocus: 'general',
      learningStyle: 'practical'
    }
  ];
}

// TODO: Implement actual Airtable API integration
export async function fetchFromAirtable(): Promise<BookRecommendation[]> {
  const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
  const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
  const AIRTABLE_TABLE_NAME = process.env.AIRTABLE_TABLE_NAME || 'Books';

  console.log('Airtable config:', {
    hasApiKey: !!AIRTABLE_API_KEY,
    baseId: AIRTABLE_BASE_ID,
    tableName: AIRTABLE_TABLE_NAME
  });

  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
    console.warn('Airtable credentials not configured, using mock data');
    return getMockAirtableData();
  }

  try {
    const encodedTableName = encodeURIComponent(AIRTABLE_TABLE_NAME);
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodedTableName}`;
    console.log('Fetching from Airtable URL:', url);
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Airtable response status:', response.status);

    if (!response.ok) {
      throw new Error(`Airtable API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Raw Airtable data:', data);
    console.log('Number of records:', data.records?.length || 0);
    
    const books = data.records.map((record: any) => {
      const book = {
        id: record.id,
        title: record.fields.title || '',
        author: record.fields.author || '',
        summary: record.fields.summary || '',
        goodreadsRating: record.fields.goodreads_rating || 0,
        amazonLink: record.fields.amazon_link || '',
        coverImage: record.fields.cover_image || '',
        personalizedExplanation: record.fields.personalized_explanation || '',
        tags: record.fields.tags?.join(', ') || '',
        difficultyLevel: record.fields.difficulty_level || '',
        industryFocus: record.fields.industry_focus?.join(', ') || '',
        learningStyle: record.fields.learning_style?.join(', ') || '',
      };
      console.log('Parsed book:', book);
      return book;
    });
    
    console.log('Final parsed books:', books.length);
    return books;
  } catch (error) {
    console.error('Error fetching from Airtable:', error);
    throw error;
  }
} 