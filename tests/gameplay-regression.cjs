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
assert.match(source, /this\.cursors\?\.left\?\.isDown \|\| this\.keys\?\.A\?\.isDown \|\| this\.touchKeys\?\.left/);
assert.match(source, /this\.cursors\?\.right\?\.isDown \|\| this\.keys\?\.D\?\.isDown \|\| this\.touchKeys\?\.right/);
assert.match(source, /this\.cursors\?\.up\?\.isDown \|\| this\.keys\?\.W\?\.isDown \|\| this\.touchKeys\?\.up/);
assert.match(source, /this\.cursors\?\.down\?\.isDown \|\| this\.keys\?\.S\?\.isDown \|\| this\.touchKeys\?\.down/);
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
assert.match(update, /if \(this\.menuOpen \|\| this\.endingActive \|\| this\.tutorialActive\) return/);
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
assert.match(source, /Use card visibility instead of a geometry mask/);
assert.match(source, /updateRecipeCardVisibility\(\) \{/);
assert.match(source, /const helpSafeWidth = Math\.max\(180, w \* 0\.94\)/);
assert.match(source, /this\.interactionPrompt\.setOrigin\(0\.5\)/);
assert.match(source, /this\.hintTextObj\.setOrigin\(0\.5\)/);
assert.match(source, /this\.indoorPrompt\.setOrigin\(0\.5\)/);
assert.match(source, /wordWrap: \{ width: 245 \}/);
assert.match(source, /wordWrap: \{ width: 155 \}/);
assert.doesNotMatch(source, /showMessage\('Workbench opened\\.'/);
assert.match(source, /card\.setVisible\(cardY >= -65 && cardY <= 570\)/);
assert.match(source, /this\.updateRecipeCardVisibility\(\)/);
assert.doesNotMatch(source, /recipeScrollArea\.setMask\(recipeMask\)/);
assert.match(source, /this\.input\.on\('wheel'/);
assert.match(source, /this\.recipeScrollArea\.setY\(-270 - this\.recipeScrollOffset\)/);
assert.match(source, /\$\{ITEM_DEFS\[k\]\.name\}: \$\{this\.getItem\(k\)\}\/\$\{a\}/);
assert.match(source, /READY TO CRAFT/);
assert.match(source, /MISSING MATERIALS/);
assert.match(source, /BOAT ESCAPE  •  CONSTRUCTION TASKS/);
assert.match(source, /TOOLS CHECKLIST/);
assert.match(source, /MATERIALS CHECKLIST/);
assert.match(source, /NEXT ACTION/);
assert.match(source, /Keep every objective on its own line on narrow touch screens/);
assert.match(source, /Return to the boat and interact/);
// TLC-026: game startup must not access Phaser's uninitialized internal pointer manager.
assert.doesNotMatch(source, /game\.input\.manager/);
assert.doesNotMatch(source, /pointerManager\.transformPointer/);
// TLC-024: compass is fixed to the viewport and follows the player's cardinal heading.
assert.match(source, /this\.createCompass\(\)/);
assert.match(source, /createCompass\(\) \{/);
assert.match(source, /updateCompass\(dx, dy\) \{/);
assert.match(source, /root\.setScrollFactor\(0\)/);
assert.match(source, /this\.compassRoot\.setPosition\(w - \(compact \? 48 : 72\), compact \? 48 : 72\)\.setScale\(compact \? 0\.78 : 1\)/);
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
assert.match(source, /mode: Phaser\.Scale\.RESIZE/);
const gameView = fs.readFileSync(path.join(__dirname, '..', 'resources', 'views', 'game.blade.php'), 'utf8');
assert.match(gameView, /main \{[\s\S]*?position: fixed;[\s\S]*?inset: 0;/);
assert.match(gameView, /\.game-header, \.game-footer \{ display: none !important; \}/);
assert.match(gameView, /#game-container \{[\s\S]*?width: 100%;[\s\S]*?height: 100%;[\s\S]*?aspect-ratio: auto;/);
assert.match(gameView, /#game-container canvas \{[\s\S]*?width: 100% !important;[\s\S]*?height: 100% !important;/);
assert.match(gameView, /\.rotate-device-notice/);
assert.match(gameView, /@media \(pointer: coarse\) and \(orientation: portrait\)/);
assert.match(gameView, /#game-container \{ visibility: hidden; \}/);
assert.match(gameView, /ROTATE YOUR PHONE/);
assert.match(gameView, /designed for landscape play/);
assert.match(source, /activePointers: 3/);
const persistence = section('    installPersistenceHooks() {', '    tilePosition(i, j) {');
assert.match(persistence, /window\.addEventListener\('pagehide'/);
assert.match(persistence, /document\.addEventListener\('visibilitychange'/);
assert.match(persistence, /this\.saveGame\(\{ silent: true \}\)/);
assert.match(source, />= 15000\) \{/);
assert.match(source, /this\.persistCurrentRun\(\);[\s\S]*?GameState\.started = false/);
assert.match(source, /toastGeneration !== this\.messageGeneration/);
assert.match(source, /this\.menuNoticeText\?\.active/);
assert.match(source, /createMenuDomButtons\(buttons, buttonStartY, buttonGap, buttonWidth, buttonHeight\)/);
assert.match(source, /document\.createElement\('button'\)/);
assert.match(source, /button\.addEventListener\('click'/);
assert.doesNotMatch(source, /button\.setInteractive\(\{ useHandCursor: true \}\)/);
assert.doesNotMatch(source, /button\.on\('pointerup'/);
assert.match(source, /destroyMenuDom\(\)/);
assert.match(source, /this\.cameras\?\.main\?\.stopFollow\(\)/);
assert.match(source, /this\.cameras\?\.main\?\.startFollow\(this\.player, true, 0\.08, 0\.08\)/);
const menuOpen = section('    openMenu(mode = \'pause\') {', '    confirmNewGame() {');
assert.match(menuOpen, /const openingMenu = !this\.menuOpen/);
assert.match(menuOpen, /this\.cameras\?\.main\?\.setZoom\(1\)/);
assert.match(menuOpen, /this\.createMenuDomButtons\(buttons, buttonStartY, buttonGap, buttonWidth, buttonHeight\)/);
assert.doesNotMatch(menuOpen, /setInteractive\(/);
const menuClose = section('    closeMenu() {', '    startNewGame() {');
assert.match(menuClose, /this\.cameras\.main\.setZoom\(this\.worldCameraZoom \|\| this\.menuCameraZoom \|\| 1\)/);
const persistenceGuard = section('    persistCurrentRun() {', '    tilePosition(i, j) {');
assert.doesNotMatch(persistenceGuard, /this\.obstacles\?\.active/);
assert.match(persistenceGuard, /!MAPS\[this\.currentMapId\]/);
const saveMethods = section('    saveGame({ silent = false } = {}) {', '    returnToTitle() {');
assert.match(saveMethods, /localStorage\.setItem\('tlc-save-v1', serialized\)/);
assert.match(saveMethods, /GameState\.objectStates = allObjectStates/);
assert.match(saveMethods, /GameState\.inventory = this\.inventory/);
assert.match(saveMethods, /GameState\.equipment = this\.equipment/);
assert.match(saveMethods, /QuotaExceededError/);
assert.match(saveMethods, /localStorage\.getItem\('tlc-save-v1'\)/);
assert.match(saveMethods, /Save validation failed/);
assert.match(saveMethods, /normalizedObjectStates/);
assert.match(saveMethods, /this\.scene\.start\('WorldScene'/);
assert.match(saveMethods, /Scene restore failed/);

assert.match(source, /this\.touchPause/);
assert.match(source, /pointerupoutside/);
assert.match(source, /const buttonWidth = compact \? Math\.min\(520, Math\.max\(220, w - 36\)\) : 420/);
assert.match(source, /const panelScale = Math\.min\(1, \(w - 20\) \/ 640, \(h - 20\) \/ 700\)/);
assert.match(source, /this\.worldCameraZoom = responsiveZoom \* \(touchLayout \? 1 : 0\.7\)/);
assert.match(source, /this\.worldCameraZoom = responsiveZoom \* \(this\.isTouchLayout \? 1 : 0\.7\)/);
assert.match(source, /Desktop receives the requested 30% zoom-out/);
assert.match(source, /this\.cameras\.main\.setZoom\(this\.menuOpen \? 1 : this\.worldCameraZoom\)/);
assert.match(source, /this\.cameras\?\.main\?\.setZoom\(1\)/);
assert.match(source, /this\.cameras\.main\.setZoom\(this\.worldCameraZoom \|\| this\.menuCameraZoom \|\| 1\)/);
assert.match(source, /const openingMenu = !this\.menuOpen/);
assert.match(source, /this\.menuCameraZoom = this\.cameras\?\.main\?\.zoom/);
assert.match(source, /const inventoryBaseX = compact \? w \/ 2 : w - 400/);
assert.match(source, /inventoryBaseX \+ w \* 0\.15/);
assert.match(source, /inventoryCenterX - 210 \* inventoryScale/);
assert.match(source, /inventoryHalfWidth \+ 12/);
assert.match(source, /w - inventoryHalfWidth - 12/);
assert.match(source, /this\.touchActionRoot\.setPosition\(Math\.max\(220, w - 42\), h - 120\)\.setScale\(touchScale\)/);
assert.match(source, /this\.touchControlsRoot\.setPosition\(Math\.min\(112, Math\.max\(68, w \* 0\.23\)\), h - 110\)\.setScale\(touchScale\)/);
assert.match(source, /this\.inventoryPanel = this\.add\.rectangle\([^\n]+480, 640/);
assert.match(source, /this\.inventoryPanel[\s\S]*?setDepth\(5000\)/);
assert.match(source, /this\.inventoryText[\s\S]*?setDepth\(5001\)/);
assert.match(source, /if \(this\.inventoryOpen\) this\.refreshInventoryUI\(\)/);
assert.match(source, /if \(escapePressed && this\.inventoryOpen\)/);
assert.match(source, /this\.messageText\.setPosition\(w \/ 2, compact \? Math\.max\(112, h \* 0\.18\) : 118\)/);
assert.match(source, /this\.children\.bringToTop\(this\.messageText\)/);
assert.match(source, /ALREADY SEARCHED/);
assert.match(source, /ALREADY HARVESTED/);
assert.match(source, /this\.messageText\.setScrollFactor\(0, 0\)/);
assert.match(source, /this\.messageHideEvent = this\.time\.delayedCall\(4500/);
assert.match(source, /this\.interactionPrompt\.setPosition\(w \/ 2, h - \(compact \? 126 : 120\)\)/);
assert.match(source, /this\.mapLabel = null;/);
assert.match(source, /this\.mapLabel && this\.mapLabel\.scene === this && this\.mapLabel\.active/);
// TLC-024: visible gates and transitions share the exact exit tile coordinates.
assert.match(source, /Draw each exit gate from the same tile coordinates used by transitions/);
assert.match(source, /const p = this\.tilePosition\(exit\.fromTile\.i, exit\.fromTile\.j\)/);
assert.match(source, /const gatePosition = this\.tilePosition\(exit\.fromTile\.i, exit\.fromTile\.j\)/);
assert.match(source, /if \(distance <= 58\)/);
assert.equal((source.match(/entryTile: \{ i: 2, j: 15 \}/g) || []).length, 4, 'Eastbound arrivals must spawn safely inside the next map');
assert.equal((source.match(/entryTile: \{ i: 27, j: 15 \}/g) || []).length, 2, 'Intermediate westbound arrivals must spawn safely inside the previous map');
assert.equal((source.match(/entryTile: \{ i: 26, j: 15 \}/g) || []).length, 2, 'Home and final-island arrivals must spawn beyond the destination gate trigger');
assert.match(source, /fromTile: \{ i: 0, j: 15 \}, toMap: 'MAP4', entryTile: \{ i: 26, j: 15 \}/, 'Final island must have a return gate to MAP4');
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
 // TLC-026: complete game flow, browser save/load, touch support and guaranteed opening supplies.
assert.match(source, /createGameMenu\(\) \{/);
assert.match(source, /openMenu\(mode = 'pause'\)/);
assert.match(source, /startNewGame\(\) \{[\s\S]*?this\.menuOverlay\?\.destroy\(\)/);
assert.match(source, /confirmNewGame\(\) \{/);
assert.match(source, /mode === 'confirm-new'/);
assert.match(source, /saveGame\(\{ silent = false \} = \{\}\) \{/);
assert.match(source, /localStorage\.setItem\('tlc-save-v1'/);
assert.match(source, /loadSavedGame\(slot = 'current'\) \{/);
assert.match(source, /hasSavedGame\(slot = 'current'\)/);
assert.match(source, /localStorage\.getItem\('tlc-save-v1'/);
assert.match(source, /slot === 'backup' \? 'tlc-save-backup-v1' : 'tlc-save-v1'/);
assert.match(source, /localStorage\.setItem\('tlc-save-backup-v1', existingSave\)/);
assert.match(source, /this\.loadSavedGame\('backup'\)/);
assert.match(source, /if \(!saved\) \{/);
assert.match(source, /captureCurrentMapObjectStates\(\)/);
assert.match(source, /state\.kind}:\$\{state\.name}:\$\{state\.x}:\$\{state\.y/);
assert.match(source, /object\.x,\s*y: object\.y/);
assert.match(source, /GameState\.objectStates\[this\.currentMapId\]/);
assert.match(source, /applySavedObjectStates\(savedObjectsForMap\)/);
assert.match(source, /createTouchControls\(\) \{/);
assert.match(source, /this\.touchKeys\?\.left/);
assert.match(source, /this\.touchKeys\?\.up/);
assert.match(source, /this\.touchInteract/);
assert.match(source, /this\.touchInventory/);
assert.match(source, /if \(escapePressed && !hadOpenPanelBeforeEscape/);
assert.match(source, /if \(name === 'Your Home'\)/);
assert.match(source, /You already have the reusable/);
assert.match(source, /alreadyOwned \? 'ALREADY OWNED'/);
assert.match(source, /this\.refreshRecipeUI\(\);/);
assert.match(source, /GameState\.workbenchDiscovered = true/);
assert.match(source, /GameState\.started = false/);
assert.match(source, /GameState\.tutorialPending = true/);
assert.match(source, /START HERE: Search Your Home/);
assert.match(source, /this\.startNewGame\(\);/);
assert.match(source, /this\.openMenu\('ending'\)/);
 // TLC-026: safe survival loop, food action, day/night state and optional sound effects.
assert.match(source, /updateSurvival\(delta = 16\)/);
assert.match(source, /this\.survival\.hunger = Math\.max\(0, this\.survival\.hunger - 1\)/);
assert.match(source, /eatFood\(\) \{/);
assert.match(source, /this\.removeItem\('food', 1\)/);
assert.match(source, /this\.survival\.hunger <= 15 \? 0\.75 : 1/);
assert.match(source, /NIGHT \(SAFE\)/);
assert.match(source, /this\.survival\.elapsedMs % cycleLength/);
assert.match(source, /this\.survival\.hunger \+ 35/);
assert.match(source, /F TO EAT/);
assert.match(source, /playSfx\(kind = 'interact'\)/);
assert.match(source, /SOUND: /);
assert.match(source, /this\.playSfx\('victory'\)/);
assert.match(source, /keyboard\.once\('keydown-R'/);
assert.match(source, /GameState\.survival = \{ \.\.\.this\.survival \}/);
// TLC-027: scene lifecycle and full save restoration.
assert.match(source, /this\.won = false;[\s\S]*?this\.endingActive = false;/);
assert.match(source, /GameState\.audioEnabled = true;/);
assert.match(source, /GameState\.objectStates = normalizedObjectStates/);
assert.match(source, /GameState\.survival = normalizedSurvival/);
assert.match(source, /this\.keys\?\.E\?\.isDown/);
assert.match(source, /this\.keys\?\.ESC\?\.isDown/);
assert.match(source, /this\.cursors\?\.left\?\.isDown/);
assert.match(source, /this\.keys\?\.A\?\.isDown/);
assert.match(source, /GameState\.audioEnabled = save\.audioEnabled !== false/);
assert.match(source, /const validInventory = save\?\.inventory/);
assert.match(source, /const validEquipment = save\?\.equipment/);
assert.match(source, /const validBoat = Number\.isInteger\(save\?\.boatStage\)/);
assert.match(source, /const validSurvival = save\?\.survival/);
assert.match(source, /const validObjectStates = save\?\.objectStates/);
assert.match(source, /previousSave\.objectStates = JSON\.parse\(JSON\.stringify\(GameState\.objectStates\)\)/);
assert.match(source, /this\.won = false;[\s\S]*?this\.endingActive = false;[\s\S]*?this\.menuOpen = false;/);
// TLC-028: regional gatherable loot profiles now create collectible world objects.
assert.match(source, /const profile = MAP_LOOT_PROFILES\[mapId\]/);
assert.match(source, /kind', 'gatherable'/);
assert.match(source, /itemKey', itemKey/);
assert.match(source, /if \(kind === 'gatherable'\)/);
const houseInteraction = section("        if (kind === 'house') {", "            object.setData('searched', true);");
assert.ok(houseInteraction.indexOf("object.getData('searched')") < houseInteraction.indexOf("buildingDef?.indoor"), 'Already-searched house feedback must run before indoor entry');
const treeInteraction = section("        if (kind === 'tree') {", "            object.setData('harvested', true);");
assert.ok(treeInteraction.indexOf("object.getData('harvested')") < treeInteraction.indexOf("!this.equipment.saw"), 'Already-harvested tree feedback must run before the Saw requirement');

assert.match(source, /const amount = itemKey === 'machinery_salvage' \? 1 : 2/);
assert.match(source, /const boatTexture = GameState\.boatBuilt[\s\S]*?boat_stage\$\{Math\.min\(3, savedStage\)\}/);
assert.match(source, /this\.menuActionAt = -Infinity/);
assert.match(source, /object\.setAlpha\(0\.35\)/);
// TLC-028: every map profile now creates collectible salvage and every salvage family can be processed.
assert.match(source, /const preferredResourceTiles = \[\[14, 6\]/);
assert.match(source, /cache\.setData\('kind', 'gatherable'\)/);
assert.match(source, /cache\.setData\('itemKey', itemKey\)/);
for (const recipeId of ['recycleBranches', 'processDriftwood', 'twistFibers', 'twistNaturalFibers', 'recycleHouseholdScrap', 'recycleMachinery', 'recycleFasteners']) {
    assert.match(source, new RegExp("id: '" + recipeId + "'"), "Missing salvage processing recipe: " + recipeId);
}
assert.match(source, /this\.inventoryWasDown = false;[\s\S]*?this\.eatWasDown = false;/);
assert.match(source, /resourceCandidates\.find/);
assert.match(source, /resourceCandidates\.push\(\[i, j\]\)/);
assert.match(source, /GameState\.inventory = Object\.fromEntries\(Object\.keys\(ITEM_DEFS\)\.map/);
assert.match(source, /this\.scale\.off\('resize', this\.repositionUI, this\)/);
assert.match(source, /saveGame\(\{ silent = false \} = \{\}\)/);
assert.match(source, /this\.time\.now - \(this\.lastAutosaveAt \?\? this\.time\.now\) >= 15000/);
assert.match(source, /this\.saveGame\(\{ silent: true \}\)/);
assert.match(source, /if \(!silent\) \{/);
assert.match(source, /else if \(!silent\) this\.showMessage/);

assert.match(source, /Touch users need a swipe gesture/);
assert.match(source, /this\.recipeDragStart\.y - pointer\.y/);
assert.match(source, /if \(!this\.recipeDragMoved\) this\.craftRecipe\(recipe\)/);
assert.match(source, /card\.on\('pointerup'/);
assert.match(source, /refreshBoatUI\(\) \{[\s\S]*?OVERALL:/);
assert.match(source, /CURRENT TASK:/);
assert.match(source, /MATERIALS NEEDED/);
assert.match(source, /NEXT: Craft/);
assert.match(source, /NEXT: Gather the missing materials/);
assert.match(source, /STATUS: READY TO SAIL/);
assert.match(source, /this\.boatText\.setWordWrapWidth\(Math\.max\(125, Math\.min\(185, this\.scale\.width - 105\)\), true\)/);
assert.match(source, /this\.refreshBoatUI\(\);[\s\S]*?this\.playSfx\('craft'\)/);
assert.match(source, /this\.inventory\[key\] = current \+ added;[\s\S]*?this\.refreshBoatUI\(\)/);
assert.match(source, /this\.inventory\[key\] = current - amount;[\s\S]*?this\.refreshBoatUI\(\)/);
assert.match(source, /HUNGER \$\{Math\.round\(this\.survival\.hunger\)\}%/);
assert.match(source, /this\.survivalText\.setPosition\(compact \? 12 : 24, compact \? 12 : 98\)/);
assert.match(source, /this\.scale\.startFullscreen\(\)/);
assert.match(source, /fullscreenLabel/);
assert.match(source, /const buttonAreaTop = -h \/ 2 \+ 120/);
assert.match(source, /const buttonAreaBottom = h \/ 2 - 64/);
assert.match(source, /Landscape recommended/);
assert.match(source, /this\.workbenchHintText\.setText\(this\.isTouchLayout/);
assert.match(source, /Swipe to browse  ·  Tap a recipe  ·  Pause to close/);
assert.match(source, /this\.messageText\.setFontSize\(compact \? 13 : 16\)/);
assert.match(source, /this\.interactionPrompt\.setFontSize\(compact \? 13 : 16\)/);
assert.match(source, /this\.hintTextObj\.setFontSize\(compact \? 11 : 13\)/);
assert.match(source, /this\.indoorPrompt\.setFontSize\(compact \? 13 : 16\)/);
assert.match(source, /const touchScale = w < 360 \? 0\.82 : w < 430 \? 0\.9 : 1/);
 // TLC-029: approaching world objects explains what they do and how to use them.
 assert.match(source, /getNearbyHelpTip\(object\) \{/);
 assert.match(source, /Trees need a Saw/);
 assert.match(source, /Open the workbench to craft tools and process materials/);
 assert.match(source, /Boat work needs tools:/);
 assert.match(source, /Search buildings for supplies/);
 assert.match(source, /Collect \$\{itemName\} here/);
 assert.match(source, /const actionKey = this\.isTouchLayout \? 'TAP' : 'E'/);
 assert.match(source, /this\.getNearbyHelpTip\(this\.nearbyObject\)/);
 assert.match(source, /interactionPrompt\.text\}\\n\$\{helpTip\}/);
 assert.match(source, /backgroundColor: '#07120ff5'/);
 assert.match(source, /color: '#ffffff'/);
 assert.match(source, /interactionPrompt\.setFontSize\(compact \? 13 : 16\)/);
 assert.match(source, /hintTextObj\.setFontSize\(compact \? 11 : 13\)/);
 assert.match(source, /this\.boatText\.setPosition\(compact \? 12 : 24, \(compact \? 66 : 24\) \+ h \* 0\.2\)/);


// TLC-030: the victory ending hides gameplay HUD and uses readable, opaque presentation.
const ending = section('    showEnding() {', '    // DO019: Reset every gameplay system');
assert.match(ending, /this\.endingActive = true/);
assert.match(ending, /this\.player\?\.setVelocity\(0, 0\)/);
assert.match(ending, /this\.player\.body\.enable = false/);
assert.match(ending, /this\.cameras\.main\.stopFollow\(\)/);
assert.doesNotMatch(ending, /startFollow\(this\.boatSite/);
assert.match(ending, /this\.boatSite,[\s\S]*?alpha: 0,[\s\S]*?duration: 2600/);
assert.match(ending, /this\.boatText,[\s\S]*?this\.touchActionRoot/);
assert.match(ending, /element\?\.setVisible\(false\)/);
assert.match(ending, /0x07120f, 0\.96/);
assert.match(ending, /color: '#f1f7e9'/);
assert.match(ending, /color: '#d0e2c4'/);
assert.match(ending, /color: '#c0d5b5'/);
assert.match(ending, /color: '#a9c59b'/);
assert.match(ending, /wordWrap: \{ width: Math\.min\(720, viewW - 48\) \}/);
assert.match(ending, /this\.input\.keyboard\.once\('keydown-R'/);


 // TLC-031: the tutorial overlays the live world and resumes the same run without a scene reload.
assert.match(source, /GameState\.tutorialPending = Boolean\(tutorial\)/);
assert.match(source, /'TUTORIAL', \(\) => this\.confirmNewGame\(true\)/);
assert.match(source, /'HOW TO PLAY', \(\) => this\.startTutorial\(\)/);
assert.match(source, /startTutorial\(\) \{/);
assert.match(source, /renderTutorialStep\(\) \{/);
assert.match(source, /finishTutorial\(skipped = false\)/);
assert.match(source, /this\.tutorialActive = true/);
assert.match(source, /this\.tutorialActive = false/);
assert.match(source, /this\.player\?\.body\) this\.player\.body\.enable = false/);
assert.match(source, /if \(this\.player\?\.body\) this\.player\.body\.enable = true/);
assert.match(source, /ENTER THE ISLAND/);
assert.match(source, /this\.destroyTutorialDom\(\)/);
assert.match(source, /this\.startTutorial\(\);/);
assert.match(source, /this\.scene\.restart\(\{ startMapId: 'MAP1'/);
assert.doesNotMatch(source.slice(source.indexOf('    finishTutorial(skipped = false)'), source.indexOf('    startNewGame(')), /scene\.restart|scene\.start/);
assert.match(gameView, /\.game-tutorial-overlay/);
assert.match(gameView, /\.game-tutorial-panel/);
assert.match(gameView, /\.game-tutorial-actions button:focus-visible/);
assert.match(gameView, /@media \(max-width: 520px\)/);

console.log('Gameplay regression checks: PASS');
console.log('Covered: indoor controls, transition isolation, inventory safety, recipe outputs, boat progression, save/load restoration, scene reset, regional gathering, compass HUD, Workbench rendering/scrolling and reachable map exits.');