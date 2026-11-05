import Phaser from 'phaser';

const TILE_W = 64;
const TILE_H = 32;

// ============================================================
// SHARED GAME STATE — survives map transitions
// ============================================================
const GameState = {
    inventory: { wood: 0, scrap: 0, rope: 0, cloth: 0, food: 0 },
    equipment: { axe: false, gatheringTool: false },
    boatStage: 0,
    boatStagesCompleted: [false, false, false, false],
    boatBuilt: false,
    workbenchDiscovered: false,
    won: false,
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
            // Zone-specific colors
            woodland:   [0x2d5a27, 0x1e4a1a],
            abandoned:  [0x8a8a6a, 0x7a7a5a],
            industrial: [0x6a5a4a, 0x5a4a3a],
            overgrown:  [0x4a7a3a, 0x3a6a2a],
            shore:      [0xc5b69a, 0xb5a78a],
        },
        // Paths are edges of the grid; exits at specific tile coords
        exits: [
            { fromTile: { i: 29, j: 15 }, toMap: 'MAP2', entryTile: { i: 0, j: 15 } },
        ],
                lootProfile: {
                            wood:      1.5, branches: 1.0, cloth: 0.3, food: 0.3,
                        },
                        zones: {
            woodland:   { minI: 0, maxI: 12, minJ: 0, maxJ: 12 },
            abandoned:  { minI: 0, maxI: 15, minJ: 17, maxJ: 29 },
            industrial: { minI: 15, maxI: 29, minJ: 0, maxJ: 12 },
            overgrown:  { minI: 10, maxI: 20, minJ: 10, maxJ: 20 },
            homeDistrict: { minI: 9, maxI: 19, minJ: 9, maxJ: 19 },
        },
        fogMargin: 2,
        landmarks: [
            { tile: { i: 13, j: 13 }, label: 'Start' },
            { tile: { i: 14, j: 23 }, label: 'Boat Dock' },
        ],
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
            shore:      [0xc5b69a, 0xb5a78a],
        },
        exits: [
            { fromTile: { i: 29, j: 15 }, toMap: 'MAP3', entryTile: { i: 0, j: 15 } },
            { fromTile: { i: 0, j: 15 }, toMap: 'MAP1', entryTile: { i: 28, j: 15 } },
        ],
                lootProfile: {
                            cloth:     1.5, food: 1.0, scrap: 1.2, fibers: 1.0,
                        },
                        zones: {
            abandoned:  { minI: 0, maxI: 29, minJ: 0, maxJ: 29 },
            overgrown:  { minI: 0, maxI: 8, minJ: 0, maxJ: 15 },
        },
        fogMargin: 2,
        landmarks: [
            { tile: { i: 15, j: 20 }, label: 'Settlement Edge' },
        ],
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
            shore:      [0xc5b69a, 0xb5a78a],
        },
        exits: [
            { fromTile: { i: 29, j: 15 }, toMap: 'MAP4', entryTile: { i: 0, j: 15 } },
            { fromTile: { i: 0, j: 15 }, toMap: 'MAP2', entryTile: { i: 28, j: 15 } },
        ],
                lootProfile: {
                            scrap:     2.0, fasteners: 1.5, rope: 0.8,
                        },
                        zones: {
            industrial: { minI: 0, maxI: 29, minJ: 0, maxJ: 29 },
            overgrown:  { minI: 18, maxI: 29, minJ: 18, maxJ: 29 },
        },
        fogMargin: 2,
        landmarks: [
            { tile: { i: 15, j: 20 }, label: 'Ruins Entrance' },
        ],
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
            shore:      [0xc5b69a, 0xb5a78a],
        },
        exits: [
            { fromTile: { i: 29, j: 15 }, toMap: 'MAP5', entryTile: { i: 0, j: 15 } },
            { fromTile: { i: 0, j: 15 }, toMap: 'MAP3', entryTile: { i: 28, j: 15 } },
        ],
                lootProfile: {
                            wood:      1.8, branches: 1.5, fibers: 1.5, food: 0.4,
                        },
                        zones: {
            woodland:   { minI: 0, maxI: 29, minJ: 0, maxJ: 29 },
            overgrown:  { minI: 0, maxI: 12, minJ: 0, maxJ: 29 },
        },
        fogMargin: 2,
        landmarks: [
            { tile: { i: 15, j: 20 }, label: 'Wilderness Trail' },
        ],
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
            shore:      [0xc5b69a, 0xb5a78a],
        },
        lootProfile: {
                            driftwood: 2.0, cloth: 1.0, rope: 0.5,
                        },
                        exits: [], // Final map — boat site for DO010
        zones: {
            shore:      { minI: 20, maxI: 29, minJ: 0, maxJ: 29 },
            overgrown:  { minI: 0, maxI: 10, minJ: 0, maxJ: 15 },
        },
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
            // Home District (center-north) — balanced loot
            { i: 13, j: 13, name: 'Your Home', kind: 'house', searchKey: 'searched' },
            { i: 10, j: 21, name: 'Garden Shed', kind: 'house', searchKey: 'searched' },
            { i: 21, j: 20, name: 'Old House', kind: 'house', searchKey: 'searched' },
            // Abandoned Residential (northeast) — cloth/rope heavy
            { i: 5, j: 24, name: 'Ruined Cottage', kind: 'house', searchKey: 'searched' },
            { i: 14, j: 26, name: 'Shelter Ruins', kind: 'house', searchKey: 'searched' },
            // Industrial Ruins (southwest) — scrap heavy
            { i: 22, j: 7, name: 'Scrap Yard', kind: 'house', searchKey: 'searched' },
            { i: 25, j: 10, name: 'Old Foundry', kind: 'house', searchKey: 'searched' },
        ],
        workbenches: [],
        trees: [
            // Woodland (northwest) — dense, wood-heavy
            [3, 4], [4, 7], [5, 3], [6, 9], [7, 5], [8, 2], [9, 10],
            [10, 4], [11, 8], [12, 3], [3, 10], [5, 11], [7, 2], [9, 6],
            // Overgrown Interior — scattered
            [11, 12], [14, 14], [17, 16], [19, 11], [13, 18], [16, 20],
            // Southeastern Shoreline — sparse
            [26, 20], [27, 22], [25, 24], [28, 18],
        ],

    },
    MAP2: {
        buildings: [
            { i: 8, j: 10, name: 'Ruined Shack', kind: 'house', searchKey: 'searched' },
            { i: 18, j: 8, name: 'Old Store', kind: 'house', searchKey: 'searched' },
            { i: 12, j: 20, name: 'Abandoned Barn', kind: 'house', searchKey: 'searched' },
            { i: 22, j: 18, name: 'Derelict House', kind: 'house', searchKey: 'searched' },
        ],
        // Designated house for workbench discovery — enters indoor mode
        indoorHouses: [
            { i: 18, j: 8, name: 'Old Store', entryTile: { i: 18, j: 9 }, indoorMap: 'INDOOR_MAP' },
        ],
        workbenches: [{ i: 15, j: 15 }],
        trees: [
            [4, 6], [6, 5], [5, 12], [7, 18],
            [4, 22], [24, 6], [25, 10], [24, 24],
            [18, 25], [10, 25], [26, 16], [6, 25],
        ],
        boatSite: null,
    },
    MAP3: {
        buildings: [
            { i: 7, j: 9, name: 'Factory Ruin', kind: 'house', searchKey: 'searched' },
            { i: 19, j: 7, name: 'Warehouse', kind: 'house', searchKey: 'searched' },
            { i: 9, j: 21, name: 'Machine Shop', kind: 'house', searchKey: 'searched' },
            { i: 21, j: 19, name: 'Control Tower', kind: 'house', searchKey: 'searched' },
        ],
        workbenches: [{ i: 15, j: 15 }],
        trees: [
            [4, 7], [6, 6], [5, 13], [8, 17],
            [4, 23], [24, 7], [25, 11], [23, 22],
            [17, 25], [11, 25], [26, 14], [6, 26],
        ],
        boatSite: null,
    },
    MAP4: {
        buildings: [
            { i: 9, j: 8, name: 'Forest Cabin', kind: 'house', searchKey: 'searched' },
            { i: 17, j: 10, name: "Hunter's Lodge", kind: 'house', searchKey: 'searched' },
            { i: 11, j: 22, name: 'Ranger Station', kind: 'house', searchKey: 'searched' },
            { i: 20, j: 20, name: 'Old Watchtower', kind: 'house', searchKey: 'searched' },
        ],
        workbenches: [{ i: 15, j: 15 }],
        trees: [
            [3, 5], [5, 4], [4, 10], [6, 16],
            [3, 20], [25, 5], [26, 9], [25, 21],
            [16, 26], [9, 26], [27, 13], [5, 27],
        ],
        boatSite: null,
    },
    MAP5: {
        buildings: [
            { i: 8, j: 10, name: 'Coastal Hut', kind: 'house', searchKey: 'searched' },
            { i: 20, j: 8, name: 'Fishing Shack', kind: 'house', searchKey: 'searched' },
            { i: 10, j: 20, name: 'Beach Tent', kind: 'house', searchKey: 'searched' },
        ],
        workbenches: [{ i: 15, j: 15 }],
        trees: [
            [4, 6], [6, 5], [5, 12], [8, 18],
            [4, 22], [23, 7], [24, 11], [23, 23],
            [18, 25], [12, 25], [26, 15], [6, 26],
        ],
        boatSite: { i: 14, j: 23 },
    },
};

