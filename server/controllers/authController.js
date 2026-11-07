// controllers/authController.js - User Authentication (Sign up, Login, Admin Session)
const supabase = require('../config/supabase');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'workconnect-dev-secret-change-in-production';
const COOKIE_NAME = 'wc_session';
const ADMIN_COOKIE_NAME = 'wc_admin_session';

// Cookie options — HTTP-only means JS cannot read it (secure by default)
const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: false, // Set to true in production with HTTPS
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

function setSessionCookie(res, user) {
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
  res.cookie(COOKIE_NAME, token, cookieOptions);
}

function setAdminCookie(res, email) {
  const token = jwt.sign(
    { email, role: 'admin' },
    JWT_SECRET,
    { expiresIn: '1d' }
  );
  res.cookie(ADMIN_COOKIE_NAME, token, cookieOptions);
}

/**
 * POST /api/auth/register
 */
exports.register = async (req, res) => {
  try {
    const { full_name, fullName, email, password, role = 'customer', phone = '' } = req.body;
    const name = full_name || fullName;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required.'
      });
    }

    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle();

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists. Please log in.'
      });
    }

    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert([
        {
          full_name: name.trim(),
          email: email.toLowerCase().trim(),
          password: password,
          role: role,
          phone: phone.trim()
        }
      ])
      .select('id, full_name, email, role, phone, created_at')
      .single();

    if (insertError) {
      console.error('Registration insert error:', insertError.message);
      return res.status(500).json({ success: false, message: insertError.message });
    }

    setSessionCookie(res, newUser);

    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      user: {
        id: newUser.id,
        name: newUser.full_name,
        email: newUser.email,
        role: newUser.role,
        phone: newUser.phone,
      }
    });
  } catch (err) {
    console.error('Server error in register:', err.message);
    res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
};

/**
 * POST /api/auth/login
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.'
      });
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('id, full_name, email, password, role, phone')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle();

    if (error) {
      console.error('Login query error:', error.message);
      return res.status(500).json({ success: false, message: error.message });
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'No account found with this email. Please sign up first.'
      });
    }

    if (user.password !== password) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect password. Please try again.'
      });
    }

    setSessionCookie(res, user);

    res.json({
      success: true,
      message: 'Login successful!',
      user: {
        id: user.id,
        name: user.full_name,
        email: user.email,
        role: user.role,
        phone: user.phone,
      }
    });
  } catch (err) {
    console.error('Server error in login:', err.message);
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
};

/**
 * GET /api/auth/me
 */
exports.me = async (req, res) => {
  try {
    const token = req.cookies[COOKIE_NAME];

    if (!token) {
      return res.status(401).json({ success: false, message: 'Not logged in.' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch {
      return res.status(401).json({ success: false, message: 'Session expired. Please log in again.' });
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('id, full_name, email, role, phone, created_at')
      .eq('id', decoded.id)
      .maybeSingle();

    if (error || !user) {
      return res.status(401).json({ success: false, message: 'User not found. Please log in again.' });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.full_name,
        email: user.email,
        role: user.role,
        phone: user.phone,
      }
    });
  } catch (err) {
    console.error('Server error in me:', err.message);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/**
 * POST /api/auth/logout
 */
exports.logout = async (req, res) => {
  res.clearCookie(COOKIE_NAME, { httpOnly: true, sameSite: 'lax' });
  res.json({ success: true, message: 'Logged out successfully.' });
};

// ══════════════════════════════════════════════════════════════════════════════
// ADMIN PORTAL AUTHENTICATION & DATA ENDPOINTS
// ══════════════════════════════════════════════════════════════════════════════

/**
 * POST /api/auth/admin-login
 * Authenticates admin against credentials stored in server/.env
 */
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@workconnect.ng').toLowerCase().trim();
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin12345';

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Admin email and password required.' });
    }

    if (email.toLowerCase().trim() !== adminEmail || password !== adminPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Admin credentials. Please check your credentials in server/.env.'
      });
    }

    setAdminCookie(res, adminEmail);

    res.json({
      success: true,
      message: 'Admin access granted!',
      admin: {
        email: adminEmail,
        name: 'System Admin',
        role: 'admin',
      }
    });
  } catch (err) {
    console.error('Server error in adminLogin:', err.message);
    res.status(500).json({ success: false, message: 'Server error during admin login.' });
  }
};

/**
 * GET /api/auth/admin-me
 * Checks if client has an active admin session cookie
 */
