require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: 'todo_db'
};

const SECRET_KEY = process.env.JWT_SECRET || 'rahasia_negara';

const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) return res.status(403).json({ message: 'Invalid token' });
        req.user = decoded;
        next();
    });
};

// GET Todos (UPDATE: TAMPILKAN SEMUA DATA KE SEMUA USER)
app.get('/todos', authenticate, async (req, res) => {
    try {
        const conn = await mysql.createConnection(dbConfig);
        // Tidak ada filter WHERE user_id, semua bisa lihat semua
        const [rows] = await conn.execute('SELECT * FROM todos');
        await conn.end();
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST Todo
app.post('/todos', authenticate, async (req, res) => {
    const { title, category, deadline } = req.body;
    try {
        const conn = await mysql.createConnection(dbConfig);
        await conn.execute(
            'INSERT INTO todos (user_id, title, category, deadline, status) VALUES (?, ?, ?, ?, ?)',
            [req.user.id, title, category, deadline, 'Pending']
        );
        await conn.end();
        res.status(201).json({ message: 'Todo created' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// UPDATE Todo (PROTEKSI TETAP ADA)
app.put('/todos/:id', authenticate, async (req, res) => {
    const { progress } = req.body;
    const todoId = req.params.id;

    try {
        const conn = await mysql.createConnection(dbConfig);
        
        // Cek kepemilikan jika bukan admin
        if (req.user.role !== 'admin') {
            const [check] = await conn.execute('SELECT user_id FROM todos WHERE id = ?', [todoId]);
            if (check.length === 0 || check[0].user_id !== req.user.id) {
                await conn.end();
                return res.status(403).json({ message: 'Forbidden: Bukan tugas Anda' });
            }
        }

        await conn.execute('UPDATE todos SET status = ? WHERE id = ?', [progress, todoId]);
        await conn.end();
        res.json({ message: 'Todo updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE Todo (PROTEKSI TETAP ADA)
app.delete('/todos/:id', authenticate, async (req, res) => {
    const todoId = req.params.id;
    try {
        const conn = await mysql.createConnection(dbConfig);
        
        if (req.user.role !== 'admin') {
            const [check] = await conn.execute('SELECT user_id FROM todos WHERE id = ?', [todoId]);
            if (check.length === 0 || check[0].user_id !== req.user.id) {
                await conn.end();
                return res.status(403).json({ message: 'Forbidden: Bukan tugas Anda' });
            }
        }

        await conn.execute('DELETE FROM todos WHERE id = ?', [todoId]);
        await conn.end();
        res.json({ message: 'Todo deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(3002, () => console.log('Todo Service running on port 3002'));
