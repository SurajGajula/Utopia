import { Character, storeExp } from '/character.js';
let hbar1, hbar2, hbar3, hbar4;
let char1, char2, char3, char4;
let count;
export async function startBattle(enemy) {
    const healthBars = Array.from(document.querySelectorAll('.health-bar'));
    [hbar1, hbar2, hbar3, hbar4] = healthBars;
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
        for (let i = 1; i <= 3; i++) {
            document.querySelector(`#skill${i}`).textContent = [char1, char2, char3][i - 1].Skill[0];
        }
        document.querySelector('#Enemy img').src = `${window.CLOUDFRONT_URL}/${char4.name}`;
    } catch (err) {
        console.error(err);
    }
    count = 0;
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
    let hits = 1;
    let damageAmount = indexChar.attack;
    document.getElementById('Skills').classList.add('hidden');
    for (let i = 0; i < hits; i++) {
        calcDamage(target, damageAmount);
        spawnDamageNumber(target, damageAmount);
        await new Promise(resolve => setTimeout(resolve, 1000));
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
        count -= 1;
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
    document.getElementById('Skills').classList.remove('hidden');
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

function calcDamage(target, damageAmount){
    const targetHBar = [hbar1, hbar2, hbar3, hbar4][target];
    const targetChar = [char1, char2, char3, char4][target];
    targetChar.health -= damageAmount;
    targetHBar.style.width = (targetChar.health / targetChar.max) * 100 + '%';
}