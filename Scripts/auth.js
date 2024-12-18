// auth.js
import { S3Client } from "@aws-sdk/client-s3";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-providers";

const IDENTITY_POOL_ID = 'us-west-1:be5f5c85-6e5f-421a-a20d-11f7b049b5d1';
const USER_POOL_ID = 'us-west-1_RAU6R6pD0';
const CLIENT_ID = '45gfll4redstf4g8hq4fa2jkob';
const REGION = 'us-west-1';
const COGNITO_DOMAIN = 'us-west-1rau6r6pd0.auth.us-west-1.amazoncognito.com';
const REDIRECT_URI = 'https://main.d22za2x5ln55me.amplifyapp.com/';
const COGNITO_IDP_ID = `cognito-idp.${REGION}.amazonaws.com/${USER_POOL_ID}`;

let s3Client = null;

// Function to generate nonce
function generateNonce() {
    return Math.random().toString(36).substring(2, 15);
}

// Function to generate state
function generateState() {
    return Math.random().toString(36).substring(2, 15);
}

// Function to redirect to login
export function redirectToLogin() {
    if (sessionStorage.getItem('authStarted')) {
        console.log('Auth process already started, skipping redirect');
        return;
    }

    const nonce = generateNonce();
    const state = generateState();

    // Store nonce and state in session storage
    sessionStorage.setItem('nonce', nonce);
    sessionStorage.setItem('state', state);
    sessionStorage.setItem('authStarted', 'true');

    const loginParams = new URLSearchParams({
        client_id: CLIENT_ID,
        response_type: 'code',
        scope: 'email openid',
        redirect_uri: REDIRECT_URI,
        state: state,
        nonce: nonce
    });

    window.location.href = `https://${COGNITO_DOMAIN}/oauth2/authorize?${loginParams.toString()}`;
}

// Get token from URL
function getToken() {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (!code) return null;
    return exchangeAuthCode(code);
}

// Exchange authorization code for tokens
async function exchangeAuthCode(code) {
    const tokenEndpoint = `https://${COGNITO_DOMAIN}/oauth2/token`;
    
    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('client_id', CLIENT_ID);
    params.append('code', code);
    params.append('redirect_uri', REDIRECT_URI);

    try {
        const response = await fetch(tokenEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: params.toString()
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Token exchange failed:', errorText);
            throw new Error(`Token exchange failed: ${response.status} ${response.statusText}`);
        }

        const tokens = await response.json();
        return tokens.id_token; // Return the ID token
    } catch (error) {
        console.error('Network error during token exchange:', error);
        throw error;
    }
}

// Initialize AWS with authenticated credentials
export async function initializeAWS() {
    try {
        const idToken = await getToken();
        if (!idToken) {
            console.log('No ID token present');
            return false;
        }

        // Create the login data object
        const loginData = {
            [COGNITO_IDP_ID]: idToken
        };

        // Initialize the S3 client with Cognito Identity Pool credentials
        s3Client = new S3Client({
            region: REGION,
            credentials: fromCognitoIdentityPool({
                clientConfig: { region: REGION },
                identityPoolId: IDENTITY_POOL_ID,
                logins: loginData
            })
        });

        // Clear the authorization code from URL
        window.history.replaceState({}, document.title, window.location.pathname);
        
        console.log('AWS initialized successfully with authenticated user');
        return true;
    } catch (error) {
        console.error('Failed to initialize AWS:', error);
        return false;
    }
}

// Get the initialized S3 client
export function getS3Client() {
    if (!s3Client) {
        throw new Error('AWS has not been initialized. Call initializeAWS first.');
    }
    return s3Client;
}

// Add logout functionality
export function logout() {
    sessionStorage.clear();
    s3Client = null;
    const logoutParams = new URLSearchParams({
        client_id: CLIENT_ID,
        logout_uri: REDIRECT_URI
    });
    
    window.location.href = `https://${COGNITO_DOMAIN}/logout?${logoutParams.toString()}`;
}
