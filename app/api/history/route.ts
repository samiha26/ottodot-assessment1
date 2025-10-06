import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

export async function GET(request: NextRequest) {
  try {
    // Fetch all problem sessions with their submissions
    const { data: sessions, error: sessionsError } = await supabase
      .from('math_problem_sessions')
      .select(`
        *,
        math_problem_submissions (*)
      `)
      .order('created_at', { ascending: false })
      .limit(20)

    if (sessionsError) {
      console.error('Error fetching history:', sessionsError)
      return NextResponse.json(
        { error: 'Failed to fetch problem history' },
        { status: 500 }
      )
    }

    // Calculate statistics
    const totalProblems = sessions?.length || 0
    const attemptedProblems = sessions?.filter(s => s.math_problem_submissions.length > 0).length || 0
    const correctAnswers = sessions?.filter(s =>
      s.math_problem_submissions.some((sub: any) => sub.is_correct)
    ).length || 0

    const stats = {
      totalProblems,
      attemptedProblems,
      correctAnswers,
      accuracy: attemptedProblems > 0 ? Math.round((correctAnswers / attemptedProblems) * 100) : 0,
      score: correctAnswers * 10, // 10 points per correct answer
    }

    return NextResponse.json({
      sessions,
      stats,
    })
  } catch (error) {
    console.error('Error fetching history:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred while fetching history' },
      { status: 500 }
    )
  }
}
