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
            height: 100dvh;
            touch-action: none;
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

        main {
            flex: 1 1 auto;
            min-width: 0;
            min-height: 0;
            display: flex;
            padding: 0;
        }

        .game-frame {
            flex: 1 1 auto;
            min-width: 0;
            min-height: 0;
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            overflow: hidden;
            border: 0;
            border-radius: 0;
            background: #18343b;
        }

        #game-container {
            position: relative;
            flex: 0 1 auto;
            min-width: 0;
            min-height: 0;
            width: min(100%, calc((100dvh - 110px) * 16 / 9));
            height: auto;
            max-height: 100%;
            aspect-ratio: 16 / 9;
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
            <div class="game-footer">
                <span>WASD / Arrow keys — Move</span>
                <span>E — Interact  ·  I — Inventory  ·  F — Eat food  ·  ESC — Pause / close panels</span>
                <span>5-map journey: Home Island → Abandoned Settlement → Industrial Ruins → Deep Wilderness → Coastal Escape (build boat here)</span>
            </div>
        </section>
    </main>
</body>
</html>
