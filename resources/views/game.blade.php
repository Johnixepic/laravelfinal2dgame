<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
    <meta name="theme-color" content="#18343b">
    <title>THE LAST CONNECTION</title>
    @vite(['resources/css/app.css', 'resources/js/app.js'])

    <style>
        *, *::before, *::after { box-sizing: border-box; }

        html, body {
            width: 100%;
            height: 100%;
            min-height: 0;
            margin: 0;
            overflow: hidden;
            overscroll-behavior: none;
            background: #101b1d;
            color: #edf3e9;
            font-family: Arial, sans-serif;
        }

        body {
            display: flex;
            flex-direction: column;
            width: 100vw;
            height: 100vh;
            height: 100dvh;
            min-height: 0;
            touch-action: none;
        }

        /* The game is an edge-to-edge application, not a letterboxed 16:9 page. */
        .game-header, .game-footer { display: none !important; }

        main {
            position: fixed;
            inset: 0;
            width: 100vw;
            height: 100vh;
            height: 100dvh;
            min-width: 0;
            min-height: 0;
            padding: 0;
            margin: 0;
        }

        .game-frame {
            width: 100%;
            height: 100%;
            min-width: 0;
            min-height: 0;
            align-items: stretch;
            justify-content: stretch;
        }

        #game-container {
            position: absolute;
            inset: 0;
            flex: 1 1 auto;
            width: 100%;
            height: 100%;
            min-width: 0;
            min-height: 0;
            max-width: none;
            max-height: none;
            aspect-ratio: auto;
        }

        #game-container canvas {
            position: absolute;
            inset: 0;
            display: block;
            width: 100% !important;
            height: 100% !important;
            touch-action: none;
        }
        #game-container .game-dom-menu {
            position: absolute; inset: 0; z-index: 30000; pointer-events: none;
        }
        #game-container .game-dom-menu-button {
            pointer-events: auto;
            padding: 0;
            font-size: 0 !important;
            color: transparent !important;
            background: transparent;
        }
        #game-container .game-dom-menu-button:focus-visible {
            outline: 3px solid #f4d77b; outline-offset: 3px;
        }

        #game-container .game-tutorial-overlay {
            position: absolute;
            inset: 0;
            z-index: 40000;
            display: grid;
            place-items: center;
            overflow-y: auto;
            padding: max(18px, env(safe-area-inset-top)) 18px max(18px, env(safe-area-inset-bottom));
            background: rgba(5, 13, 10, 0.82);
            pointer-events: auto;
            touch-action: pan-y;
        }
        #game-container .game-tutorial-panel {
            width: min(660px, 100%);
            padding: clamp(22px, 4vw, 42px);
            border: 1px solid #718e68;
            border-radius: 14px;
            background: linear-gradient(145deg, #1b3326, #101f19);
            box-shadow: 0 24px 80px rgba(0, 0, 0, 0.55);
            color: #edf5e8;
        }
        #game-container .game-tutorial-eyebrow {
            margin-bottom: 14px;
            color: #b6cf8c;
            font-size: 12px;
            font-weight: 800;
            letter-spacing: 2px;
        }
        #game-container .game-tutorial-panel h2 {
            margin: 0 0 18px;
            color: #f2f6e9;
            font-size: clamp(22px, 4vw, 32px);
            line-height: 1.15;
        }
        #game-container .game-tutorial-panel p {
            margin: 0;
            color: #d0ddce;
            font-size: clamp(15px, 2vw, 18px);
            line-height: 1.65;
        }
        #game-container .game-tutorial-actions {
            display: flex;
            flex-wrap: wrap;
            justify-content: flex-end;
            gap: 10px;
            margin-top: 30px;
        }
        #game-container .game-tutorial-actions button {
            min-height: 46px;
            padding: 0 20px;
            border: 1px solid #819b75;
            border-radius: 6px;
            background: #263f2e;
            color: #edf5e8;
            font: 700 13px Arial, sans-serif;
            letter-spacing: 0.5px;
            cursor: pointer;
            touch-action: manipulation;
        }
        #game-container .game-tutorial-actions button:focus-visible {
            outline: 3px solid #f4d77b;
            outline-offset: 3px;
        }
        #game-container .game-tutorial-actions .game-tutorial-primary {
            border-color: #b5cf8d;
            background: #b5cf8d;
            color: #152318;
        }
        #game-container .game-tutorial-actions .game-tutorial-secondary {
            background: transparent;
            color: #d2dfcf;
        }
        @media (max-width: 520px) {
            #game-container .game-tutorial-actions {
                display: grid;
                grid-template-columns: 1fr 1fr;
            }
            #game-container .game-tutorial-actions .game-tutorial-primary {
                grid-column: 1 / -1;
                grid-row: 1;
            }
        }

        .game-header {
            flex: 0 0 auto;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
            padding: 12px 22px;
            background: #172527;
            border-bottom: 1px solid #344646;
        }

        .game-header h1 {
            margin: 0;
            font-size: 18px;
            letter-spacing: 2px;
        }

        .game-header p {
            margin: 5px 0 0;
            color: #aabbb0;
            font-size: 12px;
        }

        .game-status {
            color: #c7d9b7;
            font-size: 12px;
            text-align: right;
        }

        main { display: flex; }

