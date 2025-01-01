import { pSkill, startBattle } from "/Scripts/battle.js";
import { loadAllies, loadEnemies, storeParty } from "/Scripts/character.js";
export function handleButton1(button) {
    button.addEventListener('click', async () => {
        document.getElementById('MenuUI').classList.add('hidden');
        document.getElementById('closeButton').classList.remove('hidden');
        showEnemies(await loadEnemies());
        document.getElementById('Enemies').classList.remove('hidden');
    });
}
export function handleButton2(button) {
    button.addEventListener('click', async () => {
        document.getElementById('MenuUI').classList.add('hidden');
        document.getElementById('closeButton').classList.remove('hidden');
        showAllies(await loadAllies());
        document.getElementById('Owned').classList.remove('hidden');
    });
}
export function handleButton3(button) {
    button.addEventListener('click', () => {
        document.getElementById('MenuUI').classList.add('hidden');
        document.getElementById('closeButton').classList.remove('hidden');
    });
}
export async function handleSkill(button, index) {
    button.addEventListener('click', async () => {
        await pSkill(index);
    });
}
export function handleClose(button) {
    button.addEventListener('click', () => {
        button.classList.add('hidden');
        document.getElementById('MenuUI').classList.remove('hidden');
        document.getElementById('Owned').classList.add('hidden');
        document.getElementById('Enemies').classList.add('hidden');
    });
}
function showAllies(items) {
    const container = document.getElementById("Owned");
    container.innerHTML = '';
    items.forEach(item => {
        const element = document.createElement('div');
        element.classList.add('item-card');
        const itemData = item;
        element.innerHTML = `
            <div class="card-image">
                <img src="Sprites/${itemData.Name}.svg">
            </div>
            <div class="card-content">
                <div style="display: flex; justify-content: space-between;">
                    <div class="card-info">
                        <h3>${itemData.Name}</h3>
                        <p>Attack: ${itemData.Attack}</p>
                        <p>Health: ${itemData.Health}</p>
                        <p>Level: ${itemData.Level}</p>
                        <p>Exp: ${itemData.Exp}</p>
                    </div>
                    <div class="card-buttons" style="display: flex; gap: 10px; align-items: start;">
                        <button onclick="handleParty('${itemData.Name}', 0)">Party 1</button>
                        <button onclick="handleParty('${itemData.Name}', 1)">Party 2</button>
                        <button onclick="handleParty('${itemData.Name}', 2)">Party 3</button>
                    </div>
                </div>
                <p> ${itemData.SkillName}: Deals ${itemData.Attack} damage</p>
                <p> ${itemData.SkillName}+: Deals ${itemData.Attack * itemData.SkillPlus[1]} 
                damage ${itemData.SkillPlus[0]} times with a ${itemData.SkillPlus[2]}x combo
                multiplier and ${itemData.SkillPlus[0]}x block multiplier.</p>
                <p> ${itemData.SkillName}++: Deals ${itemData.Attack * itemData.SkillPlusPlus[1]} 
                damage ${itemData.SkillPlusPlus[0]} times with a ${itemData.SkillPlusPlus[2]}x combo
                multiplier and ${itemData.SkillPlusPlus[0]}x block multiplier.</p>
            </div>
        `;
        container.appendChild(element);
    });
}
window.handleParty = async function(itemName, index) {
    await storeParty(itemName, index);
}
function showEnemies(items) {
    const container = document.getElementById("Enemies");
    container.innerHTML = '';
    items.forEach(item => {
        const element = document.createElement('div');
        element.classList.add('item-card');
        element.classList.add('clickable');
        const itemData = item;
        element.innerHTML = `
            <div class="card-image">
                <img src="Sprites/${itemData.Name}.svg">
            </div>
            <div class="card-content">
                <h3>${itemData.Name}</h3>
                <p>Attack: ${itemData.Attack}</p>
                <p>Health: ${itemData.Health}</p>
            </div>
        `; 
        element.addEventListener('click', async () => {
            document.getElementById('Enemies').classList.add('hidden');
            document.getElementById('closeButton').classList.add('hidden');
            await startBattle(itemData.Name);
            document.getElementById('BattleUI').classList.remove('hidden');
        });
        element.style.cursor = 'pointer';        
        container.appendChild(element);
    });
}