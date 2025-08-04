-- Migration number: 0002 	 2025-08-04T06:54:17.420Z

CREATE TABLE users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    name TEXT,
    role TEXT NOT NULL CHECK(role IN ('admin', 'viewer')) DEFAULT 'viewer',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);