-- Complete CBT Database Initialization Script
-- This script sets up the full database schema with CBT Technician Gr I Signal syllabus
-- Run this in your Neon database console or via psql

-- Step 1: Create extensions and basic schema
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create test_files table
CREATE TABLE IF NOT EXISTS test_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_name TEXT NOT NULL,
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
    subject_id UUID,
    chapter_id UUID,
    question_id UUID,
    subject TEXT,
    chapter TEXT,
    score INTEGER NOT NULL CHECK (score >= 0),
    total INTEGER NOT NULL CHECK (total > 0),
    date_taken TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    result_json JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subjects table
CREATE TABLE IF NOT EXISTS subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chapters table
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

-- Create test_questions table (optional)
CREATE TABLE IF NOT EXISTS test_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_id UUID NOT NULL REFERENCES test_files(id) ON DELETE CASCADE,
    question_id TEXT NOT NULL,
    question_json JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key constraints
ALTER TABLE IF EXISTS test_files
    ADD CONSTRAINT IF NOT EXISTS fk_test_files_subject
        FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE SET NULL;

ALTER TABLE IF EXISTS test_files
    ADD CONSTRAINT IF NOT EXISTS fk_test_files_chapter
        FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE SET NULL;

ALTER TABLE IF EXISTS test_results
    ADD CONSTRAINT IF NOT EXISTS fk_test_results_subject
        FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE SET NULL;

ALTER TABLE IF EXISTS test_results
    ADD CONSTRAINT IF NOT EXISTS fk_test_results_chapter
        FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE SET NULL;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_test_files_file_name ON test_files(file_name);
CREATE INDEX IF NOT EXISTS idx_test_files_uploaded_at ON test_files(uploaded_at);
CREATE INDEX IF NOT EXISTS idx_test_results_file_id ON test_results(file_id);
CREATE INDEX IF NOT EXISTS idx_test_results_subject ON test_results(subject);
CREATE INDEX IF NOT EXISTS idx_test_results_date_taken ON test_results(date_taken);
CREATE INDEX IF NOT EXISTS idx_test_results_subject_id ON test_results(subject_id);
CREATE INDEX IF NOT EXISTS idx_test_results_chapter_id ON test_results(chapter_id);
CREATE INDEX IF NOT EXISTS idx_test_results_question_id ON test_results(question_id);

-- Create triggers for updated_at
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

