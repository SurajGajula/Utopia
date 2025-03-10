import { Character, storeExp } from '/character.js';
let hbar1, hbar2, hbar3, hbar4;
let char1, char2, char3, char4;
let bbar1, bbar2, bbar3, bbar4;
let count, combo;
let comboDisplay;
let skilllevels;
export async function startBattle(enemy) {
    const healthBars = Array.from(document.querySelectorAll('.health-bar'));
    [hbar1, hbar2, hbar3, hbar4] = healthBars;
    const blockBars = Array.from(document.querySelectorAll('.block-bar'));
    [bbar1, bbar2, bbar3, bbar4] = blockBars;
    healthBars.forEach(bar => {
        bar.style.width = '100%';
    });
    blockBars.forEach(bar => {
        bar.style.width = '0%';
    });
    try {
        [char1, char2, char3, char4] = await Promise.all([
            Character.loadAlly(0),
            Character.loadAlly(1),
            Character.loadAlly(2),
            Character.loadEnemy(enemy)
        ]);
        for (let i = 1; i <= 3; i++) {
            document.querySelector(`#skill${i}`).textContent = [char1, char2, char3][i - 1].skillname;
        }
        document.querySelector('#Enemy img').src = `${window.CLOUDFRONT_URL}/${char4.name}`;
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
        await storeExp();
    }
    document.getElementById('BattleUI').classList.add('hidden');
    document.getElementById('MenuUI').classList.remove('hidden');
}
export async function damage(index, target) {
    const indexChar = [char1, char2, char3, char4][index];
    const indexBBar = [bbar1, bbar2, bbar3, bbar4][index];
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
            indexChar.block = Math.min(indexChar.maxblock, indexChar.block + (indexChar.skillplus[3] * indexChar.attack));
            indexBBar.style.width = (indexChar.block / indexChar.maxblock) * 100 + '%';
        }
        else if (combo >= 1000 && skilllevels[index] == 2) {
            combo -= 1000;
            hits = indexChar.skillplusplus[0];
        }
        else if (skilllevels[index] == 0) {
            skilllevels[index] += 1;
        }
    }
    else {
        if (count % 9 === 6) {
            hits = indexChar.skillplus[0];
            damageAmount *= indexChar.skillplus[1];
            comboAmount *= indexChar.skillplus[2];
        } 
        else if (count % 9 === 0) {
            hits = indexChar.skillplusplus[0];
            damageAmount *= indexChar.skillplusplus[1];
            comboAmount *= indexChar.skillplusplus[2];
        }
        count -= 1;
    }
    document.getElementById('Skills').classList.add('hidden');
    for (let i = 0; i < hits; i++) {
        calcDamage(target, damageAmount);
        spawnDamageNumber(target, damageAmount);
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
    if (count % 3 == 0 && index != 3) {
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
    displayCombo();
    document.getElementById('Skills').classList.remove('hidden');
    skilllevels = [0, 0, 0];
    displayUpgrade(0);
    displayUpgrade(1);
    displayUpgrade(2);
}
function spawnDamageNumber(target, damageAmount) {
    const targetElement = document.querySelector(`#Enemy`);
    const damageElement = document.createElement('div');
    damageElement.className = 'damage-number';
    damageElement.textContent = damageAmount;
    const rect = targetElement.getBoundingClientRect();
    damageElement.style.position = 'absolute';
    if (target != 3) {
        damageElement.style.left = `${rect.left + 50}px`;
        damageElement.style.top = `${rect.top + 50}px`;
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

function calcDamage(target, damageAmount){
    const targetHBar = [hbar1, hbar2, hbar3, hbar4][target];
    const targetBBar = [bbar1, bbar2, bbar3, bbar4][target];
    const targetChar = [char1, char2, char3, char4][target];
    if (damageAmount > targetChar.block){
        damageAmount -= targetChar.block;
        targetChar.block = 0;
    }
    else {
        targetChar.block -= damageAmount;
        damageAmount = 0;
    }
    targetBBar.style.width = (targetChar.block / targetChar.maxblock) * 100 + '%';
    targetChar.health -= damageAmount;
    targetHBar.style.width = (targetChar.health / targetChar.max) * 100 + '%';
}