-- Allow kids to update their own name and avatar
CREATE POLICY "Kids can update their own account"
  ON kid_accounts FOR UPDATE
  TO authenticated
  USING (id = get_kid_id())
  WITH CHECK (id = get_kid_id());
