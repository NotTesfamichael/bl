-- Initialize the notes_blog database
-- This file is executed when the PostgreSQL container starts for the first time

-- Grant all privileges to the postgres user
GRANT ALL PRIVILEGES ON DATABASE notes_blog TO postgres;

-- Create any additional users or permissions if needed
-- (Currently using the default postgres user with password 'password')
