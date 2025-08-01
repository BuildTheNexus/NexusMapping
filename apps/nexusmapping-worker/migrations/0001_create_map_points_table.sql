-- Migration number: 0001 	 2025-08-01T18:31:30.610Z
-- Initial schema for NexusMapping
CREATE TABLE map_points (
    pointId TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'new',
    description TEXT NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    accuracy REAL NOT NULL,
    address TEXT,
    photoId TEXT NOT NULL,
    adminNotes TEXT
);