// ============================================================
// INDOOR MAP — "Your Home" interior (placed near outdoor house at 13,13)
// ============================================================
const INDOOR_MAP = {
    cols: 5,
    rows: 4,
    originX: 960,
    originY: 500,
    // Wall tiles (i, j) — perimeter blocks
    walls: [
        [0,0],[1,0],[2,0],[3,0],[4,0],
        [0,1],[4,1],
        [0,2],[4,2],
        [0,3],[1,3],[2,3],[3,3],[4,3],
    ],
    // Door tile — interact here to exit
    door: { i: 2, j: 3 },
    // Workbench tile — discover by walking up to it
    workbench: { i: 2, j: 1 },
};

function indoorTilePosition(i, j) {
    return {
        x: INDOOR_MAP.originX + (i - 2) * TILE_W,
        y: INDOOR_MAP.originY + j * TILE_H,
    };
}

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
    // Abandoned Residential — cloth/rope heavy
    'Ruined Cottage': [
        { cloth: 2, rope: 1 },
        { cloth: 1, food: 1 },
        { rope: 2, cloth: 1 },
    ],
    'Shelter Ruins': [
        { rope: 2, cloth: 1 },
        { cloth: 1, food: 1 },
        { rope: 1, cloth: 1 },
    ],
    // Industrial Ruins — scrap heavy
    'Scrap Yard': [
        { scrap: 4 },
        { scrap: 2, wood: 1 },
        { scrap: 3, rope: 1 },
    ],
    'Old Foundry': [
        { scrap: 3, wood: 1 },
        { scrap: 2, rope: 1 },
        { scrap: 4 },
    ],
};

