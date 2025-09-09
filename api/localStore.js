const fs = require('fs');
const path = require('path');

const STORE_PATH = path.join(__dirname, '..', 'data', 'local_test_files.json');

function ensureStore() {
  const dir = path.dirname(STORE_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(STORE_PATH)) fs.writeFileSync(STORE_PATH, '[]', 'utf8');
}

function readStore() {
  try {
    ensureStore();
    const raw = fs.readFileSync(STORE_PATH, 'utf8');
    return JSON.parse(raw || '[]');
  } catch (err) {
    return [];
  }
}

function writeStore(items) {
  ensureStore();
  fs.writeFileSync(STORE_PATH, JSON.stringify(items, null, 2), 'utf8');
}

module.exports = { readStore, writeStore };
