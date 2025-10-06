import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { supabase } from '@/lib/supabaseClient'

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '')

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId, userAnswer, hintUsed = false } = body

    // Validate input
    if (!sessionId || typeof userAnswer !== 'number') {
      return NextResponse.json(
        { error: 'Invalid request. Session ID and user answer are required.' },
        { status: 400 }
      )
    }

    // Retrieve the original problem from the database
    const { data: session, error: fetchError } = await supabase
      .from('math_problem_sessions')
      .select('*')
      .eq('id', sessionId)
      .single()

    if (fetchError || !session) {
      console.error('Error fetching session:', fetchError)
      return NextResponse.json(
        { error: 'Problem session not found' },
        { status: 404 }
      )
    }

    // Check if the answer is correct
    const isCorrect = Math.abs(userAnswer - session.correct_answer) < 0.01

    // Use AI to generate personalized feedback
    const model = genAI.getGenerativeModel({ model: 'models/gemini-2.0-flash' })

    const feedbackPrompt = `You are a helpful and encouraging Primary 5 math tutor. A student just answered a math problem.

Problem: ${session.problem_text}
Correct Answer: ${session.correct_answer}
Student's Answer: ${userAnswer}
Result: ${isCorrect ? 'CORRECT' : 'INCORRECT'}

Generate personalized, age-appropriate feedback for this Primary 5 student (ages 10-11).

If CORRECT:
- Congratulate them warmly
- Briefly explain why the answer is correct or highlight their good problem-solving
- Encourage them to try another problem
- Keep it concise (2-3 sentences)

If INCORRECT:
- Be encouraging and supportive (never discouraging)
- Gently explain what the correct answer is and why
- If their answer is close, acknowledge that
- Provide a brief hint about the correct approach or where they might have gone wrong
- Encourage them to try again
- Keep it concise (3-4 sentences)

Return ONLY the feedback text, no additional formatting or labels.`

    const feedbackResult = await model.generateContent(feedbackPrompt)
    const feedbackResponse = await feedbackResult.response
    const feedbackText = feedbackResponse.text().trim()

    // Save the submission to the database
    const { error: submissionError } = await supabase
      .from('math_problem_submissions')
      .insert({
        session_id: sessionId,
        user_answer: userAnswer,
        is_correct: isCorrect,
        feedback_text: feedbackText,
        hint_used: hintUsed,
      })

    if (submissionError) {
      console.error('Error saving submission:', submissionError)
      return NextResponse.json(
        { error: 'Failed to save submission' },
        { status: 500 }
      )
    }

    // Return the feedback and correctness to the frontend
    return NextResponse.json({
      isCorrect,
      feedback: feedbackText,
      correctAnswer: session.correct_answer,
    })
  } catch (error) {
    console.error('Error processing answer submission:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred while processing your answer' },
      { status: 500 }
    )
  }
}
