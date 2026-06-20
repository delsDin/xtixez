const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const [
    { data: general },
    { data: services },
    { data: skills },
    { data: projects },
    { data: experiences },
    { data: contact }
  ] = await Promise.all([
    supabase.from('portfolio_general_info').select('*').single(),
    supabase.from('portfolio_services').select('title, description'),
    supabase.from('portfolio_skills').select('*'),
    supabase.from('portfolio_projects').select('title, description, tech_stack'),
    supabase.from('portfolio_experiences').select('*').order('display_order', { ascending: true }),
    supabase.from('contact_info').select('*').single()
  ]);

  console.log({ general, contact });
}

test();