exports.adminMe = async (req, res) => {
  try {
    const token = req.cookies[ADMIN_COOKIE_NAME];
    if (!token) {
      return res.status(401).json({ success: false, message: 'Admin session required.' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch {
      return res.status(401).json({ success: false, message: 'Admin session expired.' });
    }

    if (decoded.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied: not an admin.' });
    }

    res.json({
      success: true,
      admin: {
        email: decoded.email,
        name: 'System Admin',
        role: 'admin',
      }
    });
  } catch (err) {
    console.error('Server error in adminMe:', err.message);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/**
 * POST /api/auth/admin-logout
 */
exports.adminLogout = async (req, res) => {
  res.clearCookie(ADMIN_COOKIE_NAME, { httpOnly: true, sameSite: 'lax' });
  res.json({ success: true, message: 'Admin session ended.' });
};

/**
 * GET /api/auth/customers
 * Returns all registered customers from database
 */
exports.getCustomers = async (req, res) => {
  try {
    // Select all user rows safely, excluding passwords
    let { data, error } = await supabase
      .from('users')
      .select('id, full_name, email, phone, role, created_at')
      .order('id', { ascending: false });

    // Fallback if specific columns fail (e.g. if column was named 'name' or no 'created_at')
    if (error) {
      console.warn('Customer query specific columns warning, trying select(*):', error.message);
      const fallback = await supabase.from('users').select('*');
      data = fallback.data;
      error = fallback.error;
    }

    if (error) {
      console.error('Error fetching customers:', error.message);
      return res.status(500).json({ success: false, message: error.message, customers: [] });
    }

    // Map each customer ensuring both full_name & name are populated
    const customers = (data || []).map((u) => ({
      ...u,
      full_name: u.full_name || u.name || 'Registered Customer',
      role: u.role || 'customer',
      password: undefined, // Never send passwords
    }));

    res.json({
      success: true,
      count: customers.length,
      customers: customers,
    });
  } catch (err) {
    console.error('Server error in getCustomers:', err.message);
    res.status(500).json({ success: false, message: 'Server error.', customers: [] });
  }
};

/**
 * GET /api/auth/stats
 * Real dynamic database statistics — queries Supabase live
 */
exports.getStats = async (req, res) => {
  try {
    // 1. Total registered accounts
    let totalUsers = 0;
    try {
      const { count } = await supabase.from('users').select('*', { count: 'exact', head: true });
      totalUsers = count || 0;
    } catch (e) {
      console.warn('Count users notice:', e.message);
    }

    // 2. Total registered customers
    let totalCustomers = 0;
    try {
      const { count } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'customer');
      totalCustomers = count || totalUsers;
    } catch (e) {
      totalCustomers = totalUsers;
    }

    // 3. Total workers
    let totalWorkers = 0;
    try {
      const { count } = await supabase.from('workers').select('*', { count: 'exact', head: true });
      totalWorkers = count || 0;
    } catch (e) {
      console.warn('Count workers notice:', e.message);
    }

    // 4. Pending worker approvals
    let pendingWorkers = 0;
    try {
      const { count } = await supabase.from('workers').select('*', { count: 'exact', head: true }).eq('verified', false);
      pendingWorkers = count || 0;
    } catch (e) {
      console.warn('Count pending workers notice:', e.message);
    }

    // 5. Approved / Public workers
    let verifiedWorkers = 0;
    try {
      const { count } = await supabase.from('workers').select('*', { count: 'exact', head: true }).eq('verified', true);
      verifiedWorkers = count || 0;
    } catch (e) {
      console.warn('Count verified workers notice:', e.message);
    }

    // 6. Total customer reviews
    let totalReviews = 0;
    try {
      const { count, error } = await supabase.from('reviews').select('*', { count: 'exact', head: true });
      if (!error && count) totalReviews = count;
    } catch {
      totalReviews = 0;
    }

    // 7. Total reports
    let totalReports = 0;
    let pendingReports = 0;
    try {
      const { count, error } = await supabase.from('reports').select('*', { count: 'exact', head: true });
      if (!error && count) totalReports = count;

      const { count: pCount, error: pError } = await supabase
        .from('reports')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');
      if (!pError && pCount) pendingReports = pCount;
    } catch {
      totalReports = 0;
      pendingReports = 0;
    }

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalCustomers,
        totalWorkers,
        pendingWorkers,
        verifiedWorkers,
        totalReviews,
        totalReports,
        pendingReports,
      }
    });
  } catch (err) {
    console.error('Server error in getStats:', err.message);
    res.status(500).json({ success: false, message: 'Server error fetching stats.' });
  }
};
