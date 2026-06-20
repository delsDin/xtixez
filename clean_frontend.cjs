const fs = require('fs');

let content = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

// Supprimer les états inutilisés
content = content.replace(/const \[isAccessConfigLoading, setIsAccessConfigLoading\] = useState<boolean>\(false\);\n/g, '');
content = content.replace(/const \[accessConfigError, setAccessConfigError\] = useState<string>\(''\);\n/g, '');
content = content.replace(/const \[accessConfigSuccess, setAccessConfigSuccess\] = useState<string>\(''\);\n/g, '');
content = content.replace(/const \[allowedPasswords, setAllowedPasswords\] = useState<string\[\]>\(\[\]\);\n/g, '');
content = content.replace(/const \[voiceCommandAccess, setVoiceCommandAccess\] = useState<string>\('password_required'\);\n/g, '');
content = content.replace(/const \[adminAccessEnabled, setAdminAccessEnabled\] = useState<boolean>\(true\);\n/g, '');
content = content.replace(/const \[recentAttempts, setRecentAttempts\] = useState<any\[\]>\(\[\]\);\n/g, '');
content = content.replace(/const \[isTagging, setIsTagging\] = useState<number \| null>\(null\);\n/g, '');
content = content.replace(/const \[hasSuspiciousAlert, setHasSuspiciousAlert\] = useState<boolean>\(false\);\n/g, '');

// Supprimer les hooks inutilisés pour "configAccess"
// Les lignes de checkSuspiciousInitially (350-369)
content = content.replace(/useEffect\(\(\) => \{\n    const checkSuspiciousInitially[\s\S]*?\}, \[setHasSuspiciousAlert\]\);\n/g, '');

// Supprimer handleMarkAttempt
content = content.replace(/const handleMarkAttempt = async[\s\S]*?finally \{\n      setIsTagging\(null\);\n    \}\n  \};\n/g, '');

// Supprimer fetchAccessConfig
content = content.replace(/\/\/ Fetch access configuration from server\n  const fetchAccessConfig = async \(\) => \{[\s\S]*?setIsAccessConfigLoading\(false\);\n    \}\n  \};\n/g, '');

// Supprimer saveAccessConfig
content = content.replace(/\/\/ Save access configuration\n  const saveAccessConfig = async[\s\S]*?de sécurité\."\);\n    \}\n  \};\n/g, '');

// Supprimer handleRegenerateToken
content = content.replace(/const handleRegenerateToken = async \(\) => \{[\s\S]*?la clé\."\);\n    \}\n  \};\n/g, '');

// Remplacer l'action du tab
content = content.replace(/\{ value: 'configAccess', label: 'ACCÈS & SÉCURITÉ', action: \(\) => \{ fetchAccessConfig\(\); \} \}/g, "{ value: 'configAccess', label: 'ACCÈS & SÉCURITÉ' }");

fs.writeFileSync('src/components/AdminDashboard.tsx', content, 'utf8');
console.log('AdminDashboard.tsx cleaned successfully!');
