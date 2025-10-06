'use client'

import { useState, useEffect } from 'react'

interface MathProblem {
  problem_text: string
  final_answer: number
  hint?: string
  solution_steps?: string
  difficulty?: string
  problem_type?: string
}

interface Stats {
  totalProblems: number
  attemptedProblems: number
  correctAnswers: number
  accuracy: number
  score: number
}

export default function Home() {
  const [problem, setProblem] = useState<MathProblem | null>(null)
  const [userAnswer, setUserAnswer] = useState('')
  const [feedback, setFeedback] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [showHint, setShowHint] = useState(false)
  const [showSolution, setShowSolution] = useState(false)
  const [hintUsed, setHintUsed] = useState(false)
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium')
  const [problemType, setProblemType] = useState<'addition' | 'subtraction' | 'multiplication' | 'division' | 'mixed'>('mixed')
  const [stats, setStats] = useState<Stats | null>(null)

  // Fetch stats on load
  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/history')
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const generateProblem = async () => {
    setIsLoading(true)
    setFeedback('')
    setIsCorrect(null)
    setUserAnswer('')
    setShowHint(false)
    setShowSolution(false)
    setHintUsed(false)

    try {
      const response = await fetch('/api/math-problem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          difficulty,
          problemType,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate problem')
      }

      const data = await response.json()
      setProblem(data.problem)
      setSessionId(data.sessionId)
    } catch (error) {
      console.error('Error generating problem:', error)
      setFeedback('Oops! Something went wrong. Please try again.')
      setIsCorrect(false)
    } finally {
      setIsLoading(false)
    }
  }

  const submitAnswer = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!sessionId) {
      setFeedback('Please generate a new problem first.')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/math-problem/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          userAnswer: parseFloat(userAnswer),
          hintUsed,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit answer')
      }

      const data = await response.json()
      setIsCorrect(data.isCorrect)
      setFeedback(data.feedback)

      // Refresh stats
      fetchStats()
    } catch (error) {
      console.error('Error submitting answer:', error)
      setFeedback('Oops! Something went wrong. Please try again.')
      setIsCorrect(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleShowHint = () => {
    setShowHint(true)
    setHintUsed(true)
  }

  return (
    <div className="min-h-screen">
      {/* Simple Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-8 md:px-12 lg:px-16 py-6 max-w-4xl">
          <div className="flex items-center justify-between flex-wrap gap-4">
            {/* Logo Section */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Math Problem Generator
              </h1>
              <p className="text-sm text-gray-600">Practice and improve your math skills</p>
            </div>

            {/* Stats */}
            {stats && (
              <div className="flex gap-4">
                <div className="text-center">
                  <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">Score</div>
                  <div className="text-2xl font-semibold text-gray-900">{stats.score}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">Correct</div>
                  <div className="text-2xl font-semibold text-gray-900">{stats.correctAnswers}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">Accuracy</div>
                  <div className="text-2xl font-semibold text-gray-900">{stats.accuracy}%</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-8 md:px-12 lg:px-16 py-8 max-w-4xl">
        {/* Settings Section */}
        <div className="card p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 text-center">
            Configure Problem
          </h2>

          <div className="space-y-12 mb-10">
            {/* Difficulty Level */}
            <div>
              <label className="block text-xl font-bold text-gray-800 mb-6 text-center">
                Difficulty Level
              </label>
              <div className="flex flex-wrap justify-center gap-12 mx-auto mb-4">
                <button
                  onClick={() => setDifficulty('Easy')}
                  className={`py-8 px-16 rounded-full font-bold text-2xl transition-all text-white ${
                    difficulty === 'Easy' ? 'bg-indigo-600 shadow-xl scale-105' : 'bg-indigo-500 hover:bg-indigo-600'
                  }`}
                  style={{ minWidth: '200px' }}
                >
                  Easy
                </button>
                <button
                  onClick={() => setDifficulty('Medium')}
                  className={`py-8 px-16 rounded-full font-bold text-2xl transition-all text-white ${
                    difficulty === 'Medium' ? 'bg-indigo-600 shadow-xl scale-105' : 'bg-indigo-500 hover:bg-indigo-600'
                  }`}
                  style={{ minWidth: '200px' }}
                >
                  Medium
                </button>
                <button
                  onClick={() => setDifficulty('Hard')}
                  className={`py-8 px-16 rounded-full font-bold text-2xl transition-all text-white ${
                    difficulty === 'Hard' ? 'bg-indigo-600 shadow-xl scale-105' : 'bg-indigo-500 hover:bg-indigo-600'
                  }`}
                  style={{ minWidth: '200px' }}
                >
                  Hard
                </button>
              </div>
            </div>

            {/* Problem Type */}
            <div>
              <label className="block text-xl font-bold text-gray-800 mb-6 text-center">
                Problem Type
              </label>
              <div className="flex flex-wrap justify-center gap-10 mx-auto mb-4">
                {[
                  { value: 'addition', label: 'Addition', icon: '+' },
                  { value: 'subtraction', label: 'Subtract', icon: '−' },
                  { value: 'multiplication', label: 'Multiply', icon: '×' },
                  { value: 'division', label: 'Division', icon: '÷' },
                  { value: 'mixed', label: 'Mixed', icon: '∑' },
                ].map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setProblemType(type.value as any)}
                    className={`py-8 px-10 rounded-full font-bold text-xl transition-all flex flex-col items-center gap-4 text-white ${
                      problemType === type.value ? 'bg-indigo-600 shadow-xl scale-105' : 'bg-indigo-500 hover:bg-indigo-600'
                    }`}
                  >
                    <span className="text-4xl mt-1">{type.icon}</span>
                    <span className="text-base font-bold mb-1">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <div className="text-center">
            <button
              onClick={generateProblem}
              disabled={isLoading}
              className="btn-primary w-full md:w-auto"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </span>
              ) : (
                'Generate New Problem'
              )}
            </button>
          </div>
        </div>

        {/* Problem Card */}
        {problem && (
          <div className="card p-8 mb-6 animate-fade-in">
            <div className="flex items-center justify-center mb-6 flex-wrap gap-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Problem
              </h2>
              <div className="flex gap-2">
                <span className={`badge ${
                  problem.difficulty === 'Easy' ? 'badge-success' :
                  problem.difficulty === 'Medium' ? 'badge-warning' :
                  'badge-error'
                }`}>
                  {problem.difficulty}
                </span>
                <span className="badge" style={{background: '#e0e7ff', color: '#3730a3'}}>
                  {problem.problem_type}
                </span>
              </div>
            </div>

            {/* Problem Text */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6 border border-gray-200">
              <p className="text-lg text-gray-900 leading-relaxed text-center">
                {problem.problem_text}
              </p>
            </div>

            <form onSubmit={submitAnswer} className="space-y-4">
              {/* Answer Input */}
              <div className="max-w-md mx-auto">
                <label htmlFor="answer" className="block text-sm font-medium text-gray-700 mb-2 text-center">
                  Your Answer
                </label>
                <input
                  type="number"
                  id="answer"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  className="input w-full text-lg"
                  placeholder="Enter your answer"
                  required
                  step="any"
                />
              </div>

              <div className="flex gap-3 flex-wrap justify-center">
                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={!userAnswer || isLoading}
                  className="btn-primary"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Checking...
                    </span>
                  ) : (
                    'Submit Answer'
                  )}
                </button>

                {/* Hint Button */}
                {problem.hint && !showHint && (
                  <button
                    type="button"
                    onClick={handleShowHint}
                    className="btn-secondary"
                  >
                    Show Hint
                  </button>
                )}
              </div>
            </form>

            {/* Hint Section */}
            {showHint && problem.hint && (
              <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-md p-4 animate-fade-in">
                <p className="font-medium text-yellow-900 mb-1 text-sm text-center">Hint</p>
                <p className="text-yellow-800 text-sm text-center">{problem.hint}</p>
              </div>
            )}
          </div>
        )}

        {/* Feedback Card */}
        {feedback && (
          <div className={`card p-6 mb-6 animate-fade-in ${
            isCorrect
              ? 'border-l-4 border-green-500 bg-green-50'
              : 'border-l-4 border-red-500 bg-red-50'
          }`}>
            <div className="mb-4 text-center">
              <h2 className="text-lg font-semibold mb-2" style={{color: isCorrect ? '#065f46' : '#991b1b'}}>
                {isCorrect ? 'Correct!' : 'Incorrect'}
              </h2>
              <p className="text-sm" style={{color: isCorrect ? '#047857' : '#b91c1c'}}>{feedback}</p>
            </div>

            {/* Solution Toggle */}
            {!isCorrect && problem?.solution_steps && (
              <div className="text-center">
                <button
                  onClick={() => setShowSolution(!showSolution)}
                  className="btn-secondary text-sm"
                >
                  {showSolution ? 'Hide Solution' : 'Show Solution'}
                </button>
              </div>
            )}

            {/* Step-by-Step Solution */}
            {showSolution && problem?.solution_steps && (
              <div className="mt-4 bg-white rounded-md p-4 border border-gray-200 animate-fade-in">
                <h3 className="font-medium text-gray-900 text-sm mb-2 text-center">
                  Step-by-Step Solution
                </h3>
                <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-line text-center">
                  {problem.solution_steps}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
