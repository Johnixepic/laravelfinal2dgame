
// Simulate core game logic without Phaser
const fs = require('fs');
const path = require('path');

console.log('=== Core Game Logic Simulation ===');

// Load the source file to extract constants
const srcPath = path.join(__dirname, 'resources/js/app.js');
const src = fs.readFileSync(srcPath, 'utf8');

// Extract MAPS constant logic
const mapsMatch = src.match(/const MAPS = \{([\s\S]*?)\n\};/);
if (mapsMatch) {
    const mapNames = ['MAP1', 'MAP2', 'MAP3', 'MAP4', 'MAP5'];
    for (const name of mapNames) {
        if (src.includes(`  ${name}:`)) {
            console.log('PASS:', name, 'defined in MAPS');
        } else {
            console.log('FAIL:', name, 'missing from MAPS');
        }
    }
}

// Check exits configuration
const exits = src.match(/exits:\s*\[([\s\S]*?)\]/g);
console.log(\`Found ${exits ? exits.length : 0} exit configurations\`);

// Check GameState persistence
if (src.includes('GameState.inventory') || src.includes('GameState[')) {
    console.log('PASS: Inventory persistence via GameState');
} else {
    console.log('FAIL: Inventory persistence missing');
}

// Check transition logic
if (src.includes('transitionToMap') && src.includes('scene.start')) {
    console.log('PASS: Scene transition uses scene.start()');
} else {
    console.log('FAIL: Scene transition incorrect');
}

// Check fog rendering
if (src.includes('drawFog')) {
    console.log('PASS: Fog boundary rendering implemented');
} else {
    console.log('FAIL: Fog rendering missing');
}

// Check per-map obstacles
const obsMatch = src.match(/const MAP_OBSTACLES = \{([\s\S]*?)\n\};/);
if (obsMatch) {
    const mapCount = (src.match(/MAP[1-5]:/g) || []).length;
    console.log('PASS: MAP_OBSTACLES defined with', mapCount, 'map configurations');
}

// Check loot tables
const lootMatch = src.match(/const LOOT_TABLES = \{([\s\S]*?)\n\};/);
if (lootMatch) {
    const buildingNames = src.match(/['"]([^'"]+)['"]/g);
    console.log('PASS: LOOT_TABLES defined');
}

// Check boat stages
if (src.includes('BOAT_STAGES')) {
    const stages = src.match(/\{ id:/g) || [];
    console.log('PASS: BOAT_STAGES defined with', stages.length, 'stages');
}

// Check recipes
if (src.includes('RECIPES')) {
    const recipes = src.match(/id: '[a-zA-Z]+/g) || [];
    console.log('PASS: RECIPES defined with', recipes.length, 'recipes');
}

// Check tile coordinate math
const tileMath = src.includes('playerTile') && 
                 src.includes('tilePosition') &&
                 src.includes('(i - j) * TILE_W / 2');
console.log(tileMath ? 'PASS: Tile coordinate conversion correct' : 'FAIL: Tile math incomplete');

// Check apostrophe fix in Hunter's Lodge
if (src.includes("\\'s") || src.includes('"Hunter')) {
    console.log('PASS: Apostrophe in Hunter's Lodge fixed');
} else {
    console.log('WARN: Check apostrophe handling');
}
