import { 
    handleButton1, 
    handleButton2, 
    handleButton3, 
    handleSkill, 
    handleClose, 
    handleUpdates 
} from '/menu.js';
import { navigateToLogin, exchangeCodeForSub, initializeAWS } from '/auth.js';
import { dailyPulls, loadPulls } from '/character.js';
if (!window.location.search.includes('code=')) {
    navigateToLogin();
}
const urlParams = new URLSearchParams(window.location.search);
const code = urlParams.get('code');
if (code) {
    try {
        const processAuth = async () => {
            const loadingOverlay = document.querySelector('.loading-overlay');          
            try {
                loadingOverlay.classList.add('active');
                await exchangeCodeForSub(code);
                await dailyPulls();
                await updatePullsDisplay();
                window.history.replaceState({}, document.title, window.location.pathname);
            } catch (error) {
                console.error('Error processing authentication:', error);
            } finally {
                loadingOverlay.classList.remove('active');
            }
        };        
        processAuth();
    } catch (error) {
        console.error('Error in auth process:', error);
    }
} else {
    navigateToLogin();
}
window.addEventListener('load', async () => {
    try {
        if (sessionStorage.getItem('id_token')) {
            await initializeAWS();
        }
    } catch (error) {
        console.error('Failed to initialize AWS:', error);
    }
});
export async function updatePullsDisplay() {
    try {
        const pullsCount = await loadPulls();
        const pullsDisplay = document.getElementById('pullsDisplay');
        pullsDisplay.textContent = `Pulls: ${pullsCount}`;
    } catch (error) {
        console.error('Error updating pulls display:', error);
    }
}
function initializeSpriteLoading() {
    const spriteImages = document.querySelectorAll('[data-sprite]');
    spriteImages.forEach(img => {
        img.src = `${window.CLOUDFRONT_URL}/${img.dataset.sprite}`;
    });
}
document.addEventListener('DOMContentLoaded', () => {
    initializeSpriteLoading();
});
const button1 = document.getElementById('button1');
const button2 = document.getElementById('button2');
const button3 = document.getElementById('button3');
const skill1 = document.getElementById('skill1');
const skill2 = document.getElementById('skill2');
const skill3 = document.getElementById('skill3');
const closeButton = document.getElementById('closeButton');
const updatesButton = document.getElementById('updatesButton');
handleButton1(button1);
handleButton2(button2);
handleButton3(button3);
handleSkill(skill1, 0);
handleSkill(skill2, 1);
handleSkill(skill3, 2);
handleClose(closeButton);
handleUpdates(updatesButton);