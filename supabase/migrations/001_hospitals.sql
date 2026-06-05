-- Migration 001: hospitals table
CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE hospitals (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  address         TEXT NOT NULL,
  city            TEXT NOT NULL,
  lga             TEXT NOT NULL,
  phone           TEXT NOT NULL,
  email           TEXT,
  specialties     TEXT[] DEFAULT '{}',
  ownership       TEXT CHECK (ownership IN ('public', 'private')) NOT NULL,
  location        GEOGRAPHY(POINT, 4326),
  description_md  TEXT,
  visiting_hours  TEXT,
  rating_avg      NUMERIC(3,2) DEFAULT 0,
  review_count    INT DEFAULT 0,
  created_by      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- Index for fast text search on name, city, lga
CREATE INDEX hospitals_name_idx ON hospitals USING GIN (to_tsvector('english', name));
CREATE INDEX hospitals_city_idx ON hospitals (city);
CREATE INDEX hospitals_lga_idx ON hospitals (lga);

-- Spatial index for PostGIS radius queries
CREATE INDEX hospitals_location_idx ON hospitals USING GIST (location);

-- Index for specialty filtering (GIN on array column)
CREATE INDEX hospitals_specialties_idx ON hospitals USING GIN (specialties);

-- Auto-update updated_at on any row change
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER hospitals_updated_at
  BEFORE UPDATE ON hospitals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();