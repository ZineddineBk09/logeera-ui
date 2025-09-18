-- Set admin role for the admin user
UPDATE users SET role = 'ADMIN' WHERE email = 'admin@logeera.com';

-- Verify the update
SELECT id, name, email, role FROM users WHERE email = 'admin@logeera.com';
