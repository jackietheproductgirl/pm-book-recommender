const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

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

async function clearInaccurateCovers() {
  console.log('Reading current CSV file...');
  
  const books = await readCSVFile('complete-75-books-with-covers.csv');
  console.log(`Processing ${books.length} books...`);
  
  const updatedBooks = [];
  
  for (const book of books) {
    // Clear any Google Books API covers (they're inaccurate)
    if (book.cover_image && book.cover_image.includes('google.com')) {
      book.cover_image = '';
      console.log(`  ✗ Cleared inaccurate cover for: ${book.title}`);
    } else if (book.cover_image && book.cover_image.trim()) {
      console.log(`  ✓ Kept existing cover for: ${book.title}`);
    } else {
      console.log(`  - No cover for: ${book.title}`);
    }
    
    updatedBooks.push(book);
  }
  
  // Write the updated CSV
  const csvWriter = createCsvWriter({
    path: 'complete-75-books-clean.csv',
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
  console.log('\nClean database saved to: complete-75-books-clean.csv');
  
  // Count books without covers
  const booksWithoutCovers = updatedBooks.filter(book => !book.cover_image || !book.cover_image.trim());
  console.log(`\n📊 Summary:`);
  console.log(`   • Books without covers: ${booksWithoutCovers.length}`);
  console.log(`   • Books with verified covers: ${updatedBooks.length - booksWithoutCovers.length}`);
  console.log(`   • Total books: ${updatedBooks.length}`);
  
  return updatedBooks;
}

// Main execution
async function main() {
  try {
    await clearInaccurateCovers();
    console.log('\n=== Complete! ===');
  } catch (error) {
    console.error('Error:', error);
  }
}

if (require.main === module) {
  main();
}

module.exports = { clearInaccurateCovers }; 