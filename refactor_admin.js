const fs = require('fs');

let content = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

// 1. Import supabase
if (!content.includes("import { supabase }")) {
  content = content.replace("import { useNavigation } from '../context/NavigationContext';", "import { useNavigation } from '../context/NavigationContext';\nimport { supabase } from '../lib/supabase';");
}

// 2. Replace hardcoded fallback values for CV and projects
content = content.replace(/setCvFullName\("Alexandre Dupont"\);/g, "setCvFullName('');");
content = content.replace(/setCvJobTitle\("Data Scientist Senior & Développeur Full-Stack"\);/g, "setCvJobTitle('');");
content = content.replace(/setCvSummary\("Data Scientist chevronné et ingénieur Full-Stack robuste.*"\);/g, "setCvSummary('');");
content = content.replace(/setCvEmail\("alexandre.dupont@dev.fr"\);/g, "setCvEmail('');");
content = content.replace(/setCvPhone\("\+33 6 12 34 56 78"\);/g, "setCvPhone('');");
content = content.replace(/setCvLocation\("Paris, France"\);/g, "setCvLocation('');");
content = content.replace(/setCvGithub\("https:\/\/github.com\/alexdupont"\);/g, "setCvGithub('');");
content = content.replace(/setCvLinkedin\("https:\/\/linkedin.com\/in\/alexdupont"\);/g, "setCvLinkedin('');");
content = content.replace(/setCvWebsite\("https:\/\/alexdupont.dev"\);/g, "setCvWebsite('');");

fs.writeFileSync('src/components/AdminDashboard.tsx', content);
console.log('Refactoring complete.');
