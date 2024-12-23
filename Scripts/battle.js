import { Character, storeBattle, storeExp } from '/Scripts/character.js';
let hbar1, hbar2, hbar3, hbar4;
let char1, char2, char3, char4;
let count, combo;
let comboDisplay;
let skilllevels;
export async function startBattle(enemy) {
    const healthBars = Array.from(document.querySelectorAll('.health-bar'));
    [hbar3, hbar2, hbar1, hbar4] = healthBars;
    healthBars.forEach(bar => {
        bar.style.width = '100%';
    });
    try {
        [char1, char2, char3, char4] = await Promise.all([
            Character.loadAlly(0),
            Character.loadAlly(1),
            Character.loadAlly(2),
            Character.loadEnemy(enemy)
        ]);
        const enemyImage = document.querySelector('#Enemy img');
        enemyImage.src = `Sprites/${enemy}.svg`;
    } catch (err) {
        console.error(err);
    }
    comboDisplay = document.createElement('div');
    comboDisplay.textContent = `Combo: ${combo}`;
    const infoDiv = document.getElementById('Info');
    infoDiv.innerHTML = '';
    infoDiv.appendChild(comboDisplay);
    count = 0;
    combo = 0;
    skilllevels = [0, 0, 0];
    displayCombo();
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
export async function damage(index, target) {
    const targetBar = [hbar1, hbar2, hbar3, hbar4][target];
    const indexChar = [char1, char2, char3, char4][index];
    const targetChar = [char1, char2, char3, char4][target];
    let hits = 1;
    let damageAmount = indexChar.attack;
    let comboAmount = 10;
    if (index != 3) {
        if (combo >= 100 && skilllevels[index] == 1) {
            skilllevels[index] += 1;
            combo -= 100;
            hits = indexChar.skillplus[0];
            damageAmount *= indexChar.skillplus[1];
            comboAmount *= indexChar.skillplus[2];  
        }
        else if (combo >= 1000 && skilllevels[index] == 2) {
            combo -= 1000;
            hits = indexChar.skillplusplus[0];
        }
        else if (skilllevels[index] == 0) {
            skilllevels[index] += 1;
        }
    }
    document.getElementById('Skills').classList.add('hidden');
    for (let i = 0; i < hits; i++) {
        targetChar.health -= damageAmount;
        spawnDamageNumber(target, damageAmount);
        targetBar.style.width = (targetChar.health / targetChar.max) * 100 + '%';
        combo += comboAmount;
        displayCombo();
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    if (index != 3) {
        if (combo >= 100 && skilllevels[index] == 1) {
            displayUpgrade(index);
        }
        else if (combo >= 1000 && skilllevels[index] == 2) {
            displayUpgrade(index);
        }
        else {
            skilllevels[index] = 0;
            displayUpgrade(index);
        }
    }
    if (char4.health <= 0) {
        return endBattle(true);
    }
    if ([char1, char2, char3].some(char => char.health <= 0)) {
        return endBattle(false);
    }
    count += 1;
    if (count == 3) {
        eSkill();
    }
    else {
        document.getElementById('Skills').classList.remove('hidden');
    }
}
export async function pSkill(index) {
    await damage(index, 3);
}
async function eSkill() {
    const target = Math.floor(Math.random() * 3);
    const skill = Math.floor(Math.random() * 3);
    await damage(3, target, skill);
    count = 0;
    displayCombo();
    document.getElementById('Skills').classList.remove('hidden');
    skilllevels = [0, 0, 0];
    displayUpgrade(0);
    displayUpgrade(1);
    displayUpgrade(2);
}
function spawnDamageNumber(target, damageAmount) {
    const elementId = target != 3 ? `Ally${target + 1}` : 'Enemy';
    const targetElement = document.querySelector(`#${elementId}`);
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
function displayCombo() {
    comboDisplay.textContent = `Combo: ${combo}`;
}
function displayUpgrade(index) {
    const skillBtn = document.getElementById(`skill${index + 1}`);
    if (skilllevels[index] != 0) {
        skillBtn.textContent += '+';
    } else {
        skillBtn.textContent = skillBtn.textContent.replace(/\+/g, '');
    }
}