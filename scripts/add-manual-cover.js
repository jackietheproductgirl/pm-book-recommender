const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function addManualCover() {
  console.log('📚 Manual Cover Image Adder\n');
  
  // Load current manual covers
  let manualCovers = {};
  const manualCoversPath = path.join(process.cwd(), 'manual-covers.json');
  
  if (fs.existsSync(manualCoversPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(manualCoversPath, 'utf8'));
      manualCovers = data.manual_covers || {};
      console.log(`Currently have ${Object.keys(manualCovers).length} manual covers`);
    } catch (error) {
      console.error('Error loading manual covers:', error);
    }
  }
  
  console.log('\nCurrent manual covers:');
  Object.keys(manualCovers).forEach((title, index) => {
    console.log(`${index + 1}. ${title}`);
  });
  
  console.log('\n--- Add New Cover ---');
  
  const bookTitle = await question('Enter the exact book title: ');
  const coverUrl = await question('Enter the cover image URL: ');
  
  if (bookTitle && coverUrl) {
    manualCovers[bookTitle] = coverUrl;
    
    // Save updated manual covers
    const updatedData = {
      manual_covers: manualCovers,
      instructions: {
        how_to_add: "Add book titles as keys and verified cover image URLs as values. Use high-quality image URLs from Amazon, Goodreads, or other reliable sources.",
        format: "Book Title: \"https://image-url-here.com/image.jpg\"",
        recommended_sources: [
          "Amazon product images",
          "Goodreads book covers", 
          "Publisher websites",
          "Author websites"
        ]
      }
    };
    
    fs.writeFileSync(manualCoversPath, JSON.stringify(updatedData, null, 2));
    console.log(`\n✅ Added cover for "${bookTitle}"`);
    console.log(`📊 Total manual covers: ${Object.keys(manualCovers).length}`);
  } else {
    console.log('❌ Invalid input. Please provide both title and URL.');
  }
  
  rl.close();
}

// Main execution
if (require.main === module) {
  addManualCover().catch(console.error);
}

module.exports = { addManualCover }; 