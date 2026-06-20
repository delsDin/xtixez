const { execSync } = require('child_process');
try {
  const css = execSync('npx @tailwindcss/cli -i src/index.css').toString();
  console.log(css.substring(0, 500));
} catch (e) {
  console.log('Error', e.message);
}
