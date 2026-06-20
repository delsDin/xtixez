const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, 'src', 'components');
const files = fs.readdirSync(componentsDir).filter(f => f.endsWith('.tsx'));

const configApiImport = `import { fetchPortfolioConfig } from '../lib/config-api';\n`;

for (const file of files) {
  const filePath = path.join(componentsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  if (content.includes("fetch('/api/config')")) {
    console.log(`Refactoring ${file}...`);
    
    // Add import if not exists
    if (!content.includes("fetchPortfolioConfig")) {
      const importMatches = content.match(/^import .*$/m);
      if (importMatches) {
        content = content.replace(importMatches[0], `${configApiImport}${importMatches[0]}`);
      } else {
        content = configApiImport + content;
      }
    }

    // Replace fetch
    content = content.replace(/const res = await fetch\('\/api\/config'\);\s*if \(res\.ok\) {\s*const data = await res\.json\(\);/g, 
      `const data = await fetchPortfolioConfig();\n        if (data) {`);

    // In AdminDashboard, it might not use `if (res.ok)`
    // `const res = await fetch('/api/config');`
    content = content.replace(/const res = await fetch\('\/api\/config'\);\s*const data = await res\.json\(\);/g, 
      `const data = await fetchPortfolioConfig();`);

    fs.writeFileSync(filePath, content);
  }
}

// Special case for NavigationContext
const navCtxPath = path.join(__dirname, 'src', 'context', 'NavigationContext.tsx');
let navCtxContent = fs.readFileSync(navCtxPath, 'utf8');
if (navCtxContent.includes("fetch('/api/config')")) {
  if (!navCtxContent.includes("fetchPortfolioConfig")) {
    navCtxContent = `import { fetchPortfolioConfig } from '../lib/config-api';\n` + navCtxContent;
  }
  navCtxContent = navCtxContent.replace(/fetch\('\/api\/config'\)\s*\.then\(res => res\.json\(\)\)/g, `fetchPortfolioConfig()`);
  fs.writeFileSync(navCtxPath, navCtxContent);
}

console.log('Refactoring complete.');
