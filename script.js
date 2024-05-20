const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'your-database-url' });

app.use(express.json());

// Register Endpoint
app.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);
    const result = await pool.query('INSERT INTO employees (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *', [name, email, hashedPassword, 'employee']);
    res.json(result.rows[0]);
});

// Login Endpoint
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const result = await pool.query('SELECT * FROM employees WHERE email = $1', [email]);
    if (result.rows.length > 0) {
        const employee = result.rows[0];
        const isValid = bcrypt.compareSync(password, employee.password);
        if (isValid) {
            const token = jwt.sign({ id: employee.id, role: employee.role }, 'secret-key');
            res.json({ token });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } else {
        res.status(401).json({ message: 'Invalid credentials' });
    }
});

// Absensi Endpoint
app.post('/attendance', upload.single('photo'), async (req, res) => {
    const { date, time } = req.body;
    const { file } = req;
    const photoUrl = `/uploads/${file.filename}`;
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, 'secret-key');
    await pool.query('INSERT INTO attendance (employee_id, date, time, photo_url) VALUES ($1, $2, $3, $4)', [decoded.id, date, time, photoUrl]);
    res.json({ message: 'Attendance recorded' });
});

// Rekap Absensi Endpoint
app.get('/attendance/recap', async (req, res) => {
    const { period } = req.query; // 'weekly' or 'monthly'
    let query;
    if (period === 'weekly') {
        query = "SELECT * FROM attendance WHERE date >= NOW() - INTERVAL '1 week'";
    } else {
        query = "SELECT * FROM attendance WHERE date >= NOW() - INTERVAL '1 month'";
    }
    const result = await pool.query(query);
    res.json(result.rows);
});

// Kirim Pengaduan Endpoint
app.post('/complaint', async (req, res) => {
    const { message } = req.body;
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, 'secret-key');
    await pool.query('INSERT INTO complaints (employee_id, message, date) VALUES ($1, $2, $3)', [decoded.id, message, new Date()]);
    res.json({ message: 'Complaint submitted' });
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});
