CREATE POLICY "Kids can view own account"
  ON kid_accounts FOR SELECT
  TO authenticated
  USING (id = get_kid_id());
