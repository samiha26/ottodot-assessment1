# Math Problem Generator - Developer Assessment Starter Kit

## Overview

This is a starter kit for building an AI-powered math problem generator application. The goal is to create a standalone prototype that uses AI to generate math word problems suitable for Primary 5 students, saves the problems and user submissions to a database, and provides personalized feedback.

## Tech Stack

- **Frontend Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase
- **AI Integration**: Google Generative AI (Gemini)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd math-problem-generator
```

### 2. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Go to Settings → API to find your:
   - Project URL (starts with `https://`)
   - Anon/Public Key

### 3. Set Up Database Tables

1. In your Supabase dashboard, go to SQL Editor
2. Copy and paste the contents of `database.sql`
3. Click "Run" to create the tables and policies

### 4. Get Google API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key for Gemini

### 5. Configure Environment Variables

1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```
2. Edit `.env.local` and add your actual keys:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_actual_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_supabase_anon_key
   GOOGLE_API_KEY=your_actual_google_api_key
   ```

### 6. Install Dependencies

```bash
npm install
```

### 7. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Your Task

### 1. Implement Frontend Logic (`app/page.tsx`)

Complete the TODO sections in the main page component:

- **generateProblem**: Call your API route to generate a new math problem
- **submitAnswer**: Submit the user's answer and get feedback

### 2. Create Backend API Route (`app/api/math-problem/route.ts`)

Create a new API route that handles:

#### POST /api/math-problem (Generate Problem)
- Use Google's Gemini AI to generate a math word problem
- The AI should return JSON with:
  ```json
  {
    "problem_text": "A bakery sold 45 cupcakes...",
    "final_answer": 15
  }
  ```
- Save the problem to `math_problem_sessions` table
- Return the problem and session ID to the frontend

#### POST /api/math-problem/submit (Submit Answer)
- Receive the session ID and user's answer
- Check if the answer is correct
- Use AI to generate personalized feedback based on:
  - The original problem
  - The correct answer
  - The user's answer
  - Whether they got it right or wrong
- Save the submission to `math_problem_submissions` table
- Return the feedback and correctness to the frontend

### 3. Requirements Checklist

- [x] AI generates appropriate Primary 5 level math problems
- [x] Problems and answers are saved to Supabase
- [x] User submissions are saved with feedback
- [x] AI generates helpful, personalized feedback
- [x] UI is clean and mobile-responsive
- [x] Error handling for API failures
- [x] Loading states during API calls

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com) and import your repository
3. Add your environment variables in Vercel's project settings
4. Deploy!

## Assessment Submission

When submitting your assessment, provide:

1. **GitHub Repository URL**: Make sure it's public
2. **Live Demo URL**: Your Vercel deployment
3. **Supabase Credentials**: Add these to your README for testing:
   ```
   SUPABASE_URL: https://yauvlbnhkpqaebztgewh.supabase.co
   SUPABASE_ANON_KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhdXZsYm5oa3BxYWVienRnZXdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2NjQ5NzcsImV4cCI6MjA3NTI0MDk3N30.A9Q9rNtFEG8o3WKlzHAYqQJ2vZwtQr3_Fr9QRf72EAI
   ```

## Implementation Notes

### My Implementation:

#### ✅ **Core Features Implemented**

1. **AI-Powered Math Problem Generation** (`app/api/math-problem/route.ts`)
   - Integrated Google Gemini AI (gemini-2.0-flash model) to generate contextual math word problems
   - Implemented difficulty-based problem generation (Easy, Medium, Hard) with appropriate number ranges
   - Added support for different problem types: addition, subtraction, multiplication, division, and mixed operations
   - Problems are suitable for Primary 5 students with real-world scenarios (shopping, sports, cooking, etc.)
   - Each problem includes: problem text, correct answer, helpful hint, and step-by-step solution

2. **Answer Submission & AI Feedback** (`app/api/math-problem/submit/route.ts`)
   - Built submission system that checks user answers against correct solutions
   - Implemented AI-generated personalized feedback based on whether the answer is correct or incorrect
   - Feedback is contextual and encouraging, helping students learn from mistakes
   - Tracks hint usage to adjust scoring appropriately

3. **Database Integration with Supabase**
   - Successfully connected to Supabase for persistent data storage
   - Stores all problem sessions in `math_problem_sessions` table
   - Stores all user submissions in `math_problem_submissions` table
   - Implemented proper error handling for database operations

4. **Problem History & Statistics** (`app/api/history/route.ts`)
   - Created API endpoint to fetch user's problem history
   - Calculates real-time statistics: total problems, attempted problems, correct answers, accuracy percentage
   - Implements scoring system (10 points per correct answer)
   - Displays stats in the header for immediate feedback

5. **Clean, Modern UI Design** (`app/page.tsx` & `app/globals.css`)
   - Redesigned UI following Context7 and shadcn/ui design principles for simplicity and clarity
   - Implemented clean, minimal color scheme with neutral tones

6. **Interactive User Experience**
   - Larger, more prominent difficulty selection buttons (Easy/Medium/Hard)
   - Math symbol buttons with clear icons (+, −, ×, ÷, ∑) and labels
   - Real-time loading states during API calls with spinner animations
   - Smooth fade-in animations for new content
   - Hint system that students can access when stuck
   - Toggle-able step-by-step solutions for incorrect answers

7. **Error Handling & Edge Cases**
   - Comprehensive try-catch blocks in all API routes
   - User-friendly error messages for failed operations
   - Validation to ensure proper data before submission
   - Graceful handling of AI response parsing errors

#### 🚀 **Additional Features Implemented**

- [x] Difficulty levels (Easy/Medium/Hard)
- [x] Problem history view with statistics
- [x] Score tracking system
- [x] Different problem types (addition, subtraction, multiplication, division, mixed)
- [x] Hints system
- [x] Step-by-step solution explanations

#### 💡 **Features I'm Proud Of**

1. **Context-Aware AI Feedback**: The AI doesn't just say "wrong" - it provides personalized, encouraging feedback that helps students understand their mistakes
2. **Smart Hint System**: Hints are carefully crafted to guide without giving away the answer, and hint usage affects scoring
3. **Real-Time Statistics**: Students can see their progress immediately with accuracy percentage and score tracking
4. **Clean, Distraction-Free UI**: The simplified design keeps students focused on problem-solving without overwhelming visual elements
5. **Comprehensive Error Handling**: Every API call is protected with proper error handling to ensure a smooth user experience

#### 🛠️ **Technical Stack Used**

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS with custom design system
- **AI**: Google Generative AI (Gemini 2.0 Flash)
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Ready for Vercel deployment



## Additional Features Completed

All optional features have been implemented:

- [x] Difficulty levels (Easy/Medium/Hard) - Fully functional with different number ranges
- [x] Problem history view - Complete with statistics dashboard
- [x] Score tracking - 10 points per correct answer, displayed in header
- [x] Different problem types (addition, subtraction, multiplication, division, mixed) - All operation types supported
- [x] Hints system - Available for each problem, affects scoring when used
- [x] Step-by-step solution explanations - Detailed solutions available for incorrect answers

---

Good luck with your assessment! 🎯