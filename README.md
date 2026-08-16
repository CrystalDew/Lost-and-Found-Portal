# 📌 The Pinboard — Campus Lost & Found

**The Pinboard** is a full-stack, web-based Lost & Found platform designed specifically for college campuses. It allows students to report lost items, list found belongings, search through current posts, and mark returned items as resolved.

---

## 🚀 Features

* **Student Authentication:** Secure registration and login using college credentials.
* **Live Feed & Categorization:** Browse lost and found posts with instant filtering (All, Lost, Found, Claimed).
* **Search & Sort:** Easily filter items by name, location, category, or date.
* **Personalized User Profile:** View all your active posts in one place and mark items as claimed once returned.
* **Responsive UI:** Clean, glassmorphism-inspired UI designed for both mobile and desktop views.

---

## 🛠️ Tech Stack

* **Frontend:** HTML5, CSS3, JavaScript (Vanilla ES6+)
* **Backend:** Node.js, Express.js
* **Database:** PostgreSQL
* **Authentication:** Bcrypt.js (Password hashing)
* **API Architecture:** RESTful APIs

---



## ⚡ Getting Started Locally

### 1. Prerequisites
Ensure you have the following installed on your machine:
* [Node.js](https://nodejs.org/) (v14 or higher)
* [PostgreSQL](https://www.postgresql.org/)

### 2. Database Setup
Create a PostgreSQL database (e.g., `pinboard_db`) and set up the necessary tables:

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    fullname VARCHAR(100) NOT NULL,
    college_id VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE items (
    id SERIAL PRIMARY KEY,
    item_name VARCHAR(150) NOT NULL,
    category VARCHAR(50),
    location VARCHAR(150) NOT NULL,
    item_date DATE NOT NULL,
    item_time TIME,
    description TEXT,
    contact VARCHAR(100) NOT NULL,
    type VARCHAR(10) CHECK (type IN ('LOST', 'FOUND')),
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
3. Installation & Run
Clone the repository:

Bash
git clone [https://github.com/your-username/the-pinboard.git](https://github.com/your-username/the-pinboard.git)
cd the-pinboard
Install dependencies:

Bash
npm install
Configure your database credentials inside db.js.

Start the server:

Bash
node server.js
Open your browser and navigate to:

 http://localhost:3000
📜 Community Guidelines
Post only genuine lost or found items.

Always use your official college email when registering.

Meet in safe, public campus areas when returning items to fellow students.

📄 License
This project is open-source and built for student campus use.
© 2026 The Pinboard.
