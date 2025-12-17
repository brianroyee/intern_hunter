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

    await db.execute(`
      CREATE TABLE IF NOT EXISTS blog_posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        excerpt TEXT,
        content TEXT NOT NULL,
        author TEXT DEFAULT 'ADMIN',
        imageBase64 TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS jobs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        company TEXT NOT NULL,
        company_url TEXT,
        location TEXT NOT NULL,
        salary_min INTEGER,
        salary_max INTEGER,
        equity TEXT,
        tags TEXT, -- JSON array
        description TEXT NOT NULL,
        apply_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS referrals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        job_id INTEGER,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        linkedin TEXT,
        why_me TEXT,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
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

// --- API ENDPOINT: Create Blog Post ---
app.post('/api/blogs', upload.single('image'), async (req, res) => {
  try {
    if (!dbInitialized) {
      await initDB();
      dbInitialized = true;
    }
    if (!db) return res.status(500).json({ error: 'Database not configured' });

    const { title, excerpt, content, author } = req.body;
    const file = req.file;

    let imageBase64 = null;
    if (file) {
      imageBase64 = file.buffer.toString('base64');
    }

    const result = await db.execute({
      sql: `INSERT INTO blog_posts (title, excerpt, content, author, imageBase64) VALUES (?, ?, ?, ?, ?)`,
      args: [title, excerpt, content, author || 'ADMIN', imageBase64]
    });

    res.json({ success: true, id: result.lastInsertRowid });
  } catch (error) {
    console.error('Blog Create Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- API ENDPOINT: Get All Blogs (Optimized: No Images) ---
app.get('/api/blogs', async (req, res) => {
  try {
    if (!dbInitialized) {
      await initDB();
      dbInitialized = true;
    }
    if (!db) return res.status(500).json({ error: 'Database not configured' });

    // Exclude imageBase64 to speed up loading
    const result = await db.execute('SELECT id, title, excerpt, content, author, createdAt FROM blog_posts ORDER BY createdAt DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- API ENDPOINT: Get Single Blog Post ---
app.get('/api/blogs/:id', async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: 'Database not configured' });
    const { id } = req.params;
    
    // Fetch full blog post including content, but still exclude imageBase64 (frontend fetches it separately)
    // Actually, for the reading page, we might want the image separate anyway to use the image endpoint.
    // So we just fetch text fields.
    const result = await db.execute({
        sql: 'SELECT id, title, excerpt, content, author, createdAt FROM blog_posts WHERE id = ?',
        args: [id]
    });

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Blog post not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- API ENDPOINT: Get Blog Image ---
app.get('/api/blogs/:id/image', async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: 'Database not configured' });
    const { id } = req.params;
    const result = await db.execute({
      sql: 'SELECT imageBase64 FROM blog_posts WHERE id = ?',
      args: [id]
    });

    if (result.rows.length === 0 || !result.rows[0].imageBase64) {
      return res.status(404).send('Image not found');
    }

    const imgBuffer = Buffer.from(result.rows[0].imageBase64, 'base64');
    res.writeHead(200, {
      'Content-Type': 'image/png',
      'Content-Length': imgBuffer.length
    });
    res.end(imgBuffer); 
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- API ENDPOINT: Delete Blog Post ---
app.delete('/api/blogs/:id', async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: 'Database not configured' });
    const { id } = req.params;
    
    // 1. Delete the post
    await db.execute({
      sql: 'DELETE FROM blog_posts WHERE id = ?',
      args: [id]
    });

    // 2. Re-sequence IDs (Fill the gap)
    // Decrement ID of all posts that had a higher ID than the deleted one
    await db.execute({
      sql: 'UPDATE blog_posts SET id = id - 1 WHERE id > ?',
      args: [id]
    });

    res.json({ success: true, message: 'Blog post deleted and IDs re-sequenced' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- API ENDPOINT: Update Blog Post ---
app.put('/api/blogs/:id', upload.single('image'), async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: 'Database not configured' });
    
    const { id } = req.params;
    const { title, excerpt, content, author } = req.body;
    const file = req.file;

    // Build query dynamically based on whether image is updated
    let sql = 'UPDATE blog_posts SET title = ?, excerpt = ?, content = ?, author = ?';
    const args = [title, excerpt, content, author];

    if (file) {
      const imageBase64 = file.buffer.toString('base64');
      sql += ', imageBase64 = ?';
      args.push(imageBase64);
    }

    sql += ' WHERE id = ?';
    args.push(id);

    await db.execute({ sql, args });
    res.json({ success: true, message: 'Blog post updated' });
  } catch (error) {
    console.error('Blog Update Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- API ENDPOINT: JOBS ---

// GET All Jobs
app.get('/api/jobs', async (req, res) => {
  try {
    if (!dbInitialized) {
      await initDB();
      dbInitialized = true;
    }
    if (!db) return res.status(500).json({ error: 'Database not configured' });

    const result = await db.execute('SELECT * FROM jobs ORDER BY created_at DESC');
    // Parse tags JSON
    const jobs = result.rows.map(job => ({
      ...job,
      tags: job.tags ? JSON.parse(job.tags) : []
    }));
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET Single Job
app.get('/api/jobs/:id', async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: 'Database not configured' });
    const { id } = req.params;
    const result = await db.execute({
        sql: 'SELECT * FROM jobs WHERE id = ?',
        args: [id]
    });
    if (result.rows.length === 0) return res.status(404).json({ error: 'Job not found' });
    
    const job = result.rows[0];
    job.tags = job.tags ? JSON.parse(job.tags) : [];
    res.json(job);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST Create Job
app.post('/api/jobs', async (req, res) => {
  try {
    if (!dbInitialized) await initDB();
    if (!db) return res.status(500).json({ error: 'Database not configured' });

    const { title, company, company_url, location, salary_min, salary_max, equity, tags, description, apply_url } = req.body;

    const result = await db.execute({
      sql: `INSERT INTO jobs (title, company, company_url, location, salary_min, salary_max, equity, tags, description, apply_url) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        title, 
        company, 
        company_url || '', 
        location, 
        salary_min || 0, 
        salary_max || 0, 
        equity || '', 
        JSON.stringify(tags || []), 
        description, 
        apply_url || ''
      ]
    });
    res.json({ success: true, id: result.lastInsertRowid });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE Job
