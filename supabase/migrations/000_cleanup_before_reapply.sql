-- Run this ONCE in the Supabase SQL Editor before re-running 001_initial_schema.sql.
-- It removes the partial objects created by the failed first run (everything
-- before the index error at line 114), so the fixed migration applies cleanly.

DROP VIEW IF EXISTS issue_with_details;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS follows CASCADE;
DROP TABLE IF EXISTS votes CASCADE;
DROP TABLE IF EXISTS issue_updates CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS issues CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

DROP FUNCTION IF EXISTS find_duplicate_issues;
DROP FUNCTION IF EXISTS nearby_issues;

DROP TYPE IF EXISTS notification_type;
DROP TYPE IF EXISTS vote_type;
DROP TYPE IF EXISTS issue_severity;
DROP TYPE IF EXISTS issue_status;
DROP TYPE IF EXISTS user_role;
