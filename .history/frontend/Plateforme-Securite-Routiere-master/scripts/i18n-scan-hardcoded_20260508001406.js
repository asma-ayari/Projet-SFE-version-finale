const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');
const scanRoot = path.join(projectRoot, 'src', 'app');

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, out);
    } else {
      out.push(full);
    }
  }
  return out;
}

function isRelevantFile(filePath) {
  return filePath.endsWith('.html') || filePath.endsWith('.ts');
}

// Heuristic: detect likely hardcoded FR UI strings.
const hasAccents = /[\u00C0-\u017F]/;
const frenchUiWords = /\b(connexion|inscription|se connecter|mot de passe|d\u00E9connexion|cours|chapitre|bienvenue|tableau de bord|profil|pr\u00E9sentation|contact)\b/i;

function scanFile(filePath) {
  const rel = path.relative(projectRoot, filePath).replace(/\\/g, '/');
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/);

  const matches = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Skip i18n keys usage (heuristic)
    if (line.includes('| translate') || line.includes("translate.instant") || line.includes('TranslateService')) continue;

    if (hasAccents.test(line) || frenchUiWords.test(line)) {
      matches.push({ lineNumber: i + 1, text: line.trim() });
      if (matches.length >= 10) break;
    }
  }

  return { rel, matches };
}

const files = walk(scanRoot).filter(isRelevantFile);
const findings = files
  .map(scanFile)
  .filter((f) => f.matches.length > 0);

console.log(`Scanned: ${files.length} files under src/app`);
console.log(`Flagged: ${findings.length} files with likely hardcoded FR text`);

for (const f of findings) {
  console.log('\n' + f.rel);
  for (const m of f.matches) {
    console.log(`  L${m.lineNumber}: ${m.text}`);
  }
}
