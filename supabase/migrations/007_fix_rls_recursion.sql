
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;



DROP POLICY IF EXISTS "hospitals_admin_insert" ON hospitals;
DROP POLICY IF EXISTS "hospitals_admin_update" ON hospitals;
DROP POLICY IF EXISTS "hospitals_admin_delete" ON hospitals;

CREATE POLICY "hospitals_admin_insert"
  ON hospitals FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "hospitals_admin_update"
  ON hospitals FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "hospitals_admin_delete"
  ON hospitals FOR DELETE
  USING (public.is_admin());



DROP POLICY IF EXISTS "reviews_read_approved" ON reviews;
DROP POLICY IF EXISTS "reviews_admin_moderate" ON reviews;

CREATE POLICY "reviews_read_approved"
  ON reviews FOR SELECT
  USING (status = 'approved' OR auth.uid() = user_id OR public.is_admin());

CREATE POLICY "reviews_admin_moderate"
  ON reviews FOR UPDATE
  USING (public.is_admin());


DROP POLICY IF EXISTS "images_admin_insert" ON hospital_images;
DROP POLICY IF EXISTS "images_admin_delete" ON hospital_images;

CREATE POLICY "images_admin_insert"
  ON hospital_images FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "images_admin_delete"
  ON hospital_images FOR DELETE
  USING (public.is_admin());



DROP POLICY IF EXISTS "users_admin_read_all" ON public.users;

CREATE POLICY "users_admin_read_all"
  ON public.users FOR SELECT
  USING (public.is_admin());
