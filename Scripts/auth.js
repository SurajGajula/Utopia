// auth.js
const cognitoConfig = {
    userPoolId: 'us-west-1_RAU6R6pD0',
    clientId: '45gfll4redstf4g8hq4fa2jkob',
    domain: 'us-west-1rau6r6pd0',
    region: 'us-west-1',
    identityPoolId: 'us-west-1:be5f5c85-6e5f-421a-a20d-11f7b049b5d1'
};

AWS.config.region = cognitoConfig.region;

const userPool = new AWS.CognitoIdentityServiceProvider();

export async function configureAWS(idToken) {
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
        IdentityPoolId: cognitoConfig.identityPoolId,
        Logins: {
            [`cognito-idp.${cognitoConfig.region}.amazonaws.com/${cognitoConfig.userPoolId}`]: idToken
        }
    });

    try {
        await AWS.config.credentials.getPromise();
        return true;
    } catch (error) {
        console.error('Error refreshing credentials:', error);
        return false;
    }
}

export function signIn() {
    const redirectUri = 'https://main.d22za2x5ln55me.amplifyapp.com';
    const queryParams = new URLSearchParams({
        client_id: cognitoConfig.clientId,
        response_type: 'code',
        scope: 'email openid profile',
        redirect_uri: redirectUri
    });

    const loginUrl = `https://${cognitoConfig.domain}.auth.${cognitoConfig.region}.amazoncognito.com/login?${queryParams.toString()}`;
    window.location.href = loginUrl;
}

export async function handleCallback() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (code) {
        try {
            const tokens = await getTokensFromCode(code);
            if (!tokens) return false;

            const payload = JSON.parse(atob(tokens.id_token.split('.')[1]));
            const userSub = payload.sub;
            
            localStorage.setItem('refreshToken', tokens.refresh_token);
            localStorage.setItem('userSub', userSub);
            localStorage.setItem('idToken', tokens.id_token);
            localStorage.setItem('accessToken', tokens.access_token);

            const configured = await configureAWS(tokens.id_token);
            return configured;
        } catch (error) {
            console.error('Error during authentication:', error);
            return false;
        }
    }
    return false;
}

async function getTokensFromCode(code) {
    const tokenEndpoint = `https://${cognitoConfig.domain}.auth.${cognitoConfig.region}.amazoncognito.com/oauth2/token`;
    const response = await fetch(tokenEndpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
            grant_type: 'authorization_code',
            client_id: cognitoConfig.clientId,
            code: code,
            redirect_uri: 'https://d84l1y8p4kdic.cloudfront.net'
        })
    });

    if (!response.ok) {
        throw new Error('Failed to get tokens');
    }

    return response.json();
}

async function refreshTokens() {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return false;

    try {
        const tokenEndpoint = `https://${cognitoConfig.domain}.auth.${cognitoConfig.region}.amazoncognito.com/oauth2/token`;
        const response = await fetch(tokenEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                grant_type: 'refresh_token',
                client_id: cognitoConfig.clientId,
                refresh_token: refreshToken
            })
        });

        if (!response.ok) {
            throw new Error('Failed to refresh tokens');
        }

        const tokens = await response.json();
        
        localStorage.setItem('idToken', tokens.id_token);
        localStorage.setItem('accessToken', tokens.access_token);

        return await configureAWS(tokens.id_token);
    } catch (error) {
        console.error('Error refreshing tokens:', error);
        return false;
    }
}

export async function ensureAuthenticated() {
    if (!isAuthenticated()) {
        signIn();
        return false;
    }

    try {
        const success = await refreshTokens();
        if (!success) {
            signIn();
            return false;
        }
        return true;
    } catch (error) {
        console.error('Error in ensureAuthenticated:', error);
        signIn();
        return false;
    }
}

export function isAuthenticated() {
    return !!localStorage.getItem('refreshToken');
}

export function getUserSub() {
    return localStorage.getItem('userSub');
}

// Initialize authentication on page load
if (window.location.search.includes('code=')) {
    handleCallback();
} else if (isAuthenticated()) {
    ensureAuthenticated();
}