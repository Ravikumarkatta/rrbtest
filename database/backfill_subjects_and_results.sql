-- Backfill subjects/chapters and set subject_id/chapter_id on test_files and test_results
-- WARNING: Run on staging first and take a backup/snapshot before running on production.
-- This script is idempotent and uses CTEs + ON CONFLICT to avoid duplicates.

BEGIN;

-- 1) Ensure subjects exist for distinct test_files.file_json->>'section'
WITH distinct_sections AS (
  SELECT DISTINCT trim(file_json->>'section') AS section
  FROM test_files
  WHERE trim(coalesce(file_json->>'section','')) <> ''
), inserted AS (
  SELECT ds.section, COALESCE(s.id, gen_random_uuid()) AS id
  FROM distinct_sections ds
  LEFT JOIN subjects s ON lower(s.name) = lower(ds.section)
)
INSERT INTO subjects (id, name, slug, created_at, updated_at)
SELECT id, section, regexp_replace(lower(section),'[^a-z0-9]+','-','g'), NOW(), NOW()
FROM inserted
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW();

-- 2) Ensure chapters exist for distinct (section, chapter)
WITH files_with_chapters AS (
  SELECT DISTINCT trim(file_json->>'section') AS section, trim(file_json->>'chapter') AS chapter
  FROM test_files
  WHERE trim(coalesce(file_json->>'chapter','')) <> ''
), subject_map AS (
  SELECT id AS subject_id, name FROM subjects
), to_insert AS (
  SELECT gen_random_uuid() AS id, sm.subject_id, fwc.chapter AS name, regexp_replace(lower(fwc.chapter),'[^a-z0-9]+','-','g') AS slug, ROW_NUMBER() OVER (PARTITION BY fwc.section ORDER BY fwc.chapter) AS pos
  FROM files_with_chapters fwc
  JOIN subject_map sm ON lower(sm.name) = lower(fwc.section)
)
INSERT INTO chapters (id, subject_id, name, slug, position, created_at, updated_at)
SELECT id, subject_id, name, slug, pos, NOW(), NOW()
FROM to_insert
ON CONFLICT (subject_id, slug) DO NOTHING;

-- 3) Update test_files.subject_id by matching file_json->>'section' to subjects.name
UPDATE test_files tf
SET subject_id = s.id
FROM subjects s
WHERE tf.subject_id IS NULL
  AND trim(lower(tf.file_json->>'section')) = trim(lower(s.name));

-- 4) Update test_files.chapter_id by matching file_json->>'chapter' to chapters.name (requires subject_id)
UPDATE test_files tf
SET chapter_id = c.id
FROM chapters c
WHERE tf.chapter_id IS NULL
  AND tf.subject_id = c.subject_id
  AND trim(lower(tf.file_json->>'chapter')) = trim(lower(c.name));

-- 5) Update test_results.subject_id using the legacy subject text
UPDATE test_results tr
SET subject_id = s.id
FROM subjects s
WHERE tr.subject_id IS NULL
  AND trim(lower(tr.subject)) = trim(lower(s.name));

-- 6) Update test_results.chapter_id using legacy chapter text and subject mapping
UPDATE test_results tr
SET chapter_id = c.id
FROM chapters c
WHERE tr.chapter_id IS NULL
  AND tr.subject_id = c.subject_id
  AND trim(lower(tr.chapter)) = trim(lower(c.name));

COMMIT;

-- Add optional index for fast filtering by subject/chapter
CREATE INDEX IF NOT EXISTS idx_test_files_subject_chapter_uploaded ON test_files(subject_id, chapter_id, uploaded_at);
CREATE INDEX IF NOT EXISTS idx_subjects_slug ON subjects(slug);
CREATE INDEX IF NOT EXISTS idx_chapters_subject_slug ON chapters(subject_id, slug);
