-- Migration 003: hospital_images table
CREATE TABLE hospital_images (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id   UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  storage_path  TEXT NOT NULL,
  uploaded_by   UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX hospital_images_hospital_idx ON hospital_images (hospital_id);