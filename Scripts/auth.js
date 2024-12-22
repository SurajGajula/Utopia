export const navigateToLogin = () => {
    const cognitoConfig = {
        cognitoDomain: 'https://us-west-1rau6r6pd0.auth.us-west-1.amazoncognito.com',
        clientId: '45gfll4redstf4g8hq4fa2jkob',
        redirectUri: 'https://main.d22za2x5ln55me.amplifyapp.com/',
        responseType: 'code',
        scope: 'email openid'
    };
    const loginUrl = `${cognitoConfig.cognitoDomain}/login/continue?` + 
        `client_id=${cognitoConfig.clientId}&` +
        `redirect_uri=${encodeURIComponent(cognitoConfig.redirectUri)}&` +
        `response_type=${cognitoConfig.responseType}&` +
        `scope=${cognitoConfig.scope.replace(' ', '+')}`;
    window.location.href = loginUrl;
};
export const initializeAWS = async () => {
    try {
        const idToken = sessionStorage.getItem('id_token');
        if (!idToken) {
            throw new Error('No ID token found');
        }

        const REGION = 'us-west-1';
        const USER_POOL_ID = 'us-west-1_RAU6R6pD0';
        const IDENTITY_POOL_ID = 'us-west-1:be5f5c85-6e5f-421a-a20d-11f7b049b5d1';

        // First, configure the region
        AWS.config.region = REGION;

        // Configure the credentials
        AWS.config.credentials = new AWS.CognitoIdentityCredentials({
            IdentityPoolId: IDENTITY_POOL_ID,
            Logins: {
                [`cognito-idp.${REGION}.amazonaws.com/${USER_POOL_ID}`]: idToken
            }
        });

        // Wait for credentials to be available
        return new Promise((resolve, reject) => {
            AWS.config.getCredentials((err) => {
                if (err) {
                    console.error('Error getting credentials:', err);
                    reject(err);
                } else {
                    console.log('Successfully loaded credentials');
                    resolve();
                }
            });
        });
    } catch (error) {
        console.error('Failed to initialize AWS:', error);
        throw error;
    }
};

export const exchangeCodeForSub = async (code) => {
    try {
        const lambdaUrl = 'https://ynfalkk00f.execute-api.us-west-1.amazonaws.com/GetUID';
        const response = await fetch(lambdaUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                code: code
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to exchange code');
        }

        const data = await response.json();
        sessionStorage.setItem('id_token', data.id_token);
        sessionStorage.setItem('userSub', data.sub);

        // Initialize AWS with the new token
        await initializeAWS();

        return data.sub;
    } catch (error) {
        console.error('Error exchanging code:', error);
        throw error;
    }
};