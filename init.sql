-- Initialize the database with proper settings
-- This file is run when the PostgreSQL container starts for the first time

-- Create the database if it doesn't exist (it should already exist from POSTGRES_DB)
-- But this is here as a safety measure
SELECT 'CREATE DATABASE notes_blog'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'notes_blog')\gexec

-- Set timezone
SET timezone = 'UTC';

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create a simple function to generate slugs (optional)
CREATE OR REPLACE FUNCTION generate_slug(input_text TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN lower(regexp_replace(input_text, '[^a-zA-Z0-9\s-]', '', 'g'))
         |> regexp_replace('\s+', '-', 'g')
         |> regexp_replace('-+', '-', 'g')
         |> trim(both '-' from);
END;
$$ LANGUAGE plpgsql;
