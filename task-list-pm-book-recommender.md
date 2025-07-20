# Task List: PM Book Recommender MVP

## Overview
Build a quiz-based book recommendation app for new/aspiring PMs using hybrid matching (rule-based filtering + GPT personalization).

**Timeline**: 1-2 days  
**Scope**: MVP with no authentication, mobile-first, Airtable + GPT integration

---

## Frontend Tasks

### 1. Quiz Interface
- [ ] Create mobile-first quiz component with 5-8 questions
- [ ] Implement progress indicator (e.g., "Question 3 of 8")
- [ ] Add smooth transitions between questions
- [ ] Style with warm, supportive tone (LinkedIn-style)
- [ ] Ensure touch-friendly interface

### 2. Question Categories
- [ ] Experience level selector (0-2 years, career switcher, etc.)
- [ ] Learning goals selector (fundamentals, technical skills, leadership, etc.)
- [ ] Industry focus selector (B2B, B2C, SaaS, etc.)
- [ ] Learning style selector (practical, theoretical, case studies, etc.)

### 3. Results Display
- [ ] Create results page showing exactly 5 book recommendations
- [ ] Display book cover, title, author, 1-sentence summary
- [ ] Show Goodreads rating with star display
- [ ] Add Amazon purchase link (affiliate link ready)
- [ ] Display personalized explanation for each book
- [ ] Add "Retake Quiz" button

### 4. Responsive Design
- [ ] Mobile-first CSS with responsive breakpoints
- [ ] Touch-friendly buttons and interactions
- [ ] Fast loading states and transitions
- [ ] Accessibility compliance (WCAG)

---

## Backend Tasks

### 5. Quiz Logic
- [ ] Create quiz state management
- [ ] Implement answer collection and validation
- [ ] Build quiz completion handler
- [ ] Add error handling for incomplete submissions

### 6. Hybrid Matching Algorithm
- [ ] **Step 1: Rule-based Filtering**
  - [ ] Create filtering logic based on quiz answers
  - [ ] Implement tag-based matching from Airtable data
  - [ ] Filter by experience level, learning goals, industry focus
  - [ ] Return candidate books (10-15 books)

- [ ] **Step 2: GPT Personalization**
  - [ ] Send candidate books + user answers to GPT API
  - [ ] Generate personalized ranking and explanations
  - [ ] Return top 5 books with custom explanations
  - [ ] Add fallback for GPT API failures

### 7. Data Processing
- [ ] Parse Airtable book data structure
- [ ] Implement caching for Airtable data
- [ ] Create book recommendation data model
- [ ] Add error handling for missing data

---

## Integrations

### 8. Airtable Integration
- [ ] Set up Airtable API connection
- [ ] Create data fetching function
- [ ] Implement error handling and retries
- [ ] Add data caching (5-10 minute TTL)

### 9. GPT Integration
- [ ] Set up OpenAI API connection
- [ ] Create prompt template for book ranking
- [ ] Implement GPT response parsing
- [ ] Add rate limiting and error handling
- [ ] Create fallback to rule-based ranking only

### 10. Amazon Affiliate Setup
- [ ] Set up Amazon Associates account
- [ ] Create affiliate link generation function
- [ ] Test affiliate link functionality
- [ ] Add tracking parameters

---

## Infrastructure & Deployment

### 11. Project Setup
- [ ] Initialize project (Next.js/React recommended)
- [ ] Set up environment variables for APIs
- [ ] Configure build and deployment pipeline
- [ ] Set up basic analytics (optional)

### 12. Performance & Reliability
- [ ] Implement loading states for all API calls
- [ ] Add error boundaries and fallback UI
- [ ] Optimize for <10 second recommendation time
- [ ] Test on multiple devices and browsers

---

## Data Schema (Airtable)

### Required Fields:
- `title` (text)
- `author` (text)
- `summary` (text - 1 sentence)
- `goodreads_rating` (number)
- `amazon_link` (url)
- `cover_image` (url)
- `difficulty_level` (single select: beginner, intermediate, advanced)
- `tags` (multiple select: fundamentals, technical, leadership, strategy, etc.)
- `industry_focus` (multiple select: B2B, B2C, SaaS, etc.)
- `learning_style` (multiple select: practical, theoretical, case_studies, etc.)

---

## Success Criteria
- [ ] Quiz completion rate >80%
- [ ] Recommendations load within 10 seconds
- [ ] Mobile experience is smooth and intuitive
- [ ] GPT explanations feel personalized and helpful
- [ ] Amazon links work correctly with affiliate tracking

---

## Notes
- Keep the quiz short (5-8 questions max)
- Prioritize the hybrid matching algorithm
- Focus on mobile experience first
- Use warm, encouraging tone throughout
- No user accounts or saved state for MVP 