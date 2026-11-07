// config/supabase.js - Supabase Client Initialization
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;

// Backend uses the secret service key if available, otherwise publishable key
const supabaseKey =
  process.env.SUPABASE_SECRET_KEY ||
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️ Warning: Supabase URL or Key is missing in server/.env');
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;

