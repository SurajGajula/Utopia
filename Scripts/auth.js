// auth.js
const IDENTITY_POOL_ID = 'us-west-1:be5f5c85-6e5f-421a-a20d-11f7b049b5d1';
const USER_POOL_ID = 'us-west-1_RAU6R6pD0';
const CLIENT_ID = '45gfll4redstf4g8hq4fa2jkob';
const REGION = 'us-west-1';
const COGNITO_DOMAIN = 'us-west-1rau6r6pd0.auth.us-west-1.amazoncognito.com';
const REDIRECT_URI = 'https://main.d22za2x5ln55me.amplifyapp.com/';

let docClient = null;

// Function to generate random state
function generateState() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Function to redirect to login
export function redirectToLogin() {
    // Only redirect if we haven't already started the auth process
    if (sessionStorage.getItem('authStarted')) {
        console.log('Auth process already started, skipping redirect');
        return;
    }

    // Generate and store state
    const state = generateState();
    sessionStorage.setItem('authState', state);
    sessionStorage.setItem('authStarted', 'true');

    const loginParams = new URLSearchParams({
        client_id: CLIENT_ID,
        response_type: 'code',
        scope: 'email openid',
        redirect_uri: REDIRECT_URI,
        state: state
    });

    window.location.href = `https://${COGNITO_DOMAIN}/login?${loginParams.toString()}`;
}

// Initialize AWS with authenticated credentials
export async function initializeAWS() {
    // Configure region
    AWS.config.update({ region: REGION });
    
    try {
        const authCode = getAuthCode();
        const state = getState();
        
        if (!authCode) {
            console.log('No auth code present');
            return false;
        }

        // Verify state
        const savedState = sessionStorage.getItem('authState');
        if (state !== savedState) {
            console.error('State mismatch - possible CSRF attack');
            return false;
        }

        // Exchange auth code for tokens
        const tokens = await exchangeAuthCode(authCode);
        
        // Configure credentials with the authenticated identity
        AWS.config.credentials = new AWS.CognitoIdentityCredentials({
            IdentityPoolId: IDENTITY_POOL_ID,
            Logins: {
                [`cognito-idp.${REGION}.amazonaws.com/${USER_POOL_ID}`]: tokens.id_token
            }
        });

        // Ensure credentials are refreshed
        await AWS.config.credentials.getPromise();
        
        // Initialize DynamoDB client
        docClient = new AWS.DynamoDB.DocumentClient();
        console.log('AWS initialized successfully with authenticated user');
        
        // Clear the authorization code and state from URL
        window.history.replaceState({}, document.title, window.location.pathname);
        
        // Clear auth state from session storage
        sessionStorage.removeItem('authState');
        
        return true;
    } catch (error) {
        console.error('Failed to initialize AWS:', error);
        return false;
    }
}

// Get the authorization code from URL
function getAuthCode() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('code');
}

// Get the state from URL
function getState() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('state');
}

// Exchange authorization code for tokens
async function exchangeAuthCode(code) {
    const tokenEndpoint = `https://cognito-idp.${REGION}.amazonaws.com/${USER_POOL_ID}/oauth2/token`;
    
    console.log('Token endpoint:', tokenEndpoint);
    
    const params = new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: CLIENT_ID,
        code: code,
        redirect_uri: REDIRECT_URI
    });

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

        return await response.json();
    } catch (error) {
        console.error('Network error during token exchange:', error);
        throw error;
    }
}

// Add logout functionality
export function logout() {
    sessionStorage.clear();
    const logoutParams = new URLSearchParams({
        client_id: CLIENT_ID,
        logout_uri: REDIRECT_URI
    });
    
    window.location.href = `https://${COGNITO_DOMAIN}/logout?${logoutParams.toString()}`;
}

