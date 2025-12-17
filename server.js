const express = require('express');
const multer = require('multer');
const cors = require('cors');
const { createClient } = require('@libsql/client');

const app = express();
app.use(cors());
app.use(express.json());

// --- TURSO DATABASE CONNECTION ---
let db;
try {
  db = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN
  });
} catch (error) {
  console.error('Failed to connect to Turso:', error.message);
}

// Initialize database table
async function initDB() {
  if (!db) return;
  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS applications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fullName TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        department TEXT NOT NULL,
        experienceLevel TEXT DEFAULT 'intern',
        skills TEXT,
        bio TEXT,
        portfolioUrl TEXT,
        cvBase64 TEXT,
        cvFilename TEXT,
        subscribeToNewsletter INTEGER DEFAULT 0,
        submittedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Turso database ready');
  } catch (error) {
    console.error('DB Init Error:', error.message);
  }
}

// Initialize on first request (lazy loading for serverless)
let dbInitialized = false;

// --- FILE UPLOAD CONFIG (store as base64 in DB) ---
const upload = multer({ storage: multer.memoryStorage() });

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    dbConnected: !!db,
    envVars: {
      TURSO_DATABASE_URL: process.env.TURSO_DATABASE_URL ? 'set' : 'missing',
      TURSO_AUTH_TOKEN: process.env.TURSO_AUTH_TOKEN ? 'set' : 'missing'
    }
  });
});

// --- API ENDPOINT: Submit Application ---
app.post('/api/apply', upload.single('cv'), async (req, res) => {
  try {
    // Lazy init DB
    if (!dbInitialized) {
      await initDB();
      dbInitialized = true;
    }

    if (!db) {
      return res.status(500).json({ success: false, error: 'Database not configured. Check TURSO_DATABASE_URL and TURSO_AUTH_TOKEN.' });
    }

    const { fullName, email, phone, department, experienceLevel, skills, bio, portfolioUrl, subscribeToNewsletter } = req.body;
    const file = req.file;

    let cvBase64 = null;
    let cvFilename = null;

    if (file) {
      cvBase64 = file.buffer.toString('base64');
      cvFilename = file.originalname;
    }

    const result = await db.execute({
      sql: `INSERT INTO applications (fullName, email, phone, department, experienceLevel, skills, bio, portfolioUrl, cvBase64, cvFilename, subscribeToNewsletter)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        fullName,
        email,
        phone || '',
        department,
        experienceLevel || 'intern',
        typeof skills === 'string' ? skills : JSON.stringify(skills || []),
        bio || '',
        portfolioUrl || '',
        cvBase64,
        cvFilename,
        subscribeToNewsletter === 'true' || subscribeToNewsletter === true ? 1 : 0
      ]
    });

    res.json({ 
      success: true, 
      message: 'Application submitted successfully!',
      applicationId: result.lastInsertRowid
    });

  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- API ENDPOINT: Get All Applications (for admin) ---
app.get('/api/applications', async (req, res) => {
  try {
    if (!dbInitialized) {
      await initDB();
      dbInitialized = true;
    }
    if (!db) {
      return res.status(500).json({ error: 'Database not configured' });
    }
    const result = await db.execute('SELECT id, fullName, email, phone, department, experienceLevel, skills, bio, portfolioUrl, cvFilename, subscribeToNewsletter, submittedAt FROM applications ORDER BY submittedAt DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- API ENDPOINT: Download CV ---
app.get('/api/cv/:id', async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Database not configured' });
    }
    const result = await db.execute({
      sql: 'SELECT cvBase64, cvFilename FROM applications WHERE id = ?',
      args: [req.params.id]
    });
    
    if (result.rows.length === 0 || !result.rows[0].cvBase64) {
      return res.status(404).json({ error: 'CV not found' });
    }

    const { cvBase64, cvFilename } = result.rows[0];
    const buffer = Buffer.from(cvBase64, 'base64');
    
    res.setHeader('Content-Disposition', `attachment; filename="${cvFilename}"`);
    res.setHeader('Content-Type', 'application/octet-stream');
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// For local development
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({ path: '.env.local' });
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`INTERN_OS BACKEND RUNNING ON PORT ${PORT}`);
  });
}

// Export for Vercel serverless
module.exports = app;