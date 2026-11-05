const fs = require('fs');
const code = fs.readFileSync('public/build/assets/app-CLR5t2Qo.js', 'utf8');

// Extract all TLC log templates
const logs = code.match(/console\.log\(`[^`]*`\)/g);
console.log('=== TLC Console Log Templates ===');
logs.forEach(l => {
  const msg = l.replace(/console\.log\(`/, '').replace(/\`\)$/, '');
  console.log(msg);
});

// Key rendering checks
console.log('\n=== Rendering Checks ===');
console.log('Physics debug enabled:', /debug:\s*true/.test(code));
console.log('Scale RESIZE present:', /RESIZE/.test(code));
console.log('Type AUTO present:', /AUTO/.test(code));
console.log('Has graphics fillRect:', /fillRect\([^)]*\)/.test(code));
console.log('Has sprite creation:', /physics\.add\.sprite/.test(code));
console.log('Has texture generation:', /generateTexture/.test(code));
console.log('Has camera follow:', /startFollow/.test(code));

// Check drawIsland depth
const setDepthCalls = code.match(/setDepth\([^)]*\)/g);
console.log('\n=== All setDepth calls ===');
setDepthCalls.forEach(d => console.log(d));

// Check for the specific issue: graphics at depth -1000
console.log('\n=== Depth Analysis ===');
console.log('Ground depth -1000:', /setDepth\(-1e3\)/.test(code));
console.log('Diag rect depth -500:', /setDepth\(-500\)/.test(code));
console.log('Player depth uses y:', /player\.setDepth\(.*\.y\)/.test(code));

// Check if there's a potential issue with the container query
const containerQuery = code.match(/getElementById\(`game-container`\)/);
console.log('\n=== Container ===');
console.log('Container query present:', !!containerQuery);
