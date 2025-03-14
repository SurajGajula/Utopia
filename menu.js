import { pSkill, startBattle } from "/battle.js";
import { loadAllies, loadEnemies, loadBanners, storeParty, checkPulls, storePull, loadUpdates } from "/character.js";
import { updatePullsDisplay } from "/main.js";

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
        document.getElementById('Updates').classList.add('hidden');
        document.getElementById('CityUI').classList.add('hidden');
    });
}
export async function handleUpdates(button) {
    button.addEventListener('click', async () => {
        document.getElementById('MenuUI').classList.add('hidden');
        document.getElementById('closeButton').classList.remove('hidden');
        showUpdates(await loadUpdates());
        document.getElementById('Updates').classList.remove('hidden');
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
                <img src="${window.CLOUDFRONT_URL}/${item.Name}">
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
                <img src="${window.CLOUDFRONT_URL}/${item.Name}">
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
                 <img src="${window.CLOUDFRONT_URL}/${item.Name}">
            </div>
            <div class="pull-button">
                <button onclick="handlePull('${item.Name}')">10 Pull</button>
            </div>
        `;
        container.appendChild(element);
    });
}
window.handleParty = async function (itemName, index) {
    await storeParty(itemName, index);
}
window.handlePull = async function (itemName) {
    const loadingOverlay = document.querySelector('.loading-overlay');
    document.getElementById('closeButton').classList.add('hidden');
    document.getElementById('Banners').classList.add('hidden');
    loadingOverlay.classList.add('active');
    try {
        if (await checkPulls()) {
            const pulls = [];
            for (let i = 0; i < 10; i++) {
                pulls.push(storePull(itemName));
            }
            const results = await Promise.all(pulls);
            await updatePullsDisplay();
            await showPullResults(results);
        }
        loadingOverlay.classList.remove('active');
        document.getElementById('PullResults').classList.remove('hidden');
    } catch (error) {
        console.error("Error during 10 pulls:", error);
        throw error;
    }
};
async function showPullResults(pulls) {
    const pullResults = document.getElementById('PullResults');
    pullResults.innerHTML = '';
    const grid = document.createElement('div');
    grid.classList.add('pull-results-grid');
    pulls.forEach(characterName => {
        const card = document.createElement('div');
        card.classList.add('pull-card');
        card.innerHTML = `
            <img src="${window.CLOUDFRONT_URL}/${characterName}">
            <div class="name">${characterName}</div>
        `;
        grid.appendChild(card);
    });
    pullResults.appendChild(grid);
    pullResults.onclick = function () {
        pullResults.classList.add('hidden');
        document.getElementById('closeButton').classList.remove('hidden');
        document.getElementById('Banners').classList.remove('hidden');
    };
}
function showUpdates(updates) {
    const updatesContainer = document.getElementById('Updates');
    updatesContainer.innerHTML = '';
    updates.forEach(update => {
        const updateElement = document.createElement('div');
        updateElement.classList.add('update');
        updateElement.innerHTML = `
            <h2>Version ${parseFloat(update.Version).toFixed(1)}</h2>
            <p><strong>New Allies:</strong> ${update.Allies}</p>
            <p><strong>New Enemies:</strong> ${update.Enemies}</p>
            <p><strong>New Features:</strong> ${update.Features}</p>
            <hr>
        `;
        updatesContainer.appendChild(updateElement);
    });
}

document.addEventListener('keydown', (event) => {
    const skill1 = document.getElementById('skill1');
    const skill2 = document.getElementById('skill2');
    const skill3 = document.getElementById('skill3');
    if (event.key === '1' && skill1.offsetParent !== null) {
        skill1.click();
    } else if (event.key === '2' && skill2.offsetParent !== null) {
        skill2.click();
    } else if (event.key === '3' && skill3.offsetParent !== null) {
        skill3.click();
    }
});