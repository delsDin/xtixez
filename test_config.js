import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

export const fetchPortfolioConfig = async () => {
  try {
    const [
      { data: generalInfo },
      { data: cvConfig },
      { data: githubConfig },
      { data: voiceConfig },
      { data: certs },
      { data: services },
      { data: projects },
      { data: flatSkills },
      { data: experiences }
    ] = await Promise.all([
      supabase.from('general_info').select('*').single(),
      supabase.from('cv_config').select('*').single(),
      supabase.from('github_config').select('*').single(),
      supabase.from('voice_config').select('*').single(),
      supabase.from('certifications').select('*').order('created_at', { ascending: false }),
      supabase.from('services').select('*').order('id', { ascending: true }),
      supabase.from('projects').select('*').order('id', { ascending: true }),
      supabase.from('skills').select('*').order('level', { ascending: false }),
      supabase.from('experiences').select('*').order('id', { ascending: true })
    ]);

    return { projects, certs, flatSkills };
  } catch(e) {
    console.error("error", e);
  }
}

fetchPortfolioConfig().then(res => console.log('Result:', res));
