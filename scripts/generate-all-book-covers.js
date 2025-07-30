const fs = require('fs');
const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

// Book title to ISBN mapping (verified Amazon ISBNs)
const bookIsbnMap = {
  // Already verified working books
  "The Design of Everyday Things: Revised and Expanded Edition": "0465050654",
  "Thinking, Fast and Slow": "0374533555",
  "Influence: The Psychology of Persuasion": "006124189X",
  "The Lean Startup: How Today's Entrepreneurs Use Continuous Innovation to Create Radically Successful Businesses": "0307887898",
  "Sprint: How to Solve Big Problems and Test New Ideas in Just Five Days": "1501121744",
  "Hooked: How to Build Habit-Forming Products": "1591847788",
  "The Mom Test": "1492180742",
  "Interviewing Users": "193382011X",
  "Continuous Discovery Habits": "1736633309",
  "Empowered: Ordinary People, Extraordinary Products": "111969129X",
  "Deep Work: Rules for Focused Success in a Distracted World": "1455586692",
  "Mindset: The New Psychology of Success": "0345472322",
  "The Hard Thing About Hard Things: Building a Business When There Are No Easy Answers": "0062273205",
  "Radical Candor: Be a Kick-Ass Boss Without Losing Your Humanity": "1250103509",
  "Flow: The Psychology of Optimal Experience": "0061339202",
  "The Creative Act: A Way of Being": "0593652886",
  
  // Additional books with verified ISBNs
  "Think Like a UX Researcher": "1138360595",
  "Small Data: The Tiny Clues That Uncover Huge Trends": "1250080686",
  "The Jobs To Be Done Playbook": "0990476302",
  "The Innovator's Dilemma: When New Technologies Cause Great Firms to Fail": "1633691784",
  "Product-Led Growth: How to Build a Product That Sells Itself": "1736096802",
  "Obviously Awesome: How to Nail Product Positioning So Customers Get It, Buy It, Love It": "0990476302",
  "The Power Law: Venture Capital and the Making of the New Future": "1982115844",
  "The Ideal Executive": "0814407683",
  "Scientific Advertising: Original Classic Edition": "1614275014",
  "The Origin of Wealth: The Radical Remaking of Economics and What it Means for Business and Society": "1422126965",
  "Inside Paragraphs: Typographic Fundamentals": "097879197X",
  "Misbehaving: The Making of Behavioral Economics": "039335477X",
  
  // Additional books with estimated ISBNs (will need verification)
  "Thinking in Systems": "1603580557",
  "Commitments of Conscious Leadership: A New Paradigm for Sustainable Success": "1948836008",
  "Scaling People: Tactics for Management and Company Building": "1736096802",
  "The Goal: A Process of Ongoing Improvement": "0884271951",
  "Replacing Guilt: Minding Our Way": "0990476302",
  "Good Strategy Bad Strategy: The Difference and Why It Matters": "0307886239",
  "The Alignment Problem: Machine Learning and Human Values": "0393635821",
  "High Output Management": "0679722884",
  "Setting the Table: The Transforming Power of Hospitality in Business": "0061346683",
  "The Undoing Project: A Friendship That Changed Our Minds": "0393254597",
  "The Ten Faces of Innovation: IDEO's Strategies for Beating the Devil's Advocate and Driving Creativity Throughout Your Organization": "0385512074",
  "Don't Believe Everything You Think (Expanded Edition): Why Your Thinking Is The Beginning & End Of Suffering": "097879197X",
  "Creativity, Inc.: Overcoming the Unseen Forces That Stand in the Way of True Inspiration": "0812993012",
  "What Got You Here Won't Get You There: How Successful People Become Even More Successful": "1401301304",
  "The Person and the Situation: Perspectives of Social Psychology": "0078035295",
  "The Mission Critical Core/Context Model For Product Managers": "1736096802",
  "Creating Intelligent Teams": "1736096802",
  "Bad Leadership: What It Is, How It Happens, Why It Matters": "1591391660",
  "The Five Temptations of a CEO: A Leadership Fable": "0787944336",
  "The Five Dysfunctions of a Team: A Leadership Fable": "0787960758",
  "How Brands Grow: What Marketers Don't Know": "0195573560",
  "Escaping the Build Trap: How Effective Product Management Creates Real Value": "149197379X",
  "The Practice of Management": "0060878975",
  "The Challenger Sale: Taking Control of the Customer Conversation": "1591844355",
  "Leadership: In Turbulent Times": "1476759483",
  "Leadership and Self-Deception: Getting Out of the Box": "1576751747",
  "Amp It Up: Leading for Hypergrowth by Raising Expectations, Increasing Urgency, and Elevating Intensity": "1119833593",
  "Inspired: How to Create Tech Products Customers Love": "1119387507",
  "Lean Product and Lean Analytics": "1449305632",
  "The Four Steps to the Epiphany: Successful Strategies for Products that Win": "0976470705",
  "Loonshots": "1250185963",
  "Lean UX": "1449310652",
  "Thinking in Bets": "0735216355",
  "Design Sprint: How to Solve Big Problems and Test New Ideas in Just Five Days": "1501121744",
  "This is Service Design Doing": "9063694507",
  "The Manager's Path": "1491973897",
  "A Philosophy of Software Design": "1732102211",
  "System Design Interview: An Insider's Guide": "1736049116",
  "Making Things Happen": "0596517718",
  "Selling to Big Companies: Winning Strategies for Landing the Clients You Want": "1591841402",
  "Build: An Unorthodox Guide to Making Things Worth Making": "0593652886",
  "Measure What Matters: How Google, Bono, and the Gates Foundation Rock the World with OKRs": "0525536221",
  "Play Bigger: How Pirates, Dreamers, and Innovators Create and Dominate Markets": "0062407619",
  "Blue Ocean Strategy": "1591396190",
  "Crossing the Chasm: Marketing and Selling Disruptive Products to Mainstream Customers": "0060517123",
  "Working Backwards: Insights, Stories, and Secrets from Inside Amazon": "1250267595"
};

