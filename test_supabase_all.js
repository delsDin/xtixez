import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function test() {
  const [
    { data: p, error: pE },
    { data: e, error: eE },
    { data: s, error: sE },
    { data: sk, error: skE },
    { data: t, error: tE },
    { data: g, error: gE },
    { data: m, error: mE }
  ] = await Promise.all([
    supabase.from('projects').select('*').order('id', { ascending: true }),
    supabase.from('experiences').select('*').order('id', { ascending: true }),
    supabase.from('services').select('*'),
    supabase.from('skills').select('*'),
    supabase.from('testimonials').select('*'),
    supabase.from('general_info').select('*').single(),
    supabase.from('maintenance_config').select('*').eq('id', 1).single()
  ]);

  console.log('Errors:', { pE, eE, sE, skE, tE, gE, mE });
}
test();
