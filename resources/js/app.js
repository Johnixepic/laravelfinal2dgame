import Phaser from 'phaser';

const TILE_W = 64;
const TILE_H = 32;

// ============================================================
// SHARED GAME STATE — survives map transitions
// ============================================================
const GameState = {
    inventory: { wood: 0, scrap: 0, rope: 0, cloth: 0, food: 0 },
    equipment: { saw: false, hammer: false, crowbar: false, screwdriver: false },
    boatStage: 0,
    boatStagesCompleted: [false, false, false, false],
    boatBuilt: false,
    workbenchDiscovered: false,
    started: false,
    objectStates: {},
};

// ============================================================
// MAP DEFINITIONS — five connected maps
// ============================================================
const MAPS = {
    MAP1: {
        id: 'MAP1',
        name: 'Home Island',
        theme: 'home',
        dims: { cols: 30, rows: 30 },
        terrainColors: {
            grass: [0x72945f, 0x66865a],
            road: 0x77776a,
            edge: 0xb5a77b,
            water: 0x3a6b8a,
            woodland: 0x5a8a5a,
            abandoned: 0x8a7a5a,
            industrial: 0x7a7a7a,
            overgrown: 0x4a6a4a,
            shore: 0xc2b280,
        },
        exits: [
            { fromTile: { i: 28, j: 15 }, toMap: 'MAP2', entryTile: { i: 2, j: 15 } },
        ],
        fogMargin: 2,
        landmarks: [
            { tile: { i: 13, j: 13 }, label: 'Start' },
            { tile: { i: 14, j: 23 }, label: 'Boat Dock' },
        ],
        workbenches: [],
    },
    MAP2: {
        id: 'MAP2',
        name: 'Abandoned Settlement',
        theme: 'abandoned',
        dims: { cols: 30, rows: 30 },
        terrainColors: {
            grass: [0x8a7a5a, 0x7a6a4a],
            road: 0x6a6a5a,
            edge: 0x9a8a6a,
            water: 0x3a6b8a,
        },
        exits: [
            { fromTile: { i: 29, j: 15 }, toMap: 'MAP3', entryTile: { i: 2, j: 15 } },
            { fromTile: { i: 0, j: 15 }, toMap: 'MAP1', entryTile: { i: 27, j: 15 } },
        ],
        fogMargin: 2,
        landmarks: [],
    },
    MAP3: {
        id: 'MAP3',
        name: 'Industrial Ruins',
        theme: 'industrial',
        dims: { cols: 30, rows: 30 },
        terrainColors: {
            grass: [0x6a6a5a, 0x5a5a4a],
            road: 0x4a4a3a,
            edge: 0x7a7a6a,
            water: 0x3a6b8a,
        },
        exits: [
            { fromTile: { i: 29, j: 15 }, toMap: 'MAP4', entryTile: { i: 2, j: 15 } },
            { fromTile: { i: 0, j: 15 }, toMap: 'MAP2', entryTile: { i: 27, j: 15 } },
        ],
        fogMargin: 2,
        landmarks: [],
    },
    MAP4: {
        id: 'MAP4',
        name: 'Deep Wilderness',
        theme: 'wilderness',
        dims: { cols: 30, rows: 30 },
        terrainColors: {
            grass: [0x2a4a2a, 0x1a3a1a],
            road: 0x3a4a3a,
            edge: 0x4a5a4a,
            water: 0x3a6b8a,
        },
        exits: [
            { fromTile: { i: 29, j: 15 }, toMap: 'MAP5', entryTile: { i: 2, j: 15 } },
            { fromTile: { i: 0, j: 15 }, toMap: 'MAP3', entryTile: { i: 27, j: 15 } },
        ],
        fogMargin: 2,
        landmarks: [],
    },
    MAP5: {
        id: 'MAP5',
        name: 'Coastal Escape',
        theme: 'coastal',
        dims: { cols: 30, rows: 30 },
        terrainColors: {
            grass: [0x8aaa7a, 0x7a9a6a],
            road: 0x9a8a6a,
            edge: 0xc5b69a,
            water: 0x4a8ab5,
        },
        exits: [],
        fogMargin: 2,
        landmarks: [
            { tile: { i: 14, j: 23 }, label: 'Boat Site' },
        ],
    },
};

// ============================================================
// OBSTACLE DEFINITIONS PER MAP
// ============================================================
const MAP_OBSTACLES = {
    MAP1: {
        buildings: [
            { i: 10, j: 11, name: 'Your Home', kind: 'house', searchKey: 'searched' },
            { i: 20, j: 9, name: 'Abandoned House', kind: 'house', searchKey: 'searched' },
            { i: 10, j: 21, name: 'Garden Shed', kind: 'house', searchKey: 'searched' },
            { i: 21, j: 20, name: 'Old House', kind: 'house', searchKey: 'searched' },
        ],
        workbenches: [
            { i: 15, j: 15 },
        ],
        trees: [
            [5, 8], [7, 7], [6, 11], [8, 19],
            [5, 21], [23, 8], [24, 12], [23, 23],
            [18, 24], [12, 24], [25, 18], [7, 24],
        ],
    },
    MAP2: {
        buildings: [
            { i: 8, j: 10, name: 'Ruined Shack', kind: 'house', searchKey: 'searched' },
            { i: 18, j: 8, name: 'Old Store', kind: 'house', searchKey: 'searched', indoor: true },
            { i: 12, j: 20, name: 'Abandoned Barn', kind: 'house', searchKey: 'searched' },
            { i: 22, j: 18, name: 'Derelict House', kind: 'house', searchKey: 'searched' },
        ],
        indoorHouses: [
            { buildingName: 'Old Store', workbenchTile: { i: 3, j: 2 } },
        ],
        trees: [
            [4, 6], [6, 5], [5, 12], [7, 18],
            [4, 22], [24, 6], [25, 10], [24, 24],
            [18, 25], [10, 25], [26, 16], [6, 25],
        ],
        boatSite: null,
        workbenches: [],
    },
    MAP3: {
        buildings: [
            { i: 7, j: 9, name: 'Factory Ruin', kind: 'house', searchKey: 'searched' },
            { i: 19, j: 7, name: 'Warehouse', kind: 'house', searchKey: 'searched' },
            { i: 9, j: 21, name: 'Machine Shop', kind: 'house', searchKey: 'searched' },
            { i: 21, j: 19, name: 'Control Tower', kind: 'house', searchKey: 'searched' },
        ],
        trees: [
            [4, 7], [6, 6], [5, 13], [8, 17],
            [4, 23], [24, 7], [25, 11], [23, 22],
            [17, 25], [11, 25], [26, 14], [6, 26],
        ],
        boatSite: null,
        workbenches: [],
    },
    MAP4: {
        buildings: [
            { i: 9, j: 8, name: 'Forest Cabin', kind: 'house', searchKey: 'searched' },
            { i: 17, j: 10, name: "Hunter's Lodge", kind: 'house', searchKey: 'searched' },
            { i: 11, j: 22, name: 'Ranger Station', kind: 'house', searchKey: 'searched' },
            { i: 20, j: 20, name: 'Old Watchtower', kind: 'house', searchKey: 'searched' },
        ],
        trees: [
            [3, 5], [5, 4], [4, 10], [6, 16],
            [3, 20], [25, 5], [26, 9], [25, 21],
            [16, 26], [9, 26], [27, 13], [5, 27],
        ],
        boatSite: null,
        workbenches: [],
    },
    MAP5: {
        buildings: [
            { i: 8, j: 10, name: 'Coastal Hut', kind: 'house', searchKey: 'searched' },
            { i: 20, j: 8, name: 'Fishing Shack', kind: 'house', searchKey: 'searched' },
            { i: 10, j: 20, name: 'Beach Tent', kind: 'house', searchKey: 'searched' },
        ],
        trees: [
            [4, 6], [6, 5], [5, 12], [8, 18],
            [4, 22], [23, 7], [24, 11], [23, 23],
            [18, 25], [12, 25], [26, 15], [6, 26],
        ],
        boatSite: { i: 26, j: 27 },
        workbenches: [],
    },
};

// ============================================================
// LOOT TABLES — keyed by building name
// ============================================================
const LOOT_TABLES = {
    'Your Home': [
        { wood: 2, cloth: 1, food: 1 },
        { wood: 3, food: 1 },
        { cloth: 2, food: 1 },
    ],
    'Abandoned House': [
        { scrap: 2, rope: 1 },
        { scrap: 1, cloth: 1, food: 1 },
        { rope: 1, food: 1 },
        { scrap: 2, food: 1 },
    ],
    'Garden Shed': [
        { wood: 3, rope: 1 },
        { wood: 2, scrap: 1 },
        { rope: 1, scrap: 1 },
        { wood: 2, rope: 1 },
    ],
    'Old House': [
        { scrap: 2, cloth: 1 },
        { rope: 1, cloth: 1, food: 1 },
        { scrap: 1, rope: 1 },
        { cloth: 2, food: 1 },
    ],
    'Ruined Shack': [
        { wood: 2, scrap: 1 },
        { scrap: 2, food: 1 },
        { rope: 1, wood: 1 },
    ],
    'Old Store': [
        { scrap: 3, rope: 1 },
        { cloth: 2, food: 1 },
        { wood: 2, scrap: 1 },
    ],
    'Abandoned Barn': [
        { wood: 4, rope: 1 },
        { scrap: 2, wood: 1 },
        { rope: 2, food: 1 },
    ],
    'Derelict House': [
        { scrap: 2, cloth: 1 },
        { rope: 1, food: 1 },
        { wood: 1, cloth: 1 },
    ],
    'Factory Ruin': [
        { scrap: 4 },
        { scrap: 2, rope: 1 },
        { wood: 1, scrap: 2 },
    ],
    'Warehouse': [
        { scrap: 3, wood: 2 },
        { rope: 2, scrap: 1 },
        { cloth: 1, scrap: 2 },
    ],
    'Machine Shop': [
        { scrap: 4, rope: 1 },
        { wood: 1, scrap: 3 },
        { rope: 2, scrap: 1 },
    ],
    'Control Tower': [
        { scrap: 2, cloth: 1 },
        { rope: 1, scrap: 2 },
        { wood: 1, scrap: 1, food: 1 },
    ],
    'Forest Cabin': [
        { wood: 3, food: 1 },
        { rope: 1, wood: 2 },
        { cloth: 1, food: 1 },
    ],
    "Hunter's Lodge": [
        { wood: 2, rope: 1 },
        { scrap: 1, food: 2 },
        { rope: 2, wood: 1 },
    ],
    'Ranger Station': [
        { wood: 3, rope: 1 },
        { scrap: 1, cloth: 1 },
        { food: 2, wood: 1 },
    ],
    'Old Watchtower': [
        { scrap: 2, rope: 1 },
        { wood: 2, cloth: 1 },
        { rope: 1, food: 1 },
    ],
    'Coastal Hut': [
        { wood: 2, rope: 1 },
        { cloth: 1, food: 1 },
        { scrap: 1, wood: 1 },
    ],
    'Fishing Shack': [
        { rope: 2, food: 2 },
        { wood: 1, rope: 1 },
        { cloth: 1, food: 1 },
    ],
    'Beach Tent': [
        { cloth: 2, food: 1 },
        { wood: 1, food: 1 },
        { rope: 1, cloth: 1 },
    ],
};

const ITEM_DEFS = {
    wood: { name: 'Wood', limit: 30, desc: 'Basic building material.', category: 'raw-material' },
    scrap: { name: 'Scrap Metal', limit: 20, desc: 'Tool components and upgrades.', category: 'raw-material' },
    rope: { name: 'Rope', limit: 10, desc: 'Crafting and boat construction.', category: 'raw-material' },
    cloth: { name: 'Cloth', limit: 10, desc: 'Sails and repairs.', category: 'raw-material' },
    food: { name: 'Food', limit: 10, desc: 'Future survival mechanic.', category: 'consumable' },
    branches: { name: 'Branches', limit: 15, desc: 'Small sticks for kindling.', category: 'gatherable' },
    driftwood: { name: 'Driftwood', limit: 15, desc: 'Weathered wood from the shore.', category: 'gatherable' },
    plant_materials: { name: 'Plant Fibers', limit: 15, desc: 'Useful for binding and rope.', category: 'gatherable' },
    household_scrap: { name: 'Household Scrap', limit: 10, desc: 'Miscellaneous salvaged items.', category: 'gatherable' },
    fasteners: { name: 'Fasteners', limit: 10, desc: 'Nails and screws for construction.', category: 'crafted-component' },
    machinery_salvage: { name: 'Machinery Salvage', limit: 8, desc: 'Gears and metal parts.', category: 'crafted-component' },
    fibers: { name: 'Fibers', limit: 15, desc: 'Natural fibers for crafting.', category: 'gatherable' },
    boatPlank: { name: 'Boat Plank', limit: 20, desc: 'Prepared component for boat construction.', category: 'crafted-component' },
    repairKit: { name: 'Repair Kit', limit: 5, desc: 'A kit for emergency repairs.', category: 'crafted-component' },
    plank: { name: 'Plank', limit: 30, desc: 'Processed lumber for construction.', category: 'crafted-component' },
    sailcloth: { name: 'Sailcloth', limit: 10, desc: 'Treated canvas for sails.', category: 'crafted-component' },
};

