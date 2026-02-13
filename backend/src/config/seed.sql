USE online_tuition;

-- Use this script only for local testing.
-- Generate hashes with backend helper command shown in README.

INSERT INTO users (name, email, password_hash, role)
VALUES
  ('Admin User', 'admin@example.com', '$2a$10$REPLACE_WITH_BCRYPT_HASH', 'admin'),
  ('Teacher User', 'teacher@example.com', '$2a$10$REPLACE_WITH_BCRYPT_HASH', 'teacher'),
  ('Student User', 'student@example.com', '$2a$10$REPLACE_WITH_BCRYPT_HASH', 'student');
