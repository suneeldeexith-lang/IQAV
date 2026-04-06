const { createClient } = require('@supabase/supabase-js');

// Access variables strictly matching new .env
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("FATAL: Missing Supabase URL or API key in environment variables!");
    process.exit(1);
}

// Create a singleton Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

module.exports = supabase;
