const fs = require('fs');

let content = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

if (!content.includes("import { supabase }")) {
  content = content.replace("import { useNavigation } from '../context/NavigationContext';", "import { useNavigation } from '../context/NavigationContext';\nimport { supabase } from '../lib/supabase';");
}

const syncFunc = `
  const saveToSupabase = async (payload: any) => {
    try {
      if (payload.projects) {
        for (const p of payload.projects) {
          await supabase.from('projects').upsert(p);
        }
      }
      if (payload.experiences) {
        for (const e of payload.experiences) {
          await supabase.from('experiences').upsert(e);
        }
      }
      if (payload.services) {
        for (const s of payload.services) {
          await supabase.from('services').upsert(s);
        }
      }
      if (payload.testimonials) {
        for (const t of payload.testimonials) {
          await supabase.from('testimonials').upsert(t);
        }
      }
      // General Info mapped from payload root
      if (payload.ownerName !== undefined) {
        await supabase.from('general_info').upsert({
          id: 1,
          owner_name: payload.ownerName,
          owner_title_prefix: payload.ownerTitlePrefix || '',
          owner_title_suffix: payload.ownerTitleSuffix || '',
          profile_picture_url: payload.profilePictureUrl || '',
          normal_phrases: payload.normalPhrases || [],
          owner_email: payload.ownerEmail || '',
          owner_phone: payload.ownerPhone || '',
          owner_location: payload.ownerLocation || '',
          whatsapp_number: payload.whatsappNumber || '',
          github_url: payload.githubUrl || '',
          linkedin_url: payload.linkedinUrl || ''
        });
      }
      return { ok: true };
    } catch (e) {
      console.error("Supabase sync error", e);
      return { ok: false, error: e };
    }
  };
`;

if (!content.includes("const saveToSupabase")) {
  content = content.replace("export const AdminDashboard: React.FC = () => {", "export const AdminDashboard: React.FC = () => {" + syncFunc);
}

// Replace the fetch block in all handleUpdates with saveToSupabase
const fetchPattern = /const res = await fetch\('\/api\/config',\s*{\s*method:\s*'POST',\s*headers:\s*{\s*'Content-Type':\s*'application\/json',\s*'Authorization':\s*`Bearer \${adminToken}`\s*},\s*body:\s*JSON\.stringify\(([\s\S]*?)\)\s*}\);/g;

content = content.replace(fetchPattern, "const res = await saveToSupabase($1) as any;");

fs.writeFileSync('src/components/AdminDashboard.tsx', content);
console.log('Patch complete.');
