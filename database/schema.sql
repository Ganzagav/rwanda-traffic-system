-- Enable PostGIS extension for spatial queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- Intersections / Waypoints Table
CREATE TABLE IF NOT EXISTS nodes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    geom GEOMETRY(Point, 4326)
);

-- Enum for Road Surface Types
DO $$ BEGIN
    CREATE TYPE surface_type_enum AS ENUM ('tarmac', 'stone', 'unpaved');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Road Segments (Edges in the Routing Graph)
CREATE TABLE IF NOT EXISTS road_segments (
    id SERIAL PRIMARY KEY,
    source_node_id INT REFERENCES nodes(id) ON DELETE CASCADE,
    target_node_id INT REFERENCES nodes(id) ON DELETE CASCADE,
    road_name VARCHAR(150) NOT NULL,
    distance_km NUMERIC(5, 2) NOT NULL,
    speed_limit_kmh INT DEFAULT 50,
    surface_type surface_type_enum DEFAULT 'tarmac',
    congestion_factor NUMERIC(3, 2) DEFAULT 1.0, -- 1.0 = Normal, 2.0 = Heavy, 3.5 = Severe
    is_closed BOOLEAN DEFAULT FALSE,
    closure_reason TEXT DEFAULT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Traffic Police & Public Event Reports
CREATE TABLE IF NOT EXISTS traffic_reports (
    id SERIAL PRIMARY KEY,
    road_segment_id INT REFERENCES road_segments(id) ON DELETE CASCADE,
    reported_by VARCHAR(100) DEFAULT 'Traffic Police',
    incident_type VARCHAR(50) NOT NULL, -- Congestion, Construction, Event (BK Arena / Amahoro), Accident
    description TEXT,
    severity INT DEFAULT 1, -- 1 (Low) to 5 (Critical)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Spatial Indices
CREATE INDEX IF NOT EXISTS idx_nodes_geom ON nodes USING GIST(geom);

-- Initial Seed Data for Kigali Locations
INSERT INTO nodes (name, latitude, longitude, geom) VALUES
('Kibagabaga Junction', -1.9325, 30.1082, ST_SetSRID(ST_MakePoint(30.1082, -1.9325), 4326)),
('Kimironko Market', -1.9442, 30.1251, ST_SetSRID(ST_MakePoint(30.1251, -1.9442), 4326)),
('Gisozi Sector Center', -1.9181, 30.0653, ST_SetSRID(ST_MakePoint(30.0653, -1.9181), 4326)),
('Kagugu Center', -1.9056, 30.0812, ST_SetSRID(ST_MakePoint(30.0812, -1.9056), 4326)),
('BK Arena / Amahoro', -1.9536, 30.1127, ST_SetSRID(ST_MakePoint(30.1127, -1.9536), 4326)),
('Nyabugogo Bus Park', -1.9389, 30.0441, ST_SetSRID(ST_MakePoint(30.0441, -1.9389), 4326));

-- Sample Road Network Connections
INSERT INTO road_segments (source_node_id, target_node_id, road_name, distance_km, speed_limit_kmh, surface_type, congestion_factor, is_closed) VALUES
(1, 2, 'KG 14 Ave (Kibagabaga - Kimironko)', 3.2, 50, 'tarmac', 2.8, FALSE), -- Heavy traffic on main tarmac
(1, 4, 'KG 280 St (Kibagabaga - Kagugu Bypass)', 4.1, 40, 'stone', 1.0, FALSE), -- Longer, stone surface, clear traffic
(4, 3, 'KG 513 St (Kagugu - Gisozi)', 3.8, 40, 'unpaved', 1.1, FALSE),
(2, 5, 'KG 11 Ave (Kimironko - BK Arena)', 2.5, 60, 'tarmac', 3.5, TRUE), -- Blocked due to event
(3, 6, 'KN 1 Rd (Gisozi - Nyabugogo)', 5.0, 50, 'tarmac', 1.2, FALSE);