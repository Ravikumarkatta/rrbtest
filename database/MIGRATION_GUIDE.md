Migration and seed guide for Neon (Postgres)

Overview
- This guide applies the DB schema, seeds subjects/chapters, and backfills existing rows to normalized IDs.
- Always test on a staging copy and take a snapshot/backup before running in production.

Prerequisites
- psql CLI available locally OR use the Neon SQL editor console.
- NEON_DATABASE_URL environment variable (or connection string) pointing to your Neon DB.
- `database/schema.sql`, `database/seed_subjects.sql`, and `database/backfill_subjects_and_results.sql` are present in the repo.

Steps
1) Apply schema (creates tables, triggers, extensions)

```bash
export DATABASE_URL="$NEON_DATABASE_URL"
psql "$DATABASE_URL" -f database/schema.sql
```

2) Seed subjects and chapters (idempotent)

```bash
psql "$DATABASE_URL" -f database/seed_subjects.sql
```

3) Backfill existing rows to normalized IDs

```bash
psql "$DATABASE_URL" -f database/backfill_subjects_and_results.sql
```

4) Verify
- Connect to the DB and run queries:
  - SELECT COUNT(*) FROM subjects;
  - SELECT COUNT(*) FROM chapters;
  - SELECT COUNT(*) FROM test_files WHERE subject_id IS NOT NULL;
  - SELECT COUNT(*) FROM test_results WHERE subject_id IS NOT NULL;

Optional: Node migration runner (useful when psql is not available)
- Create a small script that uses the existing `api/database.js` connector to run the SQL files. Example approach:
  - Read files via fs.readFileSync
  - Run them using db.query(sql) (you may need to split statements by `;` carefully)

Rollback strategy
- If you need to roll back, restore from DB snapshot/backup.
- The seed and backfill scripts are idempotent but not reversible automatically.

Notes
- If Neon disallows CREATE EXTENSION pgcrypto, generate UUIDs in application code or use uuid-ossp if supported.
- Keep legacy `file_json` and `test_results.subject` for compatibility while migrating the application logic to use IDs.
