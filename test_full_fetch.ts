import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testFullFetch() {
  try {
    const results = await Promise.all([
      supabase.from('general_info').select('*').single(),
      supabase.from('cv_config').select('*').single(),
      supabase.from('github_config').select('*').single(),
      supabase.from('voice_config').select('*').single(),
      supabase.from('certifications').select('*').order('created_at', { ascending: false }),
      supabase.from('services').select('*').order('id', { ascending: true }),
      supabase.from('projects').select('*').order('id', { ascending: true }),
      supabase.from('skills').select('*').order('level', { ascending: false })
    ]);
    
    results.forEach((res, index) => {
        if (res.error) {
            console.error(`Error at index ${index}:`, res.error);
        } else {
            console.log(`Data at index ${index} length/exists:`, Array.isArray(res.data) ? res.data.length : !!res.data);
        }
    });

  } catch (error) {
      console.error("Promise.all threw an error:", error);
  }
}

testFullFetch();
