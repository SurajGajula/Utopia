// auth.js
const cognitoConfig = {
    userPoolId: 'us-west-1_RAU6R6pD0',
    clientId: '45gfll4redstf4g8hq4fa2jkob',
    domain: 'us-west-1rau6r6pd0',
    region: 'us-west-1',
    identityPoolId: 'us-west-1:be5f5c85-6e5f-421a-a20d-11f7b049b5d1'
};

// Configure AWS SDK region
AWS.config.region = cognitoConfig.region;

export function signIn() {
    const redirectUri = 'https://d84l1y8p4kdic.cloudfront.net';
    const queryParams = new URLSearchParams({
        client_id: cognitoConfig.clientId,
        response_type: 'code',
        scope: 'openid',
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

            const tokens = await response.json();

            // Configure AWS credentials with Identity Pool
            AWS.config.credentials = new AWS.CognitoIdentityCredentials({
                IdentityPoolId: cognitoConfig.identityPoolId,
                Logins: {
                    [`cognito-idp.${cognitoConfig.region}.amazonaws.com/${cognitoConfig.userPoolId}`]: tokens.id_token
                }
            });

            // Refresh the credentials
            await AWS.config.credentials.getPromise();
            return true;
        } catch (error) {
            console.error('Error during authentication:', error);
            return false;
        }
    }
    return false;
}

// Initialize authentication
if (window.location.search.includes('code=')) {
    handleCallback();
} else {
    signIn();
}