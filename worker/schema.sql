-- Rhythm Tracker data pipeline — docs/rhythm-tracker-instrument.md §S12.
-- Replaces Formspree. Columns mirror §S6's payload table 1:1.
--
-- Apply (one-time, and again whenever this file changes):
--   wrangler d1 execute aquatic-rhythm-rhythm-tracker --remote --file=schema.sql
--
-- Deliberately excluded: any IP address or other identifying metadata.
-- CF-Connecting-IP is used only transiently, in-memory, for the request-rate
-- limiter in index.js — it is never written to a row here. See §S12.2's
-- "No IP or identifying metadata persisted" note; this is a decision, not
-- an oversight, and must stay true here exactly as it was true of the
-- Formspree payload.

CREATE TABLE IF NOT EXISTS rhythm_tracker_submissions (
  id                    INTEGER PRIMARY KEY AUTOINCREMENT,
  respondent_id         TEXT NOT NULL,
  submission_index      INTEGER,
  instrument_version    TEXT NOT NULL,
  lang                  TEXT,
  submitted_at          TEXT NOT NULL,  -- client clock; kept for parity with Formspree-era rows
  received_at           TEXT NOT NULL DEFAULT (datetime('now')),  -- server clock; authoritative
  phases                TEXT,  -- JSON
  answers               TEXT,  -- JSON
  response_coding       TEXT,  -- JSON
  tank_volume           TEXT,
  tank_age              TEXT,
  oxygen_testing        TEXT,  -- v2.1
  temp_swing            TEXT,
  stocking_change       TEXT,
  life_change           TEXT,
  outcome_slip          TEXT,
  outcome_intervention  TEXT,
  care_intent           TEXT,
  days_since_first      TEXT,
  days_since_previous   TEXT,
  answer_dates          TEXT   -- JSON
);

CREATE INDEX IF NOT EXISTS idx_rts_respondent ON rhythm_tracker_submissions(respondent_id);

-- ── Migration: v2.1 adds oxygen_testing ─────────────────────────────────
-- The CREATE TABLE above is IF NOT EXISTS, so it is a no-op against a
-- database that already has the table — it will NOT add this column to an
-- existing table. Run the line below ONCE against a database created
-- before this column existed (SQLite/D1 has no "ADD COLUMN IF NOT EXISTS",
-- so running it a second time errors with "duplicate column name" — that
-- error means it already applied, not that anything is wrong):
--
--   ALTER TABLE rhythm_tracker_submissions ADD COLUMN oxygen_testing TEXT;
--
-- A fresh database created from this file today gets the column from the
-- CREATE TABLE above and never needs this line.
