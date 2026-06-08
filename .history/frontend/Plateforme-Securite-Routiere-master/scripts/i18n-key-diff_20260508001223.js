const fs = require('fs');
const path = require('path');

function readJson(relativePath) {
  const fullPath = path.join(__dirname, '..', relativePath);
  return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
}

function flattenKeys(obj, prefix = '', out = new Set()) {
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      flattenKeys(value, fullKey, out);
    } else {
      out.add(fullKey);
    }
  }
  return out;
}

const fr = flattenKeys(readJson(path.join('public', 'locales', 'fr', 'translation.json')));
const ar = flattenKeys(readJson(path.join('public', 'locales', 'ar', 'translation.json')));

const missingInAr = [...fr].filter((k) => !ar.has(k)).sort();
const missingInFr = [...ar].filter((k) => !fr.has(k)).sort();

console.log(`FR keys: ${fr.size}`);
console.log(`AR keys: ${ar.size}`);
console.log(`Missing in AR: ${missingInAr.length}`);
if (missingInAr.length) console.log(missingInAr.slice(0, 200).join('\n'));
console.log(`Missing in FR: ${missingInFr.length}`);
if (missingInFr.length) console.log(missingInFr.slice(0, 200).join('\n'));
