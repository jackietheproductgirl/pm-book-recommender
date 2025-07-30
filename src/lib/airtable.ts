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
  
  // Import the complete 75 books data
  const fs = require('fs');
  const csv = require('csv-parser');
  const path = require('path');
  
  try {
    const csvPath = path.join(process.cwd(), 'complete-75-books-clean.csv');
    if (fs.existsSync(csvPath)) {
      return new Promise((resolve, reject) => {
        const books: BookRecommendation[] = [];
        
        // Load manual covers if available
        let manualCovers: Record<string, string> = {};
        try {
          const manualCoversPath = path.join(process.cwd(), 'manual-covers.json');
          if (fs.existsSync(manualCoversPath)) {
            const manualCoversData = JSON.parse(fs.readFileSync(manualCoversPath, 'utf8'));
            manualCovers = manualCoversData.manual_covers || {};
            console.log(`Loaded ${Object.keys(manualCovers).length} manual cover images`);
          }
        } catch (error) {
          console.warn('Could not load manual covers:', error);
        }
        
        fs.createReadStream(csvPath)
          .pipe(csv())
          .on('data', (row: any) => {
            // Check if we have a manual cover for this book
            const manualCover = manualCovers[row.title];
            
            books.push({
              id: row.id,
              title: row.title,
              author: row.author,
              summary: row.summary,
              goodreadsRating: parseFloat(row.goodreads_rating) || 4.0,
              amazonLink: row.amazon_link,
              coverImage: manualCover || row.cover_image || undefined,
              personalizedExplanation: row.personalized_explanation,
              tags: row.tags,
              difficultyLevel: row.difficulty_level,
              industryFocus: row.industry_focus,
              learningStyle: row.learning_style
            });
          })
          .on('end', () => {
            console.log(`Loaded ${books.length} books from complete database`);
            resolve(books);
          })
          .on('error', reject);
      });
    } else {
      console.warn('Complete database CSV not found, using fallback data');
      return getFallbackData();
    }
  } catch (error) {
    console.error('Error loading complete database:', error);
    return getFallbackData();
  }
}

function getFallbackData(): BookRecommendation[] {
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