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

async function updateBookCovers(csvFilePath) {
  const books = [];
  
  // Read the CSV file
  return new Promise((resolve, reject) => {
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (row) => {
        books.push(row);
      })
      .on('end', async () => {
        console.log(`Processing ${books.length} books from ${csvFilePath}`);
        
        const updatedBooks = [];
        
        for (let i = 0; i < books.length; i++) {
          const book = books[i];
          console.log(`Processing book ${i + 1}/${books.length}: ${book.title}`);
          
          let coverImage = book.cover_image;
          
          // If no cover image exists or it's a placeholder, try to fetch one
          if (!coverImage || coverImage.includes('placeholder') || coverImage.includes('goodreads.com/books/1328831036i/840.jpg')) {
            // First try by ISBN from Amazon URL
            const isbn = extractISBNFromAmazonUrl(book.amazon_link);
            if (isbn) {
              const isbnCover = await getBookCoverByISBN(isbn);
              if (isbnCover) {
                coverImage = isbnCover;
                console.log(`  ✓ Found cover by ISBN: ${isbnCover}`);
              }
            }
            
            // If still no cover, try by title and author
            if (!coverImage || coverImage.includes('placeholder') || coverImage.includes('goodreads.com/books/1328831036i/840.jpg')) {
              const titleCover = await getBookCoverImage(book.title, book.author);
              if (titleCover) {
                coverImage = titleCover;
                console.log(`  ✓ Found cover by title: ${titleCover}`);
              } else {
                console.log(`  ✗ No cover found for: ${book.title}`);
              }
            }
          } else {
            console.log(`  - Using existing cover: ${coverImage}`);
          }
          
          updatedBooks.push({
            ...book,
            cover_image: coverImage
          });
          
          // Add a small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 200));
        }
        
        // Write the updated CSV
        const csvWriter = createCsvWriter({
          path: csvFilePath.replace('.csv', '_with_covers.csv'),
          header: Object.keys(updatedBooks[0]).map(key => ({ id: key, title: key }))
        });
        
        await csvWriter.writeRecords(updatedBooks);
        console.log(`Updated CSV saved to: ${csvFilePath.replace('.csv', '_with_covers.csv')}`);
        
        resolve(updatedBooks);
      })
      .on('error', reject);
  });
}

// Main execution
async function main() {
  const csvFiles = [
    'pm-books-batch-1.csv',
    'pm-books-batch-2.csv',
    'pm-books-batch-3.csv',
    'pm-books-batch-4.csv'
  ];
  
  for (const csvFile of csvFiles) {
    const csvPath = path.join(__dirname, '..', csvFile);
    if (fs.existsSync(csvPath)) {
      console.log(`\n=== Processing ${csvFile} ===`);
      await updateBookCovers(csvPath);
    } else {
      console.log(`File not found: ${csvPath}`);
    }
  }
  
  console.log('\n=== All CSV files processed ===');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { updateBookCovers }; 