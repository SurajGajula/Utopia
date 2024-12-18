import { handleButton1, handleButton2, handleButton3, handleSkill, handleClose, handleAlly } from '/Scripts/menu.js';
import { initializeAWS, redirectToLogin, getS3Client } from './auth.js';

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const success = await initializeAWS();
        if (!success && !sessionStorage.getItem('authStarted')) {
            redirectToLogin();
            return;
        }
        
        if (success) {
            console.log('Application ready');
            const s3Client = getS3Client();
            // Now you can use s3Client for S3 operations
        } else {
            console.log('Failed to initialize. Please refresh the page to try again.');
        }
    } catch (error) {
        console.error('Application error:', error);
    }
});

const startButton = document.getElementById('startButton');
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