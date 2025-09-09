-- Idempotent seed for subjects and chapters
-- Inserts subjects and chapters drawn from api/subjects.js
-- Run with psql: psql "$NEON_DATABASE_URL" -f database/seed_subjects.sql

-- Uses pgcrypto gen_random_uuid(); ensure pgcrypto extension is enabled.

BEGIN;

-- Insert subjects (idempotent)
INSERT INTO subjects (id, name, slug, created_at, updated_at)
VALUES
  (gen_random_uuid(), 'General Awareness', 'general-awareness', NOW(), NOW()),
  (gen_random_uuid(), 'General Intelligence and Reasoning', 'general-intelligence-and-reasoning', NOW(), NOW()),
  (gen_random_uuid(), 'Basics of Computers and Applications', 'basics-of-computers-and-applications', NOW(), NOW()),
  (gen_random_uuid(), 'Mathematics', 'mathematics', NOW(), NOW()),
  (gen_random_uuid(), 'Basic Science and Engineering', 'basic-science-and-engineering', NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW();

-- Helper: get subject id by slug
-- Chapters for 'General Awareness'
WITH s AS (SELECT id FROM subjects WHERE slug = 'general-awareness')
INSERT INTO chapters (id, subject_id, name, slug, position, created_at, updated_at)
SELECT gen_random_uuid(), s.id, name, regexp_replace(lower(name),'[^a-z0-9]+','-','g'), row_number() OVER (), NOW(), NOW()
FROM s, (VALUES
  ('Current Affairs'), ('Indian Geography'), ('Indian Culture & History'), ('Freedom Struggle'),
  ('Indian Polity & Constitution'), ('Indian Economy'), ('Environmental Issues (India & World)'),
  ('Sports'), ('Scientific & Technological Developments')
) AS t(name)
ON CONFLICT (subject_id, slug) DO NOTHING;

-- Chapters for 'General Intelligence and Reasoning'
WITH s AS (SELECT id FROM subjects WHERE slug = 'general-intelligence-and-reasoning')
INSERT INTO chapters (id, subject_id, name, slug, position, created_at, updated_at)
SELECT gen_random_uuid(), s.id, name, regexp_replace(lower(name),'[^a-z0-9]+','-','g'), row_number() OVER (), NOW(), NOW()
FROM s, (VALUES
  ('Analogies'), ('Alphabetical Series'), ('Number Series'), ('Coding & Decoding'), ('Mathematical Operations'),
  ('Relationships'), ('Syllogism'), ('Jumbling'), ('Venn Diagram'), ('Data Interpretation & Sufficiency'),
  ('Conclusions & Decision Making'), ('Similarities & Differences'), ('Analytical Reasoning'),
  ('Classification'), ('Directions'), ('Statement–Arguments'), ('Statement–Assumptions')
) AS t(name)
ON CONFLICT (subject_id, slug) DO NOTHING;

-- Chapters for 'Basics of Computers and Applications'
WITH s AS (SELECT id FROM subjects WHERE slug = 'basics-of-computers-and-applications')
INSERT INTO chapters (id, subject_id, name, slug, position, created_at, updated_at)
SELECT gen_random_uuid(), s.id, name, regexp_replace(lower(name),'[^a-z0-9]+','-','g'), row_number() OVER (), NOW(), NOW()
FROM s, (VALUES
  ('Computer Architecture'), ('Input Devices'), ('Output Devices'), ('Storage Devices'), ('Networking'),
  ('Operating Systems (Windows/Unix/Linux)'), ('MS Office'), ('Data Representation'), ('Internet & Email'),
  ('Websites & Browsers'), ('Computer Virus')
) AS t(name)
ON CONFLICT (subject_id, slug) DO NOTHING;

-- Chapters for 'Mathematics'
WITH s AS (SELECT id FROM subjects WHERE slug = 'mathematics')
INSERT INTO chapters (id, subject_id, name, slug, position, created_at, updated_at)
SELECT gen_random_uuid(), s.id, name, regexp_replace(lower(name),'[^a-z0-9]+','-','g'), row_number() OVER (), NOW(), NOW()
FROM s, (VALUES
  ('Number System'), ('Rational & Irrational Numbers'), ('BODMAS Rule'), ('Quadratic Equations'),
  ('Arithmetic Progression'), ('Similar Triangles'), ('Pythagoras Theorem'), ('Coordinate Geometry'),
  ('Trigonometric Ratios'), ('Heights & Distances'), ('Surface Area & Volume'), ('Sets'),
  ('Statistics (Dispersion & SD)'), ('Probability')
) AS t(name)
ON CONFLICT (subject_id, slug) DO NOTHING;

-- Chapters for 'Basic Science and Engineering'
WITH s AS (SELECT id FROM subjects WHERE slug = 'basic-science-and-engineering')
INSERT INTO chapters (id, subject_id, name, slug, position, created_at, updated_at)
SELECT gen_random_uuid(), s.id, name, regexp_replace(lower(name),'[^a-z0-9]+','-','g'), row_number() OVER (), NOW(), NOW()
FROM s, (VALUES
  ('Units & Measurements'), ('Mass Weight Density'), ('Work Power Energy'), ('Speed & Velocity'), ('Heat & Temperature'),
  ('Electric Charge Field Intensity'), ('Electric Potential & Potential Difference'), ('Simple Electric Circuits'),
  ('Conductors & Insulators'), ('Ohm’s Law & Limitations'), ('Resistances Series & Parallel'), ('Specific Resistance'),
  ('Electric Potential Energy & Power'), ('Ampere’s Law'), ('Magnetic Force (Charged Particle)'),
  ('Magnetic Force (Straight Conductor)'), ('Electromagnetic Induction'), ('Faraday’s Law'), ('Electromagnetic Flux'),
  ('Magnetic Field'), ('Magnetic Induction'), ('Basic Electronics'), ('Digital Electronics'), ('Electronic Devices & Circuits'),
  ('Microcontroller'), ('Microprocessor'), ('Electronic Measurements'), ('Measuring Systems & Principles'),
  ('Range Extension Methods'), ('Cathode Ray Oscilloscope'), ('LCD'), ('LED Panel'), ('Transducers')
) AS t(name)
ON CONFLICT (subject_id, slug) DO NOTHING;

COMMIT;
