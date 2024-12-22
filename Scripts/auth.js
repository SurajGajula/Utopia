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
        
        // Store tokens
        sessionStorage.setItem('id_token', data.id_token);
        sessionStorage.setItem('userSub', data.sub);

        // Debug: Log token info
        console.log('Received token data:', {
            hasIdToken: !!data.id_token,
            hasSub: !!data.sub
        });

        // Set up AWS credentials with the id_token
        const REGION = 'us-west-1';
        const USER_POOL_ID = 'us-west-1_RAU6R6pD0'; // Fixed capitalization
        const IDENTITY_POOL_ID = 'us-west-1:be5f5c85-6e5f-421a-a20d-11f7b049b5d1';

        // Clear any existing credentials
        AWS.config.credentials = null;

        // Set the region
        AWS.config.update({ region: REGION });

        // Create new credentials with the exact provider name format
        const credentials = new AWS.CognitoIdentityCredentials({
            IdentityPoolId: IDENTITY_POOL_ID,
            Logins: {
                [`cognito-idp.${REGION}.amazonaws.com/${USER_POOL_ID}`]: data.id_token
            }
        });

        // Set the credentials
        AWS.config.credentials = credentials;

        // Debug: Log the configuration
        console.log('AWS Configuration:', {
            region: AWS.config.region,
            identityPoolId: IDENTITY_POOL_ID,
            userPoolId: USER_POOL_ID,
            providerName: `cognito-idp.${REGION}.amazonaws.com/${USER_POOL_ID}`
        });

        // Refresh the credentials
        await AWS.config.credentials.refreshPromise();

        return data.sub;
    } catch (error) {
        console.error('Error exchanging code:', error);
        // Add detailed error logging
        if (error.message.includes('Invalid login token')) {
            const idToken = sessionStorage.getItem('id_token');
            try {
                // Decode the token to check its contents
                const payload = JSON.parse(atob(idToken.split('.')[1]));
                console.error('Token details:', {
                    iss: payload.iss,
                    exp: new Date(payload.exp * 1000),
                    isExpired: Date.now() > payload.exp * 1000
                });
            } catch (e) {
                console.error('Failed to decode token:', e);
            }
        }
        throw error;
    }
};