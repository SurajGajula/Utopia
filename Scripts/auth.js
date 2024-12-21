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
        return data.sub;
    } catch (error) {
        console.error('Error exchanging code:', error);
        throw error;
    }
};