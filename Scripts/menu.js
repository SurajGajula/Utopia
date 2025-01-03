import { pSkill, startBattle } from "/Scripts/battle.js";
import { loadAllies, loadEnemies, loadBanners, storeParty, checkPulls, storePull } from "/Scripts/character.js";
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
    button.addEventListener('click', async () => {
        document.getElementById('MenuUI').classList.add('hidden');
        document.getElementById('closeButton').classList.remove('hidden');
        showBanners(await loadBanners());
        document.getElementById('Banners').classList.remove('hidden');
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
        document.getElementById('Banners').classList.add('hidden');
    });
}
function showAllies(items) {
    const container = document.getElementById("Owned");
    container.innerHTML = '';
    items.forEach(item => {
        const element = document.createElement('div');
        element.classList.add('item-card');
        element.innerHTML = `
            <div class="card-image">
                <img src="Sprites/${item.Name}.svg">
            </div>
            <div class="card-content">
                <div class="card-container">
                    <div class="card-info">
                        <h3>${item.Name}</h3>
                        <p>Attack: ${item.Attack}</p>
                        <p>Health: ${item.Health}</p>
                        <p>Level: ${item.Level}</p>
                        <p>Exp: ${item.Exp}</p>
                    </div>
                    <div class="card-buttons">
                        <button onclick="handleParty('${item.Name}', 0)">Party 1</button>
                        <button onclick="handleParty('${item.Name}', 1)">Party 2</button>
                        <button onclick="handleParty('${item.Name}', 2)">Party 3</button>
                    </div>
                </div>
                <p> ${item.SkillName}: Deals ${item.Attack} damage</p>
                <p> ${item.SkillName}+: Deals ${item.Attack * item.SkillPlus[1]} 
                damage ${item.SkillPlus[0]} times with a ${item.SkillPlus[2]}x combo
                multiplier and ${item.SkillPlus[0]}x block multiplier.</p>
                <p> ${item.SkillName}++: Deals ${item.Attack * item.SkillPlusPlus[1]} 
                damage ${item.SkillPlusPlus[0]} times with a ${item.SkillPlusPlus[2]}x combo
                multiplier and ${item.SkillPlusPlus[0]}x block multiplier.</p>
            </div>
        `;
        container.appendChild(element);
    });
}
function showEnemies(items) {
    const container = document.getElementById("Enemies");
    container.innerHTML = '';
    items.forEach(item => {
        const element = document.createElement('div');
        element.classList.add('item-card');
        element.classList.add('clickable');
        element.innerHTML = `
            <div class="card-image">
                <img src="Sprites/${item.Name}.svg">
            </div>
            <div class="card-content">
                <h3>${item.Name}</h3>
                <p>Attack: ${item.Attack}</p>
                <p>Health: ${item.Health}</p>
            </div>
        `;
        element.addEventListener('click', async () => {
            document.getElementById('Enemies').classList.add('hidden');
            document.getElementById('closeButton').classList.add('hidden');
            await startBattle(item.Name);
            document.getElementById('BattleUI').classList.remove('hidden');
        });
        element.style.cursor = 'pointer';
        container.appendChild(element);
    });
}
function showBanners(items) {
    const container = document.getElementById("Banners");
    container.innerHTML = '';
    items.forEach(item => {
        const element = document.createElement('div');
        element.classList.add('item-banner');
        element.innerHTML = `
            <div class="card-image">
                <img src="Sprites/${item.Name}.svg">
            </div>
            <div class="pull-button">
                <button onclick="handlePull('${item.Name}', 0)">10 Pull</button>
            </div>
        `;
        container.appendChild(element);
    });
}
window.handleParty = async function (itemName, index) {
    await storeParty(itemName, index);
}
window.handlePull = async function (itemName) {
    try {
        if (await hasEnoughPulls()) {
            const pulls = [];
            for (let i = 0; i < 10; i++) {
                pulls.push(storePull(itemName));
            }
            await Promise.all(pulls);
        } else {
            alert("You need at least 1000 pulls to perform a 10-pull");
        }
    } catch (error) {
        console.error("Error during 10 pulls:", error);
        throw error;
    }
};