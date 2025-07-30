const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

// Google Books API functions with better search strategies
async function getBookCoverImage(title, author) {
  try {
    // Clean the title - remove common suffixes that might cause mismatches
    let cleanTitle = title
      .replace(/:\s*[^:]*$/, '') // Remove subtitle after colon
      .replace(/\s*\([^)]*\)/g, '') // Remove text in parentheses
      .replace(/\s*Revised and Expanded Edition/, '')
      .replace(/\s*Original Classic Edition/, '')
      .replace(/\s*Expanded Edition/, '')
      .trim();
    
    // Try different search strategies
    const searchStrategies = [
      `"${cleanTitle}"`, // Exact title match
      `"${cleanTitle}" ${author || ''}`.trim(), // Title + author
      cleanTitle, // Just the clean title
      title.replace(/:\s*[^:]*$/, '').trim() // Title without subtitle
    ];
    
    for (const searchQuery of searchStrategies) {
      if (!searchQuery.trim()) continue;
      
      const encodedQuery = encodeURIComponent(searchQuery);
      const url = `https://www.googleapis.com/books/v1/volumes?q=${encodedQuery}&maxResults=5`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Google Books API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.items && data.items.length > 0) {
        // Find the best match by comparing titles
        let bestMatch = null;
        let bestScore = 0;
        
        for (const item of data.items) {
          const itemTitle = item.volumeInfo.title.toLowerCase();
          const searchTitle = cleanTitle.toLowerCase();
          
          // Calculate similarity score
          let score = 0;
          if (itemTitle === searchTitle) score = 100;
          else if (itemTitle.includes(searchTitle) || searchTitle.includes(itemTitle)) score = 80;
          else if (itemTitle.split(' ').some(word => searchTitle.includes(word))) score = 60;
          
          if (score > bestScore) {
            bestScore = score;
            bestMatch = item;
          }
        }
        
        // Only use if we have a good match (score > 50)
        if (bestMatch && bestScore > 50) {
          const imageLinks = bestMatch.volumeInfo.imageLinks;
          
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
        }
      }
    }
    
    console.warn(`No accurate match found for: ${title}`);
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

// Fix the book covers with more accurate matching
async function fixBookCovers() {
  console.log('Reading current CSV file...');
  
  const books = await readCSVFile('complete-75-books-with-covers.csv');
  console.log(`Processing ${books.length} books...`);
  
  const updatedBooks = [];
  
  for (let i = 0; i < books.length; i++) {
    const book = books[i];
    console.log(`\nProcessing book ${i + 1}/${books.length}: ${book.title}`);
    
    let coverImage = book.cover_image;
    
    // Skip if we already have a cover image (unless it's empty)
    if (coverImage && !coverImage.includes('google.com')) {
      console.log(`  ✓ Using existing cover: ${coverImage}`);
      updatedBooks.push(book);
      continue;
    }
    
    // Try to get cover image with better accuracy
    const newCoverImage = await getBookCoverImage(book.title, book.author);
    if (newCoverImage) {
      book.cover_image = newCoverImage;
      console.log(`  ✓ Found accurate cover: ${newCoverImage}`);
    } else {
      console.log(`  ✗ No accurate cover found for: ${book.title}`);
      book.cover_image = ''; // Clear any incorrect covers
    }
    
    updatedBooks.push(book);
    
    // Add a small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  // Write the updated CSV
  const csvWriter = createCsvWriter({
    path: 'complete-75-books-with-accurate-covers.csv',
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
  
  await csvWriter.writeRecords(updatedBooks);
  console.log('\nUpdated database saved to: complete-75-books-with-accurate-covers.csv');
  
  return updatedBooks;
}

// Main execution
async function main() {
  try {
    await fixBookCovers();
    console.log('\n=== Complete! ===');
  } catch (error) {
    console.error('Error:', error);
  }
}

if (require.main === module) {
  main();
}

module.exports = { fixBookCovers }; 