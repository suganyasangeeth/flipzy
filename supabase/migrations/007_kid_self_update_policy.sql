-- Grant authenticated role UPDATE on kid_accounts (missing from 004)
GRANT UPDATE ON public.kid_accounts TO authenticated;

-- Allow kids to update their own name and avatar
CREATE POLICY "Kids can update their own account"
  ON kid_accounts FOR UPDATE
  TO authenticated
  USING (id = get_kid_id())
  WITH CHECK (id = get_kid_id());
