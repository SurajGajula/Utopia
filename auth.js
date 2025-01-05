export const navigateToLogin = () => {
    window.location.href = `https://us-west-1rau6r6pd0.auth.us-west-1.amazoncognito.com/login/continue?` + 
        `client_id=45gfll4redstf4g8hq4fa2jkob&` +
        `redirect_uri=${encodeURIComponent('https://main.d22za2x5ln55me.amplifyapp.com/')}&` +
        `response_type=code&` +
        `scope=email+openid`;;
};
export const initializeAWS = async () => {
    try {
        const idToken = sessionStorage.getItem('id_token');
        if (!idToken) {
            throw new Error('No ID token found');
        }
        AWS.config.region = 'us-west-1';
        AWS.config.credentials = new AWS.CognitoIdentityCredentials({
            IdentityPoolId: 'us-west-1:be5f5c85-6e5f-421a-a20d-11f7b049b5d1',
            Logins: {
                [`cognito-idp.us-west-1.amazonaws.com/us-west-1_RAU6R6pD0`]: idToken
            }
        });
        return new Promise((resolve, reject) => {
            AWS.config.getCredentials((err) => {
                if (err) {
                    console.error('Error getting credentials:', err);
                    reject(err);
                } else {
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
        await initializeAWS();
    } catch (error) {
        console.error('Error exchanging code:', error);
        throw error;
    }
};