const fs = require('fs');

let lines = fs.readFileSync('server.ts', 'utf8').split('\n');
let newLines = [];
let skip = false;
let braceDepth = 0;

const endpointsToRemove = [
  'app.get("/api/messages"',
  'app.post("/api/messages"',
  'app.delete("/api/messages/:id"',
  'app.post("/api/contact-messages"',
  'app.post("/api/newsletter"',
  'app.get("/api/admin/contact-messages"',
  'app.post("/api/admin/contact-messages/:id/read"',
  'app.delete("/api/admin/contact-messages/:id"',
  'app.post("/api/generated-resumes"',
  'app.get("/api/admin/generated-resumes"',
  'app.delete("/api/admin/generated-resumes/:id"',
  'app.get("/api/admin/metrics"',
  'app.post("/api/admin/reseed-messages"',
  'app.get("/api/config"',
  'app.get("/api/admin/visit-stats"',
  'app.post("/api/config"'
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
    if (i + 1 >= 15 && i + 1 <= 100) continue; // interfaces and defaults
    if (i + 1 >= 108 && i + 1 <= 124) continue; // MESSAGES_FILE
    if (i + 1 >= 125 && i + 1 <= 158) continue; // CONTACT_MESSAGES_FILE
    if (i + 1 >= 159 && i + 1 <= 179) continue; // NEWSLETTER_FILE
    if (i + 1 >= 180 && i + 1 <= 258) continue; // VISITS_FILE
    if (i + 1 >= 259 && i + 1 <= 280) continue; // GENERATED_RESUMES_FILE
    if (i + 1 >= 412 && i + 1 <= 802) continue; // CONFIG_FILE
    
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
console.log('Server cleaned successfully!');
