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
        location_type TEXT,
        internship_type TEXT,
        duration TEXT,
        academic_year TEXT,
        discipline TEXT,
        compensation_type TEXT,
        salary_min INTEGER,
        salary_max INTEGER,
        equity TEXT,
        tags TEXT, -- JSON array
        description TEXT NOT NULL,
        apply_url TEXT,
        status TEXT DEFAULT 'pending', -- pending, active, rejected
        admin_rating REAL, -- New: Admin Rating
        admin_comments TEXT, -- New: Admin Comments
        linkedin_url TEXT,
        twitter_url TEXT,
        instagram_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Migration for existing DBs: Try to add columns if they are missing
    const migrations = [
        "ALTER TABLE jobs ADD COLUMN status TEXT DEFAULT 'pending'",
        "ALTER TABLE jobs ADD COLUMN location_type TEXT",
        "ALTER TABLE jobs ADD COLUMN internship_type TEXT",
        "ALTER TABLE jobs ADD COLUMN duration TEXT",
        "ALTER TABLE jobs ADD COLUMN academic_year TEXT",
        "ALTER TABLE jobs ADD COLUMN discipline TEXT",
        "ALTER TABLE jobs ADD COLUMN compensation_type TEXT",
        "ALTER TABLE jobs ADD COLUMN admin_rating REAL",
        "ALTER TABLE jobs ADD COLUMN admin_comments TEXT",
        "ALTER TABLE jobs ADD COLUMN linkedin_url TEXT",
        "ALTER TABLE jobs ADD COLUMN twitter_url TEXT",
        "ALTER TABLE jobs ADD COLUMN instagram_url TEXT"
    ];

    for (const sql of migrations) {
        try {
            await db.execute(sql);
        } catch (e) {
            // Ignore error if column already exists
        }
    }

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
      TURSO_AUTH_TOKEN: process.env.TURSO_AUTH_TOKEN ? 'set' : 'missing',
      ADMIN_PASSWORD: process.env.ADMIN_PASSWORD ? 'set' : 'missing'
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
      applicationId: result.lastInsertRowid.toString()
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

    res.json({ success: true, id: result.lastInsertRowid.toString() });
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

