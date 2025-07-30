const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

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

async function verifyBookCovers() {
  console.log('Reading current CSV file...');
  
  const books = await readCSVFile('complete-75-books-with-covers.csv');
  console.log(`\n=== Book Cover Verification Report ===\n`);
  
  const booksWithCovers = [];
  const booksWithoutCovers = [];
  const booksWithGoogleCovers = [];
  
  for (const book of books) {
    if (book.cover_image && book.cover_image.trim()) {
      if (book.cover_image.includes('google.com')) {
        booksWithGoogleCovers.push(book);
      } else {
        booksWithCovers.push(book);
      }
    } else {
      booksWithoutCovers.push(book);
    }
  }
  
  console.log(`📊 Summary:`);
  console.log(`   • Books with real covers: ${booksWithCovers.length}`);
  console.log(`   • Books with Google covers (need verification): ${booksWithGoogleCovers.length}`);
  console.log(`   • Books without covers: ${booksWithoutCovers.length}`);
  console.log(`   • Total books: ${books.length}\n`);
  
  if (booksWithGoogleCovers.length > 0) {
    console.log(`⚠️  Books with Google covers (need manual verification):`);
    booksWithGoogleCovers.forEach((book, index) => {
      console.log(`   ${index + 1}. "${book.title}"`);
      console.log(`      Cover: ${book.cover_image}`);
      console.log(``);
    });
  }
  
  if (booksWithoutCovers.length > 0) {
    console.log(`❌ Books without covers (need manual addition):`);
    booksWithoutCovers.forEach((book, index) => {
      console.log(`   ${index + 1}. "${book.title}"`);
    });
    console.log(``);
  }
  
  console.log(`✅ Books with verified covers:`);
  booksWithCovers.forEach((book, index) => {
    console.log(`   ${index + 1}. "${book.title}"`);
  });
  
  // Create a CSV with books that need manual attention
  if (booksWithGoogleCovers.length > 0 || booksWithoutCovers.length > 0) {
    const booksNeedingAttention = [...booksWithGoogleCovers, ...booksWithoutCovers];
    
    const csvContent = [
      'title,author,current_cover_url,needs_manual_verification',
      ...booksNeedingAttention.map(book => 
        `"${book.title}","${book.author}","${book.cover_image || ''}","${book.cover_image ? 'verify_google_cover' : 'add_cover'}"`
      )
    ].join('\n');
    
    fs.writeFileSync('books-needing-cover-attention.csv', csvContent);
    console.log(`\n📄 Created 'books-needing-cover-attention.csv' for manual review`);
  }
}

// Main execution
async function main() {
  try {
    await verifyBookCovers();
  } catch (error) {
    console.error('Error:', error);
  }
}

if (require.main === module) {
  main();
}

module.exports = { verifyBookCovers }; 