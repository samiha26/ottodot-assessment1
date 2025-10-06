-- Enhanced database schema with additional features

-- Drop existing tables if you want to recreate them (CAREFUL: this deletes data!)
-- DROP TABLE IF EXISTS math_problem_submissions;
-- DROP TABLE IF EXISTS math_problem_sessions;

-- Create enhanced math_problem_sessions table
CREATE TABLE IF NOT EXISTS math_problem_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    problem_text TEXT NOT NULL,
    correct_answer NUMERIC NOT NULL,
    difficulty TEXT CHECK (difficulty IN ('Easy', 'Medium', 'Hard')) DEFAULT 'Medium',
    problem_type TEXT CHECK (problem_type IN ('addition', 'subtraction', 'multiplication', 'division', 'mixed')) DEFAULT 'mixed',
    hint_text TEXT,
    solution_steps TEXT
);

-- Create enhanced math_problem_submissions table
CREATE TABLE IF NOT EXISTS math_problem_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES math_problem_sessions(id) ON DELETE CASCADE,
    user_answer NUMERIC NOT NULL,
    is_correct BOOLEAN NOT NULL,
    feedback_text TEXT NOT NULL,
    hint_used BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE math_problem_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE math_problem_submissions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow anonymous access to math_problem_sessions" ON math_problem_sessions;
DROP POLICY IF EXISTS "Allow anonymous access to math_problem_submissions" ON math_problem_submissions;

-- Create permissive policies for anonymous access (for assessment purposes)
-- In production, you would want more restrictive policies

-- Allow anonymous users to read and insert math_problem_sessions
CREATE POLICY "Allow anonymous access to math_problem_sessions" ON math_problem_sessions
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Allow anonymous users to read and insert math_problem_submissions
CREATE POLICY "Allow anonymous access to math_problem_submissions" ON math_problem_submissions
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_math_problem_submissions_session_id ON math_problem_submissions(session_id);
CREATE INDEX IF NOT EXISTS idx_math_problem_sessions_created_at ON math_problem_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_math_problem_sessions_difficulty ON math_problem_sessions(difficulty);
CREATE INDEX IF NOT EXISTS idx_math_problem_sessions_problem_type ON math_problem_sessions(problem_type);

-- Migration queries to add new columns to existing tables (use these if you already have data)
-- ALTER TABLE math_problem_sessions ADD COLUMN IF NOT EXISTS difficulty TEXT CHECK (difficulty IN ('Easy', 'Medium', 'Hard')) DEFAULT 'Medium';
-- ALTER TABLE math_problem_sessions ADD COLUMN IF NOT EXISTS problem_type TEXT CHECK (problem_type IN ('addition', 'subtraction', 'multiplication', 'division', 'mixed')) DEFAULT 'mixed';
-- ALTER TABLE math_problem_sessions ADD COLUMN IF NOT EXISTS hint_text TEXT;
-- ALTER TABLE math_problem_sessions ADD COLUMN IF NOT EXISTS solution_steps TEXT;
-- ALTER TABLE math_problem_submissions ADD COLUMN IF NOT EXISTS hint_used BOOLEAN DEFAULT false;
