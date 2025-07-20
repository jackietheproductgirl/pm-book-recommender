# Product Requirements Document: PM Book Recommender

## Introduction/Overview

The PM Book Recommender is a web application designed to help new and aspiring product managers (PMs) overcome information overload and find their next best book. The app addresses the common pain point of being overwhelmed by the vast number of product management resources available, particularly for career switchers and those with less than 2 years of experience.

The app guides users through a short, friendly multiple-choice quiz to understand their experience level, skill gaps, and interests, then recommends the top 5 most relevant product-related books from a curated database of 200+ titles.

## Goals

1. **Reduce Decision Paralysis**: Help users quickly identify relevant books without spending hours researching
2. **Personalize Learning Paths**: Provide tailored recommendations based on individual experience and goals
3. **Increase Confidence**: Give users clear, actionable next steps in their PM learning journey
4. **Deliver Immediate Value**: Provide recommendations that feel genuinely helpful and personalized
5. **Maintain Simplicity**: Keep the experience streamlined and mobile-first for maximum accessibility

## User Stories

1. **As a career switcher**, I want to quickly identify books that will help me understand product management fundamentals so that I can start building my knowledge base efficiently.

2. **As a new PM with <2 years experience**, I want to find books that address my specific skill gaps so that I can grow in targeted areas.

3. **As an overwhelmed learner**, I want a simple, guided process to find relevant resources so that I don't waste time on books that aren't right for my level.

4. **As a mobile user**, I want to complete the entire experience on my phone so that I can get recommendations whenever inspiration strikes.

5. **As a practical learner**, I want to see why each book was recommended for me so that I can make informed decisions about which books to prioritize.

## Functional Requirements

1. **Quiz Interface**: The system must present a short, friendly multiple-choice quiz with 5-8 questions covering experience level, skill gaps, and interests.

2. **Mobile-First Design**: The system must provide an optimal experience on mobile devices with responsive design for desktop.

3. **Question Categories**: The system must include questions about:
   - Current experience level (0-2 years, career switcher, etc.)
   - Primary learning goals (fundamentals, technical skills, leadership, etc.)
   - Industry focus (B2B, B2C, SaaS, etc.)
   - Preferred learning style (practical, theoretical, case studies, etc.)

4. **Hybrid Matching Algorithm**: The system must implement a two-step recommendation process:
   - Step 1: Rule-based filtering using tags and criteria from Airtable
   - Step 2: GPT-based personalization for ranking and explanation generation

5. **Book Recommendations Display**: The system must show exactly 5 book recommendations, each including:
   - Book title and author
   - 1-sentence summary
   - Goodreads rating (with star display)
   - Amazon purchase link
   - Personalized explanation of why it was chosen

6. **Airtable Integration**: The system must connect to an Airtable database containing book information and retrieve relevant data for filtering.

7. **GPT Integration**: The system must use GPT API to generate personalized explanations for why each book was recommended.

8. **No Authentication**: The system must function completely without user accounts or saved state.

9. **Warm, Supportive Tone**: The system must maintain a LinkedIn-style, encouraging tone throughout all user interactions.

10. **Fast Loading**: The system must provide recommendations within 10 seconds of quiz completion.

## Non-Goals (Out of Scope)

- User accounts, login, or saved preferences
- Social features or sharing capabilities
- Book reviews or user ratings
- Advanced filtering or search functionality
- Integration with other book platforms beyond Amazon
- Email collection or marketing features
- Analytics beyond basic usage metrics
- Multi-language support
- Advanced recommendation algorithms beyond the hybrid approach

## Design Considerations

- **Mobile-First**: Design should prioritize mobile experience with touch-friendly interface
- **Warm Visual Design**: Use friendly colors, approachable typography, and encouraging imagery
- **Progress Indicators**: Show quiz progress to reduce abandonment
- **Clear CTAs**: Make next steps obvious and encouraging
- **Book Covers**: Display book cover images when available for visual appeal
- **Accessibility**: Ensure WCAG compliance for inclusive design

## Technical Considerations

- **Airtable Schema**: Proposed structure includes fields for book title, author, tags, difficulty level, Goodreads rating, Amazon link, summary, and cover image URL
- **API Integration**: Will need Airtable API and OpenAI GPT API integration
- **Static Hosting**: Consider using Vercel, Netlify, or similar for fast deployment
- **Caching**: Implement caching for Airtable data to improve performance
- **Error Handling**: Graceful fallbacks if APIs are unavailable
- **SEO Optimization**: Meta tags and structured data for discoverability

## Success Metrics

1. **Completion Rate**: >80% of users who start the quiz complete it
2. **User Satisfaction**: >4.0/5 rating on recommendation helpfulness
3. **Engagement**: Average session time >2 minutes
4. **Conversion**: >15% click-through rate on Amazon links
5. **Return Usage**: >20% of users return within 30 days
6. **Social Sharing**: Organic sharing of recommendations on social media

## Open Questions

1. What specific questions should be included in the quiz to best capture user needs?
2. How should we handle edge cases where the Airtable database doesn't have enough books matching certain criteria?
3. What fallback strategy should be used if the GPT API is unavailable?
4. Should we implement any basic analytics to track which books are recommended most often?
5. What's the optimal number of quiz questions to balance accuracy with user patience?
6. How should we handle books that may be out of print or unavailable on Amazon? 