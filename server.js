const express = require('express');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');

// ========== EMAIL CONFIG ==========
const EMAIL = 'farhanakhtar001458@gmail.com';
const EMAIL_PASS = process.env.GMAIL_APP_PASSWORD || ''; // Set your Gmail App Password

let transporter = null;
if (EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: EMAIL, pass: EMAIL_PASS }
  });
  transporter.verify((err) => {
    if (err) console.log('⚠️  Email setup failed:', err.message);
    else console.log('✅ Email notifications active → ' + EMAIL);
  });
} else {
  console.log('⚠️  No GMAIL_APP_PASSWORD set — emails disabled (messages still saved to data/)');
}

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

// ========== API: CONTACT FORM + EMAIL ==========
app.post('/api/contact', async (req, res) => {
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

  // Send email notification
  if (transporter) {
    try {
      await transporter.sendMail({
        from: `"Portfolio Contact" <${EMAIL}>`,
        to: EMAIL,
        replyTo: entry.email,
        subject: `🚀 New Portfolio Message from ${entry.name}`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0a0a0a;color:#fff;padding:30px;border-radius:12px;">
            <h2 style="color:#ff2d2d;margin-bottom:20px;">📩 New Contact Message</h2>
            <table style="width:100%;border-collapse:collapse;">
              <tr><td style="color:#888;padding:8px 0;">Name</td><td style="padding:8px 0;"><strong>${entry.name}</strong></td></tr>
              <tr><td style="color:#888;padding:8px 0;">Email</td><td style="padding:8px 0;"><a href="mailto:${entry.email}" style="color:#ff2d2d;">${entry.email}</a></td></tr>
              <tr><td style="color:#888;padding:8px 0;">Time</td><td style="padding:8px 0;">${new Date(entry.date).toLocaleString('en-IN', {timeZone:'Asia/Kolkata'})}</td></tr>
            </table>
            <div style="background:#111;padding:20px;border-radius:8px;margin-top:20px;border-left:3px solid #ff2d2d;">
              <p style="color:#ccc;line-height:1.6;margin:0;">${entry.message}</p>
            </div>
            <p style="color:#555;font-size:12px;margin-top:20px;">— Farhan Akhtar Portfolio</p>
          </div>
        `
      });
      console.log('✅ Email sent to ' + EMAIL);
    } catch (err) {
      console.log('⚠️  Email failed:', err.message);
    }
  }

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
    tech: ['Python', 'JavaScript', 'React', 'Node.js', 'HTML/CSS', 'TensorFlow', 'PyTorch', 'YOLOv8', 'OpenCV', 'WebRTC', 'Socket.io', 'MongoDB', 'Express'],
    projects: [
      {
        title: 'CCTV AI — Student Mobile Phone Detection',
        category: 'Computer Vision · AI',
        description: 'Real-time classroom surveillance detecting mobile phone usage with YOLOv8 & OpenCV.',
        tech: ['Python', 'YOLOv8', 'OpenCV', 'TensorFlow', 'CCTV']
      },
      {
        title: 'RealTime Chat App — WhatsApp Style',
        category: 'Real-Time · Full Stack',
        description: 'Instant messaging app with online status, typing indicators, and room support.',
        tech: ['Socket.io', 'Node.js', 'React', 'MongoDB', 'WebSocket']
      },
      {
        title: 'Real-Time Mobile Screen Share',
        category: 'Real-Time · WebRTC',
        description: 'Low-latency peer-to-peer screen streaming from mobile to browser.',
        tech: ['WebRTC', 'Socket.io', 'Node.js', 'JavaScript', 'P2P']
      },
      {
        title: 'Neural Network Plays Snake Game',
        category: 'Neural Network · Reinforcement Learning',
        description: 'Deep Q-learning agent that masters the classic Snake game from zero knowledge.',
        tech: ['Python', 'PyTorch', 'Reinforcement Learning', 'Pygame', 'Neural Net']
      }
    ],
    socials: {
      github: 'https://github.com/',
      linkedin: 'https://linkedin.com/',
      email: 'farhanakhtar001458@gmail.com'
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