// GET All Active Jobs (Public)
app.get('/api/jobs', async (req, res) => {
  try {
    if (!dbInitialized) {
      await initDB();
      dbInitialized = true;
    }
    if (!db) return res.status(500).json({ error: 'Database not configured' });

    // Only fetch ACTIVE jobs for the public board
    const result = await db.execute("SELECT * FROM jobs WHERE status = 'active' ORDER BY created_at DESC");
    
    const jobs = result.rows.map(job => ({
      ...job,
      tags: job.tags ? JSON.parse(job.tags) : []
    }));
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET Single Job (Public)
app.get('/api/jobs/:id', async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: 'Database not configured' });
    const { id } = req.params;
    const result = await db.execute({
        sql: "SELECT * FROM jobs WHERE id = ?",
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

// POST Create Job (Submits for Review)
app.post('/api/jobs', async (req, res) => {
  try {
    if (!dbInitialized) await initDB();
    if (!db) return res.status(500).json({ error: 'Database not configured' });

    // Extract all fields, including new internship fields
    const { 
        title, 
        company, 
        company_url, 
        location, 
        locationType, // camelCase from text
        internshipType, 
        duration, 
        academicYear, 
        discipline,
        compensationType, 
        salary_min, 
        salary_max,
        stipend_min, 
        stipend_max, 
        equity, 
        tags,
        description, 
        apply_url,
        linkedin_url,
        twitter_url,
        instagram_url
    } = req.body;

    // Use stipend values for salary columns if present
    const finalSalaryMin = stipend_min || salary_min || 0;
    const finalSalaryMax = stipend_max || salary_max || 0;

    const result = await db.execute({
      sql: `INSERT INTO jobs (
        title, company, company_url, location, 
        location_type, internship_type, duration, academic_year, discipline, compensation_type,
        salary_min, salary_max, equity, tags, description, apply_url, 
        linkedin_url, twitter_url, instagram_url, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      args: [
        title, 
        company, 
        company_url || '', 
        location,
        locationType || 'Remote',
        internshipType || 'Summer Internship',
        duration || '3 Months',
        academicYear || 'Any Year',
        discipline || 'Other',
        compensationType || 'Paid Stipend',
        finalSalaryMin,
        finalSalaryMax, 
        equity || '', 
        JSON.stringify(tags || []), 
        description, 
        apply_url || '',
        linkedin_url || '',
        twitter_url || '',
        instagram_url || ''
      ]
    });
    res.json({ success: true, id: result.lastInsertRowid.toString(), message: "Job submitted for review" });
  } catch (error) {
    console.error("Job Submit Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT Update Job (Admin Edit)
app.put('/api/jobs/:id', async (req, res) => {
    try {
        if (!db) return res.status(500).json({ error: 'Database not configured' });
        const { id } = req.params;
        const { 
            password,
            title, 
            company, 
            company_url, 
            location, 
            locationType, 
            internshipType, 
            duration, 
            academicYear, 
            discipline,
            compensationType, 
            salary_min, 
            salary_max,
            equity, 
            tags, 
            description, 
            apply_url,
            linkedin_url,
            twitter_url,
            instagram_url
        } = req.body;

        const adminPassword = (process.env.ADMIN_PASSWORD || "").trim();
        if ((password || "").trim() !== adminPassword) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        await db.execute({
            sql: `UPDATE jobs SET 
                title=?, company=?, company_url=?, location=?, location_type=?, 
                internship_type=?, duration=?, academic_year=?, discipline=?, compensation_type=?,
                salary_min=?, salary_max=?, equity=?, tags=?, description=?, apply_url=?,
                linkedin_url=?, twitter_url=?, instagram_url=?
                WHERE id = ?`,
            args: [
                title, company, company_url, location, locationType, 
                internshipType, duration, academicYear, discipline, compensationType,
                salary_min, salary_max, equity, JSON.stringify(tags || []), description, apply_url,
                linkedin_url, twitter_url, instagram_url,
                id
            ]
        });
        res.json({ success: true, message: "Job updated" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- ADMIN JOB ROUTES ---

// GET Pending Jobs (Admin)
app.get('/api/admin/jobs/pending', async (req, res) => {
    try {
        if (!db) return res.status(500).json({ error: 'Database not configured' });
        
        const result = await db.execute("SELECT * FROM jobs WHERE status = 'pending' ORDER BY created_at ASC");
        const jobs = result.rows.map(job => ({
            ...job,
            tags: job.tags ? JSON.parse(job.tags) : []
        }));
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST Update Job Status (Admin Approve/Reject w/ Comments)
app.post('/api/admin/jobs/:id/status', async (req, res) => {
    try {
        if (!db) return res.status(500).json({ error: 'Database not configured' });
        const { id } = req.params;
        const { status, password, rating, comments } = req.body; // status: 'active' or 'rejected'
        const adminPassword = (process.env.ADMIN_PASSWORD || "").trim();

        if ((password || "").trim() !== adminPassword) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        let sql = "UPDATE jobs SET status = ?";
        const args = [status];
        
        if (rating !== undefined) {
            sql += ", admin_rating = ?";
            args.push(rating);
        }
        if (comments !== undefined) {
             sql += ", admin_comments = ?";
             args.push(comments);
        }

        sql += " WHERE id = ?";
        args.push(id);

        await db.execute({ sql, args });

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// DELETE Job (Hard Delete)
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
    const adminPassword = (process.env.ADMIN_PASSWORD || "").trim();
    
    if ((password || "").trim() !== adminPassword) {
       return res.status(401).json({ error: 'Unauthorized' });
    }

    const result = await db.execute('SELECT id FROM blog_posts ORDER BY createdAt ASC');
    const posts = result.rows;
    
    for (let i = 0; i < posts.length; i++) {
        const oldId = posts[i].id;
        const newId = i + 1;
        if (oldId !== newId) {
             await db.execute({
                sql: 'UPDATE blog_posts SET id = ? WHERE id = ?',
                args: [newId, oldId]
             });
        }
    }

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

// --- MISSING ADMIN ROUTES (Restored) ---

// Admin Login
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  const adminPassword = (process.env.ADMIN_PASSWORD || "").trim();
  
  if (!adminPassword) {
    return res.status(500).json({ success: false, error: 'Admin password not configured' });
  }

  if ((password || "").trim() === adminPassword) {
    res.json({ success: true, token: 'admin-authenticated' });
  } else {
    res.status(401).json({ success: false, error: 'Invalid password' });
  }
});

// Delete All Applications
app.delete('/api/applications', async (req, res) => {
  try {
      const { password } = req.body;
      const adminPassword = (process.env.ADMIN_PASSWORD || "").trim();
      
      if ((password || "").trim() !== adminPassword) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      if (!db) return res.status(500).json({ error: 'Database not configured' });
      await db.execute('DELETE FROM applications');
      res.json({ success: true, message: 'All applications deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete Single Application
app.delete('/api/applications/:id', async (req, res) => {
  try {
      const { id } = req.params;
      const { password } = req.body;
      const adminPassword = (process.env.ADMIN_PASSWORD || "").trim();
      
      if ((password || "").trim() !== adminPassword) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      if (!db) return res.status(500).json({ error: 'Database not configured' });
      await db.execute({
        sql: 'DELETE FROM applications WHERE id = ?',
        args: [id]
      });
      res.json({ success: true, message: 'Application deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET Referrals (Admin)
app.get('/api/admin/referrals', async (req, res) => {
    try {
        if (!db) return res.status(500).json({ error: 'Database not configured' });
        
        // Join with jobs to get job title
        const result = await db.execute(`
            SELECT r.*, j.title as job_title, j.company 
            FROM referrals r 
            LEFT JOIN jobs j ON r.job_id = j.id 
            ORDER BY r.created_at DESC
        `);
        res.json(result.rows);
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

module.exports = app;