const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

// ========== MIDDLEWARE ==========
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// CORS (for dev)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  next();
});

// ========== HELPER: JSON file read/write ==========
function readJSON(file, fallback) {
  const fp = path.join(DATA_DIR, file);
  try {
    return JSON.parse(fs.readFileSync(fp, 'utf8'));
  } catch {
    return fallback;
  }
}
function writeJSON(file, data) {
  fs.writeFileSync(path.join(DATA_DIR, file), JSON.stringify(data, null, 2));
}

// ========== API: VISITOR COUNTER ==========
app.get('/api/visitors', (req, res) => {
  const stats = readJSON('visitors.json', { count: 0, history: [] });
  stats.count += 1;
  stats.history.push({ time: new Date().toISOString(), ua: req.headers['user-agent']?.slice(0, 80) });
  // Keep last 100 entries
  if (stats.history.length > 100) stats.history = stats.history.slice(-100);
  writeJSON('visitors.json', stats);
  res.json({ visitors: stats.count });
});

// ========== API: CONTACT FORM ==========
app.post('/api/contact', (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'All fields are required.' });
  }
  const messages = readJSON('messages.json', []);
  const entry = {
    id: Date.now(),
    name: name.trim(),
    email: email.trim(),
    message: message.trim(),
    date: new Date().toISOString()
  };
  messages.push(entry);
  writeJSON('messages.json', messages);
  console.log(`📩 New message from ${entry.name} <${entry.email}>`);
  res.json({ success: true, message: 'Message received! I\'ll get back to you soon. 🚀' });
});

// ========== API: GET MESSAGES (admin) ==========
app.get('/api/messages', (req, res) => {
  const messages = readJSON('messages.json', []);
  res.json({ total: messages.length, messages: messages.reverse() });
});

// ========== API: PORTFOLIO DATA ==========
app.get('/api/profile', (req, res) => {
  res.json({
    name: 'Farhan Akhtar',
    title: 'CSE AI/ML Student · Coding Agent Builder · Full-Stack Vibe Coder',
    college: 'Sagar Institute of Research and Technology',
    year: '1st Year',
    branch: 'B.Tech CSE (AI & ML)',
    skills: [
      'Coding Agent Builder', 'Frontend Development', 'Backend Development',
      'Vibe Coding', 'AI & Machine Learning', 'Problem Solving'
    ],
    tech: ['Python', 'JavaScript', 'React', 'Node.js', 'HTML/CSS', 'TensorFlow', 'MongoDB', 'Express'],
    socials: {
      github: 'https://github.com/',
      linkedin: 'https://linkedin.com/',
      email: 'farhan@example.com'
    }
  });
});

// ========== API: SERVER STATUS ==========
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    server: 'Farhan Portfolio API',
    version: '1.0.0',
    uptime: `${Math.floor(process.uptime())}s`,
    timestamp: new Date().toISOString()
  });
});

// ========== CATCH-ALL: Serve portfolio ==========
app.get('/{*splat}', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ========== START SERVER ==========
app.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('  ╔══════════════════════════════════════════╗');
  console.log('  ║                                          ║');
  console.log(`  ║   🚀 Farhan Akhtar Portfolio Server      ║`);
  console.log(`  ║   🌐 http://localhost:${PORT}               ║`);
  console.log('  ║                                          ║');
  console.log('  ║   API Endpoints:                         ║');
  console.log('  ║   GET  /api/status    — Server status    ║');
  console.log('  ║   GET  /api/profile   — Profile data     ║');
  console.log('  ║   GET  /api/visitors  — Visitor count    ║');
  console.log('  ║   POST /api/contact   — Contact form     ║');
  console.log('  ║   GET  /api/messages  — View messages    ║');
  console.log('  ║                                          ║');
  console.log('  ╚══════════════════════════════════════════╝');
  console.log('');
});
