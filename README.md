# PM Book Recommender

A personalized book recommendation app for new and aspiring product managers. Features a beautiful quiz interface that matches users with relevant PM books using a hybrid algorithm combining rule-based filtering and GPT personalization.

## Features

- 🎯 **Interactive Quiz**: 5-question assessment covering experience, goals, industry, and learning style
- 🧠 **Hybrid Matching Algorithm**: Combines rule-based filtering with GPT personalization
- 📚 **Personalized Recommendations**: Top 5 books with custom explanations
- 🎨 **Beautiful UI**: Mobile-first design with warm, supportive styling
- ⚡ **Fast Performance**: Optimized for <10 second recommendation time
- 🔄 **Fallback System**: Graceful degradation when APIs are unavailable

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS with custom gradients and animations
- **Backend**: Next.js API routes
- **AI**: OpenAI GPT-3.5-turbo for personalization
- **Data**: Airtable integration (with mock data fallback)

## Getting Started

1. **Clone the repository**:
   ```bash
   git clone https://github.com/jackietheproductgirl/pm-book-recommender.git
   cd pm-book-recommender
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables** (optional for full functionality):
   Create a `.env.local` file with:
   ```bash
   # OpenAI API Key (for GPT personalization)
   OPENAI_API_KEY=your_openai_api_key_here
   
   # Airtable API Key (for book data)
   AIRTABLE_API_KEY=your_airtable_api_key_here
   AIRTABLE_BASE_ID=your_airtable_base_id_here
   AIRTABLE_TABLE_NAME=Books
   ```

4. **Run the development server**:
```bash
npm run dev
```

5. **Open [http://localhost:3000](http://localhost:3000)** to see the app

## How It Works

### Quiz Flow
1. User answers 5 questions about their PM experience and goals
2. Answers are sent to the hybrid matching algorithm
3. Rule-based filtering selects relevant books from the database
4. GPT personalization ranks and explains the top recommendations
5. User receives 5 personalized book recommendations

### Hybrid Algorithm
- **Step 1**: Rule-based filtering using tags, difficulty levels, and categories
- **Step 2**: GPT personalization for ranking and custom explanations
- **Fallback**: Mock data and rule-based ranking if APIs are unavailable

## Project Structure

```
src/
├── app/
│   ├── api/recommendations/     # API route for recommendations
│   ├── globals.css             # Tailwind styles
│   └── page.tsx                # Main page
├── components/
│   ├── Quiz.tsx               # Main quiz component
│   ├── QuizQuestion.tsx       # Individual question component
│   ├── QuizProgress.tsx       # Progress bar
│   ├── QuizResults.tsx        # Results page
│   └── BookRecommendation.tsx # Book card component
├── contexts/
│   └── QuizContext.tsx        # Quiz state management
├── lib/
│   ├── recommendations.ts     # Hybrid matching algorithm
│   ├── airtable.ts           # Airtable integration
│   └── gpt.ts                # GPT integration
├── data/
│   ├── quizData.ts           # Quiz questions and options
│   └── mockRecommendations.ts # Fallback book data
└── types/
    ├── book.ts               # Book type definitions
    └── quiz.ts               # Quiz type definitions
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
