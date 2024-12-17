// auth.js
const IDENTITY_POOL_ID = 'us-west-1:be5f5c85-6e5f-421a-a20d-11f7b049b5d1';
const USER_POOL_ID = 'us-west-1_RAU6R6pD0';
const CLIENT_ID = '45gfll4redstf4g8hq4fa2jkob';
const REGION = 'us-west-1';
const LOGIN_URL = 'https://us-west-1rau6r6pd0.auth.us-west-1.amazoncognito.com/login';
const REDIRECT_URI = 'https://main.d22za2x5ln55me.amplifyapp.com/';

let docClient = null;

// Function to redirect to login
export function redirectToLogin() {
    const loginParams = new URLSearchParams({
        client_id: CLIENT_ID,
        redirect_uri: REDIRECT_URI,
        response_type: 'code',
        scope: 'email openid'
    });

    window.location.href = `${LOGIN_URL}?${loginParams.toString()}`;
}

// Function to get the authorization code from URL
function getAuthCode() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('code');
}

// Initialize AWS with authenticated credentials
export async function initializeAWS() {
    // Configure region
    AWS.config.update({ region: REGION });
    
    const authCode = getAuthCode();
    
    if (!authCode) {
        // No auth code present, need to login
        redirectToLogin();
        return;
    }

    try {
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
        
        // Clear the authorization code from URL
        window.history.replaceState({}, document.title, window.location.pathname);
        
    } catch (error) {
        console.error('Failed to initialize AWS:', error);
        throw error;
    }
}

// Get the initialized DocumentClient
export function getDocClient() {
    if (!docClient) {
        throw new Error('AWS has not been initialized. Call initializeAWS first.');
    }
    return docClient;
}

// Check if we're in a post-authentication state
export function isAuthenticating() {
    return !!getAuthCode();
}

// Exchange authorization code for tokens
async function exchangeAuthCode(code) {
    const tokenEndpoint = `https://${USER_POOL_ID}.auth.${REGION}.amazoncognito.com/oauth2/token`;
    
    const params = new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: CLIENT_ID,
        code: code,
        redirect_uri: REDIRECT_URI
    });

    const response = await fetch(tokenEndpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params
    });

    if (!response.ok) {
        throw new Error('Failed to exchange authorization code');
    }

    return await response.json();
}

