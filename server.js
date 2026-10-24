const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Serve your single HTML file directly from this folder
app.use(express.static(__dirname));

// 1. Database Connection (Update with your PostgreSQL credentials)
const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'agri_b2b',
    password: process.env.DB_PASSWORD || 'your_password',
    port: process.env.DB_PORT || 5432,
});

// 2. API Endpoint: Get all available crops
app.get('/api/listings', async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM crop_listings WHERE status = 'available' ORDER BY created_at DESC"
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Database error' });
    }
});

// 3. API Endpoint: Allow farmers to post a new crop listing
app.post('/api/listings', async (req, res) => {
    try {
        const { farmer_id, crop_name, category, quantity_kg, price_per_kg, harvest_date, location_district } = req.body;
        const newListing = await pool.query(
            `INSERT INTO crop_listings (farmer_id, crop_name, category, quantity_kg, price_per_kg, harvest_date, location_district) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [farmer_id, crop_name, category, quantity_kg, price_per_kg, harvest_date, location_district]
        );
        res.json(newListing.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Failed to create listing' });
    }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});