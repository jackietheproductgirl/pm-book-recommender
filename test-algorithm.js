// Test script for the new weighted recommendation algorithm
const { getBookRecommendations } = require('./src/lib/recommendations.ts');

// Mock book data for testing
const mockBooks = [
  {
    id: '1',
    title: 'Inspired: How To Create Products Customers Love',
    author: 'Marty Cagan',
    summary: 'A comprehensive guide to product management fundamentals.',
    goodreadsRating: 4.3,
    amazonLink: 'https://amazon.com/inspired',
    tags: 'fundamentals, product strategy, leadership',
    difficultyLevel: 'beginner',
    industryFocus: 'general',
    learningStyle: 'practical'
  },
  {
    id: '2',
    title: 'The Design of Everyday Things',
    author: 'Don Norman',
    summary: 'Essential reading for understanding user experience and design.',
    goodreadsRating: 4.4,
    amazonLink: 'https://amazon.com/design-everyday-things',
    tags: 'design & ux, user experience, design',
    difficultyLevel: 'intermediate',
    industryFocus: 'general',
    learningStyle: 'theoretical'
  },
  {
    id: '3',
    title: 'Lean Analytics',
    author: 'Alistair Croll',
    summary: 'Data-driven approach to product development and metrics.',
    goodreadsRating: 4.2,
    amazonLink: 'https://amazon.com/lean-analytics',
    tags: 'data & analytics, metrics, analytics',
    difficultyLevel: 'intermediate',
    industryFocus: 'startup',
    learningStyle: 'practical'
  },
  {
    id: '4',
    title: 'The Hard Thing About Hard Things',
    author: 'Ben Horowitz',
    summary: 'Leadership lessons for building and running a startup.',
    goodreadsRating: 4.5,
    amazonLink: 'https://amazon.com/hard-things',
    tags: 'leadership, management, startup',
    difficultyLevel: 'advanced',
    industryFocus: 'startup',
    learningStyle: 'case_studies'
  },
  {
    id: '5',
    title: 'Sprint: How to Solve Big Problems',
    author: 'Jake Knapp',
    summary: 'Rapid prototyping and design sprint methodology.',
    goodreadsRating: 4.1,
    amazonLink: 'https://amazon.com/sprint',
    tags: 'design & ux, prototyping, discovery',
    difficultyLevel: 'intermediate',
    industryFocus: 'general',
    learningStyle: 'practical'
  }
];

// Test user profiles
const testProfiles = [
  {
    name: 'UX Designer Focus',
    answers: {
      experience: 'intermediate',
      primaryFocus: 'ux_design',
      businessModel: 'b2b',
      learningStyle: 'practical',
      careerStage: 'individual_contributor',
      secondarySkills: ['user_research', 'prototyping'],
      currentChallenges: ['user_adoption']
    }
  },
  {
    name: 'Leadership Focus',
    answers: {
      experience: 'intermediate',
      primaryFocus: 'leadership',
      businessModel: 'startup',
      learningStyle: 'case_studies',
      careerStage: 'manager',
      secondarySkills: ['team_management', 'stakeholder_management'],
      currentChallenges: ['team_alignment', 'stakeholder_buy_in']
    }
  },
  {
    name: 'Data Analytics Focus',
    answers: {
      experience: 'junior',
      primaryFocus: 'data_analytics',
      businessModel: 'doesnt_matter',
      learningStyle: 'practical',
      careerStage: 'individual_contributor',
      secondarySkills: ['data_analysis', 'metrics'],
      currentChallenges: ['data_insights']
    }
  }
];

// Test the algorithm
async function testAlgorithm() {
  console.log('🧪 Testing New Weighted Recommendation Algorithm\n');
  
  for (const profile of testProfiles) {
    console.log(`\n📋 Testing Profile: ${profile.name}`);
    console.log('User Answers:', JSON.stringify(profile.answers, null, 2));
    
    try {
      // Mock the getAirtableBooks function to return our test data
      const originalGetAirtableBooks = require('./src/lib/airtable').getAirtableBooks;
      require('./src/lib/airtable').getAirtableBooks = () => Promise.resolve(mockBooks);
      
      const recommendations = await getBookRecommendations(profile.answers);
      
      console.log('\n📚 Top Recommendations:');
      recommendations.forEach((book, index) => {
        console.log(`${index + 1}. "${book.title}" by ${book.author}`);
        console.log(`   Rating: ${book.goodreadsRating}/5`);
        console.log(`   Tags: ${book.tags}`);
        console.log('');
      });
      
      // Restore original function
      require('./src/lib/airtable').getAirtableBooks = originalGetAirtableBooks;
      
    } catch (error) {
      console.error('❌ Error testing algorithm:', error);
    }
  }
}

// Run the test
testAlgorithm().catch(console.error); 