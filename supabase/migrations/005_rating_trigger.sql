-- Migration 005: auto-update hospital rating on review change
CREATE OR REPLACE FUNCTION update_hospital_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE hospitals
  SET
    rating_avg = (
      SELECT COALESCE(AVG(rating::NUMERIC), 0)
      FROM reviews
      WHERE hospital_id = COALESCE(NEW.hospital_id, OLD.hospital_id)
        AND status = 'approved'
    ),
    review_count = (
      SELECT COUNT(*)
      FROM reviews
      WHERE hospital_id = COALESCE(NEW.hospital_id, OLD.hospital_id)
        AND status = 'approved'
    )
  WHERE id = COALESCE(NEW.hospital_id, OLD.hospital_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER reviews_update_rating
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_hospital_rating();