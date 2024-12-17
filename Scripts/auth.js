// auth.js
const cognitoConfig = {
    userPoolId: 'us-west-1_RAU6R6pD0',
    clientId: '45gfll4redstf4g8hq4fa2jkob',
    domain: 'us-west-1rau6r6pd0',  // This needs to match exactly what's in your User Pool
    region: 'us-west-1',
    identityPoolId: 'us-west-1:be5f5c85-6e5f-421a-a20d-11f7b049b5d1'
};

// Configure AWS SDK region
AWS.config.region = cognitoConfig.region;

export function signIn() {
    const redirectUri = 'https://main.d22za2x5ln55me.amplifyapp.com/';
    const loginUrl = `https://${cognitoConfig.domain}.auth.${cognitoConfig.region}.amazoncognito.com/login?client_id=${cognitoConfig.clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=email+openid`;
    window.location.href = loginUrl;
}

export async function handleCallback() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (code) {
        try {
            const redirectUri = 'https://main.d22za2x5ln55me.amplifyapp.com/';
            const tokenEndpoint = `https://${cognitoConfig.domain}.auth.${cognitoConfig.region}.amazoncognito.com/oauth2/token`;
            
            const body = new URLSearchParams({
                grant_type: 'authorization_code',
                code: code,
                client_id: cognitoConfig.clientId,
                redirect_uri: redirectUri
            });

            console.log('Token request:', {
                url: tokenEndpoint,
                body: body.toString()
            });

            const response = await fetch(tokenEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: body
            });

            if (!response.ok) {
                const errorData = await response.text();
                console.error('Token endpoint error:', errorData);
                throw new Error(`Token endpoint returned ${response.status}: ${errorData}`);
            }

            const tokens = await response.json();
            
            if (!tokens.id_token) {
                throw new Error('No ID token received');
            }

            // Configure AWS credentials with Identity Pool
            AWS.config.credentials = new AWS.CognitoIdentityCredentials({
                IdentityPoolId: cognitoConfig.identityPoolId,
                Logins: {
                    [`cognito-idp.${cognitoConfig.region}.amazonaws.com/${cognitoConfig.userPoolId}`]: tokens.id_token
                }
            });

            // Refresh the credentials
            await AWS.config.credentials.getPromise();
            
            // Remove the code from URL without triggering a page reload
            window.history.replaceState({}, document.title, window.location.pathname);
            
            return true;
        } catch (error) {
            console.error('Error during authentication:', error);
            return false;
        }
    }
    return false;
}

export function isAuthenticated() {
    return AWS.config.credentials && !AWS.config.credentials.expired;
}
