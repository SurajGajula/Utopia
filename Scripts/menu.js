// menu.js
import { pSkill, startBattle, setCur } from "/Scripts/battle.js";
import { loadOwned, loadEnemies } from "/Scripts/character.js";

export function handleButton1(button) {
    button.addEventListener('click', async () => {
        const enemies = await loadEnemies();
        if (!enemies) {
            console.log('Not authenticated');
            return;
        }

        document.getElementById('MenuUI').classList.add('hidden');
        document.getElementById('closeButton').classList.remove('hidden');
        showEnemies(enemies);
        document.getElementById('Enemies').classList.remove('hidden');
    });
}

export function handleButton2(button) {
    button.addEventListener('click', async () => {
        const owned = await loadOwned();
        if (!owned) {
            console.log('Not authenticated');
            return;
        }

        document.getElementById('MenuUI').classList.add('hidden');
        document.getElementById('closeButton').classList.remove('hidden');
        showOwned(owned);
        document.getElementById('Owned').classList.remove('hidden');
    });
}

export function handleButton3(button) {
    button.addEventListener('click', () => {
        document.getElementById('MenuUI').classList.add('hidden');
        document.getElementById('closeButton').classList.remove('hidden');
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

export function handleStart(button) {
    button.addEventListener('click', () => {
        button.style.display = 'none';
        document.getElementById('title').style.display = 'none';
        document.getElementById('MenuUI').classList.remove('hidden');
    });
}

export function handleSkill(button, index) {
    button.addEventListener('click', () => {
        pSkill(index);
    });
}

export function handleAlly(index) {
    setCur(index);
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
                <p>Level: ${itemData.Level}</p>
                <p>Health: ${itemData.Health}</p>
                <p>Attack: ${itemData.Attack}</p>
                <p>Exp: ${itemData.Exp}</p>
                <p>Threshold: ${itemData.Threshold}</p>
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
        element.addEventListener('click', () => {
            startBattle(item.Name);
        });
        const itemData = item;
        element.innerHTML = `
            <div class="card-image">
                <img src="Sprites/${itemData.Name}.svg">
            </div>
            <div class="card-content">
                <h3>${itemData.Name}</h3>
                <p>Level: ${itemData.Level}</p>
                <p>Health: ${itemData.Health}</p>
                <p>Attack: ${itemData.Attack}</p>
            </div>
        `;
        container.appendChild(element);
    });
}