const ITEM_DEFS = {
    wood:      { name: 'Wood',        limit: 30, desc: 'Basic building material.' },
    branches:  { name: 'Branches',    limit: 20, desc: 'Crafting fibers and rope.' },
    scrap:     { name: 'Scrap Metal', limit: 20, desc: 'Tool components and upgrades.' },
    fasteners: { name: 'Fasteners',   limit: 15, desc: 'Metal parts for reinforcement.' },
    rope:      { name: 'Rope',        limit: 10, desc: 'Crafting and boat construction.' },
    cloth:     { name: 'Cloth',       limit: 10, desc: 'Sails and repairs.' },
    fibers:    { name: 'Fibers',      limit: 15, desc: 'Plant materials for crafting.' },
    sailcloth: { name: 'Sailcloth',   limit: 8,  desc: 'Treated cloth for boat sails.' },
    driftwood: { name: 'Driftwood',   limit: 15, desc: 'Washed-up wood from the shore.' },
    food:      { name: 'Food',        limit: 10, desc: 'Rations for the journey.' },
};

const BOAT_STAGES = [
    { id: 'hull',         name: 'Hull',          ingredients: { wood: 12 }, desc: 'Lay the hull frame from timber.' },
    { id: 'reinforcement', name: 'Reinforcement', ingredients: { scrap: 6, wood: 4 }, desc: 'Plate the hull with scrap metal and wood braces.' },
    { id: 'rigging',      name: 'Rigging',       ingredients: { rope: 5 }, desc: 'Rig the mast and control lines.' },
    { id: 'sail',         name: 'Sail',          ingredients: { cloth: 6 }, desc: 'Hoist the sail and prepare for departure.' },
];

