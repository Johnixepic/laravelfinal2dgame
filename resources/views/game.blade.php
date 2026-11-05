<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
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
            background: #101b1d;
            color: #edf3e9;
            font-family: Arial, sans-serif;
        }

        body {
            display: flex;
            flex-direction: column;
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
            overflow: hidden;
            border: 0;
            border-radius: 0;
            background: #18343b;
        }

        #game-container {
            flex: 1 1 auto;
            min-width: 0;
            min-height: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
        }

        #game-container canvas {
            display: block;
            width: 100% !important;
            height: 100% !important;
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

        @media (max-width: 600px) {
            .game-header { padding: 8px 12px; }
            .game-header h1 { font-size: 14px; }
            .game-footer { padding: 6px 10px; font-size: 10px; }
        }
    </style>
</head>
<body>
    <header class="game-header">
        <div>
            <h1>THE LAST CONNECTION</h1>
            <p>A survival story begins at home.</p>
        </div>
        <div class="game-status">FINAL BUILD<br>v1.0 — THE LAST CONNECTION</div>
    </header>

    <main>
        <section class="game-frame" aria-label="Game area">
            <div id="game-container"></div>
            <div class="game-footer">
                <span>WASD / Arrow keys — Move</span>
                <span>E — Interact  ·  ESC — Close panels</span>
                <span>5-map journey: Home Island → Abandoned Settlement → Industrial Ruins → Deep Wilderness → Coastal Escape (build boat here)</span>
            </div>
        </section>
    </main>
</body>
</html>
