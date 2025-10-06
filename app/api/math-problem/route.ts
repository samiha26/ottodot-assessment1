import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { supabase } from '@/lib/supabaseClient'

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '')

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { difficulty = 'Medium', problemType = 'mixed' } = body

    // Initialize the Gemini model
    const model = genAI.getGenerativeModel({ model: 'models/gemini-2.0-flash' })

    // Define difficulty parameters
    const difficultyParams = {
      Easy: 'Numbers should be small (1-20). Operations should be simple and straightforward.',
      Medium: 'Numbers should be moderate (1-100). May involve 2-3 steps.',
      Hard: 'Numbers can be larger (1-1000). Should involve multiple steps and potentially mixed operations.'
    }

    // Define problem type requirements
    const problemTypeParams = {
      addition: 'Focus ONLY on addition problems.',
      subtraction: 'Focus ONLY on subtraction problems.',
      multiplication: 'Focus ONLY on multiplication problems.',
      division: 'Focus ONLY on division problems.',
      mixed: 'Can use any combination of addition, subtraction, multiplication, or division.'
    }

    // Create a prompt for generating a Primary 5 level math word problem
    const prompt = `Generate a math word problem suitable for Primary 5 students (ages 10-11).

DIFFICULTY LEVEL: ${difficulty}
${difficultyParams[difficulty as keyof typeof difficultyParams]}

PROBLEM TYPE: ${problemType}
${problemTypeParams[problemType as keyof typeof problemTypeParams]}

The problem should be based on real-world scenarios that students can relate to (e.g., shopping, sports, school activities, cooking, games).

IMPORTANT: Return ONLY a valid JSON object with this exact structure, no markdown formatting or code blocks:
{
  "problem_text": "A clear, engaging word problem suitable for Primary 5 students",
  "final_answer": a number representing the correct answer (just the number, no units),
  "hint": "A helpful hint that guides the student without giving away the answer",
  "solution_steps": "Step-by-step explanation of how to solve the problem"
}

Example for Medium difficulty, mixed type:
{
  "problem_text": "Sarah went to the bookstore with $50. She bought 3 books at $12 each and 2 pencil cases at $4 each. How much money does she have left?",
  "final_answer": 6,
  "hint": "First, calculate how much Sarah spent in total, then subtract that from the money she started with.",
  "solution_steps": "Step 1: Calculate the cost of books: 3 × $12 = $36\\nStep 2: Calculate the cost of pencil cases: 2 × $4 = $8\\nStep 3: Find total spent: $36 + $8 = $44\\nStep 4: Subtract from starting amount: $50 - $44 = $6"
}

Generate a new, unique problem now.`

    // Generate the problem using Gemini
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // Parse the AI response
    let problemData
    try {
      // Remove markdown code blocks if present
      const cleanText = text.replace(/```json\n?|\n?```/g, '').trim()
      problemData = JSON.parse(cleanText)
    } catch (parseError) {
      console.error('Failed to parse AI response:', text)
      return NextResponse.json(
        { error: 'Failed to generate a valid problem. Please try again.' },
        { status: 500 }
      )
    }

    // Validate the response structure
    if (!problemData.problem_text || typeof problemData.final_answer !== 'number') {
      return NextResponse.json(
        { error: 'Invalid problem format generated. Please try again.' },
        { status: 500 }
      )
    }

    // Save the problem to Supabase
    const { data: session, error: dbError } = await supabase
      .from('math_problem_sessions')
      .insert({
        problem_text: problemData.problem_text,
        correct_answer: problemData.final_answer,
        difficulty: difficulty as 'Easy' | 'Medium' | 'Hard',
        problem_type: problemType as 'addition' | 'subtraction' | 'multiplication' | 'division' | 'mixed',
        hint_text: problemData.hint || null,
        solution_steps: problemData.solution_steps || null,
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json(
        { error: 'Failed to save problem to database' },
        { status: 500 }
      )
    }

    // Return the problem and session ID to the frontend
    return NextResponse.json({
      sessionId: session.id,
      problem: {
        problem_text: problemData.problem_text,
        final_answer: problemData.final_answer,
        hint: problemData.hint,
        solution_steps: problemData.solution_steps,
        difficulty: difficulty,
        problem_type: problemType,
      },
    })
  } catch (error) {
    console.error('Error generating problem:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred while generating the problem' },
      { status: 500 }
    )
  }
}
