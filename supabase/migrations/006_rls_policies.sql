-- Migration 006: Enable RLS on all tables
ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospital_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- HOSPITALS
-- ============================================================

-- Anyone can read hospitals
CREATE POLICY "hospitals_read_all"
  ON hospitals FOR SELECT
  USING (true);

-- Only admins can insert
CREATE POLICY "hospitals_admin_insert"
  ON hospitals FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can update
CREATE POLICY "hospitals_admin_update"
  ON hospitals FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can delete
CREATE POLICY "hospitals_admin_delete"
  ON hospitals FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================
-- REVIEWS
-- ============================================================

-- Anyone can read approved reviews
CREATE POLICY "reviews_read_approved"
  ON reviews FOR SELECT
  USING (status = 'approved' OR auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- Logged-in users can submit reviews
CREATE POLICY "reviews_user_insert"
  ON reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can edit their own reviews
CREATE POLICY "reviews_user_update_own"
  ON reviews FOR UPDATE
  USING (auth.uid() = user_id);

-- Admins can moderate (approve/hide) any review
CREATE POLICY "reviews_admin_moderate"
  ON reviews FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================
-- HOSPITAL IMAGES
-- ============================================================

-- Anyone can read images
CREATE POLICY "images_read_all"
  ON hospital_images FOR SELECT
  USING (true);

-- Only admins can upload
CREATE POLICY "images_admin_insert"
  ON hospital_images FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can delete
CREATE POLICY "images_admin_delete"
  ON hospital_images FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================
-- USERS
-- ============================================================

-- Users can read their own row
CREATE POLICY "users_read_own"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

-- Admins can read all users
CREATE POLICY "users_admin_read_all"
  ON public.users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );