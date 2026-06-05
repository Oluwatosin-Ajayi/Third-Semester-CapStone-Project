-- Migration 002: reviews table
CREATE TABLE reviews (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id  UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating       INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  text         TEXT,
  status       TEXT NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('approved', 'hidden', 'pending')),
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now()
);

-- One review per user per hospital
CREATE UNIQUE INDEX reviews_user_hospital_unique
  ON reviews (user_id, hospital_id);

CREATE INDEX reviews_hospital_idx ON reviews (hospital_id);
CREATE INDEX reviews_status_idx ON reviews (status);

CREATE TRIGGER reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();