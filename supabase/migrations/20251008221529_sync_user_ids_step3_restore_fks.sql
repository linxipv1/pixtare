/*
  # Step 3: Restore Foreign Key Constraints
  
  Add back foreign key constraints after ID sync
*/

ALTER TABLE credit_ledger
ADD CONSTRAINT credit_ledger_user_id_fkey
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE generations
ADD CONSTRAINT generations_user_id_fkey
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE credit_transactions
ADD CONSTRAINT credit_transactions_user_id_fkey
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;