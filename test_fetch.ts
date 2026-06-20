import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testFetch() {
    const [
      { data: generalInfo, error: err1 },
      { data: services, error: err2 },
    ] = await Promise.all([
      supabase.from('general_info').select('*').single(),
      supabase.from('services').select('*').order('id', { ascending: true }),
    ]);

    console.log("Services Error:", err2);
    console.log("Services Data:", services?.length);
}

testFetch();
