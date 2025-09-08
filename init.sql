-- Initialize the notes_blog database
-- This file is executed when the PostgreSQL container starts for the first time

-- Grant all privileges to the postgres user
GRANT ALL PRIVILEGES ON DATABASE notes_blog TO postgres;

-- Create any additional users or permissions if needed
-- (Currently using the default postgres user with password 'postgres')

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create a function to generate slugs
CREATE OR REPLACE FUNCTION generate_slug(input_text TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN lower(regexp_replace(input_text, '[^a-zA-Z0-9\s-]', '', 'g'))
         |> regexp_replace('\s+', '-', 'g')
         |> trim('-');
END;
$$ LANGUAGE plpgsql;

-- Create indexes for better performance
-- These will be created after Prisma runs its migrations
-- but having them here ensures they exist for the application
