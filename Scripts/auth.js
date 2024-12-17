const cognitoConfig = {
    userPoolId: 'us-west-1_RAU6R6pD0',
    clientId: '45gfll4redstf4g8hq4fa2jkob',
    domain: 'us-west-1rau6r6pd0',
    region: 'us-west-1',
    identityPoolId: 'us-west-1:9e8e8481-b6d4-4199-bbdc-9d4ad09dfe58'
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
        scope: 'email openid',
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
            const tokenResponse = await fetch(tokenEndpoint, {
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
            const tokens = await tokenResponse.json();
            const payload = JSON.parse(atob(tokens.id_token.split('.')[1]));
            const userSub = payload.sub;
            localStorage.setItem('authCode', code);
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
export async function ensureAuthenticated() {
    if (!isAuthenticated()) {
        signIn();
        return false;
    }
    const idToken = localStorage.getItem('idToken');
    if (!idToken) {
        signIn();
        return false;
    }
    const configured = await configureAWS(idToken);
    if (!configured) {
        signIn();
        return false;
    }
    return true;
}
export function isAuthenticated() {
    return !!localStorage.getItem('authCode');
}
export function getUserSub() {
    return localStorage.getItem('userSub');
}
if (isAuthenticated()) {
    ensureAuthenticated();
}