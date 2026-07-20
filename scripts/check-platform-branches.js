const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..', 'mobile', 'src', 'components');
const files = fs.existsSync(root) ? fs.readdirSync(root).filter((file) => file.endsWith('.ts') || file.endsWith('.tsx')) : [];
const violations = files.filter((file) => /Platform\.OS\s*===/.test(fs.readFileSync(path.join(root, file), 'utf8')));
if (violations.length) { console.error(`Platform branching is not allowed in shared components: ${violations.join(', ')}`); process.exit(1); }
console.log('Shared components contain no inline Platform.OS branches.');
