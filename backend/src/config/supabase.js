const { createClient } = require('@supabase/supabase-js');

// Access variables
const SUPABASE_URL = process.env.SUPABASE_PROJECT_URL;
const SUPABASE_KEY = process.env.SUPABASE_API_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.warn("Missing Supabase project URL or API key in environment variables!");
}

// Create a singleton Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

module.exports = supabase;