.game-frame {
            flex: 1 1 auto;
            min-width: 0;
            min-height: 0;
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: stretch;
            justify-content: stretch;
            overflow: hidden;
            border: 0;
            border-radius: 0;
            background: #18343b;
        }

        #game-container {
            position: absolute;
            inset: 0;
            flex: 1 1 auto;
            min-width: 0;
            min-height: 0;
            width: 100%;
            height: 100%;
            max-width: none;
            max-height: none;
            aspect-ratio: auto;
            overflow: hidden;
        }

        /* Keep the visible canvas exactly aligned with Phaser's measured parent.
           The game and parent are both 16:9, so this does not distort the render. */
        #game-container canvas {
            position: absolute;
            inset: 0;
            display: block;
            width: 100%;
            height: 100%;
            touch-action: none;
        }

        .game-footer {
            flex: 0 0 auto;
            display: flex;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 8px 16px;
            padding: 8px 16px;
            background: #172527;
            border-top: 1px solid #344646;
            color: #afc0b4;
            font-size: 12px;
        }

        @media (max-width: 900px), (max-height: 620px), (pointer: coarse) {
            .game-header {
                flex: 0 0 auto;
                min-height: 38px;
                padding: calc(6px + env(safe-area-inset-top)) 12px 6px;
                gap: 8px;
            }
            .game-header h1 { font-size: 12px; letter-spacing: 1px; }
            .game-header p, .game-status, .game-footer { display: none; }
            main {
                flex: 1 1 auto;
                min-height: 0;
                padding: 0 0 env(safe-area-inset-bottom);
            }
            .game-frame { align-items: stretch; justify-content: stretch; }
            #game-container {
                flex: 1 1 auto;
                width: 100%;
                height: 100%;
                max-height: none;
                aspect-ratio: auto;
            }
            #game-container canvas { width: 100%; height: 100%; }
        }

        /* A portrait phone cannot display the full game layout reliably.
           Ask the player to rotate instead of showing a blank/cropped canvas. */
        .rotate-device-notice {
            display: none;
            position: fixed;
            inset: 0;
            z-index: 50000;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            gap: 16px;
            padding: 32px;
            text-align: center;
            background: #101b1d;
            color: #edf3e9;
        }
        .rotate-device-notice .rotate-icon { font-size: 64px; line-height: 1; }
        .rotate-device-notice h2 { margin: 0; font-size: 22px; letter-spacing: 1px; }
        .rotate-device-notice p { max-width: 300px; margin: 0; color: #b8c9bb; line-height: 1.5; }

        @media (pointer: coarse) and (orientation: portrait) {
            #game-container { visibility: hidden; }
            .rotate-device-notice { display: flex; }
        }

        @media (orientation: landscape) and (max-height: 500px) {
            .game-header { min-height: 30px; padding-top: 4px; padding-bottom: 4px; }
            .game-header h1 { font-size: 11px; }
        }
    </style>
</head>
<body>
    <header class="game-header">
        <div>
            <h1>THE LAST CONNECTION</h1>
            <p>A survival story begins at home.</p>
        </div>
        <div class="game-status">THE LAST CONNECTION<br>Explore · Craft · Escape</div>
    </header>

    <main>
        <section class="game-frame" aria-label="Game area">
            <div id="game-container"></div>
            <div class="rotate-device-notice" role="status" aria-live="polite">
                <div class="rotate-icon" aria-hidden="true">↻</div>
                <h2>ROTATE YOUR PHONE</h2>
                <p>THE LAST CONNECTION is designed for landscape play. Turn your phone sideways to start playing.</p>
            </div>
            <div class="game-footer">
                <span>WASD / Arrow keys — Move</span>
                <span>E — Interact  ·  I — Inventory  ·  F — Eat food  ·  ESC — Pause / close panels</span>
                <span>5-map journey: Home Island → Abandoned Settlement → Industrial Ruins → Deep Wilderness → Coastal Escape (build boat here)</span>
            </div>
        </section>
    </main>
</body>
</html>
