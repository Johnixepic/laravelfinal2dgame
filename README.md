# THE LAST CONNECTION

A 2D exploration and crafting game built with Phaser.js and Laravel.

## Overview

You wake up on a small island with nothing but the clothes on your back. Search your home, gather resources, discover a workbench, craft tools, and repair a boat across four stages — then sail to escape.

**Genre**: 2D survival/crafting exploration
**Canvas**: 960x600 (responsive)
**Maps**: 5 connected island maps with eastward progression
**Win Condition**: Build a boat through 4 stages, reach the eastern coast (MAP5), and sail away

## Quick Start

### Prerequisites
- Node.js 18+
- PHP 8.1+
- Composer
- npm

### Install & Build
```
cd 2DGame
composer install
npm install
npm run build
```

### Run Development Server
```
php artisan serve
```
Open http://localhost:8000/ in a browser.

### Production Build
```
npm run build
php artisan optimize
```

## Controls

| Key | Action |
|-----|--------|
| WASD / Arrow Keys | Move |
| E | Interact (search, gather, craft, build boat) |
| I | Toggle inventory side panel |
| ESC | Close crafting panel / exit indoor mode |
| R (after win) | Restart game |

## Gameplay

1. Search your home — find initial supplies (wood, cloth, food)
2. Explore the island — walk east to discover new maps and resources
3. Find a workbench — enter the Old Store on MAP2 to discover one
4. Craft tools — use the workbench to craft the reusable Saw, Hammer, Crowbar, and Screwdriver
5. Gather resources — the Saw is required to cut trees; search buildings across MAP2–MAP4 for guaranteed minimum construction supplies
6. Build the boat — craft all four tools first, then visit the boat site on MAP5 and complete all 4 stages:
   - Stage 1: Hull — 12 wood
   - Stage 2: Reinforcement — 6 scrap + 4 wood
   - Stage 3: Rigging — 5 rope
   - Stage 4: Sail — 6 cloth
7. Sail away — after all four stages are complete, press E again at the boat on MAP5 to trigger the ending cinematic

## Maps

| Map | Name | Theme | Key Resources |
|-----|------|-------|---------------|
| MAP1 | Home Island | Verdant woodland | Wood, rope, cloth, food |
| MAP2 | Abandoned Settlement | Desolate gray-brown | Scrap, rope, cloth |
| MAP3 | Industrial Ruins | Steely gray | Scrap, fasteners, machinery_salvage |
| MAP4 | Deep Wilderness | Dark forest green | Plant fibers, wood |
| MAP5 | Coastal Escape | Shoreline green | Driftwood, cloth |

## Project Structure

```
2DGame/
  resources/
    js/
      app.js              # Main Phaser game
    views/
      game.blade.php      # Laravel view (header + canvas + footer)
  public/build/           # Vite compiled assets
  DDO-*.txt               # Development Order logs (iteration history)
  DO008_REPORT.md         # Feature-specific reports
  validate-game.js        # Automated verification script
```

## Game Architecture

### Core Systems
- **GameState** — Persistent state across map transitions (inventory, four reusable tools, boatStage, boatBuilt, workbenchDiscovered)
- **MAPS** — 5 map definitions with terrain colors, exits, and fog margins
- **ITEM_DEFS** — 12 item definitions with name, limit, description, and category
- **RECIPES** — Crafting recipes with ingredient requirements and workbench gating
- **BOAT_STAGES** — 4 boat construction stages with resource costs
- **LOOT_TABLES** — Per-building loot tables defining what items can be searched

### Coordinate System
- Isometric projection with TILE_W = 64 and TILE_H = 32
- Tile positions use {i, j} grid coordinates
- Pixel-to-tile conversion handled by pixelToTile() / tilePosition()

### State Persistence
- GameState object persists across map transitions and scene restarts
- Indoor workbench discovery (workbenchDiscovered) is cross-map persistent
- Full game reset via restartGame() on win/restart

## Development Notes

- All game logic lives in resources/js/app.js
- Map definitions, item data, and recipes are top-level constants for easy editing
- DDO files track the development history; see DDO-021 for the latest architecture summary
- The game has no audio, no mobile touch controls, and no server-side save (by design for demo scope)

## License

MIT
