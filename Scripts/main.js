import { handleButton1, handleButton2, handleButton3, handleSkill, handleClose, handleAlly } from '/Scripts/menu.js';
import { navigateToLogin } from './auth.js';
if (!window.location.search.includes('code=')) {
    navigateToLogin();
}
const urlParams = new URLSearchParams(window.location.search);
const code = urlParams.get('code');
if (code) {
    console.log('Authorization code received:', code);
}
const button1 = document.getElementById('button1');
const button2 = document.getElementById('button2');
const button3 = document.getElementById('button3');
const skill1 = document.getElementById('skill1');
const skill2 = document.getElementById('skill2');
const skill3 = document.getElementById('skill3');
const closeButton = document.getElementById('closeButton');
handleButton1(button1);
handleButton2(button2);
handleButton3(button3);
handleSkill(skill1, 0);
handleSkill(skill2, 1);
handleSkill(skill3, 2);
handleClose(closeButton);
document.addEventListener('DOMContentLoaded', function() {
    const allies = document.querySelectorAll('#Allies img');
    allies.forEach(ally => {
        ally.addEventListener('click', function() {
            const idNumber = parseInt(this.id.replace('Ally', '')) - 1;
            handleAlly(idNumber);
        });
    });
});