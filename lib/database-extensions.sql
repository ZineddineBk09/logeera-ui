-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create custom types for better geospatial handling
-- Note: Prisma will still use String fields, but we'll use raw SQL for geospatial queries
