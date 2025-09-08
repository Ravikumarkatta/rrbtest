-- Migration script for creating test_files and test_results tables
-- Run this script in your Neon database console

-- Create test_files table
CREATE TABLE IF NOT EXISTS test_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_name TEXT NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    file_json JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create test_results table
CREATE TABLE IF NOT EXISTS test_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_id UUID NOT NULL REFERENCES test_files(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    chapter TEXT,
    score INTEGER NOT NULL CHECK (score >= 0),
    total INTEGER NOT NULL CHECK (total > 0),
    date_taken TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    result_json JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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