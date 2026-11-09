const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(
    path.join(__dirname, '..', 'resources', 'js', 'app.js'),
    'utf8'
);

function section(start, end) {
    const from = source.indexOf(start);
    const to = source.indexOf(end, from);
    assert.notEqual(from, -1, `Missing section start: ${start}`);
    assert.notEqual(to, -1, `Missing section end: ${end}`);
    return source.slice(from, to);
}

// Indoor mode must use one consistent set of object names.
assert.equal(source.includes('indor'), false, 'Misspelled indoor property remains');
assert.match(source, /this\.indoorGrid\.add\(this\.indoorDoor\)/);
assert.match(source, /this\.indoorPlayerSprite\.setPosition\(clampedX, clampedY\)/);
assert.match(source, /this\.indoorPrompt\.setText/);
assert.match(source, /this\.currentIndoorHouse = null/);
assert.match(source, /I: Phaser\.Input\.Keyboard\.KeyCodes\.I/);
assert.match(source, /const inventoryPressed = inventoryDown && !this\.inventoryWasDown/);
assert.match(source, /this\.inventoryText\.setVisible\(this\.inventoryOpen\)/);

// Indoor update handling must run before outdoor object interactions and transitions.
const update = section('    update(time, delta = 16) {', '\n}\n\n// ============================================================\n// GAME INITIALIZATION');
assert.ok(
    update.indexOf('if (this.indoorMode) {') < update.indexOf('this.nearbyObject = this.findNearbyObject();'),
    'Indoor mode must return before outdoor interaction handling'
);
assert.match(update, /const step = Math\.min\(Math\.max\(delta, 0\), 50\) \/ 1000/);
assert.match(update, /const interactionPressed = interactionDown && !this\.interactionWasDown/);
assert.match(update, /if \(escapePressed\) this\.exitIndoor\(\)/);
assert.match(update, /this\.checkMapTransition\(\)/);

// Map transitions are blocked while indoors and latched while changing scenes.
const transition = section('    checkMapTransition() {', '    updateMapUI() {');
assert.match(transition, /this\.indoorMode \|\| this\.transitioningMap/);
assert.match(transition, /this\.transitioningMap = true/);
assert.match(transition, /GameState\.inventory = this\.inventory/);

// Inventory operations cannot overdraw resources, and all recipe outputs exist.
const inventory = section('    addItem(key, amount) {', '    getItem(key) {');
assert.match(inventory, /current < amount/);
assert.match(inventory, /Number\.isInteger\(amount\)/);
for (const key of ['boatPlank', 'repairKit', 'plank', 'sailcloth']) {
    assert.match(source, new RegExp(`\\b${key}: \\{ name:`), `Missing ITEM_DEFS entry for ${key}`);
}
assert.match(source, /outputDef\.limit/);
assert.match(source, /recipe\.workbenchRequired && !this\.workbenchDiscovered/);
assert.match(source, /const requiredTools = \['saw', 'hammer', 'crowbar', 'screwdriver'\]/);
assert.match(source, /if \(!this\.equipment\.saw\)/);
assert.match(source, /GameState\.equipment = \{ saw: false, hammer: false, crowbar: false, screwdriver: false \}/);
assert.match(source, /MAP2: \{ wood: 1, scrap: 1, rope: 1, cloth: 1 \}/);
assert.match(source, /MAP3: \{ scrap: 2, rope: 1, cloth: 1 \}/);
assert.match(source, /MAP4: \{ scrap: 1, rope: 1, cloth: 1 \}/);
assert.match(source, /MAP5: \{ rope: 1, cloth: 2 \}/);

