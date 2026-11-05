from pathlib import Path

path = Path("resources/js/app.js")
source = path.read_text()

def replace_once(old, new, label):
    global source
    count = source.count(old)
    if count != 1:
        raise SystemExit(
            f"STOP: Expected exactly one match for {label}, found {count}. "
            "No file was written."
        )
    source = source.replace(old, new, 1)

# Add the workbench texture after the tree texture.
replace_once(
"""        tree.generateTexture('tree', 42, 54);
        tree.destroy();

        const playerTexture""",
"""        tree.generateTexture('tree', 42, 54);
        tree.destroy();

        const bench = this.make.graphics({ x: 0, y: 0, add: false });

        bench.fillStyle(0x443324);
        bench.fillRect(5, 23, 46, 9);
        bench.fillStyle(0x8a6039);
        bench.fillRect(8, 10, 40, 15);
        bench.fillStyle(0x5d4028);
        bench.fillRect(11, 25, 5, 18);
        bench.fillRect(40, 25, 5, 18);
        bench.fillStyle(0xc0a071);
        bench.fillRect(13, 13, 30, 3);

        bench.generateTexture('workbench', 56, 46);
        bench.destroy();

        const playerTexture""",
"workbench texture"
)

# Place the workbench in the obstacle group.
replace_once(
"""        const trees = [
            [5, 8], [7, 7], [6, 11], [8, 19],""",
"""        const benchPosition = this.tilePosition(16, 18);
        const workbench = this.obstacles.create(
            benchPosition.x,
            benchPosition.y - 12,
            'workbench'
        );

        workbench.setDepth(workbench.y);
        workbench.refreshBody();
        workbench.setData('name', 'Workbench');
        workbench.setData('kind', 'workbench');

        const trees = [
            [5, 8], [7, 7], [6, 11], [8, 19],""",
"workbench placement"
)

# Add Esc and a separate crafting toggle key.
replace_once(
"""            E: Phaser.Input.Keyboard.KeyCodes.E,
        });""",
"""            E: Phaser.Input.Keyboard.KeyCodes.E,
            ESC: Phaser.Input.Keyboard.KeyCodes.ESC,
        });""",
"Escape key"
)

# Add a basic hidden crafting panel after inventory HUD creation.
replace_once(
"""        this.messageText.setVisible(false);
        this.refreshInventoryUI();""",
"""        this.messageText.setVisible(false);

        this.craftingPanel = this.add.container(480, 270);
        this.craftingPanel.setScrollFactor(0);
        this.craftingPanel.setDepth(3000);

        const panelBackground = this.add.rectangle(
            0, 0, 390, 220, 0x14251f, 0.97
        ).setStrokeStyle(2, 0x9bb58b);

        const panelTitle = this.add.text(
            0, -78, 'WORKBENCH',
            {
                fontFamily: 'sans-serif',
                fontSize: '22px',
                fontStyle: 'bold',
                color: '#e2f0d8',
            }
        ).setOrigin(0.5);

        const panelInstructions = this.add.text(
            0, -20,
            'Crafting recipes will be added next.\\n\\nPress ESC to close.',
            {
                fontFamily: 'sans-serif',
                fontSize: '15px',
                color: '#ffffff',
                align: 'center',
                lineSpacing: 8,
            }
        ).setOrigin(0.5);

        this.craftingPanel.add([
            panelBackground,
            panelTitle,
            panelInstructions,
        ]);
        this.craftingPanel.setVisible(false);
        this.craftingOpen = false;

        this.refreshInventoryUI();""",
"crafting panel"
)

# Add workbench interaction without treating it as a tree.
replace_once(
"""        if (kind === 'tree') {
            if (object.getData('harvested')) {""",
"""        if (kind === 'workbench') {
            this.craftingOpen = true;
            this.craftingPanel.setVisible(true);
            this.showMessage('Workbench opened.');
            return;
        }

        if (kind === 'tree') {
            if (object.getData('harvested')) {""",
"workbench interaction"
)

# Handle the workbench prompt and open/close keys.
replace_once(
"""        if (this.nearbyObject) {
            const kind = this.nearbyObject.getData('kind');
            const name = this.nearbyObject.getData('name') || 'Object';
            const alreadyUsed = kind === 'house'
                ? this.nearbyObject.getData('searched')
                : this.nearbyObject.getData('harvested');

            let action = kind === 'house' ? 'Search' : 'Gather wood';

            if (alreadyUsed) {
                action = kind === 'house' ? 'Already searched' : 'Already harvested';
            }

            this.interactionPrompt.setText(
                alreadyUsed ? `${name} — ${action}` : `E — ${action}: ${name}`
            );
            this.interactionPrompt.setVisible(true);
        } else {
            this.interactionPrompt.setVisible(false);
        }

        const interactionDown = this.keys.E.isDown;

        if (interactionDown && !this.interactionWasDown && this.nearbyObject) {
            this.interactWith(this.nearbyObject);
        }

        this.interactionWasDown = interactionDown;""",
"""        if (this.keys.ESC.isDown && !this.escapeWasDown) {
            if (this.craftingOpen) {
                this.craftingOpen = false;
                this.craftingPanel.setVisible(false);
            }
        }
        this.escapeWasDown = this.keys.ESC.isDown;

        if (this.craftingOpen) {
            this.interactionPrompt.setVisible(false);
        } else if (this.nearbyObject) {
            const kind = this.nearbyObject.getData('kind');
            const name = this.nearbyObject.getData('name') || 'Object';

            if (kind === 'workbench') {
                this.interactionPrompt.setText(`E — Craft items: ${name}`);
            } else {
                const alreadyUsed = kind === 'house'
                    ? this.nearbyObject.getData('searched')
                    : this.nearbyObject.getData('harvested');

                let action = kind === 'house' ? 'Search' : 'Gather wood';

                if (alreadyUsed) {
                    action = kind === 'house'
                        ? 'Already searched'
                        : 'Already harvested';
                }

                this.interactionPrompt.setText(
                    alreadyUsed
                        ? `${name} — ${action}`
                        : `E — ${action}: ${name}`
                );
            }

            this.interactionPrompt.setVisible(true);
        } else {
            this.interactionPrompt.setVisible(false);
        }

        const interactionDown = this.keys.E.isDown;

        if (
            !this.craftingOpen &&
            interactionDown &&
            !this.interactionWasDown &&
            this.nearbyObject
        ) {
            this.interactWith(this.nearbyObject);
        }

        this.interactionWasDown = interactionDown;""",
"interaction prompt and toggle"
)

path.write_text(source)
print("Patch applied successfully.")