const BOAT_STAGES = [
    { id: 'hull', name: 'Hull', ingredients: { wood: 12 }, desc: 'Lay the hull frame from timber.' },
    { id: 'reinforcement', name: 'Reinforcement', ingredients: { scrap: 6, wood: 4 }, desc: 'Plate the hull with scrap metal and wood braces.' },
    { id: 'rigging', name: 'Rigging', ingredients: { rope: 5 }, desc: 'Rig the mast and control lines.' },
    { id: 'sail', name: 'Sail', ingredients: { cloth: 6 }, desc: 'Hoist the sail and prepare for departure.' },
];

const RECIPES = [
    {
        id: 'saw',
        name: 'Saw',
        result: { type: 'equipment', key: 'saw' },
        ingredients: { wood: 3, scrap: 2 },
        desc: 'Reusable cutting tool. Required to harvest trees.',
        workbenchRequired: true,
    },
    {
        id: 'hammer',
        name: 'Hammer',
        result: { type: 'equipment', key: 'hammer' },
        ingredients: { wood: 2, scrap: 2 },
        desc: 'Reusable construction tool. Required to build the boat.',
        workbenchRequired: true,
    },
    {
        id: 'crowbar',
        name: 'Crowbar',
        result: { type: 'equipment', key: 'crowbar' },
        ingredients: { wood: 1, scrap: 3 },
        desc: 'Reusable salvage tool. Required to build the boat.',
        workbenchRequired: true,
    },
    {
        id: 'screwdriver',
        name: 'Screwdriver',
        result: { type: 'equipment', key: 'screwdriver' },
        ingredients: { wood: 1, scrap: 2 },
        desc: 'Reusable fastening tool. Required to build the boat.',
        workbenchRequired: true,
    },
    {
        id: 'boatPlank',
        name: 'Boat Plank',
        result: { type: 'item', key: 'boatPlank', amount: 1 },
        ingredients: { wood: 8, rope: 3 },
        desc: 'Component for boat construction.',
    },
    {
        id: 'repairKit',
        name: 'Repair Kit',
        result: { type: 'item', key: 'repairKit', amount: 1 },
        ingredients: { scrap: 4, cloth: 2 },
        desc: 'Emergency repairs and sail patches.',
    },
    {
        id: 'plank',
        name: 'Plank',
        result: { type: 'item', key: 'plank', amount: 1 },
        ingredients: { wood: 4 },
        desc: 'Processed lumber. Requires workbench.',
        workbenchRequired: true,
    },
    {
        id: 'fasteners',
        name: 'Fasteners',
        result: { type: 'item', key: 'fasteners', amount: 2 },
        ingredients: { scrap: 3 },
        desc: 'Nails and screws. Requires workbench.',
        workbenchRequired: true,
    },
    {
        id: 'sailcloth',
        name: 'Sailcloth',
        result: { type: 'item', key: 'sailcloth', amount: 1 },
        ingredients: { cloth: 4, rope: 2 },
        desc: 'Treated canvas for sails. Requires workbench.',
        workbenchRequired: true,
    },
];

// ============================================================
// MAP-SPECIFIC LOOT PROFILES (DO007)
// ============================================================
const MAP_LOOT_PROFILES = {
    MAP1: {
        trees: ['wood'],
        buildings: ['wood', 'rope', 'cloth'],
        gatherables: ['branches'],
    },
    MAP2: {
        trees: ['branches', 'plant_materials'],
        buildings: ['cloth', 'rope', 'household_scrap'],
        gatherables: ['fibers', 'plant_materials'],
    },
    MAP3: {
        trees: ['branches'],
        buildings: ['scrap', 'fasteners', 'machinery_salvage'],
        gatherables: ['fasteners', 'machinery_salvage'],
    },
    MAP4: {
        trees: ['wood'],
        buildings: ['plant_materials', 'fibers'],
        gatherables: ['plant_materials', 'fibers'],
    },
    MAP5: {
        trees: ['driftwood'],
        buildings: ['cloth', 'driftwood'],
        gatherables: ['driftwood', 'fibers'],
    },
};

// ============================================================
// WORLD SCENE
// ============================================================
class WorldScene extends Phaser.Scene {
    constructor() {
        super('WorldScene');
    }

    preload() {
    }

    create(data = {}) {
        const startMapId = typeof data === 'string'
            ? data
            : data.startMapId || 'MAP1';

        const startTile = typeof data === 'object' && data !== null
            ? data.startTile || null
            : null;

        const mapDef = MAPS[startMapId] || MAPS.MAP1;
        this.currentMapId = startMapId;
        this.mapDef = mapDef;
        // Scene restarts reuse WorldScene; discard stale UI GameObject references.
        this.mapLabel = null;
        this.cols = mapDef.dims.cols;
        this.rows = mapDef.dims.rows;
        this.worldW = this.cols * TILE_W;
        this.worldH = this.rows * TILE_H + 160;

        // DO008: Workbench discovery state
        // DO022: Read persistent workbench discovery state
        this.workbenchDiscovered = GameState.workbenchDiscovered || false;
        this.indoorMode = false;
        this.transitioningMap = false;
        this.interactionWasDown = false;
        this.escapeWasDown = false;

        // DO019: Initialize recipe card tracking
        this.recipeCards = [];

        // DO022: Indoor exploration state
        this.indoorMode = false;
        this.indoorGrid = null;
        this.indoorPlayer = null;
        this.indoorObstacles = null;
        this.indoorWorkbenchTile = null;
        this.currentIndoorHouse = null;

        // DO018: Hint system state
        this.hintIndex = 0;
        this.hintText = '';
        this.hintTimer = null;

        this.physics.world.setBounds(0, 0, this.worldW, this.worldH);

        // Clear any leftover graphics from previous map
        const existingGraphics = this.children.getAll().filter(c => c.type === 'graphics');
        existingGraphics.forEach(g => g.destroy());

        this.drawMap();
        this.createTextures();
        this.createObstacles(startMapId);
        const savedObjectsForMap = data?.objectStates?.[startMapId] || GameState.objectStates?.[startMapId] || [];
        if (savedObjectsForMap.length) this.applySavedObjectStates(savedObjectsForMap);
        this.createPlayer(startTile || mapDef.landmarks[0]?.tile || { i: 13, j: 13 });
        this.createControls();
        this.createInteractionSystem();
        this.createBoatSite(startMapId);
        this.createCamera();
        this.drawFog();

        // Update UI to reflect current map
        this.updateMapUI();

        // DO010: Position UI panels
        this.repositionUI();
        this.scale.on('resize', this.repositionUI, this);
    }

    tilePosition(i, j) {
        const cx = 960;
        const cy = 40;
        return {
            x: cx + (i - j) * TILE_W / 2,
            y: cy + (i + j) * TILE_H / 2,
        };
    }

    drawMap() {
        const graphics = this.add.graphics({ add: true });
        const colors = this.mapDef.terrainColors;

        for (let i = 0; i < this.cols; i++) {
            for (let j = 0; j < this.rows; j++) {
                const { x, y } = this.tilePosition(i, j);
                const edge = i === 0 || j === 0 ||
                    i === this.cols - 1 || j === this.rows - 1;

                const road = i === 15 || j === 15;
                let color;

                if (edge) {
                    color = colors.edge;
                } else if (road) {
                    color = colors.road;
                } else {
                    color = ((i * 7 + j * 13) % 5 === 0)
                        ? colors.grass[1]
                        : colors.grass[0];
                }

                graphics.fillStyle(color, 1);
                graphics.lineStyle(1, 0x000000, 0.08);

                graphics.beginPath();
                graphics.moveTo(x, y - TILE_H / 2);
                graphics.lineTo(x + TILE_W / 2, y);
                graphics.lineTo(x, y + TILE_H / 2);
                graphics.lineTo(x - TILE_W / 2, y);
                graphics.closePath();
                graphics.fillPath();
                graphics.strokePath();
            }
        }

        graphics.setDepth(-1000);
    }

    drawFog() {
        const margin = this.mapDef.fogMargin || 2;
        const colors = this.mapDef.terrainColors;
        const fogColor = colors.water || 0x3a6b8a;
        const graphics = this.add.graphics({ add: true });

        // Draw fog tiles just outside the playable area to obscure boundaries
        for (let i = -margin; i < this.cols + margin; i++) {
            for (let j = -margin; j < this.rows + margin; j++) {
                const isPlayable = i >= 0 && j >= 0 && i < this.cols && j < this.rows;
                if (isPlayable) continue;

                const { x, y } = this.tilePosition(i, j);
                graphics.fillStyle(fogColor, 0.85);
                graphics.lineStyle(1, 0x000000, 0.05);

                graphics.beginPath();
                graphics.moveTo(x, y - TILE_H / 2);
                graphics.lineTo(x + TILE_W / 2, y);
                graphics.lineTo(x, y + TILE_H / 2);
                graphics.lineTo(x - TILE_W / 2, y);
                graphics.closePath();
                graphics.fillPath();
                graphics.strokePath();
            }
        }
    }

