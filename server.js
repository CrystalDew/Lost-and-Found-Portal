const express = require("express");
const cors = require("cors");
const path = require("path");
const pool = require("./db");
const bcrypt = require("bcryptjs");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

// Signup Route
app.post("/api/signup", async (req, res) => {
    try {
        const { fullname, college_id, email, phone, password } = req.body;

        // Corrected for bcryptjs
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(password, salt);

        const result = await pool.query(
            `INSERT INTO users
            (fullname, college_id, email, phone, password_hash)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, fullname, email, college_id`,
            [fullname, college_id, email, phone, hashedPassword]
        );

        res.status(201).json({
            message: "Signup successful!",
            user: result.rows[0]
        });

    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({
            message: "Signup failed",
            error: error.message
        });
    }
});

// Login Route (Supports bcrypt and plain-text fallback for test/legacy data)
app.post("/api/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (result.rows.length === 0) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const user = result.rows[0];
        const storedPassword = user.password_hash || user.password;

        if (!storedPassword) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        let isMatch = false;
        if (storedPassword.startsWith("$2a$") || storedPassword.startsWith("$2b$")) {
            isMatch = await bcrypt.compare(password, storedPassword);
        } else {
            isMatch = (password === storedPassword);
        }

        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        res.json({
            message: "Login successful!",
            user: { 
                id: user.id, 
                fullname: user.fullname, 
                email: user.email,
                college_id: user.college_id
            }
        });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Login failed", error: error.message });
    }
});

// Fetch All Items
app.get("/api/items", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM items ORDER BY created_at DESC");
        res.json(result.rows);
    } catch (error) {
        console.error("Fetch Items Error:", error);
        res.status(500).json({ message: "Failed to fetch items" });
    }
});

// Post Lost/Found Item
app.post("/api/items", async (req, res) => {
    try {
        const { title, category, type, location, item_date, item_time, description, contact } = req.body;

        const result = await pool.query(
            `INSERT INTO items (item_name, category, location, item_date, item_time, description, contact, type)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING *`,
            [
                title, 
                category, 
                location, 
                item_date, 
                item_time || null, 
                description, 
                contact, 
                type ? type.toUpperCase() : 'LOST'
            ]
        );

        res.status(201).json({ message: "Item posted successfully!", item: result.rows[0] });
    } catch (error) {
        console.error("Database insert error:", error);
        res.status(500).json({ message: "Failed to post item", error: error.message });
    }
});

// Update Item to Claimed
app.put("/api/items/:id/claim", async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            "UPDATE items SET status = 'CLAIMED' WHERE id = $1 RETURNING *",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Item not found" });
        }

        res.json({ message: "Item status updated to CLAIMED", item: result.rows[0] });
    } catch (error) {
        console.error("Claim Item Error:", error);
        res.status(500).json({ message: "Failed to update item status" });
    }
});

// Page Routes
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "portal.html")));
app.get("/portal.html", (req, res) => res.sendFile(path.join(__dirname, "portal.html")));
app.get("/login.html", (req, res) => res.sendFile(path.join(__dirname, "login.html")));
app.get("/signup.html", (req, res) => res.sendFile(path.join(__dirname, "signup.html")));
app.get("/user.html", (req, res) => res.sendFile(path.join(__dirname, "user.html")));

// Dynamic Port Configuration for Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
