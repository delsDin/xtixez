const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  const { data: services, error: sErr } = await supabase.from('portfolio_services').select('title, description');
  console.log("Services Error:", sErr);
  const { data: projects, error: pErr } = await supabase.from('portfolio_projects').select('title, description, tech_stack');
  console.log("Projects Error:", pErr);
}
test();
