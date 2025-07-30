const fs = require('fs');
const path = require('path');

// Batch cover additions - you can add more books here
const newCovers = {
  "Escaping the Build Trap: How Effective Product Management Creates Real Value": "https://images-na.ssl-images-amazon.com/images/P/149197379X.01.L.jpg",
  "Measure What Matters: How Google, Bono, and the Gates Foundation Rock the World with OKRs": "https://images-na.ssl-images-amazon.com/images/P/0525536221.01.L.jpg",
  "Blue Ocean Strategy": "https://images-na.ssl-images-amazon.com/images/P/1591396190.01.L.jpg",
  "Crossing the Chasm: Marketing and Selling Disruptive Products to Mainstream Customers": "https://images-na.ssl-images-amazon.com/images/P/0062292986.01.L.jpg",
  "Obviously Awesome: How to Nail Product Positioning So Customers Get It, Buy It, Love It": "https://images-na.ssl-images-amazon.com/images/P/1989025741.01.L.jpg",
  "Working Backwards: Insights, Stories, and Secrets from Inside Amazon": "https://www.amazon.com/images/P/1250267595.01.L.jpg",
  "The Goal: A Process of Ongoing Improvement": "https://images-na.ssl-images-amazon.com/images/P/0884271951.01.L.jpg",
  "Good Strategy Bad Strategy: The Difference and Why It Matters": "https://images-na.ssl-images-amazon.com/images/P/0307886239.01.L.jpg",
  "High Output Management": "https://images-na.ssl-images-amazon.com/images/P/0679762884.01.L.jpg",
  "The Power Law: Venture Capital and the Making of the New Future": "https://images-na.ssl-images-amazon.com/images/P/1982115559.01.L.jpg",
  "Creativity, Inc.: Overcoming the Unseen Forces That Stand in the Way of True Inspiration": "https://images-na.ssl-images-amazon.com/images/P/0812993012.01.L.jpg",
  "The Ten Faces of Innovation: IDEO's Strategies for Beating the Devil's Advocate and Driving Creativity Throughout Your Organization": "https://images-na.ssl-images-amazon.com/images/P/0385512074.01.L.jpg",
  "The Ideal Executive": "https://images-na.ssl-images-amazon.com/images/P/0060154564.01.L.jpg",
  "The Undoing Project: A Friendship That Changed Our Minds": "https://images-na.ssl-images-amazon.com/images/P/0393254593.01.L.jpg",
  "Setting the Table: The Transforming Power of Hospitality in Business": "https://images-na.ssl-images-amazon.com/images/P/0060742763.01.L.jpg",
  "Scientific Advertising: Original Classic Edition": "https://images-na.ssl-images-amazon.com/images/P/1614271314.01.L.jpg",
  "The Creative Act: A Way of Being": "https://images-na.ssl-images-amazon.com/images/P/0593652880.01.L.jpg",
  "Inside Paragraphs: Typographic Fundamentals": "https://images-na.ssl-images-amazon.com/images/P/0977282775.01.L.jpg",
  "The Origin of Wealth: The Radical Remaking of Economics and What it Means for Business and Society": "https://images-na.ssl-images-amazon.com/images/P/1422103373.01.L.jpg",
  "Misbehaving: The Making of Behavioral Economics": "https://images-na.ssl-images-amazon.com/images/P/0393088693.01.L.jpg"
};

async function addBatchCovers() {
  console.log('📚 Adding batch cover images...\n');
  
  // Load current manual covers
  const manualCoversPath = path.join(process.cwd(), 'manual-covers.json');
  let manualCovers = {};
  
  if (fs.existsSync(manualCoversPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(manualCoversPath, 'utf8'));
      manualCovers = data.manual_covers || {};
      console.log(`Currently have ${Object.keys(manualCovers).length} manual covers`);
    } catch (error) {
      console.error('Error loading manual covers:', error);
    }
  }
  
  // Add new covers
  let addedCount = 0;
  for (const [title, url] of Object.entries(newCovers)) {
    if (!manualCovers[title]) {
      manualCovers[title] = url;
      console.log(`✅ Added: ${title}`);
      addedCount++;
    } else {
      console.log(`⏭️  Skipped (already exists): ${title}`);
    }
  }
  
  // Save updated manual covers
  const updatedData = {
    manual_covers: manualCovers,
    instructions: {
      how_to_add: "Add book titles as keys and verified cover image URLs as values. Use high-quality image URLs from Amazon, Goodreads, or other reliable sources.",
      format: "Book Title: \"https://image-url-here.com/image.jpg\"",
      recommended_sources: [
        "Amazon product images (use .01.L.jpg format)",
        "Goodreads book covers", 
        "Publisher websites",
        "Author websites"
      ],
      note: "Amazon image URLs should use the format: https://images-na.ssl-images-amazon.com/images/P/ISBN.01.L.jpg"
    }
  };
  
  fs.writeFileSync(manualCoversPath, JSON.stringify(updatedData, null, 2));
  console.log(`\n🎉 Successfully added ${addedCount} new cover images!`);
  console.log(`📊 Total manual covers: ${Object.keys(manualCovers).length}`);
  
  return addedCount;
}

// Main execution
if (require.main === module) {
  addBatchCovers().catch(console.error);
}

module.exports = { addBatchCovers }; 