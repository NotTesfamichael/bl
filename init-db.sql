-- Initialize the database
-- This script runs when the PostgreSQL container starts for the first time

-- Create the database if it doesn't exist
SELECT 'CREATE DATABASE notes_blog_dev'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'notes_blog_dev')\gexec

-- Create the production database if it doesn't exist
SELECT 'CREATE DATABASE notes_blog'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'notes_blog')\gexec

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE notes_blog_dev TO postgres;
GRANT ALL PRIVILEGES ON DATABASE notes_blog TO postgres;
