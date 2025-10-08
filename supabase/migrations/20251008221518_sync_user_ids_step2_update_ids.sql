/*
  # Step 2: Update User IDs to Match auth.users
  
  Update public.users and related tables to use auth.users IDs
*/

-- Update credit_ledger user_ids
UPDATE credit_ledger cl
SET user_id = au.id
FROM auth.users au, users u
WHERE cl.user_id = u.id
AND u.email = au.email;

-- Update credit_transactions user_ids  
UPDATE credit_transactions ct
SET user_id = au.id
FROM auth.users au, users u
WHERE ct.user_id = u.id
AND u.email = au.email;

-- Update generations user_ids
UPDATE generations g
SET user_id = au.id
FROM auth.users au, users u
WHERE g.user_id = u.id
AND u.email = au.email;

-- Finally, update users table IDs
UPDATE users u
SET id = au.id
FROM auth.users au
WHERE u.email = au.email;