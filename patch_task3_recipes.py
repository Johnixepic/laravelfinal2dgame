#!/usr/bin/env python3
"""TLC-005G: Add recipe system to workbench crafting panel."""

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


# 1. Add RECIPES constant after ITEM_DEFS
replace_once(
"""const ITEM_DEFS = {
    wood:   { name: 'Wood',       limit: 30, desc: 'Basic building material.' },
    scrap:  { name: 'Scrap Metal', limit: 20, desc: 'Tool components and upgrades.' },
    rope:   { name: 'Rope',       limit: 10, desc: 'Crafting and boat construction.' },
    cloth:  { name: 'Cloth',      limit: 10, desc: 'Sails and repairs.' },
    food:   { name: 'Food',       limit: 10, desc: 'Future survival mechanic.' },
};""",
"""const ITEM_DEFS = {
    wood:   { name: 'Wood',       limit: 30, desc: 'Basic building material.' },
    scrap:  { name: 'Scrap Metal', limit: 20, desc: 'Tool components and upgrades.' },
    rope:   { name: 'Rope',       limit: 10, desc: 'Crafting and boat construction.' },
    cloth:  { name: 'Cloth',      limit: 10, desc: 'Sails and repairs.' },
    food:   { name: 'Food',       limit: 10, desc: 'Future survival mechanic.' },
};

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
];""",
"RECIPES constant"
)

# 2. Add equipment tracking to createInteractionSystem()
replace_once(
"""        this.interactionRange = 82;
        this.inventory = { wood: 0, scrap: 0, rope: 0, cloth: 0, food: 0 };

        this.nearbyObject = null;""",
"""        this.interactionRange = 82;
        this.inventory = { wood: 0, scrap: 0, rope: 0, cloth: 0, food: 0 };
        this.equipment = { axe: false, gatheringTool: false };

        this.nearbyObject = null;""",
"equipment tracking"
)

# 3. Replace placeholder panel with recipe UI
replace_once(
"""        const panelInstructions = this.add.text(
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
        ]);""",
"""        const recipeScrollArea = this.add.container(0, -10);

        this.recipeCards = [];
        let cardY = 0;

        for (const recipe of RECIPES) {
            const card = this.add.container(0, cardY);
            card.setStrokeStyle(1, 0x5a7a52);

            const cardBg = this.add.rectangle(0, 0, 370, 48, 0x1a2e1d, 0.95);
            card.add(cardBg);

            const canCraft = Object.entries(recipe.ingredients).every(
                ([key, amount]) => this.hasItem(key, amount)
            );

            const nameText = this.add.text(-175, -12, recipe.name, {
                fontFamily: 'sans-serif',
                fontSize: '14px',
                fontStyle: 'bold',
                color: canCraft ? '#e2f0d8' : '#7a8a72',
            });
            card.add(nameText);

            const ingredientText = this.add.text(-175, 6,
                Object.entries(recipe.ingredients).map(
                    ([k, a]) => `${ITEM_DEFS[k].name}: ${a}`
                ).join('  |  '),
                {
                    fontFamily: 'sans-serif',
                    fontSize: '11px',
                    color: canCraft ? '#c8dcc0' : '#5a6a52',
                }
            );
            card.add(ingredientText);

            const descText = this.add.text(175, -4, recipe.desc, {
                fontFamily: 'sans-serif',
                fontSize: '10px',
                color: canCraft ? '#a8c0a0' : '#4a5a42',
                align: 'right',
                wordWrap: { width: 170 },
            });
            card.add(descText);

            card.setStrokeStyle(1, canCraft ? 0x9bb58b : 0x3a4a32);
            card.setInteractive();
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

        this.craftingPanel.add([panelBackground, panelTitle, recipeScrollArea]);""",
"recipe UI"
)

# 4. Add craftRecipe method before refreshInventoryUI
replace_once(
"""    refreshInventoryUI() {""",
"""    craftRecipe(recipe) {
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

            const [nameText] = card.getChildren().filter(c => c.text === recipe.name);
            const [ingredientText] = card.getChildren().filter(c =>
                c.text.includes(ITEM_DEFS[Object.keys(recipe.ingredients)[0]]?.name || '')
            );
            if (nameText) {
                nameText.setColor(canCraft ? '#e2f0d8' : '#7a8a72');
            }
            if (ingredientText) {
                ingredientText.setColor(canCraft ? '#c8dcc0' : '#5a6a52');
            }
        }
    }

    refreshInventoryUI() {""",
"craftRecipe method"
)

# 5. Update update() to handle crafting panel interactions
replace_once(
"""        this.escapeWasDown = this.keys.ESC.isDown;

        if (this.craftingOpen) {""",
"""        this.escapeWasDown = this.keys.ESC.isDown;

        // Handle crafting key when panel is open
        if (this.craftingOpen && this.keys.E.isDown && !this.interactionWasDown) {
            const nearby = this.findNearbyObject();
            if (nearby && nearby.getData('kind') === 'workbench') {
                const firstAffordable = RECIPES.find(r =>
                    Object.entries(r.ingredients).every(
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

        if (this.craftingOpen) {""",
"crafting key handling in update"
)

path.write_text(source)
print("Recipe system patch applied successfully.")