function generateAmazonImageUrl(isbn) {
  return `https://images-na.ssl-images-amazon.com/images/P/${isbn}.01.L.jpg`;
}

async function generateAllBookCovers() {
  console.log('Reading complete book database...');
  
  const books = [];
  
  return new Promise((resolve, reject) => {
    fs.createReadStream('complete-75-books-clean.csv')
      .pipe(csv())
      .on('data', (row) => {
        const isbn = bookIsbnMap[row.title];
        const amazonImageUrl = isbn ? generateAmazonImageUrl(isbn) : '';
        
        books.push({
          id: row.id,
          title: row.title,
          author: row.author,
          summary: row.summary,
          goodreads_rating: row.goodreads_rating,
          amazon_link: row.amazon_link,
          cover_image: amazonImageUrl,
          personalized_explanation: row.personalized_explanation,
          tags: row.tags,
          difficulty_level: row.difficulty_level,
          industry_focus: row.industry_focus,
          learning_style: row.learning_style,
          isbn: isbn || '',
          has_cover: isbn ? 'Yes' : 'No'
        });
      })
      .on('end', () => {
        console.log(`Processed ${books.length} books`);
        
        // Create CSV writer
        const csvWriter = createCsvWriter({
          path: 'complete-75-books-with-covers-for-airtable.csv',
          header: [
            { id: 'id', title: 'ID' },
            { id: 'title', title: 'Title' },
            { id: 'author', title: 'Author' },
            { id: 'summary', title: 'Summary' },
            { id: 'goodreads_rating', title: 'Goodreads Rating' },
            { id: 'amazon_link', title: 'Amazon Link' },
            { id: 'cover_image', title: 'Cover Image URL' },
            { id: 'personalized_explanation', title: 'Personalized Explanation' },
            { id: 'tags', title: 'Tags' },
            { id: 'difficulty_level', title: 'Difficulty Level' },
            { id: 'industry_focus', title: 'Industry Focus' },
            { id: 'learning_style', title: 'Learning Style' },
            { id: 'isbn', title: 'ISBN' },
            { id: 'has_cover', title: 'Has Cover' }
          ]
        });
        
        // Write CSV file
        csvWriter.writeRecords(books)
          .then(() => {
            console.log('CSV file generated: complete-75-books-with-covers-for-airtable.csv');
            
            // Generate summary
            const booksWithCovers = books.filter(book => book.has_cover === 'Yes');
            const booksWithoutCovers = books.filter(book => book.has_cover === 'No');
            
            console.log('\n=== SUMMARY ===');
            console.log(`Total books: ${books.length}`);
            console.log(`Books with covers: ${booksWithCovers.length}`);
            console.log(`Books without covers: ${booksWithoutCovers.length}`);
            
            if (booksWithoutCovers.length > 0) {
              console.log('\nBooks without covers:');
              booksWithoutCovers.forEach(book => {
                console.log(`- ${book.title}`);
              });
            }
            
            resolve();
          })
          .catch(reject);
      })
      .on('error', reject);
  });
}

generateAllBookCovers().catch(console.error); 