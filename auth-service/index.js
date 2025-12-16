require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: 'user_db'
};

const SECRET_KEY = process.env.JWT_SECRET || 'rahasia_negara';

// Register
app.post('/auth/register', async (req, res) => {
    const { username, password, role } = req.body;
    const finalRole = role === 'admin' ? 'admin' : 'user';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    try {
        const conn = await mysql.createConnection(dbConfig);
        await conn.execute('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [username, hashedPassword, finalRole]);
        await conn.end();
        res.status(201).json({ message: 'User registered' });
    } catch (err) {
        res.status(500).json({ message: 'Error registering user', error: err.message });
    }
});

// Login
app.post('/auth/login', async (req, res) => {
    const { username, password } = req.body;
    
    try {
        const conn = await mysql.createConnection(dbConfig);
        const [rows] = await conn.execute('SELECT * FROM users WHERE username = ?', [username]);
        await conn.end();

        if (rows.length === 0) return res.status(404).json({ message: 'User not found' });

        const user = rows[0];
        const isValid = await bcrypt.compare(password, user.password);
        
        if (!isValid) return res.status(401).json({ message: 'Invalid password' });

        const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, SECRET_KEY, { expiresIn: '1h' });
        res.json({ token, role: user.role });
    } catch (err) {
        res.status(500).json({ message: 'Login error' });
    }
});

// Update Profile
app.put('/auth/update', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if(!token) return res.status(401).send('Unauthorized');

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        const { newUsername, newPassword } = req.body;
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const conn = await mysql.createConnection(dbConfig);
        await conn.execute('UPDATE users SET username=?, password=? WHERE id=?', [newUsername, hashedPassword, decoded.id]);
        await conn.end();
        res.json({ message: 'Profile updated' });
    } catch(err) {
        res.status(500).json({ message: err.message });
    }
});

// Get All Users (UPDATE: DIBUKA UNTUK SEMUA USER AUTHENTICATED)
app.get('/auth/users', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    try {
        // Cukup verifikasi token saja, tidak perlu cek role admin
        jwt.verify(token, SECRET_KEY);

        const conn = await mysql.createConnection(dbConfig);
        const [rows] = await conn.execute('SELECT id, username, role FROM users');
        await conn.end();
        res.json(rows);
    } catch (err) {
        res.status(401).json({ message: 'Unauthorized' });
    }
});

app.listen(3001, () => console.log('Auth Service running on port 3001'));
