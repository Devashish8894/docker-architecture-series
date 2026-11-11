const express = require('express');
const cors = require('cors');
const dns = require('dns').promises;
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Database connection pool using Docker Embedded DNS hostname 'db'
const pool = new Pool({
    host: process.env.DB_HOST || 'db',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME || 'arch_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres_secret',
    connectionTimeoutMillis: 5000
});

// Root endpoint: General Status & Architecture Overview
app.get('/api/status', async (req, res) => {
    try {
        const dbResult = await pool.query('SELECT * FROM services_status ORDER BY id ASC');
        res.json({
            status: 'success',
            chapter: '13:30 - Practical Example: Frontend-Backend Communication',
            message: 'Successfully reached Backend API via Docker network',
            container_hostname: require('os').hostname(),
            timestamp: new Date().toISOString(),
            services: dbResult.rows
        });
    } catch (err) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to query database',
            error: err.message
        });
    }
});

// Endpoint demonstrating Chapter 11:15 - Docker's Embedded DNS
app.get('/api/dns-lookup', async (req, res) => {
    const targetHost = req.query.host || 'db';
    try {
        const lookupResult = await dns.lookup(targetHost);
        res.json({
            query: targetHost,
            resolved_ip: lookupResult.address,
            family: `IPv${lookupResult.family}`,
            explanation: `Docker's embedded DNS server (127.0.0.11) automatically resolved the service name '${targetHost}' to container IP ${lookupResult.address}.`
        });
    } catch (err) {
        res.status(500).json({
            query: targetHost,
            error: err.message,
            explanation: `Resolution failed. Check if '${targetHost}' is in the same bridge network as this container.`
        });
    }
});

// Endpoint demonstrating Network Isolation
app.get('/api/network-info', (req, res) => {
    const os = require('os');
    const interfaces = os.networkInterfaces();
    res.json({
        service: 'Backend API Service',
        role: 'Dual-homed bridge connector (frontend-net & backend-net)',
        interfaces: interfaces
    });
});

app.listen(PORT, () => {
    console.log(`Backend API running inside container on port ${PORT}`);
});
