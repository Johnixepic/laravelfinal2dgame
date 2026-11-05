const fs = require('fs');
const code = fs.readFileSync('public/build/assets/app-CLR5t2Qo.js', 'utf8');

// Extract all TLC log templates
const logs = code.match(/console\.log\(`[^`]*`\)/g);
console.log('=== TLC Console Log Templates ===');
logs.forEach(l => {
  const msg = l.replace(/console\.log\(`/, '').replace(/\`\)$/, '');
  console.log(msg);
});

// Check for error patterns
const errors = code.match(/console\.error[^\)]*/g);
if (errors) {
  console.log('\n=== Console Error Patterns ===');
  errors.forEach(e => console.log(e.substring(0, 100)));
}

// Key rendering checks
console.log('\n=== Rendering Checks ===');
console.log('Physics debug enabled:', /debug:\s*true/.test(code));
console.log('Scale RESIZE:', /RESIZE/.test(code));
console.log('Type AUTO:', /AUTO/.test(code));
console.log('Has graphics fillRect:', /fillRect\([^)]*\)/.test(code));
console.log('Has sprite creation:', /physics\.add\.sprite/.test(code));
console.log('Has texture generation:', /generateTexture/.test(code));
console.log('Has camera follow:', /startFollow/.test(code));

// Check drawIsland depth
const drawIslandMatch = code.match(/setDepth\([^)]*\)/g);
console.log('\n=== All setDepth calls ===');
drawIslandMatch.forEach(d => console.log(d));
