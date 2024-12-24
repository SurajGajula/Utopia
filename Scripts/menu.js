import { pSkill, startBattle } from "/Scripts/battle.js";
import { loadOwned, loadEnemies } from "/Scripts/character.js";
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
        showOwned(await loadOwned());
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
function showOwned(items) {
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
                <h3>${itemData.Name}</h3>
                <p>Attack: ${itemData.Attack}</p>
                <p>Health: ${itemData.Health}</p>
                <p>Level: ${itemData.Level}</p>
                <p>Exp: ${itemData.Exp}</p>
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
        const itemData = item;
        element.innerHTML = `
            <div class="card-image">
                <img src="Sprites/${itemData.Name}.svg">
            </div>
            <div class="card-content">
                <h3>${itemData.Name}</h3>
                <p>Attack: ${itemData.Attack}</p>
                <p>Health: ${itemData.Health}</p>
                <p>Level: ${itemData.Level}</p>
                <p>Defeated: ${itemData.Defeated}</p>
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