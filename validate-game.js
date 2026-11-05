
// Test script for game validation
const fs = require('fs');
const path = require('path');

const jsPath = path.join(__dirname, 'public/build/assets/app-FmJEehdg.js');
const code = fs.readFileSync(jsPath, 'utf8');

console.log('=== Game Build Validation ===');
console.log('JS file size:', code.length);

// Check for key features in the minified bundle
const checks = [
    { name: 'MAPS constant', pattern: /MAPS/ },
    { name: 'GameState object', pattern: /GameState/ },
    { name: 'transitionToMap', pattern: /transitionToMap/ },
    { name: 'drawFog', pattern: /drawFog/ },
    { name: 'playerTile', pattern: /playerTile/ },
    { name: 'checkMapTransition', pattern: /checkMapTransition/ },
    { name: 'MAP_OBSTACLES', pattern: /MAP_OBSTACLES/ },
    { name: 'LOOT_TABLES', pattern: /LOOT_TABLES/ },
    { name: 'BOAT_STAGES', pattern: /BOAT_STAGES/ },
    { name: 'RECIPES', pattern: /RECIPES/ },
    { name: 'WorldScene class', pattern: /class WorldScene/ },
    { name: 'addItem method', pattern: /addItem/ },
    { name: 'craftRecipe method', pattern: /craftRecipe/ },
    { name: 'buildBoatStage method', pattern: /buildBoatStage/ },
];

let passed = 0;
let failed = 0;

for (const check of checks) {
    const found = check.pattern.test(code);
    if (found) {
        console.log('PASS:', check.name);
        passed++;
    } else {
        console.log('FAIL:', check.name);
        failed++;
    }
}

console.log(\`\nTotal: ${passed} passed, ${failed} failed\`);

// Check for syntax errors by trying to parse (using Function constructor)
try {
    new Function(code);
    console.log('JS syntax: VALID');
} catch(e) {
    console.log('JS syntax ERROR:', e.message.substring(0, 200));
}

// Check for Phaser usage patterns
const phaserChecks = [
    { name: 'Phaser.Game', pattern: /new Phaser\.Game/ },
    { name: 'WorldScene extends', pattern: /extends Phaser\.Scene/ },
    { name: 'physics.add.sprite', pattern: /physics\.add\.sprite/ },
    { name: 'tilePosition', pattern: /tilePosition/ },
];

console.log(\`\n=== Phaser Integration ===\`);
for (const check of phaserChecks) {
    const found = check.pattern.test(code);
    console.log(found ? 'PASS:' : 'FAIL:', check.name);
}
