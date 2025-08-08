// =====================================================
// Cyber Trust Platform - Express API Server
// Version: 1.0.0
// Description: Complete API with authentication and all dashboard endpoints
// =====================================================

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const morgan = require('morgan');

// Load environment variables
dotenv.config({ path: '/opt/risk-platform/.env.database' });
dotenv.config({ path: '.env' });

const app = express();
const PORT = process.env.API_PORT || 3001;

// =====================================================
// DATABASE CONNECTION
// =====================================================

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'cyber_trust_db',
  user: process.env.DB_USER || 'cyber_trust_app',
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('✅ Database connected successfully at:', res.rows[0].now);
  }
});

// =====================================================
// MIDDLEWARE
// =====================================================

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://31.97.114.80',
    'https://31.97.114.80',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true
}));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
app.use(morgan('combined'));

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: 'Too many login attempts, please try again later'
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

app.use('/api/', apiLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// =====================================================
// JWT CONFIGURATION
// =====================================================

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRY = '24h';

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      organization_id: user.organization_id
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRY }
  );
};

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Middleware to check user role
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};

// =====================================================
// AUTHENTICATION ENDPOINTS
// =====================================================

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Register new user
app.post('/api/auth/register', async (req, res) => {
  const { email, password, firstName, lastName, organizationName } = req.body;

  // Validation
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Check if user already exists
    const existingUser = await client.query(
      'SELECT id FROM cyber_trust.users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: 'User already exists' });
    }

    // Create or find organization
    let organizationId;
    if (organizationName) {
      // Create new organization
      const orgResult = await client.query(
        `INSERT INTO cyber_trust.organizations (name, domain, industry, size)
         VALUES ($1, $2, 'Technology', 'small')
         RETURNING id`,
        [organizationName, email.split('@')[1]]
      );
      organizationId = orgResult.rows[0].id;
    } else {
      // Use default organization
      const defaultOrg = await client.query(
        'SELECT id FROM cyber_trust.organizations LIMIT 1'
      );
      organizationId = defaultOrg.rows[0]?.id;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const userResult = await client.query(
      `INSERT INTO cyber_trust.users 
       (organization_id, email, password_hash, first_name, last_name, role)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, email, first_name, last_name, role, organization_id`,
      [organizationId, email, hashedPassword, firstName || 'User', lastName || '', 'viewer']
    );

    await client.query('COMMIT');

    const user = userResult.rows[0];
    const token = generateToken(user);

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        organizationId: user.organization_id
      }
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  } finally {
    client.release();
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    // Get user from database
    const result = await pool.query(
      `SELECT u.*, o.name as organization_name 
       FROM cyber_trust.users u
       JOIN cyber_trust.organizations o ON u.organization_id = o.id
       WHERE u.email = $1 AND u.is_active = true`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    await pool.query(
      'UPDATE cyber_trust.users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    );

    // Generate token
    const token = generateToken(user);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        organizationId: user.organization_id,
        organizationName: user.organization_name
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get current user profile
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.*, o.name as organization_name, o.trust_score
       FROM cyber_trust.users u
       JOIN cyber_trust.organizations o ON u.organization_id = o.id
       WHERE u.id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];
    res.json({
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
      department: user.department,
      title: user.title,
      organizationId: user.organization_id,
      organizationName: user.organization_name,
      trustScore: user.trust_score,
      lastLogin: user.last_login
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update user profile
app.put('/api/auth/profile', authenticateToken, async (req, res) => {
  const { firstName, lastName, department, title, phone } = req.body;

  try {
    const result = await pool.query(
      `UPDATE cyber_trust.users 
       SET first_name = COALESCE($1, first_name),
           last_name = COALESCE($2, last_name),
           department = COALESCE($3, department),
           title = COALESCE($4, title),
           phone = COALESCE($5, phone),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING *`,
      [firstName, lastName, department, title, phone, req.user.id]
    );

    const user = result.rows[0];
    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        department: user.department,
        title: user.title,
        phone: user.phone
      }
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Change password
app.post('/api/auth/change-password', authenticateToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current and new passwords are required' });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ error: 'New password must be at least 8 characters' });
  }

  try {
    // Get current password hash
    const userResult = await pool.query(
      'SELECT password_hash FROM cyber_trust.users WHERE id = $1',
      [req.user.id]
    );

    const user = userResult.rows[0];

    // Verify current password
    const validPassword = await bcrypt.compare(currentPassword, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await pool.query(
      'UPDATE cyber_trust.users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [hashedPassword, req.user.id]
    );

    res.json({ message: 'Password changed successfully' });

  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// =====================================================
// DASHBOARD DATA ENDPOINTS
// =====================================================

// Get organization dashboard summary
app.get('/api/dashboard/summary', authenticateToken, async (req, res) => {
  try {
    const orgId = req.user.organization_id;

    const [
      requirements,
      capabilities,
      risks,
      threats,
      trustScore
    ] = await Promise.all([
      pool.query('SELECT COUNT(*) as total, status FROM cyber_trust.requirements WHERE organization_id = $1 GROUP BY status', [orgId]),
      pool.query('SELECT COUNT(*) as total, status FROM cyber_trust.capabilities WHERE organization_id = $1 GROUP BY status', [orgId]),
      pool.query('SELECT COUNT(*) as total, AVG(residual_risk_score) as avg_risk FROM cyber_trust.risks WHERE organization_id = $1', [orgId]),
      pool.query('SELECT COUNT(*) as total, severity FROM cyber_trust.threats WHERE organization_id = $1 GROUP BY severity', [orgId]),
      pool.query('SELECT trust_score FROM cyber_trust.organizations WHERE id = $1', [orgId])
    ]);

    res.json({
      requirements: requirements.rows,
      capabilities: capabilities.rows,
      risks: risks.rows[0],
      threats: threats.rows,
      trustScore: trustScore.rows[0]?.trust_score || 50
    });

  } catch (error) {
    console.error('Dashboard summary error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// =====================================================
// REQUIREMENTS ENDPOINTS
// =====================================================

// Get all requirements
app.get('/api/requirements', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT r.*, u.first_name || ' ' || u.last_name as owner_name
       FROM cyber_trust.requirements r
       LEFT JOIN cyber_trust.users u ON r.owner_id = u.id
       WHERE r.organization_id = $1
       ORDER BY r.created_at DESC`,
      [req.user.organization_id]
    );

    res.json(result.rows);

  } catch (error) {
    console.error('Requirements fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch requirements' });
  }
});

// Create requirement
app.post('/api/requirements', authenticateToken, requireRole(['admin', 'analyst']), async (req, res) => {
  const { code, title, description, category, type, source, priority } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO cyber_trust.requirements 
       (organization_id, code, title, description, category, type, source, priority, owner_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [req.user.organization_id, code, title, description, category, type, source, priority, req.user.id]
    );

    res.status(201).json(result.rows[0]);

  } catch (error) {
    console.error('Requirement creation error:', error);
    res.status(500).json({ error: 'Failed to create requirement' });
  }
});

// Update requirement
app.put('/api/requirements/:id', authenticateToken, requireRole(['admin', 'analyst']), async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const setClause = Object.keys(updates)
      .map((key, index) => `${key} = $${index + 3}`)
      .join(', ');

    const values = [req.user.organization_id, id, ...Object.values(updates)];

    const result = await pool.query(
      `UPDATE cyber_trust.requirements 
       SET ${setClause}, updated_at = CURRENT_TIMESTAMP
       WHERE organization_id = $1 AND id = $2
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Requirement not found' });
    }

    res.json(result.rows[0]);

  } catch (error) {
    console.error('Requirement update error:', error);
    res.status(500).json({ error: 'Failed to update requirement' });
  }
});

// =====================================================
// CAPABILITIES ENDPOINTS
// =====================================================

// Get all capabilities
app.get('/api/capabilities', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.*, u.first_name || ' ' || u.last_name as owner_name
       FROM cyber_trust.capabilities c
       LEFT JOIN cyber_trust.users u ON c.owner_id = u.id
       WHERE c.organization_id = $1
       ORDER BY c.created_at DESC`,
      [req.user.organization_id]
    );

    res.json(result.rows);

  } catch (error) {
    console.error('Capabilities fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch capabilities' });
  }
});

// Get capability heatmap data
app.get('/api/capabilities/heatmap', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
         category,
         COUNT(*) as total,
         AVG(maturity_level) as avg_maturity,
         AVG(effectiveness) as avg_effectiveness
       FROM cyber_trust.capabilities
       WHERE organization_id = $1
       GROUP BY category`,
      [req.user.organization_id]
    );

    res.json(result.rows);

  } catch (error) {
    console.error('Heatmap data error:', error);
    res.status(500).json({ error: 'Failed to fetch heatmap data' });
  }
});

// =====================================================
// RISKS ENDPOINTS
// =====================================================

// Get all risks
app.get('/api/risks', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT r.*, u.first_name || ' ' || u.last_name as owner_name
       FROM cyber_trust.risks r
       LEFT JOIN cyber_trust.users u ON r.owner_id = u.id
       WHERE r.organization_id = $1
       ORDER BY r.residual_risk_score DESC`,
      [req.user.organization_id]
    );

    res.json(result.rows);

  } catch (error) {
    console.error('Risks fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch risks' });
  }
});

// Get risk matrix data
app.get('/api/risks/matrix', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
         current_probability as probability,
         current_impact as impact,
         COUNT(*) as count,
         ARRAY_AGG(title) as risk_titles
       FROM cyber_trust.risks
       WHERE organization_id = $1 AND is_active = true
       GROUP BY current_probability, current_impact`,
      [req.user.organization_id]
    );

    res.json(result.rows);

  } catch (error) {
    console.error('Risk matrix error:', error);
    res.status(500).json({ error: 'Failed to fetch risk matrix data' });
  }
});

// =====================================================
// TRUST SCORE ENDPOINTS
// =====================================================

// Get current trust score with breakdown
app.get('/api/trust-score', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
         o.trust_score,
         tc.component_name,
         tc.current_score,
         tc.weight,
         tc.trend,
         tc.last_calculated
       FROM cyber_trust.organizations o
       LEFT JOIN cyber_trust.trust_components tc ON o.id = tc.organization_id
       WHERE o.id = $1`,
      [req.user.organization_id]
    );

    const trustScore = result.rows[0]?.trust_score || 50;
    const components = result.rows.filter(r => r.component_name).map(r => ({
      name: r.component_name,
      score: r.current_score,
      weight: r.weight,
      trend: r.trend
    }));

    res.json({
      overall: trustScore,
      components,
      lastUpdated: result.rows[0]?.last_calculated || new Date()
    });

  } catch (error) {
    console.error('Trust score error:', error);
    res.status(500).json({ error: 'Failed to fetch trust score' });
  }
});

// Get trust score history
app.get('/api/trust-score/history', authenticateToken, async (req, res) => {
  const { days = 30 } = req.query;

  try {
    const result = await pool.query(
      `SELECT score, calculated_at
       FROM cyber_trust.trust_scores
       WHERE organization_id = $1 
       AND calculated_at >= CURRENT_DATE - INTERVAL '${days} days'
       ORDER BY calculated_at ASC`,
      [req.user.organization_id]
    );

    res.json(result.rows);

  } catch (error) {
    console.error('Trust history error:', error);
    res.status(500).json({ error: 'Failed to fetch trust score history' });
  }
});

// =====================================================
// AUDIT LOG ENDPOINT
// =====================================================

// Get audit logs
app.get('/api/audit-logs', authenticateToken, requireRole(['admin']), async (req, res) => {
  const { limit = 100, offset = 0 } = req.query;

  try {
    const result = await pool.query(
      `SELECT 
         al.*,
         u.email as user_email,
         u.first_name || ' ' || u.last_name as user_name
       FROM cyber_trust.audit_logs al
       LEFT JOIN cyber_trust.users u ON al.user_id = u.id
       WHERE al.organization_id = $1
       ORDER BY al.created_at DESC
       LIMIT $2 OFFSET $3`,
      [req.user.organization_id, limit, offset]
    );

    res.json(result.rows);

  } catch (error) {
    console.error('Audit logs error:', error);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

// =====================================================
// ERROR HANDLING
// =====================================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// =====================================================
// START SERVER
// =====================================================

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`
    ========================================
    🚀 Cyber Trust API Server Started
    ========================================
    Port: ${PORT}
    Environment: ${process.env.NODE_ENV || 'production'}
    Database: ${process.env.DB_NAME}
    Time: ${new Date().toISOString()}
    
    Endpoints:
    - POST   /api/auth/register     - Register new user
    - POST   /api/auth/login        - Login
    - GET    /api/auth/me           - Get profile
    - GET    /api/dashboard/summary - Dashboard data
    - GET    /api/requirements      - List requirements
    - GET    /api/capabilities      - List capabilities
    - GET    /api/risks            - List risks
    - GET    /api/trust-score      - Get trust score
    ========================================
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server...');
  server.close(() => {
    console.log('Server closed');
    pool.end(() => {
      console.log('Database pool closed');
      process.exit(0);
    });
  });
});

module.exports = app;