    createTextures() {
        function drawToBitmap(drawFn, key, w, h) {
            if (this.textures.exists(key)) return this.textures.get(key);
            const c = document.createElement('canvas');
            c.width = w;
            c.height = h;
            const ctx = c.getContext('2d');
            drawFn(ctx);
            const texture = this.textures.addCanvas(key, c);
            if (!texture) {
                throw new Error(`Failed to register Phaser texture: ${key}`);
            }
        }

        // House: 96x80
        drawToBitmap.call(this, function (ctx) {
            ctx.fillStyle = '#695344';
            ctx.fillRect(12, 35, 72, 42);
            ctx.fillStyle = '#994e40';
            ctx.beginPath();
            ctx.moveTo(4, 36); ctx.lineTo(48, 5); ctx.lineTo(92, 36);
            ctx.closePath(); ctx.fill();
            ctx.fillStyle = '#c5b69a';
            ctx.fillRect(40, 51, 17, 26);
            ctx.fillStyle = '#91bdc3';
            ctx.fillRect(20, 45, 14, 13);
            ctx.fillRect(63, 45, 14, 13);
        }, 'house', 96, 80);

        // Tree: 42x54
        drawToBitmap.call(this, function (ctx) {
            ctx.fillStyle = '#59412c';
            ctx.fillRect(16, 24, 10, 28);
            ctx.fillStyle = '#31583c';
            ctx.beginPath(); ctx.arc(21, 20, 18, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#507b47';
            ctx.beginPath(); ctx.arc(12, 24, 11, 0, Math.PI * 2); ctx.fill();
        }, 'tree', 42, 54);

        // Workbench: 56x46
        drawToBitmap.call(this, function (ctx) {
            ctx.fillStyle = '#443324';
            ctx.fillRect(5, 23, 46, 9);
            ctx.fillStyle = '#8a6039';
            ctx.fillRect(8, 10, 40, 15);
            ctx.fillStyle = '#5d4028';
            ctx.fillRect(11, 25, 5, 18);
            ctx.fillRect(40, 25, 5, 18);
            ctx.fillStyle = '#c0a071';
            ctx.fillRect(13, 13, 30, 3);
        }, 'workbench', 56, 46);

        // DO022: Indoor textures for MAP2 house discovery
        if (!this.textures.exists('indoor_floor')) {
        const floor = this.make.graphics({ x: 0, y: 0, add: false });
        floor.fillStyle(0x8b7355, 1);
        floor.fillRect(0, 0, 32, 32);
        floor.lineStyle(1, 0x6b5344, 0.5);
        floor.strokeRect(0, 0, 32, 32);
        floor.generateTexture('indoor_floor', 32, 32);
        floor.destroy();
        }

        if (!this.textures.exists('indoor_wall')) {
        const wall = this.make.graphics({ x: 0, y: 0, add: false });
        wall.fillStyle(0x5d4037, 1);
        wall.fillRect(0, 0, 32, 32);
        wall.lineStyle(1, 0x3e2723, 0.8);
        wall.strokeRect(0, 0, 32, 32);
        wall.generateTexture('indoor_wall', 32, 32);
        wall.destroy();
        }

        // Player: 32x38
        drawToBitmap.call(this, function (ctx) {
            ctx.fillStyle = 'rgba(23,32,29,0.25)';
            ctx.beginPath(); ctx.ellipse(16, 30, 12, 5, 0, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#e2c49a';
            ctx.beginPath(); ctx.arc(16, 9, 7, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#416f9a';
            if (ctx.roundRect) {
                ctx.beginPath(); ctx.roundRect(8, 16, 16, 16, 4); ctx.fill();
            } else {
                ctx.fillRect(8, 16, 16, 16);
            }
            ctx.fillStyle = '#292e38';
            ctx.fillRect(9, 29, 5, 7);
            ctx.fillRect(18, 29, 5, 7);
        }, 'player', 32, 38);

        this.createBoatTextures();
    }

    // DO022: Indoor scene methods for workbench discovery on MAP2
    enterIndoorMode(buildingName, buildingDef) {
        this.indoorMode = true;
        this.currentIndoorHouse = buildingName;

        // Find the indoor house definition
        const mapObstacles = MAP_OBSTACLES[this.currentMapId] || {};
        const indoorDef = (mapObstacles.indoorHouses || []).find(
            h => h.buildingName === buildingName
        );

        if (!indoorDef) {
            this.showMessage('The house is empty.');
            this.indoorMode = false;
            return;
        }

        // Hide outdoor obstacles and player
        this.obstacles.setVisible(false);
        if (this.player) this.player.setVisible(false);
        if (this.boatSite) this.boatSite.setVisible(false);

        // Create indoor grid (5x4 tiles)
        const GRID_W = 5;
        const GRID_H = 4;
        const INDOOR_TILE = 32;
        const offsetX = (this.scale.width - GRID_W * INDOOR_TILE) / 2;
        const offsetY = (this.scale.height - GRID_H * INDOOR_TILE) / 2;

        this.indoorGrid = this.add.container(offsetX, offsetY);
        this.indoorGrid.setScrollFactor(0);
        this.indoorGrid.setDepth(2000);

        // Draw floor
        for (let i = 0; i < GRID_W; i++) {
            for (let j = 0; j < GRID_H; j++) {
                const tile = this.add.rectangle(
                    i * INDOOR_TILE + INDOOR_TILE / 2,
                    j * INDOOR_TILE + INDOOR_TILE / 2,
                    INDOOR_TILE, INDOOR_TILE, 0x8b7355
                );
                tile.setStrokeStyle(1, 0x6b5344);
                this.indoorGrid.add(tile);
            }
        }

        // Draw walls (border)
        for (let i = 0; i < GRID_W; i++) {
            const wall = this.add.rectangle(
                i * INDOOR_TILE + INDOOR_TILE / 2,
                -8, INDOOR_TILE, 16, 0x5d4037
            );
            wall.setStrokeStyle(1, 0x3e2723);
            this.indoorGrid.add(wall);
        }
        for (let i = 0; i < GRID_W; i++) {
            const wall = this.add.rectangle(
                i * INDOOR_TILE + INDOOR_TILE / 2,
                GRID_H * INDOOR_TILE + 8, INDOOR_TILE, 16, 0x5d4037
            );
            wall.setStrokeStyle(1, 0x3e2723);
            this.indoorGrid.add(wall);
        }
        for (let j = 0; j < GRID_H; j++) {
            const wall = this.add.rectangle(
                -8, j * INDOOR_TILE + INDOOR_TILE / 2, 16, INDOOR_TILE, 0x5d4037
            );
            wall.setStrokeStyle(1, 0x3e2723);
            this.indoorGrid.add(wall);
        }
        for (let j = 0; j < GRID_H; j++) {
            const wall = this.add.rectangle(
                GRID_W * INDOOR_TILE + 8, j * INDOOR_TILE + INDOOR_TILE / 2, 16, INDOOR_TILE, 0x5d4037
            );
            wall.setStrokeStyle(1, 0x3e2723);
            this.indoorGrid.add(wall);
        }

        // Place workbench at designated tile
        const wbTile = indoorDef.workbenchTile;
        const wbX = wbTile.i * INDOOR_TILE + INDOOR_TILE / 2;
        const wbY = wbTile.j * INDOOR_TILE + INDOOR_TILE / 2;
        this.indoorWorkbench = this.add.rectangle(wbX, wbY, 40, 28, 0x8a6039);
        this.indoorWorkbench.setStrokeStyle(2, 0x5d4028);
        this.indoorWorkbench.setDepth(10);
        this.indoorGrid.add(this.indoorWorkbench);

        // Place player at door position (bottom center)
        this.indoorPlayer = { x: 2 * INDOOR_TILE + INDOOR_TILE / 2, y: (GRID_H - 1) * INDOOR_TILE + INDOOR_TILE / 2 };
        const playerSprite = this.add.rectangle(
            this.indoorPlayer.x, this.indoorPlayer.y, 20, 28, 0xe2c49a
        );
        playerSprite.setDepth(11);
        this.indoorGrid.add(playerSprite);
        this.indoorPlayerSprite = playerSprite;

        // Door at bottom center
        const doorX = 2 * INDOOR_TILE + INDOOR_TILE / 2;
        const doorY = (GRID_H - 1) * INDOOR_TILE + INDOOR_TILE / 2 + 20;
        this.indoorDoor = this.add.rectangle(doorX, doorY, 24, 12, 0x3e2723);
        this.indoorDoor.setDepth(5);
        this.indoorGrid.add(this.indoorDoor);

        // Indoor prompt
        if (this.indoorPrompt) this.indoorPrompt.destroy();
        this.indoorPrompt = this.add.text(this.scale.width / 2, this.scale.height - 90, 'E — Discover workbench inside', {
            fontFamily: 'sans-serif',
            fontSize: '16px',
            color: '#e2f0d8',
            backgroundColor: '#14251fdd',
            padding: { x: 12, y: 8 },
        }).setOrigin(0.5).setScrollFactor(0).setDepth(3000);

        this.showMessage(`Entered ${buildingName}. Find the workbench inside.`);
    }

    exitIndoor() {
        if (!this.indoorMode) return;

        // Destroy indoor scene elements
        if (this.indoorGrid) {
            this.indoorGrid.destroy();
            this.indoorGrid = null;
        }
        if (this.indoorPrompt) {
            this.indoorPrompt.destroy();
            this.indoorPrompt = null;
        }

        // Restore outdoor elements
        if (this.obstacles) this.obstacles.setVisible(true);
        if (this.player) this.player.setVisible(true);
        if (this.boatSite) this.boatSite.setVisible(true);

        this.indoorMode = false;
        this.currentIndorHouse = null;
        this.showMessage('You exit the building.');
    }

    createBoatTextures() {
        function drawToBitmap(drawFn, key, w, h) {
            if (this.textures.exists(key)) return this.textures.get(key);
            const c = document.createElement('canvas');
            c.width = w;
            c.height = h;
            const ctx = c.getContext('2d');
            drawFn(ctx);
            const texture = this.textures.addCanvas(key, c);
            if (!texture) {
                throw new Error(`Failed to register Phaser texture: ${key}`);
            }
        }

        // Stage 0 - bare hull frame
        drawToBitmap.call(this, function (ctx) {
            ctx.fillStyle = '#3a5a3a';
            ctx.beginPath();
            ctx.ellipse(40, 42, 34, 7, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#8a6039';
            ctx.beginPath();
            ctx.moveTo(8, 30);
            ctx.quadraticCurveTo(4, 18, 14, 12);
            ctx.lineTo(66, 12);
            ctx.quadraticCurveTo(76, 18, 72, 30);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = '#6b4c2e';
            ctx.fillRect(10, 28, 60, 5);
            ctx.fillStyle = '#a07848';
            for (let x = 16; x < 64; x += 10) {
                ctx.fillRect(x, 14, 3, 14);
            }
            ctx.fillStyle = '#7a5a32';
            ctx.fillRect(14, 20, 40, 3);
            ctx.fillRect(18, 25, 32, 3);
            ctx.fillStyle = '#5d4028';
            ctx.fillRect(68, 6, 4, 12);
            ctx.fillRect(8, 6, 4, 12);
        }, 'boat_stage0', 80, 50);

        // Stage 1 - reinforced hull
        drawToBitmap.call(this, function (ctx) {
            ctx.fillStyle = '#3a5a3a';
            ctx.beginPath();
            ctx.ellipse(40, 42, 34, 7, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#8a6039';
            ctx.beginPath();
            ctx.moveTo(8, 30);
            ctx.quadraticCurveTo(4, 18, 14, 12);
            ctx.lineTo(66, 12);
            ctx.quadraticCurveTo(76, 18, 72, 30);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = '#6b4c2e';
            ctx.fillRect(10, 28, 60, 5);
            ctx.fillStyle = '#a07848';
            for (let x = 16; x < 64; x += 10) {
                ctx.fillRect(x, 14, 3, 14);
            }
            ctx.fillStyle = '#7a5a32';
            ctx.fillRect(14, 20, 40, 3);
            ctx.fillRect(18, 25, 32, 3);
            ctx.fillStyle = '#7a8a8a';
            ctx.fillRect(14, 30, 10, 5);
            ctx.fillRect(30, 30, 10, 5);
            ctx.fillRect(46, 30, 8, 5);
            ctx.fillStyle = '#8a6039';
            ctx.fillRect(12, 37, 40, 4);
            ctx.fillRect(68, 6, 4, 12);
            ctx.fillRect(8, 6, 4, 12);
        }, 'boat_stage1', 80, 50);

        // Stage 2 - rigging
        drawToBitmap.call(this, function (ctx) {
            ctx.fillStyle = '#3a5a3a';
            ctx.beginPath();
            ctx.ellipse(40, 42, 34, 7, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#8a6039';
            ctx.beginPath();
            ctx.moveTo(8, 30);
            ctx.quadraticCurveTo(4, 18, 14, 12);
            ctx.lineTo(66, 12);
            ctx.quadraticCurveTo(76, 18, 72, 30);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = '#6b4c2e';
            ctx.fillRect(10, 28, 60, 5);
            ctx.fillStyle = '#a07848';
            for (let x = 16; x < 64; x += 10) {
                ctx.fillRect(x, 14, 3, 14);
            }
            ctx.fillStyle = '#7a5a32';
            ctx.fillRect(14, 20, 40, 3);
            ctx.fillRect(18, 25, 32, 3);
            ctx.fillStyle = '#7a8a8a';
            ctx.fillRect(14, 30, 10, 5);
            ctx.fillRect(30, 30, 10, 5);
            ctx.fillRect(46, 30, 8, 5);
            ctx.fillStyle = '#8a6039';
            ctx.fillRect(12, 37, 40, 4);
            ctx.fillStyle = '#6b4c2a';
            ctx.fillRect(30, 4, 4, 26);
            ctx.strokeStyle = '#a08050'; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(32, 6); ctx.lineTo(10, 28); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(32, 6); ctx.lineTo(54, 28); ctx.stroke();
            ctx.fillRect(68, 6, 4, 12);
            ctx.fillRect(8, 6, 4, 12);
        }, 'boat_stage2', 80, 50);

        // Stage 3 - full sail
        drawToBitmap.call(this, function (ctx) {
            ctx.fillStyle = '#3a5a3a';
            ctx.beginPath();
            ctx.ellipse(40, 42, 34, 7, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#8a6039';
            ctx.beginPath();
            ctx.moveTo(8, 30);
            ctx.quadraticCurveTo(4, 18, 14, 12);
            ctx.lineTo(66, 12);
            ctx.quadraticCurveTo(76, 18, 72, 30);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = '#6b4c2e';
            ctx.fillRect(10, 28, 60, 5);
            ctx.fillStyle = '#a07848';
            for (let x = 16; x < 64; x += 10) {
                ctx.fillRect(x, 14, 3, 14);
            }
            ctx.fillStyle = '#7a5a32';
            ctx.fillRect(14, 20, 40, 3);
            ctx.fillRect(18, 25, 32, 3);
            ctx.fillStyle = '#7a8a8a';
            ctx.fillRect(14, 30, 10, 5);
            ctx.fillRect(30, 30, 10, 5);
            ctx.fillRect(46, 30, 8, 5);
            ctx.fillStyle = '#8a6039';
            ctx.fillRect(12, 37, 40, 4);
            ctx.fillStyle = '#6b4c2a';
            ctx.fillRect(30, 4, 4, 26);
            ctx.fillStyle = '#e8dcc8';
            ctx.beginPath();
            ctx.moveTo(34, 6); ctx.lineTo(56, 12); ctx.lineTo(56, 28); ctx.lineTo(34, 28);
            ctx.closePath(); ctx.fill();
            ctx.strokeStyle = '#a08050'; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(32, 6); ctx.lineTo(10, 28); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(32, 6); ctx.lineTo(54, 28); ctx.stroke();
            ctx.fillRect(68, 6, 4, 12);
            ctx.fillRect(8, 6, 4, 12);
        }, 'boat_stage3', 80, 50);
    }

    createObstacles(mapId) {
        this.obstacles = this.physics.add.staticGroup();
        const defs = MAP_OBSTACLES[mapId] || MAP_OBSTACLES.MAP1;

        for (const b of defs.buildings) {
            const p = this.tilePosition(b.i, b.j);
            const obj = this.obstacles.create(p.x, p.y - 20, 'house');
            obj.setDepth(obj.y);
            obj.refreshBody();
            obj.setData('name', b.name);
            obj.setData('kind', b.kind);
            obj.setData(b.searchKey, false);
        }

        for (const wb of (defs.workbenches || [])) {
            const p = this.tilePosition(wb.i, wb.j);
            const workbench = this.obstacles.create(p.x, p.y - 12, 'workbench');
            workbench.setDepth(workbench.y);
            workbench.refreshBody();
            workbench.setData('name', 'Workbench');
            workbench.setData('kind', 'workbench');
        }

        for (const [i, j] of defs.trees) {
            const p = this.tilePosition(i, j);
            const tree = this.obstacles.create(p.x, p.y - 14, 'tree');
            tree.setDepth(tree.y);
            tree.refreshBody();
            tree.setData('name', 'Tree');
            tree.setData('kind', 'tree');
            tree.setData('harvested', false);
        }

        // Draw each exit gate from the same tile coordinates used by transitions.
        // Gates are visual markers only, so they never block the player.
        this.exitGates = [];
        for (const exit of (this.mapDef.exits || [])) {
            const p = this.tilePosition(exit.fromTile.i, exit.fromTile.j);
            const gate = this.add.graphics();
            gate.setPosition(p.x, p.y - 24);
            gate.fillStyle(0x4a3525, 1);
            gate.fillRect(-19, -4, 5, 38);
            gate.fillRect(14, -4, 5, 38);
            gate.fillRect(-22, -8, 44, 6);
            gate.fillStyle(0x9b7748, 1);
            gate.fillRect(-14, 1, 3, 27);
            gate.fillRect(-5, 1, 3, 27);
            gate.fillRect(4, 1, 3, 27);
            gate.fillRect(13, 1, 3, 27);
            gate.lineStyle(2, 0xd0b27a, 1);
            gate.strokeRect(-22, -8, 44, 42);
            gate.setDepth(p.y + 2);
            this.exitGates.push(gate);
        }
    }

    createPlayer(startTile) {
        const p = this.tilePosition(startTile.i, startTile.j);
        this.player = this.physics.add.sprite(p.x, p.y, 'player');
        this.player.setDepth(p.y);
        this.player.setCollideWorldBounds(true);
        this.player.body.setSize(18, 14);
        this.player.body.setOffset(7, 21);
        this.player.body.setDrag(900, 900);
        this.player.body.setMaxVelocity(180, 180);
        this.physics.add.collider(this.player, this.obstacles);
    }

    createControls() {
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keys = this.input.keyboard.addKeys({
            W: Phaser.Input.Keyboard.KeyCodes.W,
            A: Phaser.Input.Keyboard.KeyCodes.A,
            S: Phaser.Input.Keyboard.KeyCodes.S,
            D: Phaser.Input.Keyboard.KeyCodes.D,
            E: Phaser.Input.Keyboard.KeyCodes.E,
            ESC: Phaser.Input.Keyboard.KeyCodes.ESC,
            I: Phaser.Input.Keyboard.KeyCodes.I,
        });

        this.add.text(24, 0, 'WASD / ARROWS: MOVE  ·  I: INVENTORY', {
            fontFamily: 'sans-serif',
            fontSize: '12px',
            color: '#ffffff',
            backgroundColor: '#14251ddd',
            padding: { x: 12, y: 9 },
        })
            .setOrigin(0, 1)
            .setScrollFactor(0)
            .setDepth(1000);

        this.events.on('postupdate', () => {
            this.player.setDepth(this.player.y);
        });
    }

    createCamera() {
        this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
        this.cameras.main.setZoom(1.5);
    }

    createInteractionSystem() {
        this.interactionRange = 82;
        // Sync from GameState
        this.inventory = GameState.inventory;
        this.equipment = GameState.equipment;
        this.nearbyObject = null;
        this.interactionWasDown = false;
        this.inventoryOpen = false;
        this.inventoryWasDown = false;
        this.boatStage = GameState.boatStage;
        this.boatStagesCompleted = GameState.boatStagesCompleted;
        this.boatBuilt = GameState.boatBuilt;

        this.interactionPrompt = this.add.text(
            this.scale.width / 2, this.scale.height - 120, '',
            {
                fontFamily: 'sans-serif',
                fontSize: '15px',
                color: '#ffffff',
                backgroundColor: '#0f1c12ff',
                padding: { x: 14, y: 10 },
                align: 'center',
            }
        )
            .setOrigin(0.5)
            .setScrollFactor(0)
            .setDepth(2000)
            .setVisible(false);

        // Inventory is a dedicated viewport-fixed panel, above the workbench layer.
        this.inventoryPanel = this.add.rectangle(this.scale.width - 260, 380, 480, 640, 0x0b1710, 0.98)
            .setScrollFactor(0)
            .setDepth(5000)
            .setVisible(false);

        this.inventoryText = this.add.text(
            this.scale.width - 480, 75, '',
            {
                fontFamily: 'sans-serif',
                fontSize: '14px',
                color: '#e5f0df',
                padding: { x: 8, y: 8 },
                lineSpacing: 4,
                align: 'left',
                wordWrap: { width: 420 },
            }
        )
            .setScrollFactor(0)
            .setDepth(5001)
            .setVisible(false);

        this.refreshInventoryUI();

        // High-priority toast layer: keep gameplay feedback away from the bottom
        // prompts and above inventory/workbench panels.
        this.messageText = this.add.text(
            this.scale.width / 2, 118, '',
            {
                fontFamily: 'sans-serif',
                fontSize: '16px',
                fontStyle: 'bold',
                color: '#e2f0d8',
                backgroundColor: '#101b1df2',
                padding: { x: 18, y: 12 },
                align: 'center',
                wordWrap: { width: Math.max(280, Math.min(760, this.scale.width - 48)), useAdvancedWrap: true },
                stroke: '#071012',
                strokeThickness: 3,
                shadow: { offsetX: 0, offsetY: 2, color: '#000000', blur: 6, fill: true },
            }
        )
            .setOrigin(0.5, 0)
            .setScrollFactor(0)
            .setDepth(10000);

        this.messageText.setVisible(false);

        this.boatText = this.add.text(
            24, 24, '',
            {
                fontFamily: 'sans-serif',
                fontSize: '12px',
                color: '#e2f0d8',
                backgroundColor: '#0f1c12ff',
                padding: { x: 10, y: 7 },
                align: 'left',
                lineSpacing: 4,
                wordWrap: { width: 220 },
            }
        )
            .setOrigin(0, 0)
            .setScrollFactor(0)
            .setDepth(1000);

        // DO018: Hint display text
        this.hintTextObj = this.add.text(
            this.scale.width / 2, this.scale.height - 24, '',
            {
                fontFamily: 'sans-serif',
                fontSize: '12px',
                color: '#7a9a72',
                backgroundColor: '#0f1c12cc',
                padding: { x: 12, y: 6 },
                align: 'center',
            }
        )
            .setOrigin(0.5)
            .setScrollFactor(0)
            .setDepth(2000)
            .setVisible(false);

        this.refreshBoatUI();
        this.createTouchControls();
        this.createGameMenu();

        const camW = this.cameras.main.width;
        const camH = this.cameras.main.height;
        const panelW = 640, panelH = 700;
        const px = camW / 2;
        const py = camH / 2;
        this.craftingPanel = this.add.container(px, py);
        this.craftingPanel.setScrollFactor(0);
        this.craftingPanel.setDepth(3000);
        this.craftingPanelPosition = { x: px, y: py };

        const panelBorder = this.add.graphics();
        panelBorder.lineStyle(2, 0x9bb58b, 1);
        panelBorder.strokeRect(-320, -350, 640, 700);

        const panelBackground = this.add.rectangle(0, 0, 640, 700, 0x0f1c12, 0.98);

        const panelTitle = this.add.text(
            0, -315, 'WORKBENCH',
            {
                fontFamily: 'sans-serif',
                fontSize: '22px',
                fontStyle: 'bold',
                color: '#e2f0d8',
            }
        ).setOrigin(0.5);

        const recipeScrollArea = this.add.container(0, -270);

        const panelHint = this.add.text(
            0,
            320,
            'Scroll to browse  ·  Click a recipe to craft  ·  ESC to close',
            {
                fontFamily: 'sans-serif',
                fontSize: '14px',
                color: '#a8c0a0',
                align: 'center',
            }
        ).setOrigin(0.5);

        let cardY = 0;

        // Keep the mask graphics off the visible display list. It is still used
        // by Phaser's geometry-mask renderer, but cannot paint a white rectangle.
        if (this.recipeMaskShape) this.recipeMaskShape.destroy();
        const recipeMaskShape = this.make.graphics({ x: px, y: py, add: false });
        recipeMaskShape.fillStyle(0xffffff, 1);
        recipeMaskShape.fillRect(-300, -305, 600, 575);

        const recipeMask = recipeMaskShape.createGeometryMask();
        recipeScrollArea.setMask(recipeMask);
        this.recipeMaskShape = recipeMaskShape;
        this.recipeScrollArea = recipeScrollArea;
        this.recipeScrollOffset = 0;

        this.craftingPanel.add([panelBackground, panelBorder, panelTitle, recipeScrollArea, panelHint]);

        for (const recipe of RECIPES) {
            const card = this.add.container(0, cardY);
            const cardBorder = this.add.graphics();
            cardBorder.lineStyle(1, 0x5a7a52, 1);
            cardBorder.strokeRect(-290, -30, 580, 60);
            card.add(cardBorder, 0);

            const cardBg = this.add.rectangle(0, 0, 578, 58, 0x1a2e1d, 1);
            card.add(cardBg);

            const canCraft = Object.entries(recipe.ingredients).every(
                ([key, amount]) => this.hasItem(key, amount)
            );

            const nameText = this.add.text(-270, -21, recipe.name, {
                fontFamily: 'sans-serif',
                fontSize: '14px',
                fontStyle: 'bold',
                color: canCraft ? '#e2f0d8' : '#7a8a72',
                wordWrap: { width: 330 },
            });
            card.add(nameText);
            card.setData('nameText', nameText);

            const ingredientText = this.add.text(-270, 3,
                Object.entries(recipe.ingredients).map(
                    ([k, a]) => `${ITEM_DEFS[k].name}: ${this.getItem(k)}/${a}`
                ).join('  |  '),
                {
                    fontFamily: 'sans-serif',
                    fontSize: '13px',
                    color: canCraft ? '#c8dcc0' : '#5a6a52',
                    wordWrap: { width: 330 },
                }
            );
            card.add(ingredientText);
            card.setData('ingredientText', ingredientText);

            const descText = this.add.text(
                275,
                -20,
                `${recipe.desc}\n${canCraft ? 'READY TO CRAFT' : 'MISSING MATERIALS'}`,
                {
                    fontFamily: 'sans-serif',
                    fontSize: '12px',
                    color: canCraft ? '#a8c0a0' : '#8a927f',
                    align: 'right',
                    wordWrap: { width: 190 },
                }
            ).setOrigin(1, 0);
            card.add(descText);
            card.setData('descText', descText);
            card.setData('cardBorder', cardBorder);

            cardBorder.clear();
            cardBorder.lineStyle(1, canCraft ? 0x9bb58b : 0x3a4a32, 1);
            cardBorder.strokeRect(-290, -30, 580, 60);
            card.setInteractive(
                new Phaser.Geom.Rectangle(-290, -29, 580, 58),
                Phaser.Geom.Rectangle.Contains
            );
            card.setData('recipeId', recipe.id);
            card.on('pointerover', () => {
                if (card.getData('recipeId')) {
                    cardBg.setFillStyle(0x243a26);
                }
            });
            card.on('pointerout', () => {
                cardBg.setFillStyle(0x1a2e1d);
            });
            card.on('pointerdown', () => {
                this.craftRecipe(recipe);
            });

            recipeScrollArea.add(card);
            this.recipeCards.push(card);
            cardY += 68;
        }

        this.craftingPanel.setVisible(false);
        this.craftingOpen = false;
        this.recipeScrollMax = Math.max(0, cardY - 535);

        this.input.on('wheel', (pointer, currentlyOver, deltaX, deltaY) => {
            if (!this.craftingOpen || !this.recipeScrollArea) return;
            const bounds = {
                left: this.craftingPanel.x - 320,
                right: this.craftingPanel.x + 320,
                top: this.craftingPanel.y - 350,
                bottom: this.craftingPanel.y + 350,
            };
            if (pointer.x < bounds.left || pointer.x > bounds.right ||
                pointer.y < bounds.top || pointer.y > bounds.bottom) return;

            this.recipeScrollOffset = Phaser.Math.Clamp(
                this.recipeScrollOffset + deltaY * 0.65,
                0,
                this.recipeScrollMax
            );
            this.recipeScrollArea.setY(-270 - this.recipeScrollOffset);
        });

        this.createCompass();
        this.refreshInventoryUI();
    }

    // ------------------------------------------------------------
    // GAME FLOW: title menu, pause menu, local save/load and replay
    // ------------------------------------------------------------
    createGameMenu() {
        this.menuOpen = false;
        this.menuMode = null;
        this.menuOverlay = null;
        if (!GameState.started) this.openMenu('title');
    }

    openMenu(mode = 'pause') {
        if (this.menuOverlay) this.menuOverlay.destroy();
        this.menuMode = mode;
        this.menuOpen = true;
        this.player?.setVelocity(0, 0);
        if (this.player?.body) this.player.body.enable = false;

        const w = this.scale.width;
        const h = this.scale.height;
        const overlay = this.add.container(w / 2, h / 2).setScrollFactor(0).setDepth(20000);
        const shade = this.add.rectangle(0, 0, w, h, 0x07100d, 0.88);
        overlay.add(shade);

        const titleText = mode === 'title' ? 'THE LAST CONNECTION'
            : mode === 'confirm-new' ? 'START A NEW GAME?'
            : mode === 'ending' ? 'JOURNEY COMPLETE'
            : 'PAUSED';
        const title = this.add.text(0, -245, titleText, {
            fontFamily: 'sans-serif', fontSize: '38px', fontStyle: 'bold',
            color: '#e2f0d8', align: 'center',
        }).setOrigin(0.5);
        overlay.add(title);

        const subtitle = this.add.text(0, -185,
            mode === 'title' ? 'A survival story begins at home.'
                : mode === 'confirm-new' ? 'Starting over replaces the current browser save.'
                : mode === 'ending' ? 'You built a way out. Your story continues beyond the island.'
                : 'Your progress is safe while the game is paused.',
            { fontFamily: 'sans-serif', fontSize: '16px', color: '#a8c0a0', align: 'center' }
        ).setOrigin(0.5);
        overlay.add(subtitle);

        const buttons = mode === 'confirm-new'
            ? [
                ['START A FRESH GAME', () => this.startNewGame()],
                ['CANCEL', () => this.openMenu('title')],
            ]
            : mode === 'title'
            ? [
                ['NEW GAME', () => this.confirmNewGame()],
                ['CONTINUE / LOAD SAVE', () => this.loadSavedGame()],
                ['EXIT TO BROWSER', () => this.showMenuNotice('To exit, close this browser tab. Browsers do not let games close their own tab.')],
            ]
            : mode === 'ending'
                ? [
                    ['PLAY AGAIN', () => this.startNewGame()],
                    ['MAIN MENU', () => this.returnToTitle()],
                ]
                : [
                    ['RESUME', () => this.closeMenu()],
                    ['SAVE GAME', () => this.saveGame()],
                    ['LOAD SAVED GAME', () => this.loadSavedGame()],
                    ['MAIN MENU', () => this.returnToTitle()],
                ];

        buttons.forEach(([label, action], index) => {
            const y = -95 + index * 76;
            const button = this.add.rectangle(0, y, 420, 54, 0x203a29, 1)
                .setStrokeStyle(2, 0x8eaa7d, 1)
                .setInteractive({ useHandCursor: true });
            const text = this.add.text(0, y, label, {
                fontFamily: 'sans-serif', fontSize: '17px', fontStyle: 'bold',
                color: '#edf5e8', align: 'center',
            }).setOrigin(0.5);
            button.on('pointerover', () => button.setFillStyle(0x34553a));
            button.on('pointerout', () => button.setFillStyle(0x203a29));
            button.on('pointerdown', action);
            overlay.add([button, text]);
        });

        let saveExists = false;
        try { saveExists = Boolean(localStorage.getItem('tlc-save-v1')); } catch (error) { saveExists = false; }
        if (mode === 'title' && !saveExists) {
            const note = this.add.text(0, 165, 'No saved game found. Start a new journey.', {
                fontFamily: 'sans-serif', fontSize: '13px', color: '#8c9d87',
            }).setOrigin(0.5);
            overlay.add(note);
        }
        const footer = this.add.text(0, 245, 'WASD / Arrows to move  ·  E interact  ·  I inventory  ·  ESC pause', {
            fontFamily: 'sans-serif', fontSize: '12px', color: '#71866f',
        }).setOrigin(0.5);
        overlay.add(footer);
        this.menuOverlay = overlay;
    }

    confirmNewGame() {
        let hasSave = false;
        try { hasSave = Boolean(localStorage.getItem('tlc-save-v1')); } catch (error) { hasSave = false; }
        if (hasSave) this.openMenu('confirm-new');
        else this.startNewGame();
    }

    showMenuNotice(message) {
        if (!this.menuOverlay) return;
        const notice = this.add.text(0, 195, message, {
            fontFamily: 'sans-serif', fontSize: '13px', color: '#ffe08a',
            align: 'center', wordWrap: { width: 600 },
        }).setOrigin(0.5);
        this.menuOverlay.add(notice);
    }

    closeMenu() {
        if (!this.menuOpen) return;
        this.menuOverlay?.destroy();
        this.menuOverlay = null;
        this.menuOpen = false;
        this.menuMode = null;
        if (this.player?.body) this.player.body.enable = true;
    }

    startNewGame() {
        GameState.inventory = { wood: 0, scrap: 0, rope: 0, cloth: 0, food: 0 };
        GameState.equipment = { saw: false, hammer: false, crowbar: false, screwdriver: false };
        GameState.boatStage = 0;
        GameState.boatStagesCompleted = [false, false, false, false];
        GameState.boatBuilt = false;
        GameState.workbenchDiscovered = false;
        GameState.objectStates = {};
        GameState.started = true;
        try { localStorage.removeItem('tlc-save-v1'); } catch (error) { /* Starting a new run must still work if storage is blocked. */ }
        this.scene.restart({ startMapId: 'MAP1', startTile: { i: 13, j: 13 } });
    }

    saveGame() {
        const playerTile = this.playerTile();
        const objectStates = this.captureCurrentMapObjectStates();
        GameState.objectStates[this.currentMapId] = objectStates;
        const save = {
            version: 1,
            savedAt: new Date().toISOString(),
            mapId: this.currentMapId,
            playerTile,
            inventory: { ...this.inventory },
            equipment: { ...this.equipment },
            boatStage: this.boatStage,
            boatStagesCompleted: [...this.boatStagesCompleted],
            boatBuilt: this.boatBuilt,
            workbenchDiscovered: this.workbenchDiscovered,
            objectStates: { ...GameState.objectStates },
        };
        try {
            localStorage.setItem('tlc-save-v1', JSON.stringify(save));
            GameState.inventory = save.inventory;
            GameState.equipment = save.equipment;
            GameState.boatStage = save.boatStage;
            GameState.boatStagesCompleted = save.boatStagesCompleted;
            GameState.boatBuilt = save.boatBuilt;
            GameState.workbenchDiscovered = save.workbenchDiscovered;
            this.showMessage('Game saved in this browser.', 'success');
            this.closeMenu();
            return true;
        } catch (error) {
            this.showMessage('Could not save. Browser storage may be unavailable or full.', 'error');
            return false;
        }
    }

    loadSavedGame() {
        let save;
        try {
            save = JSON.parse(localStorage.getItem('tlc-save-v1') || 'null');
        } catch (error) {
            save = null;
        }
        if (!save || save.version !== 1 || !MAPS[save.mapId] || !save.playerTile) {
            if (this.menuOpen) this.showMenuNotice('No valid saved game was found in this browser.');
            else this.showMessage('No valid saved game was found.', 'warning');
            return false;
        }

        GameState.inventory = { ...save.inventory };
        GameState.equipment = { ...save.equipment };
        GameState.boatStage = save.boatStage || 0;
        GameState.boatStagesCompleted = [...(save.boatStagesCompleted || [false, false, false, false])];
        GameState.boatBuilt = Boolean(save.boatBuilt);
        GameState.workbenchDiscovered = Boolean(save.workbenchDiscovered);
        GameState.started = true;
        this.scene.start('WorldScene', {
            startMapId: save.mapId,
            startTile: save.playerTile,
            objectStates: save.objectStates || {},
        });
        return true;
    }

    returnToTitle() {
        GameState.started = false;
        this.scene.restart({ showTitle: true });
    }

    captureCurrentMapObjectStates() {
        return this.obstacles.getChildren().map(object => ({
            name: object.getData('name'),
            kind: object.getData('kind'),
            x: object.x,
            y: object.y,
            searched: Boolean(object.getData('searched')),
            harvested: Boolean(object.getData('harvested')),
        }));
    }

    applySavedObjectStates(states = []) {
        const lookup = new Map(states.map(state => [`${state.kind}:${state.name}:${state.x}:${state.y}`, state]));
        for (const object of this.obstacles.getChildren()) {
            const state = lookup.get(`${object.getData('kind')}:${object.getData('name')}:${object.x}:${object.y}`);
            if (!state) continue;
            if (state.searched) object.setData('searched', true);
            if (state.harvested) object.setData('harvested', true);
        }
    }

    createTouchControls() {
        this.touchKeys = { up: false, down: false, left: false, right: false };
        const root = this.add.container(150, this.scale.height - 170).setScrollFactor(0).setDepth(6000);
        const makeButton = (x, y, label, onDown, onUp) => {
            const button = this.add.circle(x, y, 31, 0x10231b, 0.82)
                .setStrokeStyle(2, 0x91aa80, 0.9)
                .setInteractive();
            const text = this.add.text(x, y, label, {
                fontFamily: 'sans-serif', fontSize: '19px', fontStyle: 'bold', color: '#edf5e8',
            }).setOrigin(0.5);
            button.on('pointerdown', onDown);
            button.on('pointerup', onUp);
            button.on('pointerout', onUp);
            root.add([button, text]);
        };
        makeButton(0, -62, '↑', () => this.touchKeys.up = true, () => this.touchKeys.up = false);
        makeButton(0, 62, '↓', () => this.touchKeys.down = true, () => this.touchKeys.down = false);
        makeButton(-62, 0, '←', () => this.touchKeys.left = true, () => this.touchKeys.left = false);
        makeButton(62, 0, '→', () => this.touchKeys.right = true, () => this.touchKeys.right = false);
        const actionRoot = this.add.container(this.scale.width - 150, this.scale.height - 155)
            .setScrollFactor(0).setDepth(6000);
        const interact = this.add.circle(0, 0, 36, 0x315b39, 0.9).setStrokeStyle(2, 0xc5d9b6).setInteractive();
        const interactLabel = this.add.text(0, 0, 'E', { fontSize: '20px', fontStyle: 'bold', color: '#fff' }).setOrigin(0.5);
        interact.on('pointerdown', () => this.touchInteract = true);
        interact.on('pointerup', () => this.touchInteract = false);
        interact.on('pointerout', () => this.touchInteract = false);
        const inventory = this.add.circle(0, 86, 30, 0x263d4c, 0.9).setStrokeStyle(2, 0xb4c8d2).setInteractive();
        const inventoryLabel = this.add.text(0, 86, 'I', { fontSize: '18px', fontStyle: 'bold', color: '#fff' }).setOrigin(0.5);
        inventory.on('pointerdown', () => this.touchInventory = true);
        inventory.on('pointerup', () => this.touchInventory = false);
        inventory.on('pointerout', () => this.touchInventory = false);
        actionRoot.add([interact, interactLabel, inventory, inventoryLabel]);
        root.setVisible(Boolean(this.sys.game.device.input.touch));
        actionRoot.setVisible(Boolean(this.sys.game.device.input.touch));
        this.touchControlsRoot = root;
        this.touchActionRoot = actionRoot;
    }

    addItem(key, amount) {
        const def = ITEM_DEFS[key];
        if (!def || !Number.isInteger(amount) || amount <= 0) return 0;

        const current = this.inventory[key] || 0;
        const space = Math.max(0, def.limit - current);
        const added = Math.min(amount, space);

        if (added <= 0) {
            this.showMessage(`${def.name} storage is full.`);
            return 0;
        }

        this.inventory[key] = current + added;
        this.refreshInventoryUI();

        if (added < amount) {
            this.showMessage(`${def.name} storage is nearly full — received ${added} of ${amount}.`);
        } else {
            this.showMessage(`+${added} ${def.name}`);
        }

        return added;
    }

    removeItem(key, amount) {
        if (!Number.isInteger(amount) || amount <= 0) return false;

        const current = this.inventory[key] || 0;
        if (current < amount) return false;

        this.inventory[key] = current - amount;
        this.refreshInventoryUI();
        return true;
    }

    hasItem(key, amount = 1) {
        return Number.isFinite(amount) && amount >= 0 &&
            (this.inventory[key] || 0) >= amount;
    }

    getItem(key) {
        return this.inventory[key] || 0;
    }

    craftRecipe(recipe) {
        if (!recipe || !recipe.ingredients || !recipe.result) return;

        if (recipe.workbenchRequired && !this.workbenchDiscovered) {
            this.showMessage('Must discover a workbench first!');
            return;
        }

        const canCraft = Object.entries(recipe.ingredients).every(
            ([key, amount]) => this.hasItem(key, amount)
        );

        if (!canCraft) {
            this.showMessage('Not enough resources to craft.');
            return;
        }

        const result = recipe.result;
        const resultAmount = result.amount || 1;

        if (result.type === 'item') {
            const outputDef = ITEM_DEFS[result.key];
            if (!outputDef) {
                this.showMessage(`Crafting failed: unknown item "${result.key}".`, 'error');
                return;
            }

            if ((this.inventory[result.key] || 0) + resultAmount > outputDef.limit) {
                this.showMessage(`${outputDef.name} storage is full. Free space before crafting.`, 'warning');
                return;
            }
        } else if (result.type === 'equipment') {
            if (!Object.prototype.hasOwnProperty.call(this.equipment, result.key)) {
                this.showMessage('Crafting failed: unknown equipment.', 'error');
                return;
            }
        } else {
            this.showMessage('Crafting failed: invalid recipe output.', 'error');
            return;
        }

        // All ingredients were validated above; remove them only after output validation.
        for (const [key, amount] of Object.entries(recipe.ingredients)) {
            if (!this.removeItem(key, amount)) {
                this.showMessage('Crafting was cancelled because inventory changed.', 'error');
                return;
            }
        }

        if (result.type === 'equipment') {
            this.equipment[result.key] = true;
            GameState.equipment = this.equipment;
            this.showMessage(`Crafted ${recipe.name}! The tool is reusable.`, 'success');
        } else {
            this.addItem(result.key, resultAmount);
            this.showMessage(`Crafted ${recipe.name}!`, 'success');
        }

        this.refreshRecipeUI();
        this.refreshInventoryUI();
    }

    refreshRecipeUI() {
        for (const card of this.recipeCards) {
            const recipe = RECIPES.find(r => r.id === card.getData('recipeId'));
            if (!recipe) continue;

            const canCraft = Object.entries(recipe.ingredients).every(
                ([key, amount]) => this.hasItem(key, amount)
            );

            const nameText = card.getData('nameText');
            const ingredientText = card.getData('ingredientText');
            const descText = card.getData('descText');
            const cardBorder = card.getData('cardBorder');
            if (nameText) {
                nameText.setColor(canCraft ? '#e2f0d8' : '#a0a895');
            }
            if (ingredientText) {
                ingredientText.setText(Object.entries(recipe.ingredients).map(
                    ([key, amount]) => `${ITEM_DEFS[key].name}: ${this.getItem(key)}/${amount}`
                ).join('  |  '));
                ingredientText.setColor(canCraft ? '#c8dcc0' : '#a0a895');
            }
            if (descText) {
                descText.setText(`${recipe.desc}\n${canCraft ? 'READY TO CRAFT' : 'MISSING MATERIALS'}`);
                descText.setColor(canCraft ? '#a8c0a0' : '#8a927f');
            }
            if (cardBorder) {
                cardBorder.clear();
                cardBorder.lineStyle(1, canCraft ? 0x9bb58b : 0x59634f, 1);
                cardBorder.strokeRect(-290, -30, 580, 60);
            }
        }
    }

    refreshInventoryUI() {
        const lines = ['SURVIVOR INVENTORY', ''];

        for (const [key, def] of Object.entries(ITEM_DEFS)) {
            const count = this.inventory[key] || 0;
            const filled = Math.min(count, 10);
            const empty = 10 - filled;

            // DO010: Unicode block bars
            const bar = '█'.repeat(filled) + '░'.repeat(empty);

            // DO010: Color coding based on category
            let color = '#d8e8d2';
            if (def.category === 'raw-material') {
                color = '#7ab87a';
            } else if (def.category === 'crafted-component') {
                color = '#d4c070';
            } else if (def.category === 'gatherable') {
                color = '#70b8d4';
            } else if (def.category === 'consumable') {
                color = '#e27070';
            }

            lines.push(`${def.name}: ${count.toString().padStart(2)}/${def.limit}  ${bar}`);
        }

        lines.push('', 'REUSABLE TOOLS');
        for (const key of ['saw', 'hammer', 'crowbar', 'screwdriver']) {
            const label = key.charAt(0).toUpperCase() + key.slice(1);
            lines.push(`${this.equipment[key] ? '✔' : '○'} ${label}`);
        }

        this.inventoryText.setText(lines.join('\n'));
    }

    showMessage(message, type = 'info') {
        if (!this.messageText || !this.messageText.active) return;

        // Keep important feedback visible above every gameplay panel.
        const colors = {
            info: '#f0f5ed',
            success: '#9be29b',
            warning: '#ffe08a',
            error: '#ff9999',
        };
        this.messageText.setText(String(message));
        this.messageText.setColor(colors[type] || colors.info);
        this.messageText.setDepth(10000);
        this.messageText.setPosition(this.scale.width / 2, 118);
        this.messageText.setWordWrapWidth(Math.max(280, Math.min(760, this.scale.width - 48)), true);
        this.messageText.setAlpha(1);
        this.messageText.setVisible(true);

        // Restart the lifetime so consecutive messages do not disappear early.
        this.tweens.killTweensOf(this.messageText);
        if (this.messageHideEvent) this.messageHideEvent.remove(false);

        this.messageHideEvent = this.time.delayedCall(3000, () => {
            this.tweens.add({
                targets: this.messageText,
                alpha: 0,
                duration: 250,
                ease: 'Power2',
                onComplete: () => {
                    if (this.messageText?.active) this.messageText.setVisible(false);
                },
            });
        });
    }

    findNearbyObject() {
        let nearest = null;
        let nearestDistance = this.interactionRange;

        for (const object of this.obstacles.getChildren()) {
            if (!object.active) continue;

            const distance = Phaser.Math.Distance.Between(
                this.player.x,
                this.player.y,
                object.x,
                object.y
            );

            if (distance < nearestDistance) {
                nearest = object;
                nearestDistance = distance;
            }
        }

        return nearest;
    }

    // Convert player world position back to tile coords
    playerTile() {
        const px = this.player.x - 960;
        const py = this.player.y - 40;
        // Inverse of tilePosition: x = 960 + (i-j)*32, y = 40 + (i+j)*16
        const j = (py / (TILE_H / 2) - px / (TILE_W / 2)) / 2;
        const i = (py / (TILE_H / 2) + px / (TILE_W / 2)) / 2;
        return { i: Math.round(i), j: Math.round(j) };
    }

    interactWith(object) {
        const kind = object.getData('kind');
        const name = object.getData('name') || 'Object';

        if (kind === 'house') {
            // DO022: Check for indoor house (workbench discovery on MAP2)
            const mapObstacles = MAP_OBSTACLES[this.currentMapId] || {};
            const buildingDef = mapObstacles.buildings?.find(b => b.name === name);

            if (buildingDef?.indoor && !this.workbenchDiscovered) {
                // Enter indoor mode to discover workbench
                this.enterIndoorMode(name, buildingDef);
                return;
            }

            if (object.getData('searched')) {
                this.showMessage(`${name} has already been searched.`);
                return;
            }

            object.setData('searched', true);

            const table = LOOT_TABLES[name] || LOOT_TABLES['Abandoned House'];
            const loot = { ...Phaser.Math.RND.pick(table) };
            if (name === 'Your Home') {
                loot.wood = Math.max(loot.wood || 0, 3);
                loot.scrap = Math.max(loot.scrap || 0, 2);
                loot.rope = Math.max(loot.rope || 0, 1);
                loot.cloth = Math.max(loot.cloth || 0, 1);
            }

            // Guaranteed minimum supplies prevent unlucky loot rolls from softlocking
            // the tool and boat progression. Searching every region remains important.
            const regionalMinimums = {
                MAP2: { wood: 1, scrap: 1, rope: 1, cloth: 1 },
                MAP3: { scrap: 2, rope: 1, cloth: 1 },
                MAP4: { scrap: 1, rope: 1, cloth: 1 },
                MAP5: { rope: 1, cloth: 2 },
            };
            for (const [item, minimum] of Object.entries(regionalMinimums[this.currentMapId] || {})) {
                loot[item] = Math.max(loot[item] || 0, minimum);
            }

            for (const [item, amount] of Object.entries(loot)) {
                this.addItem(item, amount);
            }

            this.showMessage(`Searched ${name}. Supplies recovered!`);
            return;
        }

        if (kind === 'workbench') {
            // DO008: Mark workbench as discovered
            this.workbenchDiscovered = true;

            this.craftingOpen = true;
            this.craftingPanel.setVisible(true);
            this.showMessage('Workbench opened.');
            return;
        }

        if (kind === 'boatSite') {
            if (this.boatBuilt) {
                // DO016: Trigger cinematic ending when boat is complete
                this.showMessage('The boat is ready! Press E to sail away.');
                return;
            }

            const stage = BOAT_STAGES[this.boatStage];
            const matLines = Object.entries(stage.ingredients)
                .map(([k, a]) => `${ITEM_DEFS[k].name}: ${a}`)
                .join('  ·  ');
            this.showMessage(`${stage.name} — ${matLines}`);
            return;
        }

        if (kind === 'tree') {
            if (!this.equipment.saw) {
                this.showMessage('You need a Saw to cut down trees.', 'warning');
                return;
            }

            if (object.getData('harvested')) {
                this.showMessage('This tree has already been harvested.');
                return;
            }

            object.setData('harvested', true);
            this.addItem('wood', 3);
        }
    }

    createBoatSite(mapId) {
        const defs = MAP_OBSTACLES[mapId] || MAP_OBSTACLES.MAP1;
        if (!defs.boatSite) return;

        const { i, j } = defs.boatSite;
        const dockPos = this.tilePosition(i, j);

        this.boatSite = this.obstacles.create(
            dockPos.x,
            dockPos.y - 16,
            'boat_stage0'
        );
        this.boatSite.setDepth(dockPos.y);
        this.boatSite.refreshBody();
        this.boatSite.setData('kind', 'boatSite');
        this.boatSite.setData('name', 'Boat Dock');
    }

    buildBoatStage() {
        if (this.boatBuilt || this.boatStage >= BOAT_STAGES.length) return;

        const requiredTools = ['saw', 'hammer', 'crowbar', 'screwdriver'];
        const missingTools = requiredTools.filter(key => !this.equipment[key]);
        if (missingTools.length > 0) {
            const labels = missingTools.map(key => key.charAt(0).toUpperCase() + key.slice(1));
            this.showMessage(`Required tools: ${labels.join(', ')}. Craft them at the workbench.`, 'warning');
            return;
        }

        const stage = BOAT_STAGES[this.boatStage];
        const canBuild = Object.entries(stage.ingredients).every(
            ([key, amount]) => this.hasItem(key, amount)
        );

        if (!canBuild) {
            this.showMessage(`Not enough resources for ${stage.name}.`);
            return;
        }

        for (const [key, amount] of Object.entries(stage.ingredients)) {
            this.removeItem(key, amount);
        }

        this.boatStagesCompleted[this.boatStage] = true;
        this.boatStage++;

        if (this.boatSite) {
            const isLastStage = this.boatStage >= BOAT_STAGES.length;
            const texIndex = isLastStage ? 3 : this.boatStage;
            this.boatSite.setTexture(`boat_stage${texIndex}`);
        }

        if (this.boatStage >= BOAT_STAGES.length) {
            this.boatBuilt = true;
            this.showMessage('Boat is ready! You can now sail away.');
        } else {
            this.showMessage(`${stage.name} complete! Next: ${BOAT_STAGES[this.boatStage].name}.`);
        }

        this.refreshBoatUI();
    }

    // DO016: Check if all win conditions are met
    checkWinCondition(interactionPressed = false) {
        if (!interactionPressed || this.won || !this.boatBuilt || this.currentMapId !== 'MAP5') {
            return false;
        }

        const nearby = this.findNearbyObject();
        if (!nearby || nearby.getData('kind') !== 'boatSite') return false;

        this.won = true;
        this.showEnding();
        return true;
    }

    // DO016: Cinematic victory overlay
    showEnding() {
        if (this.endingActive) return;
        this.endingActive = true;

        // Dim the game world
        this.tweens.add({
            targets: this.cameras.main,
            alpha: 0,
            duration: 1500,
            ease: 'Power2',
        });

        // Create ending overlay
        const viewW = this.scale.width;
        const viewH = this.scale.height;
        const overlay = this.add.container(viewW / 2, viewH / 2);
        overlay.setScrollFactor(0);
        overlay.setDepth(5000);

        const bg = this.add.rectangle(0, 0, viewW, viewH, 0x0a1a12, 0);
        overlay.add(bg);

        const title = this.add.text(0, -180, 'THE LAST CONNECTION', {
            fontFamily: 'sans-serif',
            fontSize: '36px',
            fontStyle: 'bold',
            color: '#e2f0d8',
        }).setOrigin(0.5);
        overlay.add(title);

        const subtitle = this.add.text(0, -100, 'You built the boat. You found your way to the coast.', {
            fontFamily: 'sans-serif',
            fontSize: '18px',
            color: '#a8c0a0',
        }).setOrigin(0.5);
        overlay.add(subtitle);

        const body = this.add.text(0, -20, `The horizon stretches endlessly ahead.
All the resources you gathered, every path you walked,
led to this moment.`, {
            fontFamily: 'sans-serif',
            fontSize: '15px',
            color: '#7a9a72',
            align: 'center',
            wordWrap: { width: Math.min(900, viewW - 120) },
        }).setOrigin(0.5);
        overlay.add(body);

        const credits = this.add.text(0, 170, 'Press R to play again  ·  Click here for more options', {
            fontFamily: 'sans-serif',
            fontSize: '14px',
            color: '#5a7a52',
        }).setOrigin(0.5);
        overlay.add(credits);
        credits.setInteractive({ useHandCursor: true });
        credits.on('pointerdown', () => this.openMenu('ending'));

        // Fade in overlay
        this.tweens.add({
            targets: bg,
            alpha: 1,
            duration: 1500,
            delay: 500,
            ease: 'Power2',
        });

        // Animate title fade in
        title.setAlpha(0);
        this.tweens.add({
            targets: title,
            alpha: 1,
            duration: 800,
            delay: 800,
            ease: 'Power2',
        });

        subtitle.setAlpha(0);
        this.tweens.add({
            targets: subtitle,
            alpha: 1,
            duration: 800,
            delay: 1200,
            ease: 'Power2',
        });

        body.setAlpha(0);
        this.tweens.add({
            targets: body,
            alpha: 1,
            duration: 800,
            delay: 1600,
            ease: 'Power2',
        });

        credits.setAlpha(0);
        this.tweens.add({
            targets: credits,
            alpha: 1,
            duration: 800,
            delay: 2400,
            ease: 'Power2',
        });

        // Store overlay for cleanup
        this.endingOverlay = overlay;

        // Listen for restart
        this.input.keyboard.on('keydown-R', () => {
            this.restartGame();
        });
    }

    // DO019: Reset game state for replay
    restartGame() {
        // Reset GameState
        GameState.inventory = { wood: 0, scrap: 0, rope: 0, cloth: 0, food: 0 };
        GameState.equipment = { saw: false, hammer: false, crowbar: false, screwdriver: false };
        GameState.boatStage = 0;
        GameState.boatStagesCompleted = [false, false, false, false];
        GameState.boatBuilt = false;
        GameState.workbenchDiscovered = false;
        GameState.started = true;
        localStorage.removeItem('tlc-save-v1');

        // Destroy ending overlay
        if (this.endingOverlay) {
            this.endingOverlay.destroy();
            this.endingOverlay = null;
        }
        this.endingActive = false;
        this.won = false;

        // Restart from MAP1
        this.scene.restart();
    }

    refreshBoatUI() {
        const lines = ['BOAT CONSTRUCTION', ''];
        let missingAny = false;

        for (let i = 0; i < BOAT_STAGES.length; i++) {
            const stage = BOAT_STAGES[i];
            const done = this.boatStagesCompleted[i];
            const current = i === this.boatStage && !this.boatBuilt;

            const resourceRows = Object.entries(stage.ingredients).map(([k, a]) => {
                const available = this.inventory[k] || 0;
                const cap = ITEM_DEFS[k]?.limit ?? '?';
                const hasEnough = available >= a;
                if (!done && !hasEnough) missingAny = true;
                return `    ${ITEM_DEFS[k].name}: ${available}/${cap}  (need ${a})`;
            });

            const icon = done ? '✔' : (current ? '►' : '○');
            lines.push(`${icon}  ${stage.name}`);
            lines.push(...resourceRows);

            if (current && !done) {
                const missing = Object.entries(stage.ingredients)
                    .filter(([k, a]) => (this.inventory[k] || 0) < a)
                    .map(([k, a]) => `${a - (this.inventory[k] || 0)} ${ITEM_DEFS[k].name}`);
                if (missing.length > 0) {
                    lines.push(`    ⚠ Missing: ${missing.join(', ')}`);
                }
            }
        }

        if (this.boatBuilt) {
            lines.push('');
            lines.push('✔ ALL STAGES COMPLETE — the boat is seaworthy!');
        } else {
            const allDone = BOAT_STAGES.every((_, i) => this.boatStagesCompleted[i]);
            if (!allDone) {
                lines.push(missingAny ? '  (gather more resources to continue)' : '');
            }
        }

        this.boatText.setText(lines.join('\n'));
    }

    // DO018: Contextual hints based on game state
    getContextualHints() {
        const hints = [];

        if (this.boatBuilt) {
            hints.push('You built the boat — find the coast and press E to sail away.');
            return hints;
        }

        if (this.boatStage < BOAT_STAGES.length) {
            const stage = BOAT_STAGES[this.boatStage];
            const missing = Object.entries(stage.ingredients)
                .filter(([k, a]) => (this.inventory[k] || 0) < a)
                .map(([k]) => ITEM_DEFS[k]?.name || k);
            if (missing.length > 0) {
                hints.push(`Need ${missing.join(', ')} for ${stage.name}. Search houses or gather from trees.`);
            }
        }

        if (!this.workbenchDiscovered) {
            hints.push('Find a workbench — search an abandoned house to discover one.');
        }

        if (this.currentMapId === 'MAP1') {
            hints.push('Explore Home Island. Head east through the exit to reach new lands.');
        } else if (this.currentMapId === 'MAP2') {
            hints.push('The Abandoned Settlement holds scrap and rope. Keep going east.');
        } else if (this.currentMapId === 'MAP3') {
            hints.push('Industrial Ruins — scrap metal and fasteners are here. Head east to escape.');
        } else if (this.currentMapId === 'MAP4') {
            hints.push('Deep Wilderness is the last stop. Reach the eastern exit to find the coast.');
        }

        return hints;
    }

    isInsideIsland(x, y) {
        const centerX = 960;
        const centerY = 40 + ((this.rows - 1) * TILE_H) / 2;
        const halfWidth = ((this.cols - 1) * TILE_W) / 2;
        const halfHeight = ((this.rows - 1) * TILE_H) / 2;
        const normalizedX = Math.abs(x - centerX) / halfWidth;
        const normalizedY = Math.abs(y - centerY) / halfHeight;
        // Include the actual outer tile centers; exit tiles sit on this boundary.
        return normalizedX + normalizedY <= 1.03;
    }

    pixelToTile(x, y) {
        const px = x - 960;
        const py = y - 40;
        const j = (py / (TILE_H / 2) - px / (TILE_W / 2)) / 2;
        const i = (py / (TILE_H / 2) + px / (TILE_W / 2)) / 2;
        return { i: Math.round(i), j: Math.round(j) };
    }

    getZone(i, j) {
        if (i >= 8 && i <= 18 && j >= 8 && j <= 18) return 'home';
        if (i >= 3 && i <= 12 && j >= 3 && j <= 10) return 'woodland';
        if (i >= 3 && i <= 12 && j >= 15 && j <= 22) return 'abandoned';
        if (i >= 18 && i <= 25 && j >= 3 && j <= 10) return 'industrial';
        if (i >= 10 && i <= 20 && j >= 10 && j <= 20) return 'overgrown';
        if (i >= 20 && i <= 28 && j >= 5 && j <= 12) return 'shore';
        return 'water';
    }

    // Check if player is stepping on a map exit path
    checkMapTransition() {
        if (this.indoorMode || this.transitioningMap || this.endingActive || this.won) return;

        for (const exit of (this.mapDef.exits || [])) {
            // Use the same tile center as the visible gate; this avoids a detached
            // marker and prevents broad, premature transitions beside the path.
            const gatePosition = this.tilePosition(exit.fromTile.i, exit.fromTile.j);
            const distance = Phaser.Math.Distance.Between(
                this.player.x,
                this.player.y,
                gatePosition.x,
                gatePosition.y
            );

            if (distance <= 58) {
                this.transitionToMap(exit.toMap, exit.entryTile);
                return;
            }
        }
    }

    transitionToMap(mapId, entryTile) {
        if (this.indoorMode || this.transitioningMap || !MAPS[mapId] || !entryTile) return;
        this.transitioningMap = true;

        // Sync state to GameState before transition
        GameState.inventory = this.inventory;
        GameState.equipment = this.equipment;
        GameState.boatStage = this.boatStage;
        GameState.boatStagesCompleted = this.boatStagesCompleted;
        GameState.boatBuilt = this.boatBuilt;
        GameState.workbenchDiscovered = this.workbenchDiscovered || false;
        GameState.objectStates[this.currentMapId] = this.captureCurrentMapObjectStates();

        // Close crafting panel if open
        if (this.craftingOpen) {
            this.craftingOpen = false;
            this.craftingPanel.setVisible(false);
        }

        // Start new scene with same key but fresh create()
        this.scene.start('WorldScene', { startMapId: mapId, startTile: entryTile });
    }

    updateMapUI() {
        const mapName = this.mapDef.name;
        const mapId = this.mapDef.id;
        // Update the header text on screen
        if (this.mapLabel && this.mapLabel.scene === this && this.mapLabel.active) {
            this.mapLabel.setText(`${mapName}  /  ${mapId}`);
        } else {
            this.mapLabel = this.add.text(24, 66, `${mapName}  /  ${mapId}`, {
                fontFamily: 'sans-serif',
                fontSize: '12px',
                color: '#d8e8d2',
                backgroundColor: '#14251dcc',
                padding: { x: 10, y: 7 },
            })
                .setScrollFactor(0)
                .setDepth(1000);
        }
    }

    createCompass() {
        const root = this.add.container(this.scale.width - 72, 72);
        root.setScrollFactor(0);
        root.setDepth(1600);

        const background = this.add.circle(0, 0, 34, 0x0f1c12, 0.94);
        background.setStrokeStyle(2, 0x9bb58b, 1);

        const labelStyle = {
            fontFamily: 'sans-serif',
            fontSize: '10px',
            fontStyle: 'bold',
            color: '#e2f0d8',
        };
        const north = this.add.text(0, -25, 'N', labelStyle).setOrigin(0.5);
        const east = this.add.text(24, 0, 'E', labelStyle).setOrigin(0.5);
        const south = this.add.text(0, 25, 'S', labelStyle).setOrigin(0.5);
        const west = this.add.text(-24, 0, 'W', labelStyle).setOrigin(0.5);

        const needle = this.add.graphics();
        needle.fillStyle(0xd9e5d0, 1);
        needle.beginPath();
        needle.moveTo(0, -17);
        needle.lineTo(6, 5);
        needle.lineTo(0, 1);
        needle.lineTo(-6, 5);
        needle.closePath();
        needle.fillPath();
        needle.fillStyle(0xc96b55, 1);
        needle.fillTriangle(-2, 0, 2, 0, 0, 8);

        root.add([background, north, east, south, west, needle]);
        this.compassRoot = root;
        this.compassNeedle = needle;
        this.facingDirection = 'N';
    }

    updateCompass(dx, dy) {
        if (!this.compassNeedle || (dx === 0 && dy === 0)) return;

        if (Math.abs(dx) >= Math.abs(dy)) {
            this.facingDirection = dx >= 0 ? 'E' : 'W';
        } else {
            this.facingDirection = dy >= 0 ? 'S' : 'N';
        }

        const rotations = { N: 0, E: Math.PI / 2, S: Math.PI, W: -Math.PI / 2 };
        this.compassNeedle.setRotation(rotations[this.facingDirection]);
    }

    // DO010: Reposition UI panels based on viewport size
    repositionUI() {
        const w = this.scale.width;
        const h = this.scale.height;

        if (this.inventoryPanel) {
            this.inventoryPanel.setPosition(w - 260, 380);
        }
        if (this.inventoryText) {
            this.inventoryText.setPosition(w - 480, 75);
            this.inventoryText.setWordWrapWidth(420, true);
        }

        if (this.boatPanel) {
            this.boatPanel.setPosition(24, h - 180);
        }
        if (this.boatText) {
            this.boatText.setPosition(24, 24);
        }
        if (this.interactionPrompt) {
            this.interactionPrompt.setPosition(w / 2, h - 120);
        }
        if (this.hintTextObj) {
            this.hintTextObj.setPosition(w / 2, h - 24);
        }
        if (this.indoorPrompt) {
            this.indoorPrompt.setPosition(w / 2, h - 90);
        }

        if (this.messageText) {
            this.messageText.setPosition(w / 2, 118);
            this.messageText.setWordWrapWidth(Math.max(280, Math.min(760, w - 48)), true);
        }
        if (this.compassRoot) {
            this.compassRoot.setPosition(w - 72, 72);
        }
        if (this.touchActionRoot) this.touchActionRoot.setPosition(w - 150, h - 155);
        if (this.touchControlsRoot) this.touchControlsRoot.setPosition(150, h - 170);
        if (this.craftingPanel) {
            const panelH = 700;
            const panelY = h / 2;
            this.craftingPanel.setPosition(w / 2, panelY);
            this.craftingPanelPosition = { x: w / 2, y: panelY };
            if (this.recipeMaskShape) this.recipeMaskShape.setPosition(w / 2, panelY);
        }
    }

    update(time, delta = 16) {
        const body = this.player?.body;
        if (!body) return;

        const interactionDown = this.keys.E.isDown || Boolean(this.touchInteract);
        const escapeDown = this.keys.ESC.isDown;
        if (this.menuOpen) return;
        const inventoryDown = this.keys.I.isDown || Boolean(this.touchInventory);
        const inventoryPressed = inventoryDown && !this.inventoryWasDown;

        if (inventoryPressed) {
            this.inventoryOpen = !this.inventoryOpen;
            if (this.inventoryOpen) this.refreshInventoryUI();
            this.inventoryPanel.setVisible(this.inventoryOpen);
            this.inventoryText.setVisible(this.inventoryOpen);
        }
        const interactionPressed = interactionDown && !this.interactionWasDown;
        const escapePressed = escapeDown && !this.escapeWasDown;

        // Indoor movement is isolated from the outdoor player, objects and map exits.
        if (this.indoorMode) {
            const GRID_W = 5;
            const GRID_H = 4;
            const INDOOR_TILE = 32;
            const SPEED = 120;
            const step = Math.min(Math.max(delta, 0), 50) / 1000;

            let idx = 0;
            let idy = 0;
            if (this.keys.left.isDown || this.keys.A.isDown || this.touchKeys?.left) idx -= 1;
            if (this.keys.right.isDown || this.keys.D.isDown || this.touchKeys?.right) idx += 1;
            if (this.keys.up.isDown || this.keys.W.isDown || this.touchKeys?.up) idy -= 1;
            if (this.keys.down.isDown || this.keys.S.isDown || this.touchKeys?.down) idy += 1;

            if (idx !== 0 && idy !== 0) {
                const length = Math.hypot(idx, idy);
                idx /= length;
                idy /= length;
            }
            this.updateCompass(idx, idy);

            const clampedX = Phaser.Math.Clamp(
                this.indoorPlayer.x + idx * SPEED * step,
                INDOOR_TILE / 2,
                (GRID_W - 0.5) * INDOOR_TILE
            );
            const clampedY = Phaser.Math.Clamp(
                this.indoorPlayer.y + idy * SPEED * step,
                INDOOR_TILE / 2,
                (GRID_H - 0.5) * INDOOR_TILE
            );

            this.indoorPlayer.x = clampedX;
            this.indoorPlayer.y = clampedY;
            if (this.indoorPlayerSprite) {
                this.indoorPlayerSprite.setPosition(clampedX, clampedY);
            }

            const indoorDef = (MAP_OBSTACLES[this.currentMapId]?.indoorHouses || [])
                .find(h => h.buildingName === this.currentIndoorHouse);
            const wbTile = indoorDef?.workbenchTile || { i: 3, j: 2 };
            const wbX = wbTile.i * INDOOR_TILE + INDOOR_TILE / 2;
            const wbY = wbTile.j * INDOOR_TILE + INDOOR_TILE / 2;
            const distToWB = Math.hypot(clampedX - wbX, clampedY - wbY);

            if (this.indoorPrompt) {
                if (distToWB < INDOOR_TILE * 1.5 && !this.workbenchDiscovered) {
                    this.indoorPrompt.setText('E — Discover workbench');
                    this.indoorPrompt.setVisible(true);
                } else if (this.workbenchDiscovered) {
                    this.indoorPrompt.setText('Workbench discovered — ESC to exit.');
                    this.indoorPrompt.setVisible(true);
                } else {
                    this.indoorPrompt.setVisible(false);
                }
            }

            if (interactionPressed && distToWB < INDOOR_TILE * 1.5 && !this.workbenchDiscovered) {
                this.workbenchDiscovered = true;
                GameState.workbenchDiscovered = true;
                this.showMessage('You discovered a workbench inside! Crafting is now available.', 'success');
            }

            if (interactionPressed) {
                const doorX = 2 * INDOOR_TILE + INDOOR_TILE / 2;
                const doorY = (GRID_H - 1) * INDOOR_TILE + INDOOR_TILE / 2 + 20;
                if (Math.hypot(clampedX - doorX, clampedY - doorY) < INDOOR_TILE) {
                    this.exitIndoor();
                }
            }

            if (escapePressed) this.exitIndoor();

            this.interactionWasDown = interactionDown;
            this.escapeWasDown = escapeDown;
            this.inventoryWasDown = inventoryDown;
            return;
        }

        this.nearbyObject = this.findNearbyObject();

        const hadOpenPanelBeforeEscape = this.craftingOpen || this.inventoryOpen;
        if (escapePressed && this.craftingOpen) {
            this.craftingOpen = false;
            this.craftingPanel.setVisible(false);
        }
        if (escapePressed && this.inventoryOpen) {
            this.inventoryOpen = false;
            this.inventoryPanel.setVisible(false);
            this.inventoryText.setVisible(false);
        }
        if (escapePressed && !hadOpenPanelBeforeEscape && !this.craftingOpen && !this.inventoryOpen) {
            this.openMenu(this.won ? 'ending' : 'pause');
            this.interactionWasDown = interactionDown;
            this.escapeWasDown = escapeDown;
            this.inventoryWasDown = inventoryDown;
            return;
        }

        if (this.craftingOpen && interactionPressed) {
            const nearby = this.findNearbyObject();
            if (nearby && nearby.getData('kind') === 'workbench') {
                const firstAffordable = RECIPES.find(recipe =>
                    (!recipe.workbenchRequired || this.workbenchDiscovered) &&
                    Object.entries(recipe.ingredients).every(
                        ([key, amount]) => this.hasItem(key, amount)
                    )
                );

                if (firstAffordable) {
                    this.craftRecipe(firstAffordable);
                } else {
                    this.showMessage('No affordable recipes available.');
                }
            }
        }

        if (this.craftingOpen) {
            this.interactionPrompt.setVisible(false);
        } else if (this.nearbyObject) {
            const kind = this.nearbyObject.getData('kind');
            const name = this.nearbyObject.getData('name') || 'Object';

            if (kind === 'workbench') {
                this.interactionPrompt.setText(`E — Craft items: ${name}`);
            } else if (kind === 'boatSite') {
                if (this.boatBuilt) {
                    this.interactionPrompt.setText('E — Sail away');
                } else {
                    const stage = BOAT_STAGES[this.boatStage];
                    this.interactionPrompt.setText(`E — Build ${stage.name}: ${name}`);
                }
            } else {
                const alreadyUsed = kind === 'house'
                    ? this.nearbyObject.getData('searched')
                    : this.nearbyObject.getData('harvested');
                const action = kind === 'house'
                    ? (alreadyUsed ? 'Already searched' : 'Search')
                    : (alreadyUsed ? 'Already harvested' : 'Gather wood');
                this.interactionPrompt.setText(
                    alreadyUsed ? `${name} — ${action}` : `E — ${action}: ${name}`
                );
            }

            this.interactionPrompt.setVisible(true);
        } else {
            this.interactionPrompt.setVisible(false);
        }

        if (!this.craftingOpen && interactionPressed && this.nearbyObject) {
            const kind = this.nearbyObject.getData('kind');
            if (kind === 'boatSite') {
                // A newly completed boat requires a second, deliberate press to depart.
                if (this.boatBuilt) {
                    this.checkWinCondition(true);
                } else {
                    this.buildBoatStage();
                }
            } else {
                this.interactWith(this.nearbyObject);
            }
        }

        if (!this.endingActive && !this.won) {
            const hints = this.getContextualHints();
            if (hints.length > 0) {
                const idx = Math.floor(Date.now() / 8000) % hints.length;
                if (this.hintText !== hints[idx]) {
                    this.hintText = hints[idx];
                    if (this.hintTimer) this.time.removeEvent(this.hintTimer);
                    this.hintTimer = this.time.delayedCall(5000, () => {
                        this.hintTextObj.setVisible(false);
                        this.hintText = '';
                    });
                    this.hintTextObj.setText(hints[idx]);
                    this.hintTextObj.setVisible(true);
                }
            }
        }

        this.interactionWasDown = interactionDown;
        this.escapeWasDown = escapeDown;
        this.inventoryWasDown = inventoryDown;

        let dx = 0;
        let dy = 0;

        if (this.cursors.left.isDown || this.keys.A.isDown || this.touchKeys?.left) dx -= 1;
        if (this.cursors.right.isDown || this.keys.D.isDown || this.touchKeys?.right) dx += 1;
        if (this.cursors.up.isDown || this.keys.W.isDown || this.touchKeys?.up) dy -= 1;
        if (this.cursors.down.isDown || this.keys.S.isDown || this.touchKeys?.down) dy += 1;

        if (dx !== 0 && dy !== 0) {
            const length = Math.hypot(dx, dy);
            dx /= length;
            dy /= length;
        }

        this.updateCompass(dx, dy);

        const inside = this.isInsideIsland(this.player.x, this.player.y);
        if (!inside) {
            const centerX = 960;
            const centerY = 40 + ((this.rows - 1) * TILE_H) / 2;
            const dot = dx * (centerX - this.player.x) + dy * (centerY - this.player.y);
            if (dot < 0) {
                dx = 0;
                dy = 0;
            }
        }

        body.setAcceleration(dx * 900, dy * 900);
        if (dx === 0) body.setAccelerationX(0);
        if (dy === 0) body.setAccelerationY(0);

        this.checkMapTransition();
    }
}

// ============================================================
// GAME INITIALIZATION — accept start data via scene config
// ============================================================
const gameContainer = document.getElementById('game-container');

if (gameContainer) {
    const game = new Phaser.Game({
        type: Phaser.CANVAS,
        parent: 'game-container',
        width: 1920,
        height: 1080,
        backgroundColor: '#18343b',
        pixelArt: false,
        antialias: true,
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
        },
        physics: {
            default: 'arcade',
            arcade: {
            },
        },
        scene: [WorldScene],
    });

    game.events.on('ready', () => {
    });
    game.events.on('shutdown', () => {
    });
} else {
}
