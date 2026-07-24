const express = require('express');

const {Pool} = require('pg');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());


const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
});


// Create table on startup if it doesn't exist
pool.query(`
    CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        title VARCHAR(100) NOT NULL,
        completed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW()
    )
`).catch(console.error);

// Health check endpoint - required for Docker health check and load balancer
app.get('/health', (req, res) => {
    res.json({status: 'ok', timestamp: new Date().toISOString()});
});

app.get('/tasks', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM tasks ORDER BY created_at DESC');    
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Internal Server Error'});
    }
});

app.post('/tasks', async (req, res) => {
    const { title } = req.body; 
    if(!title || title.trim() === '') {
        return res.status(400).json({error: 'Title is required'});
    }
    try {
        const result = await pool.query('INSERT INTO tasks (title) VALUES ($1) RETURNING *', [title]);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Internal Server Error'});
    }
});


app.patch('/tasks/:id', async (req, res) => {
    const { id } = req.params;
    const { completed } = req.body;
    try {
        const result = await pool.query('UPDATE tasks SET completed = $1 WHERE id = $2 RETURNING *', [completed, id]);
        if (result.rows.length === 0) {
            return res.status(404).json({error: 'Task not found'});
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Internal Server Error'});
    }
});



app.delete('/tasks/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM tasks WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({error: 'Task not found'});
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Internal Server Error'});
    }
});



app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});





