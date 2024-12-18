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
