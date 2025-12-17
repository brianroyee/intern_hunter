const { createClient } = require('@libsql/client');

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
  } catch (error) {
    console.error('DB Init Error:', error.message);
  }
}

let dbInitialized = false;

// Parse multipart form data manually
function parseMultipart(body, contentType) {
  const boundary = contentType.split('boundary=')[1];
  if (!boundary) return { fields: {}, file: null };

  const parts = body.split(`--${boundary}`);
  const fields = {};
  let file = null;

  for (const part of parts) {
    if (part.includes('Content-Disposition')) {
      const nameMatch = part.match(/name="([^"]+)"/);
      const filenameMatch = part.match(/filename="([^"]+)"/);
      
      if (nameMatch) {
        const name = nameMatch[1];
        // Find the content (after double newline)
        const contentStart = part.indexOf('\r\n\r\n');
        if (contentStart !== -1) {
          let content = part.substring(contentStart + 4);
          // Remove trailing \r\n
          content = content.replace(/\r\n$/, '');
          
          if (filenameMatch) {
            // It's a file
            file = {
              name: name,
              filename: filenameMatch[1],
              buffer: Buffer.from(content, 'binary')
            };
          } else {
            fields[name] = content.trim();
          }
        }
      }
    }
  }

  return { fields, file };
}

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const url = req.url;

  try {
    // Health check
    if (url === '/api/health' && req.method === 'GET') {
      return res.status(200).json({
        status: 'ok',
        dbConnected: !!db,
        envVars: {
          TURSO_DATABASE_URL: process.env.TURSO_DATABASE_URL ? 'set' : 'missing',
          TURSO_AUTH_TOKEN: process.env.TURSO_AUTH_TOKEN ? 'set' : 'missing'
        }
      });
    }

    // Submit Application
    if (url === '/api/apply' && req.method === 'POST') {
      if (!dbInitialized) {
        await initDB();
        dbInitialized = true;
      }

      if (!db) {
        return res.status(500).json({ success: false, error: 'Database not configured' });
      }

      // Parse the request body
      let body = '';
      const contentType = req.headers['content-type'] || '';
      
      // For multipart form data
      let fields = {};
      let file = null;

      if (contentType.includes('multipart/form-data')) {
        // Read raw body as buffer
        const chunks = [];
        for await (const chunk of req) {
          chunks.push(chunk);
        }
        const rawBody = Buffer.concat(chunks).toString('binary');
        const parsed = parseMultipart(rawBody, contentType);
        fields = parsed.fields;
        file = parsed.file;
      } else {
        // JSON body
        fields = req.body || {};
      }

      const { fullName, email, phone, department, experienceLevel, skills, bio, portfolioUrl, subscribeToNewsletter } = fields;

      let cvBase64 = null;
      let cvFilename = null;

      if (file && file.buffer) {
        cvBase64 = file.buffer.toString('base64');
        cvFilename = file.filename;
      }

      const result = await db.execute({
        sql: `INSERT INTO applications (fullName, email, phone, department, experienceLevel, skills, bio, portfolioUrl, cvBase64, cvFilename, subscribeToNewsletter)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          fullName || '',
          email || '',
          phone || '',
          department || '',
          experienceLevel || 'intern',
          typeof skills === 'string' ? skills : JSON.stringify(skills || []),
          bio || '',
          portfolioUrl || '',
          cvBase64,
          cvFilename,
          subscribeToNewsletter === 'true' || subscribeToNewsletter === true ? 1 : 0
        ]
      });

      return res.status(200).json({
        success: true,
        message: 'Application submitted successfully!',
        applicationId: result.lastInsertRowid.toString()
      });
    }

    // --- BLOG ENDPOINTS ---

    // Get All Blogs (Optimized)
    if (url === '/api/blogs' && req.method === 'GET') {
      if (!dbInitialized) {
        await initDB();
        dbInitialized = true;
      }
      if (!db) return res.status(500).json({ error: 'Database not configured' });

      const result = await db.execute('SELECT id, title, excerpt, content, author, createdAt FROM blog_posts ORDER BY createdAt DESC');
      return res.status(200).json(result.rows);
    }

    // Get Blog Image
    if (url.match(/^\/api\/blogs\/\d+\/image$/) && req.method === 'GET') {
      const id = url.split('/api/blogs/')[1].split('/')[0];
      if (!db) return res.status(500).json({ error: 'Database not configured' });

      try {
        const result = await db.execute({
          sql: 'SELECT imageBase64 FROM blog_posts WHERE id = ?',
          args: [id]
        });

        if (result.rows.length === 0 || !result.rows[0].imageBase64) {
          return res.status(404).send('Image not found');
        }

        const imgBuffer = Buffer.from(result.rows[0].imageBase64, 'base64');
        res.setHeader('Content-Type', 'image/png');
        return res.send(imgBuffer);
      } catch (error) {
        return res.status(500).json({ error: error.message });
      }
    }

    // Delete Blog Post
    if (url.match(/^\/api\/blogs\/\d+$/) && req.method === 'DELETE') {
      const id = url.split('/api/blogs/')[1];
      if (!db) return res.status(500).json({ error: 'Database not configured' });
      
      try {
        await db.execute({
          sql: 'DELETE FROM blog_posts WHERE id = ?',
          args: [id]
        });
        return res.status(200).json({ success: true, message: 'Blog post deleted' });
      } catch (error) {
        return res.status(500).json({ error: error.message });
      }
    }

    // Update Blog Post
    if (url.match(/^\/api\/blogs\/\d+$/) && req.method === 'PUT') {
      const id = url.split('/api/blogs/')[1];
      if (!db) return res.status(500).json({ error: 'Database not configured' });

      const contentType = req.headers['content-type'] || '';
      let fields = {};
      let file = null;

      if (contentType.includes('multipart/form-data')) {
        const chunks = [];
        for await (const chunk of req) {
          chunks.push(chunk);
        }
        const rawBody = Buffer.concat(chunks).toString('binary');
        const parsed = parseMultipart(rawBody, contentType);
        fields = parsed.fields;
        file = parsed.file;
      } else {
        fields = req.body || {};
      }

      const { title, excerpt, content, author } = fields;
      
      let sql = 'UPDATE blog_posts SET title = ?, excerpt = ?, content = ?, author = ?';
      const args = [title, excerpt, content, author];

      if (file && file.buffer) {
        const imageBase64 = file.buffer.toString('base64');
        sql += ', imageBase64 = ?';
        args.push(imageBase64);
      }

      sql += ' WHERE id = ?';
      args.push(id);

      try {
        await db.execute({ sql, args });
        return res.status(200).json({ success: true });
      } catch (e) {
        return res.status(500).json({ success: false, error: e.message });
      }
    }

    // Create Blog Post
    if (url === '/api/blogs' && req.method === 'POST') {
      if (!dbInitialized) {
        await initDB();
        dbInitialized = true;
      }
      if (!db) return res.status(500).json({ error: 'Database not configured' });

      // Parse body (Multipart or JSON)
      const contentType = req.headers['content-type'] || '';
      let fields = {};
      let file = null;

      if (contentType.includes('multipart/form-data')) {
        const chunks = [];
        for await (const chunk of req) {
          chunks.push(chunk);
        }
        const rawBody = Buffer.concat(chunks).toString('binary');
        const parsed = parseMultipart(rawBody, contentType);
        fields = parsed.fields;
        file = parsed.file;
      } else {
        fields = req.body || {};
      }

      const { title, excerpt, content, author } = fields;
      let imageBase64 = null;

      if (file && file.buffer) {
        imageBase64 = file.buffer.toString('base64');
      }

      try {
        const result = await db.execute({
          sql: `INSERT INTO blog_posts (title, excerpt, content, author, imageBase64) VALUES (?, ?, ?, ?, ?)`,
          args: [title, excerpt, content, author || 'ADMIN', imageBase64]
        });
        return res.status(200).json({ success: true, id: result.lastInsertRowid.toString() });
      } catch (e) {
        console.error("Blog Insert Error:", e);
        return res.status(500).json({ success: false, error: e.message });
      }
    }

    // Get All Applications
    if (url === '/api/applications' && req.method === 'GET') {
      if (!dbInitialized) {
        await initDB();
        dbInitialized = true;
      }
      if (!db) {
        return res.status(500).json({ error: 'Database not configured' });
      }
      const result = await db.execute('SELECT id, fullName, email, phone, department, experienceLevel, skills, bio, portfolioUrl, cvFilename, subscribeToNewsletter, submittedAt FROM applications ORDER BY submittedAt DESC');
      return res.status(200).json(result.rows);
    }

    // Delete All Applications
    if (url === '/api/applications' && req.method === 'DELETE') {
      const { password } = req.body || {};
      const adminPassword = process.env.ADMIN_PASSWORD;

      if (password !== adminPassword) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      if (!db) {
        return res.status(500).json({ error: 'Database not configured' });
      }

      await db.execute('DELETE FROM applications');
      return res.status(200).json({ success: true, message: 'All applications deleted' });
    }

    // Admin Login
    if (url === '/api/admin/login' && req.method === 'POST') {
      const { password } = req.body || {};
      const adminPassword = process.env.ADMIN_PASSWORD;

      if (!adminPassword) {
        return res.status(500).json({ success: false, error: 'Admin password not configured' });
      }

      if (password === adminPassword) {
        return res.status(200).json({ success: true, token: 'admin-authenticated' });
      } else {
        return res.status(401).json({ success: false, error: 'Invalid password' });
      }
    }

    // Download CV - /api/cv/:id
    if (url.startsWith('/api/cv/') && req.method === 'GET') {
      const id = url.split('/api/cv/')[1];
      if (!db) {
        return res.status(500).json({ error: 'Database not configured' });
      }
      const result = await db.execute({
        sql: 'SELECT cvBase64, cvFilename FROM applications WHERE id = ?',
        args: [id]
      });

      if (result.rows.length === 0 || !result.rows[0].cvBase64) {
        return res.status(404).json({ error: 'CV not found' });
      }

      const { cvBase64, cvFilename } = result.rows[0];
      const buffer = Buffer.from(cvBase64, 'base64');

      res.setHeader('Content-Disposition', `attachment; filename="${cvFilename}"`);
      res.setHeader('Content-Type', 'application/octet-stream');
      return res.send(buffer);
    }

    // Delete Single Application - /api/applications/:id
    if (url.match(/^\/api\/applications\/\d+$/) && req.method === 'DELETE') {
      const id = url.split('/api/applications/')[1];
      const { password } = req.body || {};
      const adminPassword = process.env.ADMIN_PASSWORD;

      if (password !== adminPassword) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      if (!db) {
        return res.status(500).json({ error: 'Database not configured' });
      }

      await db.execute({
        sql: 'DELETE FROM applications WHERE id = ?',
        args: [id]
      });

      return res.status(200).json({ success: true, message: 'Application deleted' });
    }

    // 404 for unmatched routes
    return res.status(404).json({ error: 'Not found' });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};
