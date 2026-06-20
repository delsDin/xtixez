const fs = require('fs');

let lines = fs.readFileSync('server.ts', 'utf8').split('\n');
let newLines = [];
let skip = false;
let braceDepth = 0;

const endpointsToRemove = [
  'app.get("/api/admin/voice-bypass-status"',
  'app.get("/api/admin/verify"',
  'app.post("/api/admin/auth"',
  'app.get("/api/admin/access-config"',
  'app.post("/api/admin/access-config"',
  'app.post("/api/admin/mark-attempt"',
  'app.post("/api/admin/reset-token"'
];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];

  if (!skip) {
    if (endpointsToRemove.some(m => line.includes(m))) {
      skip = true;
      braceDepth = 0;
      braceDepth += (line.match(/\{/g) || []).length;
      braceDepth -= (line.match(/\}/g) || []).length;
      continue;
    }
    
    // Omit specific variable blocks
    if (i + 1 >= 15 && i + 1 <= 30) continue; // AdminAccessConfig
    if (i + 1 >= 42 && i + 1 <= 59) continue; // ADMIN_ACCESS_FILE and let adminAccessConfig
    if (i + 1 >= 61 && i + 1 <= 84) continue; // try catch for ADMIN_ACCESS_FILE
    if (i + 1 >= 86 && i + 1 <= 160) continue; // logAdminActivity
    
    newLines.push(line);
  } else {
    braceDepth += (line.match(/\{/g) || []).length;
    braceDepth -= (line.match(/\}/g) || []).length;
    
    if (braceDepth <= 0 && line.trim().startsWith('});')) {
      skip = false;
    }
  }
}

fs.writeFileSync('server.ts', newLines.join('\n'), 'utf8');
console.log('Server admin routes cleaned successfully!');
