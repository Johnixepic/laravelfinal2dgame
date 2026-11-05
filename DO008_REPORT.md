DO008 COMPLETE — House Interior and Workbench Discovery

CHANGES TO resources/js/app.js:
1. Added workbenchDiscovered: false to GameState
2. Removed outdoor workbench from MAP_OBSTACLES.MAP1 (tile 16,18)
3. Added INDOOR_MAP constant — 5x4 indoor grid with walls, door, workbench
4. Added indoorTilePosition() helper for indoor world coordinates
5. Created indoor_floor and indoor_wall bitmap textures
6. Added createIndoorObjects() — builds wall obstacles, workbench sprite, door sprite, floor graphics
7. Added destroyIndoorObjects() cleanup
8. Added setIndoorMode(enabled) — toggles mode, repositions player, adjusts camera zoom (2x in / 1.5x out)
9. Modified interactWith(): door exits house; workbench gated behind workbenchDiscovered flag
10. Modified update(): enter-house on E near Your Home; discovery trigger at workbench; prompt updates for door/discovery
11. Synced GameState.workbenchDiscovered in transitionToMap()

VERIFICATION:
- npm run build passes (return code 0)
- Node syntax check passes
- Brace balance: 430/430
- All 7 flow checks pass (enter, discover, gate, craft, exit, persist, no outdoor workbench)
- Backup preserved at app.js.bak

TESTING:
http://localhost:8000/ — navigate to Your Home at tile (13,13), press E to enter, walk to workbench and press E to discover it, then press E again to open crafting. Press E at the door to exit.