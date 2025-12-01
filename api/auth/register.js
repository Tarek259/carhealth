const { Client } = require('pg');
const crypto = require('crypto');

async function ensureTables(client) {
  await client.query(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    full_name TEXT,
    phone TEXT,
    avatar TEXT,
    role TEXT,
    created_at TIMESTAMP,
    last_login TIMESTAMP,
    settings JSONB,
    cars JSONB
  )`);
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { username, email, password, fullName, phone, avatar } = req.body || {};

  if (!username || !email || !password) {
    return res.status(400).json({ success: false, error: 'username/email/password required' });
  }

  const dbUrl = process.env.DATABASE_URL || process.env.VERCEL_POSTGRES_URL;
  if (!dbUrl) {
    return res.status(501).json({ success: false, error: 'Postgres not configured. Set DATABASE_URL in environment variables.' });
  }

  const client = new Client({ connectionString: dbUrl });
  try {
    await client.connect();
    await ensureTables(client);

    // Check if email or username already exists
    const userCheck = await client.query('SELECT id FROM users WHERE username=$1 OR email=$2', [username, email]);
    if (userCheck.rows.length > 0) {
      return res.status(409).json({ success: false, error: 'User already exists' });
    }

    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
    const id = username; // Use username as id
    const now = new Date();
    const settings = {
      notifications: true,
      darkMode: true,
      language: 'ar',
      distanceUnit: 'km',
      currency: 'SAR'
    };

    const cars = [];

    await client.query(
      'INSERT INTO users (id, username, email, password, full_name, phone, avatar, role, created_at, settings, cars) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)',
      [id, username, email, hashedPassword, fullName || null, phone || null, avatar || '👤', 'user', now, JSON.stringify(settings), JSON.stringify(cars)]
    );

    await client.end();

    return res.json({ success: true, user: { id, username, email, fullName, phone, avatar, role: 'user', createdAt: now } });
  } catch (err) {
    console.error('Register error:', err);
    try { await client.end(); } catch(e) {}
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};
