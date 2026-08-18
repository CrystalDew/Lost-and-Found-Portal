const express = require('express');
const path = require('path');
const cors = require('cors');
const bcrypt = require('bcrypt');
const pool = require('./db');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname)));

// Root Route - Serves the login page by default
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

// ================= USER AUTHENTICATION ROUTES =================

// Signup Route
app.post('/api/signup', async (req, res) => {
  const { fullname, college_id, email, phone, password } = req.body;

  try {
    // Check if user already exists
    const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Hash the password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Insert user into database
    const newUser = await pool.query(
      'INSERT INTO users (fullname, college_id, email, phone, password_hash) VALUES ($1, $2, $3, $4, $5) RETURNING id, fullname, email',
      [fullname, college_id, email, phone, password_hash]
    );

    res.status(201).json({ message: 'User registered successfully', user: newUser.rows[0] });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Server error during signup' });
  }
});

// Login Route
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const user = result.rows[0];

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        fullname: user.fullname,
        email: user.email,
        college_id: user.college_id
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// ================= LOST & FOUND ITEMS ROUTES =================

// Get all lost/found items
app.get('/api/items', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM items ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Fetch items error:', err);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

// Add a new item (Lost or Found)
app.post('/api/items', async (req, res) => {
  const { item_name, category, location, item_date, item_time, description, contact, type } = req.body;

  try {
    const newItem = await pool.query(
      `INSERT INTO items (item_name, category, location, item_date, item_time, description, contact, type)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [item_name, category, location, item_date, item_time, description, contact, type]
    );

    res.status(201).json({ message: 'Item reported successfully', item: newItem.rows[0] });
  } catch (err) {
    console.error('Add item error:', err);
    res.status(500).json({ error: 'Failed to add item' });
  }
});

// Mark item as resolved/claimed
app.put('/api/items/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // e.g., 'RESOLVED' or 'CLAIMED'

  try {
    const updatedItem = await pool.query(
      'UPDATE items SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (updatedItem.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.json({ message: 'Item status updated', item: updatedItem.rows[0] });
  } catch (err) {
    console.error('Update item error:', err);
    res.status(500).json({ error: 'Failed to update item status' });
  }
});

// ================= SERVER PORT CONFIGURATION =================

// Render assigns a dynamic port via process.env.PORT
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running live on port ${PORT}`);
});
