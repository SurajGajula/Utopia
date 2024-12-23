import { Character, storeBattle, storeExp } from '/Scripts/character.js';
let hbar1, hbar2, hbar3, hbar4;
let char1, char2, char3, char4;
let count, combo, turn;
let comboDisplay, turnDisplay;
export async function startBattle(enemy) {
    const healthBars = Array.from(document.querySelectorAll('.health-bar'));
    [hbar1, hbar2, hbar3, hbar4] = healthBars;
    healthBars.forEach(bar => {
        bar.style.width = '100%';
    });
    try {
        char1 = await Character.loadFromDb('Ally1');
        char2 = await Character.loadFromDb('Ally2');
        char3 = await Character.loadFromDb('Ally3');
        char4 = await Character.loadFromDb(enemy);
        const enemyImage = document.querySelector('#Enemy img');
        enemyImage.src = `Sprites/${enemy}.svg`;
    } catch (err) {
        console.error(err);
    }
    comboDisplay = document.createElement('div');
    turnDisplay = document.createElement('div');
    comboDisplay.textContent = `Combo: ${combo}`;
    turnDisplay.textContent = `Turn: ${turn}`;
    const infoDiv = document.getElementById('Info');
    infoDiv.innerHTML = '';
    infoDiv.appendChild(comboDisplay);
    infoDiv.appendChild(turnDisplay);
    count = 0;
    combo = 0;
    turn = 0;
    updateDisplays();
}
async function endBattle(result) {
    if (result) {
        await Promise.all([
            storeBattle(),
            storeExp()
        ]);
    }
    document.getElementById('BattleUI').classList.add('hidden');
    document.getElementById('MenuUI').classList.remove('hidden');
}
export function damage(index, target) {
    const targetBar = [hbar1, hbar2, hbar3, hbar4][target];
    const indexChar = [char1, char2, char3, char4][index];
    const targetChar = [char1, char2, char3, char4][target];
    let damageAmount = indexChar.attack;
    targetChar.health -= damageAmount;
    spawnDamageNumber(target, damageAmount);
    combo += 10;
    updateDisplays();
    targetBar.style.width = (targetChar.health / targetChar.max) * 100 + '%';
    if (char4.health <= 0) {
        return endBattle(true);
    }
    if ([char1, char2, char3].some(char => char.health <= 0)) {
        return endBattle(false);
    }
    count += 1;
    if (count == 3) {
        document.getElementById('Skills').classList.add('hidden');
        eSkill();
    }
}
export function pSkill(index) {
    damage(index, 3);
}
function eSkill() {
    const target = Math.floor(Math.random() * 3);
    const skill = Math.floor(Math.random() * 3);
    damage(3, target, skill);
    count = 0;
    turn += 1;
    updateDisplays();
    document.getElementById('Skills').classList.remove('hidden');
}
function spawnDamageNumber(target, damageAmount) {
    const elementId = target != 3 ? `Ally${target + 1}` : 'Enemy';
    const targetElement = document.querySelector(`#${elementId}`);
    if (!targetElement) return;
    const damageElement = document.createElement('div');
    damageElement.className = 'damage-number';
    damageElement.textContent = damageAmount;
    if (target === 3) {
        damageElement.style.fontSize = '48px';
    }
    const rect = targetElement.getBoundingClientRect();
    damageElement.style.position = 'absolute';
    if (target != 3) {
        damageElement.style.left = `${rect.left + 25}px`;
        damageElement.style.top = `${rect.top}px`;
    } else {
        damageElement.style.left = `${rect.right - 125}px`;
        damageElement.style.top = `${rect.top + 50}px`;
    }
    document.body.appendChild(damageElement);
    requestAnimationFrame(() => {
        damageElement.style.transform = 'translateY(-50px)';
        damageElement.style.opacity = '0';
    });
    setTimeout(() => {
        document.body.removeChild(damageElement);
    }, 1000);
}
function updateDisplays() {
    if (comboDisplay && turnDisplay) {
        comboDisplay.textContent = `Combo: ${combo}`;
        turnDisplay.textContent = `Turn: ${turn}`;
    }
}