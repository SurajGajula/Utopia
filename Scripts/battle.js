import { Character, storeBattle, storeExp } from '/Scripts/character.js'; 
let hbar1, hbar2, hbar3, hbar4;
let char1, char2, char3, char4;
let redirect = [0, 0, 0, 0];
let corrosion = [0, 0, 0, 0];
let vulnerability = [0, 0, 0, 0];
let cur;
export let count;
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
    cur = 0;
    count = 0;
}
async function endBattle(result) {
    if(result) {
        await Promise.all([
            storeBattle(),
            storeExp()
        ]);
    }
    document.getElementById('BattleUI').classList.add('hidden');
    document.getElementById('MenuUI').classList.remove('hidden');
}
export function damage(index, target, skill) {
    const targetBar = [hbar1, hbar2, hbar3, hbar4][target];
    const indexBar = [hbar1, hbar2, hbar3, hbar4][index];
    const indexChar = [char1, char2, char3, char4][index];
    const targetChar = [char1, char2, char3, char4][target];
    if (corrosion[index] > 0) {
        indexChar.health -= 10 % corrosion[index];
        spawnDamageNumber(index, 10 % corrosion[index]);
        indexBar.style.width = (indexChar.health/indexChar.max) * 100 + '%';
        corrosion[index] -= 1;
        if (corrosion[index] % 10 == 0) {
            corrosion[index] = 0;
        }
    }
    if (redirect[index] > 0) {
        redirect[index] -= indexChar.attack;
        spawnDamageNumber(target, indexChar.attack);
        if (redirect[index] <= 0) {
            redirect[index] = 0;
        }
        return;
    }
    if (vulnerability[target] > 0) {
        targetChar.health -= indexChar.attack * 2;
        spawnDamageNumber(target, indexChar.attack * 2);
        vulnerability[target] = 0;
    }
    else {
        targetChar.health -= indexChar.attack;
        spawnDamageNumber(target, indexChar.attack);
    }
    targetBar.style.width = (targetChar.health/targetChar.max) * 100 + '%';
    if (indexChar.skillstatuses[skill] == 'Redirect') {
        redirect[target] = indexChar.attack;
    }
    if (indexChar.skillstatuses[skill] == 'Corrosion') {
        corrosion[target] = indexChar.attack + 3;
    }
    if (indexChar.skillstatuses[skill] == 'Vulnerability') {
        vulnerability[target] = 1;
    }
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
    damage(cur, 3, index);
}
function eSkill() {
    const target = Math.floor(Math.random() * 3);
    const skill = Math.floor(Math.random() * 3);
    damage(3, target, skill);
    count = 0;
    document.getElementById('Skills').classList.remove('hidden');
}
export function setCur(value) {
    cur = value;
}
function spawnDamageNumber(target, damageAmount) {
    const elementId = target >= 0 && target <= 2 ? `Ally${target + 1}` : 'Enemy';
    const targetElement = document.querySelector(`#${elementId}`);
    if (!targetElement) return;
    const damageElement = document.createElement('div');
    damageElement.className = 'damage-number';
    damageElement.textContent = damageAmount;
    const rect = targetElement.getBoundingClientRect();
    damageElement.style.position = 'absolute';
    if (target >= 0 && target <= 2) {
        damageElement.style.left = `${rect.left}px`;
        damageElement.style.top = `${rect.top}px`;
    } else {
        damageElement.style.left = `${rect.right - 50}px`;
        damageElement.style.top = `${rect.top}px`;
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
