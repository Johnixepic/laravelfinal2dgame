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

// Boat stages are sequential; sailing requires a deliberate interaction on MAP5.
assert.match(source, /const BOAT_STAGES = \[\s*\{ id: 'hull'/);
assert.match(source, /checkWinCondition\(interactionPressed = false\)/);
assert.match(source, /if \(!interactionPressed \|\| this\.won \|\| !this\.boatBuilt \|\| this\.currentMapId !== 'MAP5'\)/);
assert.match(update, /if \(this\.boatBuilt\) \{\s*this\.checkWinCondition\(true\)/);
assert.match(source, /GameState\.boatStagesCompleted = \[false, false, false, false\]/);

console.log('Gameplay regression checks: PASS');
console.log('Covered: indoor controls, transition isolation, inventory safety, recipe outputs, boat progression and explicit ending interaction.');
