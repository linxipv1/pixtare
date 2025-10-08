/*
  # Step 1: Remove Foreign Key Constraints
  
  Temporarily remove foreign key constraints to allow ID updates
*/

ALTER TABLE credit_ledger DROP CONSTRAINT IF EXISTS credit_ledger_user_id_fkey;
ALTER TABLE generations DROP CONSTRAINT IF EXISTS generations_user_id_fkey;
ALTER TABLE credit_transactions DROP CONSTRAINT IF EXISTS credit_transactions_user_id_fkey;