CREATE TRIGGER update_test_results_updated_at
    BEFORE UPDATE ON test_results
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Step 2: Insert CBT subjects
INSERT INTO subjects (id, name, slug, created_at, updated_at)
VALUES
    (gen_random_uuid(), 'General Awareness', 'general-awareness', NOW(), NOW()),
    (gen_random_uuid(), 'General Intelligence and Reasoning', 'general-intelligence-and-reasoning', NOW(), NOW()),
    (gen_random_uuid(), 'Basics of Computers and Applications', 'basics-of-computers-and-applications', NOW(), NOW()),
    (gen_random_uuid(), 'Mathematics', 'mathematics', NOW(), NOW()),
    (gen_random_uuid(), 'Basic Science and Engineering', 'basic-science-and-engineering', NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW();

-- Step 3: Insert CBT chapters

-- General Awareness chapters
WITH s AS (SELECT id FROM subjects WHERE slug = 'general-awareness')
INSERT INTO chapters (id, subject_id, name, slug, position, created_at, updated_at)
SELECT gen_random_uuid(), s.id, name, regexp_replace(lower(name),'[^a-z0-9]+','-','g'), row_number() OVER (), NOW(), NOW()
FROM s, (VALUES
    ('Current Affairs'),
    ('Indian Geography'), 
    ('Indian Culture & History'),
    ('Freedom Struggle'),
    ('Indian Polity & Constitution'),
    ('Indian Economy'),
    ('Environmental Issues (India & World)'),
    ('Sports'),
    ('Scientific & Technological Developments')
) AS t(name)
ON CONFLICT (subject_id, slug) DO NOTHING;

-- General Intelligence and Reasoning chapters
WITH s AS (SELECT id FROM subjects WHERE slug = 'general-intelligence-and-reasoning')
INSERT INTO chapters (id, subject_id, name, slug, position, created_at, updated_at)
SELECT gen_random_uuid(), s.id, name, regexp_replace(lower(name),'[^a-z0-9]+','-','g'), row_number() OVER (), NOW(), NOW()
FROM s, (VALUES
    ('Analogies'),
    ('Alphabetical Series'),
    ('Number Series'),
    ('Coding & Decoding'),
    ('Mathematical Operations'),
    ('Relationships'),
    ('Syllogism'),
    ('Jumbling'),
    ('Venn Diagram'),
    ('Data Interpretation & Sufficiency'),
    ('Conclusions & Decision Making'),
    ('Similarities & Differences'),
    ('Analytical Reasoning'),
    ('Classification'),
    ('Directions'),
    ('Statement–Arguments'),
    ('Statement–Assumptions')
) AS t(name)
ON CONFLICT (subject_id, slug) DO NOTHING;

-- Basics of Computers and Applications chapters
WITH s AS (SELECT id FROM subjects WHERE slug = 'basics-of-computers-and-applications')
INSERT INTO chapters (id, subject_id, name, slug, position, created_at, updated_at)
SELECT gen_random_uuid(), s.id, name, regexp_replace(lower(name),'[^a-z0-9]+','-','g'), row_number() OVER (), NOW(), NOW()
FROM s, (VALUES
    ('Computer Architecture'),
    ('Input Devices'),
    ('Output Devices'),
    ('Storage Devices'),
    ('Networking'),
    ('Operating Systems (Windows/Unix/Linux)'),
    ('MS Office'),
    ('Data Representation'),
    ('Internet & Email'),
    ('Websites & Browsers'),
    ('Computer Virus')
) AS t(name)
ON CONFLICT (subject_id, slug) DO NOTHING;

-- Mathematics chapters
WITH s AS (SELECT id FROM subjects WHERE slug = 'mathematics')
INSERT INTO chapters (id, subject_id, name, slug, position, created_at, updated_at)
SELECT gen_random_uuid(), s.id, name, regexp_replace(lower(name),'[^a-z0-9]+','-','g'), row_number() OVER (), NOW(), NOW()
FROM s, (VALUES
    ('Number System'),
    ('Rational & Irrational Numbers'),
    ('BODMAS Rule'),
    ('Quadratic Equations'),
    ('Arithmetic Progression'),
    ('Similar Triangles'),
    ('Pythagoras Theorem'),
    ('Coordinate Geometry'),
    ('Trigonometric Ratios'),
    ('Heights & Distances'),
    ('Surface Area & Volume'),
    ('Sets'),
    ('Statistics (Dispersion & SD)'),
    ('Probability')
) AS t(name)
ON CONFLICT (subject_id, slug) DO NOTHING;

-- Basic Science and Engineering chapters
WITH s AS (SELECT id FROM subjects WHERE slug = 'basic-science-and-engineering')
INSERT INTO chapters (id, subject_id, name, slug, position, created_at, updated_at)
SELECT gen_random_uuid(), s.id, name, regexp_replace(lower(name),'[^a-z0-9]+','-','g'), row_number() OVER (), NOW(), NOW()
FROM s, (VALUES
    ('Units & Measurements'),
    ('Mass Weight Density'),
    ('Work Power Energy'),
    ('Speed & Velocity'),
    ('Heat & Temperature'),
    ('Electric Charge Field Intensity'),
    ('Electric Potential & Potential Difference'),
    ('Simple Electric Circuits'),
    ('Conductors & Insulators'),
    ('Ohm''s Law & Limitations'),
    ('Resistances Series & Parallel'),
    ('Specific Resistance'),
    ('Electric Potential Energy & Power'),
    ('Ampere''s Law'),
    ('Magnetic Force (Charged Particle)'),
    ('Magnetic Force (Straight Conductor)'),
    ('Electromagnetic Induction'),
    ('Faraday''s Law'),
    ('Electromagnetic Flux'),
    ('Magnetic Field'),
    ('Magnetic Induction'),
    ('Basic Electronics'),
    ('Digital Electronics'),
    ('Electronic Devices & Circuits'),
    ('Microcontroller'),
    ('Microprocessor'),
    ('Electronic Measurements'),
    ('Measuring Systems & Principles'),
    ('Range Extension Methods'),
    ('Cathode Ray Oscilloscope'),
    ('LCD'),
    ('LED Panel'),
    ('Transducers')
) AS t(name)
ON CONFLICT (subject_id, slug) DO NOTHING;

-- Verification queries (optional - uncomment to see results)
-- SELECT 'Subjects created:' as info, count(*) as count FROM subjects;
-- SELECT 'Chapters created:' as info, count(*) as count FROM chapters;
-- SELECT s.name as subject, count(c.id) as chapter_count 
-- FROM subjects s LEFT JOIN chapters c ON s.id = c.subject_id 
-- GROUP BY s.name ORDER BY s.name;

COMMIT;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'CBT Database initialization completed successfully!';
    RAISE NOTICE 'Created 5 subjects and their corresponding chapters';
    RAISE NOTICE 'You can now upload test files with subject/chapter selection';
END $$;