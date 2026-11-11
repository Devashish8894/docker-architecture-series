-- Initial database schema for EP1 demonstration
CREATE TABLE IF NOT EXISTS services_status (
    id SERIAL PRIMARY KEY,
    service_name VARCHAR(100) NOT NULL,
    network_segment VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL,
    dns_hostname VARCHAR(100) NOT NULL,
    description TEXT,
    checked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO services_status (service_name, network_segment, status, dns_hostname, description)
VALUES 
    ('Frontend Web Client', 'frontend-net', 'ONLINE', 'frontend', 'Handles user presentation. Communicates with Backend API via internal DNS & port mapping.'),
    ('Backend REST API', 'frontend-net + backend-net', 'ONLINE', 'backend', 'Dual-homed bridge. Serves API to frontend, talks to database via private DNS.'),
    ('PostgreSQL Database', 'backend-net (Isolated)', 'PROTECTED', 'db', 'Fully isolated database. Inaccessible to frontend-net and host by design.');