// TLC-024: the Workbench mask must cover the panel, not the world origin.
assert.match(source, /this\.make\.graphics\(\{ x: px, y: py, add: false \}\)/);
assert.match(source, /recipeMaskShape\.fillRect\(-300, -305, 600, 575\)/);
assert.match(source, /recipeScrollArea\.setMask\(recipeMask\)/);
assert.match(source, /this\.input\.on\('wheel'/);
assert.match(source, /this\.recipeScrollArea\.setY\(-270 - this\.recipeScrollOffset\)/);
assert.match(source, /\$\{ITEM_DEFS\[k\]\.name\}: \$\{this\.getItem\(k\)\}\/\$\{a\}/);
assert.match(source, /READY TO CRAFT/);
assert.match(source, /MISSING MATERIALS/);

// TLC-024: compass is fixed to the viewport and follows the player's cardinal heading.
assert.match(source, /this\.createCompass\(\)/);
assert.match(source, /createCompass\(\) \{/);
assert.match(source, /updateCompass\(dx, dy\) \{/);
assert.match(source, /root\.setScrollFactor\(0\)/);
assert.match(source, /this\.compassRoot\.setPosition\(w - 72, 72\)/);
assert.match(source, /this\.compassNeedle\.setRotation\(rotations\[this\.facingDirection\]\)/);
assert.match(source, /this\.scale\.on\('resize', this\.repositionUI, this\)/);
assert.match(source, /this\.updateCompass\(idx, idy\)/);
assert.match(source, /Scroll to browse/);

// TLC-025: texture registration is safe when Phaser recreates a scene.
assert.equal(
    (source.match(/if \(this\.textures\.exists\(key\)\)/g) || []).length,
    2,
    'Both world and boat texture helpers must reuse existing texture keys'
);

// TLC-025: the game uses a 1920x1080 reference canvas and preserves 16:9.
assert.match(source, /width: 1920,\s*height: 1080/);
assert.match(source, /mode: Phaser\.Scale\.FIT/);
assert.match(source, /this\.inventoryPanel\.setPosition\(w - 140, 230\)/);
assert.match(source, /this\.inventoryText\.setPosition\(w - 260, 38\)/);
assert.match(source, /this\.messageText\.setPosition\(w \/ 2, 118\)/);
assert.match(source, /this\.interactionPrompt\.setPosition\(w \/ 2, h - 120\)/);
assert.match(source, /this\.mapLabel = null;/);
assert.match(source, /this\.mapLabel && this\.mapLabel\.scene === this && this\.mapLabel\.active/);




// TLC-024: visible gates and transitions share the exact exit tile coordinates.
assert.match(source, /Draw each exit gate from the same tile coordinates used by transitions/);
assert.match(source, /const p = this\.tilePosition\(exit\.fromTile\.i, exit\.fromTile\.j\)/);
assert.match(source, /const gatePosition = this\.tilePosition\(exit\.fromTile\.i, exit\.fromTile\.j\)/);
assert.match(source, /if \(distance <= 58\)/);
assert.equal((source.match(/entryTile: \{ i: 2, j: 15 \}/g) || []).length, 4, 'Eastbound arrivals must spawn two tiles inside the next map');
assert.equal((source.match(/entryTile: \{ i: 27, j: 15 \}/g) || []).length, 3, 'Westbound arrivals must spawn two tiles inside the previous map');
assert.match(source, /const panelW = 640, panelH = 700/);
assert.match(source, /panelBorder\.strokeRect\(-320, -350, 640, 700\)/);
assert.match(source, /this\.add\.text\(\s*275,\s*-20,/);
assert.match(source, /\)\.setOrigin\(1, 0\);/);
assert.match(source, /left: this\.craftingPanel\.x - 320/);
assert.match(source, /return normalizedX \+ normalizedY <= 1\.03/);

// Boat stages are sequential; sailing requires a deliberate interaction on MAP5.
assert.match(source, /const BOAT_STAGES = \[\s*\{ id: 'hull'/);
assert.match(source, /checkWinCondition\(interactionPressed = false\)/);
assert.match(source, /if \(!interactionPressed \|\| this\.won \|\| !this\.boatBuilt \|\| this\.currentMapId !== 'MAP5'\)/);
assert.match(update, /if \(this\.boatBuilt\) \{\s*this\.checkWinCondition\(true\)/);
assert.match(source, /GameState\.boatStagesCompleted = \[false, false, false, false\]/);

console.log('Gameplay regression checks: PASS');
console.log('Covered: indoor controls, transition isolation, inventory safety, recipe outputs, boat progression, compass HUD, Workbench rendering/scrolling and reachable map exits.');