const RECIPES = [
    {
        id: 'crudeAxe',
        name: 'Crude Axe',
        result: { type: 'equipment', key: 'axe' },
        ingredients: { wood: 5, rope: 2 },
        desc: 'Basic chopping tool. +1 wood from trees.',
    },
    {
        id: 'gatheringTool',
        name: 'Gathering Tool',
        result: { type: 'equipment', key: 'gatheringTool' },
        ingredients: { wood: 4, scrap: 2 },
        desc: 'Improved gathering. +1 scrap from houses.',
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
];

// ============================================================
// WORLD SCENE
// ============================================================
class WorldScene extends Phaser.Scene {
    constructor() {
        super('WorldScene');
    }

    preload() {
    }

    create() {
        const startMapId = this.data?.startMapId || 'MAP1';
        const startTile = this.data?.startTile || null;
        const mapDef = MAPS[startMapId];
        this.currentMapId = startMapId;
        this.mapDef = mapDef;
        this.cols = mapDef.dims.cols;
        this.rows = mapDef.dims.rows;
        this.worldW = this.cols * TILE_W;
        this.worldH = this.rows * TILE_H + 160;

        this.physics.world.setBounds(0, 0, this.worldW, this.worldH);

        // Clear any leftover graphics from previous map
        const existingGraphics = this.children.getAll().filter(c => c.type === 'graphics');
        existingGraphics.forEach(g => g.destroy());

        this.drawMap();
        this.createTextures();
        this.createObstacles(startMapId);
        this.createPlayer(startTile || mapDef.landmarks[0]?.tile || { i: 13, j: 13 });
        this.createControls();
        this.createInteractionSystem();
        this.createBoatSite(startMapId);
        this.createCamera();
        this.drawFog();

        // Update UI to reflect current map
        this.updateMapUI();
    }

    tilePosition(i, j) {
        const cx = 960;
        const cy = 40;
        return {
            x: cx + (i - j) * TILE_W / 2,
            y: cy + (i + j) * TILE_H / 2,
        };
    }

    checkZone(i, j, zone) {
        if (!zone) return false;
        if (typeof zone === 'boolean') return zone;
        if (zone.includes) return zone.includes([i, j]);
        // Support {minI, maxI, minJ, maxJ} rectangle definition
        if (zone.minI != null && i >= zone.minI && i <= zone.maxI &&
            zone.minJ != null && j >= zone.minJ && j <= zone.maxJ) return true;
        return false;
    }

    drawMap() {
        const graphics = this.add.graphics({ add: true });
        const colors = this.mapDef.terrainColors;

        for (let i = 0; i < this.cols; i++) {
            for (let j = 0; j < this.rows; j++) {
                const { x, y } = this.tilePosition(i, j);
                let color;

                // Zone detection — per-map zone definitions from mapDef
                const zones = this.mapDef.zones || {};
                const inWoodland    = zones.woodland    ? this.checkZone(i, j, zones.woodland)    : false;
                const inAbandoned   = zones.abandoned   ? this.checkZone(i, j, zones.abandoned)   : false;
                const inIndustrial  = zones.industrial  ? this.checkZone(i, j, zones.industrial)  : false;
                const inOvergrown   = zones.overgrown   ? this.checkZone(i, j, zones.overgrown)   : false;
                const inHomeDist    = zones.homeDistrict ? this.checkZone(i, j, zones.homeDistrict) : false;

                // Shoreline: SE edge tiles that are on the island boundary
                const isSEShore = this.isInsideIsland(x, y) &&
                    (i >= 24 || j <= 5) && !inWoodland && !inIndustrial;

                // Road network connecting all zones
                const road = i === 15 || j === 15;

                if (road) {
                    color = colors.road;
                } else if (isSEShore) {
                    color = ((i * 7 + j * 13) % 3 === 0)
                        ? colors.shore[1]
                        : colors.shore[0];
                } else if (inWoodland) {
                    color = ((i * 7 + j * 13) % 5 === 0)
                        ? colors.woodland[1]
                        : colors.woodland[0];
                } else if (inAbandoned) {
                    color = ((i * 7 + j * 13) % 5 === 0)
                        ? colors.abandoned[1]
                        : colors.abandoned[0];
                } else if (inIndustrial) {
                    color = ((i * 7 + j * 13) % 5 === 0)
                        ? colors.industrial[1]
                        : colors.industrial[0];
                } else if (inOvergrown) {
                    color = ((i * 7 + j * 13) % 5 === 0)
                        ? colors.overgrown[1]
                        : colors.overgrown[0];
                } else if (inHomeDist) {
                    color = ((i * 7 + j * 13) % 5 === 0)
                        ? colors.grass[1]
                        : colors.grass[0];
                } else {
                    // Background / water tiles outside main zones — skip drawing
                    continue;
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

        // Draw a fog overlay gradient at map edges
        const fogOverlay = this.add.graphics({ add: true });
        fogOverlay.setDepth(50);
        fogOverlay.setVisible(false); // Fog tiles handle it; keep overlay for future use
    }

    createTextures() {
        function drawToBitmap(drawFn, key, w, h) {
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
        drawToBitmap.call(this, function(ctx) {
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
        drawToBitmap.call(this, function(ctx) {
            ctx.fillStyle = '#59412c';
            ctx.fillRect(16, 24, 10, 28);
            ctx.fillStyle = '#31583c';
            ctx.beginPath(); ctx.arc(21, 20, 18, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#507b47';
            ctx.beginPath(); ctx.arc(12, 24, 11, 0, Math.PI * 2); ctx.fill();
        }, 'tree', 42, 54);

        // Workbench: 56x46
        drawToBitmap.call(this, function(ctx) {
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

        // Indoor floor: 64x32
        drawToBitmap.call(this, function(ctx) {
            ctx.fillStyle = '#8a7050';
            ctx.fillRect(0, 0, 64, 32);
            ctx.fillStyle = '#7a6040';
            ctx.fillRect(0, 15, 64, 2);
            ctx.fillRect(32, 0, 2, 15);
            ctx.fillRect(16, 17, 2, 15);
            ctx.fillRect(48, 17, 2, 15);
            ctx.fillStyle = '#9a8060';
            ctx.fillRect(8, 8, 20, 2);
            ctx.fillRect(36, 8, 20, 2);
        }, 'indoor_floor', 64, 32);

        // Indoor wall: 64x32
        drawToBitmap.call(this, function(ctx) {
            ctx.fillStyle = '#5a4a3a';
            ctx.fillRect(0, 0, 64, 32);
            ctx.fillStyle = '#4a3a2a';
            ctx.fillRect(0, 0, 64, 4);
            ctx.fillRect(0, 28, 64, 4);
            ctx.fillRect(0, 0, 4, 32);
            ctx.fillRect(60, 0, 4, 32);
            ctx.fillStyle = '#6a5a4a';
            ctx.fillRect(8, 8, 20, 2);
            ctx.fillRect(36, 8, 20, 2);
        }, 'indoor_wall', 64, 32);

        // Player: 32x38
        drawToBitmap.call(this, function(ctx) {
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

    createBoatTextures() {
        function drawToBitmap(drawFn, key, w, h) {
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
        drawToBitmap.call(this, function(ctx) {
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
        drawToBitmap.call(this, function(ctx) {
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
        drawToBitmap.call(this, function(ctx) {
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
        drawToBitmap.call(this, function(ctx) {
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

        for (const wb of defs.workbenches) {
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
    }

    createIndoorObjects() {
        this.indoorObjects = this.physics.add.staticGroup();

        // Draw indoor floor
        const floorGraphics = this.add.graphics({ add: true });
        for (let i = 0; i < INDOOR_MAP.cols; i++) {
            for (let j = 0; j < INDOOR_MAP.rows; j++) {
                const p = indoorTilePosition(i, j);
                floorGraphics.fillStyle(0x8a7050, 1);
                floorGraphics.fillRect(p.x - 32, p.y - 16, 64, 32);
            }
        }
        floorGraphics.setDepth(-1000);

        // Create wall obstacles
        for (const [i, j] of INDOOR_MAP.walls) {
            const p = indoorTilePosition(i, j);
            const wall = this.indoorObjects.create(p.x, p.y, 'indoor_wall');
            wall.setDepth(p.y);
            wall.refreshBody();
            wall.setData('kind', 'wall');
        }

        // Create workbench inside
        const wp = indoorTilePosition(INDOOR_MAP.workbench.i, INDOOR_MAP.workbench.j);
        this.indoorWorkbench = this.indoorObjects.create(wp.x, wp.y - 12, 'workbench');
        this.indoorWorkbench.setDepth(wp.y);
        this.indoorWorkbench.refreshBody();
        this.indoorWorkbench.setData('name', 'Workbench');
        this.indoorWorkbench.setData('kind', 'workbench');

        // Create door (exit) at bottom center
        const dp = indoorTilePosition(INDOOR_MAP.door.i, INDOOR_MAP.door.j);
        this.indoorDoor = this.indoorObjects.create(dp.x, dp.y, 'door');
        this.indoorDoor.setDepth(dp.y);
        this.indoorDoor.refreshBody();
        this.indoorDoor.setData('name', 'Exit');
        this.indoorDoor.setData('kind', 'door');

        // Sync discovered state
        if (this.workbenchDiscovered) {
            this.indoorWorkbench.setData('discovered', true);
        }
    }

    destroyIndoorObjects() {
        if (this.indoorObjects) {
            this.indoorObjects.destroy();
            this.indoorObjects = null;
        }
        this.indoorWorkbench = null;
        this.indoorDoor = null;

        // Clear floor graphics
        const existingGraphics = this.children.getAll().filter(c => c.type === 'graphics');
        existingGraphics.forEach(g => g.destroy());
    }

    setIndoorMode(enabled) {
        this.indoorMode = enabled;
        if (enabled) {
            this.createIndoorObjects();
            // Move player to door position
            const dp = indoorTilePosition(INDOOR_MAP.door.i, INDOOR_MAP.door.j);
            this.player.setPosition(dp.x, dp.y);
            this.player.setDepth(dp.y);
            this.physics.world.setBounds(
                INDOOR_MAP.originX - 160,
                INDOOR_MAP.originY - 20,
                INDOOR_MAP.cols * TILE_W + 320,
                INDOOR_MAP.rows * TILE_H + 40
            );
            this.cameras.main.setZoom(2.0);
            this.cameras.main.follow(this.player, true, 0.08, 0.08);
        } else {
            this.destroyIndoorObjects();
            // Move player back to outdoor position near house
            const hp = this.tilePosition(13, 13);
            this.player.setPosition(hp.x, hp.y + 40);
            this.player.setDepth(this.player.y);
            this.physics.world.setBounds(0, 0, this.worldW, this.worldH);
            this.cameras.main.setZoom(1.5);
            this.cameras.main.follow(this.player, true, 0.08, 0.08);
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
        });

        this.add.text(24, 0, 'WASD / ARROWS: MOVE', {
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
        this.indoorMode = false;
        this.indoorObjects = null;
        this.boatStage = GameState.boatStage;
        this.boatStagesCompleted = GameState.boatStagesCompleted;
        this.boatBuilt = GameState.boatBuilt;
        this.workbenchDiscovered = GameState.workbenchDiscovered;

        this.interactionPrompt = this.add.text(
            480, 520, '',
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

        this.inventoryText = this.add.text(
            24, 112, '',
            {
                fontFamily: 'sans-serif',
                fontSize: '13px',
                color: '#ffffff',
                backgroundColor: '#0f1c12ff',
                padding: { x: 12, y: 9 },
                lineSpacing: 5,
                align: 'left',
                wordWrap: { width: 220 },
            }
        )
            .setScrollFactor(0)
            .setDepth(1000);

        this.messageText = this.add.text(
            480, 465, '',
            {
                fontFamily: 'sans-serif',
                fontSize: '14px',
                color: '#e2f0d8',
                backgroundColor: '#0f1c12ff',
                padding: { x: 12, y: 8 },
                align: 'center',
            }
        )
            .setOrigin(0.5)
            .setScrollFactor(0)
            .setDepth(2000);

        this.messageText.setVisible(false);

        this.boatText = this.add.text(
            936, 24, '',
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
            .setOrigin(1, 0)
            .setScrollFactor(0)
            .setDepth(1000);
        this.refreshBoatUI();

        const camW = this.cameras.main.width;
        const camH = this.cameras.main.height;
        const panelW = 390, panelH = 300;
        const px = camW / 2;
        const py = Math.max(panelH / 2 + 10, Math.min(camH - panelH / 2 - 10, camH / 2 - 40));
        this.craftingPanel = this.add.container(px, py);
        this.craftingPanel.setScrollFactor(0);
        this.craftingPanel.setDepth(3000);

        const panelBorder = this.add.graphics();
        panelBorder.fillStyle(0x0f1c12, 1);
        panelBorder.fillRect(-195, -150, 390, 300);
        panelBorder.lineStyle(2, 0x9bb58b, 1);
        panelBorder.strokeRect(-195, -150, 390, 300);

        const panelBackground = this.add.rectangle(0, 0, 390, 300, 0x0f1c12, 1);

        const panelTitle = this.add.text(
            0, -128, 'WORKBENCH',
            {
                fontFamily: 'sans-serif',
                fontSize: '22px',
                fontStyle: 'bold',
                color: '#e2f0d8',
            }
        ).setOrigin(0.5);

        const recipeScrollArea = this.add.container(0, -43);

        this.recipeCards = [];
        let cardY = 0;

        for (const recipe of RECIPES) {
            const card = this.add.container(0, cardY);
            const cardBorder = this.add.graphics();
            cardBorder.lineStyle(1, 0x5a7a52, 1);
            cardBorder.strokeRect(-186, -25, 372, 50);
            card.add(cardBorder, 0);

            const cardBg = this.add.rectangle(0, 0, 370, 48, 0x1a2e1d, 1);
            card.add(cardBg);

            const canCraft = Object.entries(recipe.ingredients).every(
                ([key, amount]) => this.hasItem(key, amount)
            );

            const nameText = this.add.text(-175, -12, recipe.name, {
                fontFamily: 'sans-serif',
                fontSize: '14px',
                fontStyle: 'bold',
                color: canCraft ? '#e2f0d8' : '#7a8a72',
                wordWrap: { width: 160 },
            });
            card.add(nameText);
            card.setData('nameText', nameText);

            const ingredientText = this.add.text(-175, 6,
                Object.entries(recipe.ingredients).map(
                    ([k, a]) => `${ITEM_DEFS[k].name}: ${a}`
                ).join('  |  '),
                {
                    fontFamily: 'sans-serif',
                    fontSize: '11px',
                    color: canCraft ? '#c8dcc0' : '#5a6a52',
                    wordWrap: { width: 160 },
                }
            );
            card.add(ingredientText);
            card.setData('ingredientText', ingredientText);

            const descText = this.add.text(175, -4, recipe.desc, {
                fontFamily: 'sans-serif',
                fontSize: '10px',
                color: canCraft ? '#a8c0a0' : '#4a5a42',
                align: 'right',
                wordWrap: { width: 170 },
            });
            card.add(descText);

            cardBorder.clear();
            cardBorder.lineStyle(1, canCraft ? 0x9bb58b : 0x3a4a32, 1);
            cardBorder.strokeRect(-186, -25, 372, 50);
            card.setInteractive(
                new Phaser.Geom.Rectangle(-185, -24, 370, 48),
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
            cardY += 56;
        }

        this.craftingPanel.add([panelBorder, panelBackground, panelTitle, recipeScrollArea]);
        this.craftingPanel.setVisible(false);
        
        // DO015: Boat Progress UI
        this.boatProgressText = this.add.text(20, 60, '', {
            fontFamily: "'Inter', sans-serif", fontSize: '13px', color: '#94a3b8'
        }).setDepth(1).setVisible(false);
        // Boat Progress UI (DO015)
        this.boatProgressText = this.add.text(20, 60, '', {
            fontFamily: "'Inter', sans-serif", fontSize: '13px', color: '#94a3b8'
        }).setDepth(1).setVisible(false);
        this.craftingOpen = false;

        this.refreshInventoryUI();
    }

    addItem(key, amount) {
        const def = ITEM_DEFS[key];
        if (!def) return 0;

        const current = this.inventory[key] || 0;
        const space = def.limit - current;
        if (space <= 0) {
            this.showMessage(`${def.name} storage is full.`);
            return 0;
        }

        const added = Math.min(amount, space);
        this.inventory[key] = current + added;

        if (added > 0) {
            this.refreshInventoryUI();
            this.showMessage(`+${added} ${def.name}`);
        }

        if (added < amount) {
            this.showMessage(`${def.name} stack near limit — received ${added} of ${amount}.`);
        }

        return added;
    }

    removeItem(key, amount) {
        const current = this.inventory[key] || 0;
        const canRemove = Math.min(amount, current);
        if (canRemove <= 0) return false;

        this.inventory[key] -= canRemove;
        this.refreshInventoryUI();
        return true;
    }

    hasItem(key, amount = 1) {
        return (this.inventory[key] || 0) >= amount;
    }

    getItem(key) {
        return this.inventory[key] || 0;
    }

    craftRecipe(recipe) {
        const canCraft = Object.entries(recipe.ingredients).every(
            ([key, amount]) => this.hasItem(key, amount)
        );

        if (!canCraft) {
            this.showMessage('Not enough resources to craft.');
            return;
        }

        for (const [key, amount] of Object.entries(recipe.ingredients)) {
            this.removeItem(key, amount);
        }

        const result = recipe.result;
        if (result.type === 'equipment') {
            this.equipment[result.key] = true;
            this.showMessage(`Crafted ${recipe.name}!`);
        } else if (result.type === 'item') {
            this.addItem(result.key, result.amount || 1);
            this.showMessage(`Crafted ${recipe.name}!`);
        }

        this.refreshRecipeUI();
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
            if (nameText) {
                nameText.setColor(canCraft ? '#e2f0d8' : '#7a8a72');
            }
            if (ingredientText) {
                ingredientText.setColor(canCraft ? '#c8dcc0' : '#5a6a52');
            }
        }
    }

    refreshInventoryUI() {
        const lines = ['SURVIVOR INVENTORY', ''];

        for (const [key, def] of Object.entries(ITEM_DEFS)) {
            const count = this.inventory[key] || 0;
            const filled = Math.min(count, 10);
            const empty = 10 - filled;
            const bar = '[' + '■'.repeat(filled) + '·'.repeat(empty) + ']';
            lines.push(`${def.name}: ${count.toString().padStart(2)}/${def.limit}  ${bar}`);
        }

        this.inventoryText.setText(lines.join('\n'));
    }

    showMessage(message) {
        this.messageText.setText(message);
        this.messageText.setVisible(true);

        if (this.messageHideEvent) {
            this.messageHideEvent.remove(false);
        }

        this.messageHideEvent = this.time.delayedCall(1800, () => {
            this.messageText.setVisible(false);
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
        // i = (x-960)/32 + (y-40)/16  all / TILE_W and TILE_H/2
        const j = (py / (TILE_H / 2) - px / (TILE_W / 2)) / 2;
        const i = (py / (TILE_H / 2) + px / (TILE_W / 2)) / 2;
        return { i: Math.round(i), j: Math.round(j) };
    }

    interactWith(object) {
        const kind = object.getData('kind');
        const name = object.getData('name') || 'Object';

        if (kind === 'house') {
            if (object.getData('searched')) {
                this.showMessage(`${name} has already been searched.`);
                return;
            }

            object.setData('searched', true);

            const table = LOOT_TABLES[name] || LOOT_TABLES['Abandoned House'];
            // Weight by map loot profile for cross-map consistency
            const profile = this.mapDef.lootProfile || {};
            let loot;
            if (Object.keys(profile).length > 0) {
                // Filter and weight loot table entries by profile
                const weighted = table.map(entry => {
                    let score = 1;
                    for (const [item, amount] of Object.entries(entry)) {
                        if (profile[item]) score *= profile[item];
                    }
                    return { entry, score };
                });
                const total = weighted.reduce((s, w) => s + w.score, 0);
                let r = Math.random() * total;
                for (const w of weighted) {
                    r -= w.score;
                    if (r <= 0) { loot = w.entry; break; }
                }
                if (!loot) loot = table[0];
            } else {
                loot = Phaser.Math.RND.pick(table);
            }

            for (const [item, amount] of Object.entries(loot)) {
                this.addItem(item, amount);
            }

            this.showMessage(`Searched ${name}. Supplies recovered!`);
            return;
        }

        if (kind === 'door') {
            this.setIndoorMode(false);
            this.showMessage('Exited the house.');
            return;
        }

        if (kind === 'workbench') {
            if (!this.workbenchDiscovered) {
                this.showMessage('You need to discover the workbench first. Look around inside.');
                return;
            }
            this.craftingOpen = true;
            this.craftingPanel.setVisible(true);
            this.showMessage('Workbench opened.');
            return;
        }

        if (kind === 'boatSite') {
            if (this.boatBuilt) {
                this.showMessage('The boat is already complete and ready to sail!');
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
            if (object.getData('harvested')) {
                this.showMessage('This tree has already been harvested.');
                return;
            }

            object.setData('harvested', true);
            const tile = this.playerTile();
            const zone = this.getZone(tile.i, tile.j);

            // Map-aware loot profile yields
            const profile = this.mapDef.lootProfile || {};
            let woodAmount = Math.max(1, Math.round(3 * (profile.wood || 1)));
            if (zone === 'woodland') woodAmount = Math.max(woodAmount, Math.round(4 * (profile.wood || 1)));
            else if (zone === 'overgrown') woodAmount = Math.max(woodAmount, Math.round(4 * (profile.wood || 1)));
            else if (zone === 'shore') woodAmount = Math.max(woodAmount, Math.round(2 * (profile.wood || 1)));

            const branchesAmount = Math.max(0, Math.round(2 * (profile.branches || 0)));
            const fibersAmount = Math.max(0, Math.round(1 * (profile.fibers || 0)));

            let result = this.addItem('wood', woodAmount);
            if (this.equipment.axe) {
                const ax = this.addItem('wood', 1);
                result.message += ' ';
            }
            if (branchesAmount > 0) {
                const br = this.addItem('branches', branchesAmount);
                result.message += br.message.replace('Added', 'And found');
            }
            if (fibersAmount > 0) {
                this.addItem('fibers', fibersAmount);
            }
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
        // DO015: Show stage availability feedback
        if (this.boatBuilt || this.boatStage >= BOAT_STAGES.length) {
            if (!this.boatBuilt) {
                const lastStage = BOAT_STAGES[BOAT_STAGES.length - 1];
                this.showMessage('The boat is already complete and ready to sail!');
            }
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