app.delete('/api/jobs/:id', async (req, res) => {
    try {
      if (!db) return res.status(500).json({ error: 'Database not configured' });
      await db.execute({
        sql: 'DELETE FROM jobs WHERE id = ?',
        args: [req.params.id]
      });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
});

// POST Request Referral
app.post('/api/referral', async (req, res) => {
    try {
        if (!dbInitialized) await initDB();
        if (!db) return res.status(500).json({ error: 'Database not configured' });

        const { job_id, name, email, linkedin, why_me } = req.body;
        await db.execute({
            sql: `INSERT INTO referrals (job_id, name, email, linkedin, why_me) VALUES (?, ?, ?, ?, ?)`,
            args: [job_id, name, email, linkedin || '', why_me || '']
        });
        res.json({ success: true, message: 'Referral request sent!' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// --- API ENDPOINT: Resequence Blog IDs ---
app.post('/api/admin/resequence', async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: 'Database not configured' });
    const { password } = req.body;
    
    if (password !== process.env.ADMIN_PASSWORD) {
       return res.status(401).json({ error: 'Unauthorized' });
    }

    // 1. Get all posts ordered by date
    const result = await db.execute('SELECT id FROM blog_posts ORDER BY createdAt ASC');
    const posts = result.rows;

    // 2. Update IDs sequentially
    // We do this in a specific way to avoid unique constraint violations if we are just shifting
    // Simplest way for small data: Move all to huge IDs first (temporary), then back to 1..N?
    // Or just rely on the fact that we are likely shrinking IDs (4 -> 1). 
    // If we have 1, 4, 5 and want 1, 2, 3. 1 is fine. 4->2, 5->3.
    // If we iterate sorted by ID ASC, we can just update.
    
    // Better strategy:
    // Create a temporary table, copy data, drop old, rename new? 
    // No, overly complex for this app.
    
    // Simple Strategy: UPDATE one by one. If collision, it will fail, but since we are compacting gaps, 
    // collisions only happen if we swap order. Assuming we keep date order = ID order.
    
    for (let i = 0; i < posts.length; i++) {
        const oldId = posts[i].id;
        const newId = i + 1;
        if (oldId !== newId) {
            // First check if target ID exists (it shouldn't if we are compacting validly from bottom up, unless unsorted?)
            // We just execute.
             await db.execute({
                sql: 'UPDATE blog_posts SET id = ? WHERE id = ?',
                args: [newId, oldId]
             });
        }
    }

    // 3. Fix AutoIncrement Sequence
    const maxId = posts.length;
    await db.execute({
        sql: "UPDATE sqlite_sequence SET seq = ? WHERE name = 'blog_posts'",
        args: [maxId]
    });

    res.json({ success: true, message: 'Blog IDs re-sequenced successfully' });
  } catch (error) {
    console.error('Resequence Error:', error);
    res.status(500).json({ success: false, error: error.message });
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