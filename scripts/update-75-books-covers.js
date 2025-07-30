const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

// Google Books API functions
async function getBookCoverImage(title, author) {
  try {
    const searchQuery = encodeURIComponent(`${title} ${author || ''}`.trim());
    const url = `https://www.googleapis.com/books/v1/volumes?q=${searchQuery}&maxResults=1`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Google Books API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.items || data.items.length === 0) {
      console.warn(`No book found for: ${title} by ${author}`);
      return null;
    }
    
    const book = data.items[0];
    const imageLinks = book.volumeInfo.imageLinks;
    
    // Return the best available image
    if (imageLinks?.large) {
      return imageLinks.large;
    } else if (imageLinks?.medium) {
      return imageLinks.medium;
    } else if (imageLinks?.small) {
      return imageLinks.small;
    } else if (imageLinks?.thumbnail) {
      return imageLinks.thumbnail;
    } else if (imageLinks?.smallThumbnail) {
      return imageLinks.smallThumbnail;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching book cover from Google Books:', error);
    return null;
  }
}

async function getBookCoverByISBN(isbn) {
  try {
    const url = `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}&maxResults=1`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Google Books API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.items || data.items.length === 0) {
      console.warn(`No book found for ISBN: ${isbn}`);
      return null;
    }
    
    const book = data.items[0];
    const imageLinks = book.volumeInfo.imageLinks;
    
    // Return the best available image
    if (imageLinks?.large) {
      return imageLinks.large;
    } else if (imageLinks?.medium) {
      return imageLinks.medium;
    } else if (imageLinks?.small) {
      return imageLinks.small;
    } else if (imageLinks?.thumbnail) {
      return imageLinks.thumbnail;
    } else if (imageLinks?.smallThumbnail) {
      return imageLinks.smallThumbnail;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching book cover by ISBN:', error);
    return null;
  }
}

function extractISBNFromAmazonUrl(amazonUrl) {
  // Try to extract ISBN from various Amazon URL formats
  const patterns = [
    /\/dp\/([0-9X]{10,13})/, // Standard ASIN/ISBN format
    /\/product\/([0-9X]{10,13})/, // Product format
    /isbn=([0-9X]{10,13})/, // ISBN parameter
  ];
  
  for (const pattern of patterns) {
    const match = amazonUrl.match(pattern);
    if (match) {
      return match[1];
    }
  }
  
  return null;
}

// Read CSV file and return data as array
function readCSVFile(filePath) {
  return new Promise((resolve, reject) => {
    const data = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        data.push(row);
      })
      .on('end', () => {
        resolve(data);
      })
      .on('error', reject);
  });
}

// Merge the updated CSV files and add cover images
async function createCompleteBookDatabase() {
  console.log('Reading updated CSV files...');
  
  // Read the updated CSV files
  const difficultyData = await readCSVFile('updated-book-difficulty-learning.csv');
  const tagsData = await readCSVFile('updated-book-tags.csv');
  
  console.log(`Found ${difficultyData.length} books in difficulty file`);
  console.log(`Found ${tagsData.length} books in tags file`);
  
  // Create a map for quick lookup
  const difficultyMap = new Map(difficultyData.map(book => [book.title, book]));
  const tagsMap = new Map(tagsData.map(book => [book.title, book]));
  
  // Merge the data
  const mergedBooks = [];
  const allTitles = new Set([...difficultyData.map(b => b.title), ...tagsData.map(b => b.title)]);
  
  for (const title of allTitles) {
    const difficulty = difficultyMap.get(title);
    const tags = tagsMap.get(title);
    
    if (difficulty && tags) {
      mergedBooks.push({
        title: title,
        difficulty_level: difficulty.difficulty_level,
        learning_style: difficulty.learning_style,
        tags: tags.tags
      });
    }
  }
  
  console.log(`Merged ${mergedBooks.length} books`);
  
  // Add mock data for missing fields (you can update these later)
  const completeBooks = mergedBooks.map((book, index) => ({
    id: (index + 1).toString(),
    title: book.title,
    author: 'Author TBD', // You'll need to add authors
    summary: 'Summary TBD', // You'll need to add summaries
    goodreads_rating: 4.0, // Default rating
    amazon_link: `https://amazon.com/dp/${Math.random().toString(36).substr(2, 10)}`, // Placeholder
    cover_image: '', // Will be populated by API
    personalized_explanation: 'Personalized explanation TBD',
    tags: book.tags,
    difficulty_level: book.difficulty_level,
    industry_focus: 'general', // Default
    learning_style: book.learning_style
  }));
  
  // Now fetch cover images for all books
  console.log('\nFetching cover images for all books...');
  
  for (let i = 0; i < completeBooks.length; i++) {
    const book = completeBooks[i];
    console.log(`Processing book ${i + 1}/${completeBooks.length}: ${book.title}`);
    
    // Try to get cover image by title and author
    const coverImage = await getBookCoverImage(book.title, book.author);
    if (coverImage) {
      book.cover_image = coverImage;
      console.log(`  ✓ Found cover: ${coverImage}`);
    } else {
      console.log(`  ✗ No cover found for: ${book.title}`);
    }
    
    // Add a small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  // Write the complete database
  const csvWriter = createCsvWriter({
    path: 'complete-75-books-with-covers.csv',
    header: [
      { id: 'id', title: 'id' },
      { id: 'title', title: 'title' },
      { id: 'author', title: 'author' },
      { id: 'summary', title: 'summary' },
      { id: 'goodreads_rating', title: 'goodreads_rating' },
      { id: 'amazon_link', title: 'amazon_link' },
      { id: 'cover_image', title: 'cover_image' },
      { id: 'personalized_explanation', title: 'personalized_explanation' },
      { id: 'tags', title: 'tags' },
      { id: 'difficulty_level', title: 'difficulty_level' },
      { id: 'industry_focus', title: 'industry_focus' },
      { id: 'learning_style', title: 'learning_style' }
    ]
  });
  
  await csvWriter.writeRecords(completeBooks);
  console.log('\nComplete database saved to: complete-75-books-with-covers.csv');
  
  return completeBooks;
}

// Main execution
async function main() {
  try {
    await createCompleteBookDatabase();
    console.log('\n=== Complete! ===');
  } catch (error) {
    console.error('Error:', error);
  }
}

if (require.main === module) {
  main();
}

module.exports = { createCompleteBookDatabase }; 