const { Client } = require('pg');
const crypto = require('crypto');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ success: false, error: 'username/password required' });
  }

  const dbUrl = process.env.DATABASE_URL || process.env.VERCEL_POSTGRES_URL;
  if (!dbUrl) {
    return res.status(501).json({ success: false, error: 'Postgres not configured. Set DATABASE_URL in environment variables.' });
  }

  const client = new Client({ connectionString: dbUrl });
  try {
    await client.connect();

    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
    const userQuery = await client.query('SELECT id, username, email, full_name, phone, avatar, role, created_at, last_login, settings, cars FROM users WHERE username=$1 OR email=$2', [username, username]);
    if (userQuery.rows.length === 0) {
      await client.end();
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const user = userQuery.rows[0];

    const pwdQuery = await client.query('SELECT password FROM users WHERE id=$1', [user.id]);
    if (pwdQuery.rows.length === 0 || pwdQuery.rows[0].password !== hashedPassword) {
      await client.end();
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Update last_login
    await client.query('UPDATE users SET last_login=$1 WHERE id=$2', [new Date(), user.id]);

    await client.end();

    // Return safe user data (excluding password)
    return res.json({ success: true, user: { id: user.id, username: user.username, email: user.email, fullName: user.full_name || null, phone: user.phone || null, avatar: user.avatar || '👤', role: user.role, createdAt: user.created_at, lastLogin: user.last_login, settings: user.settings, cars: user.cars } });
  } catch (err) {
    console.error('Login error:', err);
    try { await client.end(); } catch(e) {}
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};
