-- Migration script for creating test_files and test_results tables
-- Run this script in your Neon database console

-- Ensure pgcrypto is available for gen_random_uuid()
-- Many managed Postgres providers (including Neon) provide this extension.
-- If your provider does not allow creating extensions, replace gen_random_uuid()
-- with uuid_generate_v4() and enable the uuid-ossp extension instead.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Alternative: if your provider prefers the uuid-ossp extension, uncomment the
-- next line and change DEFAULT gen_random_uuid() to uuid_generate_v4() for id columns.
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create test_files table
CREATE TABLE IF NOT EXISTS test_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_name TEXT NOT NULL,
    -- optional normalized references if you want subjects/chapters as rows
    subject_id UUID,
    chapter_id UUID,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    file_json JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create test_results table
CREATE TABLE IF NOT EXISTS test_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_id UUID NOT NULL REFERENCES test_files(id) ON DELETE CASCADE,
    -- normalized references (optional)
    subject_id UUID,
    chapter_id UUID,
    question_id UUID,
    -- deprecated legacy denormalized fields kept for compatibility
    subject TEXT,
    chapter TEXT,
    score INTEGER NOT NULL CHECK (score >= 0),
    total INTEGER NOT NULL CHECK (total > 0),
    date_taken TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    result_json JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Normalized subjects and chapters (optional)
CREATE TABLE IF NOT EXISTS subjects (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL UNIQUE,
        slug TEXT NOT NULL UNIQUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chapters (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        slug TEXT NOT NULL,
        position INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(subject_id, slug)
);

-- Optional: normalized questions table if you want queries per-question
-- This is optional because questions are stored in file_json; use when
-- you need to query/filter individual questions across files.
CREATE TABLE IF NOT EXISTS test_questions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        file_id UUID NOT NULL REFERENCES test_files(id) ON DELETE CASCADE,
        question_id TEXT NOT NULL, -- original id from file_json
        question_json JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Foreign keys from test_files to subjects/chapters (optional, set when backfilling)
ALTER TABLE IF EXISTS test_files
    ADD CONSTRAINT IF NOT EXISTS fk_test_files_subject
        FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE SET NULL;

ALTER TABLE IF EXISTS test_files
    ADD CONSTRAINT IF NOT EXISTS fk_test_files_chapter
        FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE SET NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_test_files_file_name ON test_files(file_name);
CREATE INDEX IF NOT EXISTS idx_test_files_uploaded_at ON test_files(uploaded_at);
CREATE INDEX IF NOT EXISTS idx_test_results_file_id ON test_results(file_id);
CREATE INDEX IF NOT EXISTS idx_test_results_subject ON test_results(subject);
CREATE INDEX IF NOT EXISTS idx_test_results_date_taken ON test_results(date_taken);

-- Create updated_at trigger for test_files
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_test_files_updated_at
    BEFORE UPDATE ON test_files
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Also keep test_results.updated_at in sync
CREATE TRIGGER update_test_results_updated_at
    BEFORE UPDATE ON test_results
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add foreign keys and indexes for normalized references (optional)
ALTER TABLE IF EXISTS test_results
    ADD CONSTRAINT IF NOT EXISTS fk_test_results_subject
        FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE SET NULL;

ALTER TABLE IF EXISTS test_results
    ADD CONSTRAINT IF NOT EXISTS fk_test_results_chapter
        FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE SET NULL;

-- Indexes to accelerate queries by normalized ids
CREATE INDEX IF NOT EXISTS idx_test_results_subject_id ON test_results(subject_id);
CREATE INDEX IF NOT EXISTS idx_test_results_chapter_id ON test_results(chapter_id);
CREATE INDEX IF NOT EXISTS idx_test_results_question_id ON test_results(question_id);

-- Backfill notes:
-- To map existing rows to normalized subjects/chapters, insert subjects/chapters
-- from distinct file_json->>'section' and file_json->>'chapter', then update
-- test_results.subject_id by joining on subject name/slug. Keep legacy subject
-- and chapter text fields for compatibility until the application is migrated.