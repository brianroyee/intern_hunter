const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { Resvg } = require('@resvg/resvg-js');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('dist'));

// --- SUPABASE CLIENT ---
// Use Service Role Key if available for Admin actions, otherwise Anon Key
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase URL or Key missing. Check environment variables.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// --- FILE UPLOAD CONFIG ---
const upload = multer({ storage: multer.memoryStorage() });

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    supabaseConnected: !!supabase,
    env: {
      url: !!supabaseUrl,
      key: !!supabaseKey
    }
  });
});

// --- API ENDPOINT: Submit Application ---
app.post('/api/apply', upload.single('cv'), async (req, res) => {
  try {
    const { fullName, email, phone, department, experienceLevel, skills, bio, portfolioUrl, subscribeToNewsletter } = req.body;
    const file = req.file;

    let cvUrl = '';
    let cvFilename = '';

    if (file) {
      const fileExt = file.originalname.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const { data, error } = await supabase.storage
        .from('resumes')
        .upload(fileName, file.buffer, {
          contentType: file.mimetype
        });
      
      if (error) throw error;
      
      const { data: { publicUrl } } = supabase.storage.from('resumes').getPublicUrl(data.path);
      cvUrl = publicUrl;
      cvFilename = file.originalname;
    }

    const { data, error } = await supabase.from('applications').insert([{
      full_name: fullName,
      email,
      phone,
      department,
      experience_level: experienceLevel || 'intern',
      skills: typeof skills === 'string' ? JSON.parse(skills) : skills,
      bio,
      portfolio_url: portfolioUrl,
      cv_url: cvUrl,
      cv_filename: cvFilename,
      subscribe_to_newsletter: subscribeToNewsletter === 'true' || subscribeToNewsletter === true
    }]).select();

    if (error) throw error;

    res.json({ 
      success: true, 
      message: 'Application submitted successfully!',
      applicationId: data[0].id
    });

  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- API ENDPOINT: Get All Applications (for admin) ---
app.get('/api/applications', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- API ENDPOINT: Create Blog Post ---
app.post('/api/blogs', upload.single('image'), async (req, res) => {
  try {
    const { title, excerpt, content, author } = req.body;
    const file = req.file;

    let imageUrl = null;
    if (file) {
       const fileExt = file.originalname.split('.').pop();
       const fileName = `${Math.random()}.${fileExt}`;
       const { data, error } = await supabase.storage
        .from('blog-images')
        .upload(fileName, file.buffer, { contentType: file.mimetype });
       
       if (error) throw error;
       const { data: { publicUrl } } = supabase.storage.from('blog-images').getPublicUrl(data.path);
       imageUrl = publicUrl;
    }

    const { data, error } = await supabase.from('blog_posts').insert([{
      title, excerpt, content, author: author || 'ADMIN', image_url: imageUrl
    }]).select();

    if (error) throw error;

    res.json({ success: true, id: data[0].id });
  } catch (error) {
    console.error('Blog Create Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- API ENDPOINT: Get All Blogs ---
app.get('/api/blogs', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('id, title, excerpt, content, author, created_at, image_url')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- API ENDPOINT: Get Single Blog Post ---
app.get('/api/blogs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return res.status(404).json({ error: 'Blog post not found' });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- SOCIAL SHARING: Handle Blog Page Requests with Meta Tags ---
app.get('/blogs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // 1. Fetch blog data from Supabase
    const { data: post, error } = await supabase
      .from('blog_posts')
      .select('title, excerpt, image_url')
      .eq('id', id)
      .single();

    if (error || !post) {
      return res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
    }

    const title = post.title;
    const description = post.excerpt || "Check out this log entry on INTERN_OS";
    const imageUrl = post.image_url || '';
    
    // Construct absolute Page URL
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const host = req.headers.host;
    const pageUrl = `${protocol}://${host}/blogs/${id}`;

    // 2. Read index.html
    let htmlPath = path.join(process.cwd(), 'dist', 'index.html');
    if (!fs.existsSync(htmlPath)) {
        htmlPath = path.join(process.cwd(), 'index.html');
    }

    let html = fs.readFileSync(htmlPath, 'utf8');

    // 3. Inject Meta Tags
    const metaTags = `
    <!-- Primary Meta Tags -->
    <title>${title} | INTERN_OS</title>
    <meta name="title" content="${title} | INTERN_OS">
    <meta name="description" content="${description}">

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="article">
    <meta property="og:site_name" content="INTERN_OS">
    <meta property="og:url" content="${pageUrl}">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:image" content="${imageUrl}">
    <meta property="og:image:secure_url" content="${imageUrl.replace('http://', 'https://')}">
    <meta property="og:image:type" content="image/png">

    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="${pageUrl}">
    <meta property="twitter:title" content="${title}">
    <meta property="twitter:description" content="${description}">
    <meta property="twitter:image" content="${imageUrl}">
    `;

    html = html.replace('<head>', `<head>${metaTags}`);
    res.send(html);

  } catch (error) {
    console.error('Meta Injection Error:', error);
    res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
  }
});

// --- API ENDPOINT: Job OG Image (Generate Brutalist SVG) ---
app.get('/api/jobs/:id/og-image', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data: job, error } = await supabase
      .from('jobs')
      .select('title, company, location, salary_min, salary_max, internship_type, location_type')
      .eq('id', id)
      .single();

    if (error || !job) return res.status(404).send('Not Found');

    // Create a refined Brutalist SVG Social Card (GitHub style)
    const svg = `
    <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
      <!-- Outer Border and Background -->
      <rect width="1200" height="630" fill="#ffffff" />
      <rect x="0" y="0" width="1200" height="630" fill="none" stroke="black" stroke-width="40" />
      
      <!-- Logo area -->
      <rect x="60" y="60" width="80" height="80" fill="black" />
      <text x="75" y="118" font-family="system-ui, Arial, sans-serif" font-size="50" font-weight="900" fill="#fff500">I</text>
      <text x="160" y="115" font-family="system-ui, Arial, sans-serif" font-size="40" font-weight="900" fill="black">INTERN_OS // BOUNTY</text>

      <!-- Content Area -->
      <text x="60" y="240" font-family="system-ui, Arial, sans-serif" font-size="32" font-weight="bold" fill="#666666" text-transform="uppercase">
        AT ${job.company.toUpperCase()}
      </text>
      
      <!-- Role Title (Large & Bold) -->
      <text x="60" y="320" font-family="system-ui, Arial, sans-serif" font-size="85" font-weight="900" fill="black">
        ${job.title.toUpperCase()}
      </text>

      <!-- Details Bar -->
      <rect x="60" y="380" width="1080" height="160" fill="#fff500" stroke="black" stroke-width="8" />
      
      <!-- Salary -->
      <text x="100" y="440" font-family="system-ui, Arial, sans-serif" font-size="24" font-weight="bold" fill="black" opacity="0.6">COMPENSATION</text>
      <text x="100" y="500" font-family="system-ui, Arial, sans-serif" font-size="56" font-weight="900" fill="black">₹${((job.salary_min||0)/1000).toFixed(0)}K - ₹${((job.salary_max||0)/1000).toFixed(0)}K</text>

      <!-- Location/Mode -->
      <text x="650" y="440" font-family="system-ui, Arial, sans-serif" font-size="24" font-weight="bold" fill="black" opacity="0.6">LOCATION / TYPE</text>
      <text x="650" y="500" font-family="system-ui, Arial, sans-serif" font-size="48" font-weight="900" fill="black">${job.location.toUpperCase()} [${(job.location_type || 'REMOTE').toUpperCase()}]</text>

      <!-- Footer Info -->
      <text x="60" y="585" font-family="system-ui, Arial, sans-serif" font-size="20" font-weight="bold" fill="#666666">
        VERIFIED BOUNTY // ${new Date().toLocaleDateString().toUpperCase()} // NO MIDDLEMEN
      </text>
    </svg>
    `;

    const resvg = new Resvg(svg, {
      background: '#ffffff',
      fitTo: {
        mode: 'width',
        value: 1200,
      },
    });
    const pngData = resvg.render();
    const pngBuffer = pngData.asPng();

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.send(pngBuffer);
  } catch (error) {
    console.error('OG Image Generation Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// --- SOCIAL SHARING: Handle Job Page Requests with Meta Tags ---
app.get('/jobs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // 1. Fetch job data
    const { data: job, error } = await supabase
      .from('jobs')
      .select('title, company, location, salary_min, salary_max')
      .eq('id', id)
      .single();

    if (error || !job) {
      return res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
    }

    const title = `${job.title} @ ${job.company}`;
    const description = `Apply for ${job.title} at ${job.company}. Location: ${job.location}. Salary: ₹${((job.salary_min||0)/1000).toFixed(0)}k - ₹${((job.salary_max||0)/1000).toFixed(0)}k | Verified Job on INTERN_OS`;
    
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const host = req.headers.host;
    const imageUrl = `${protocol}://${host}/api/jobs/${id}/og-image`;
    const pageUrl = `${protocol}://${host}/jobs/${id}`;

    // 2. Read index.html
    let htmlPath = path.join(process.cwd(), 'dist', 'index.html');
    if (!fs.existsSync(htmlPath)) {
        htmlPath = path.join(process.cwd(), 'index.html');
    }

    let html = fs.readFileSync(htmlPath, 'utf8');

    // 3. Inject Meta Tags
    const metaTags = `
    <!-- Primary Meta Tags -->
    <title>${title} | INTERN_OS</title>
    <meta name="title" content="${title} | INTERN_OS">
    <meta name="description" content="${description}">

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="INTERN_OS">
    <meta property="og:url" content="${pageUrl}">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:image" content="${imageUrl}">
    <meta property="og:image:secure_url" content="${imageUrl.replace('http://', 'https://')}">
    <meta property="og:image:type" content="image/png">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">

    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="${pageUrl}">
    <meta property="twitter:title" content="${title}">
    <meta property="twitter:description" content="${description}">
    <meta property="twitter:image" content="${imageUrl}">
    `;

    html = html.replace('<head>', `<head>${metaTags}`);
    res.send(html);

  } catch (error) {
    console.error('Job Meta Injection Error:', error);
    res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
  }
});

// GET All Active Jobs (Public)
app.get('/api/jobs', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET Single Job (Public)
app.get('/api/jobs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return res.status(404).json({ error: 'Job not found' });
    res.json(data);
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