module.exports = {
    creds: {
        redirectUrl: 'https://botrepo.herokuapp.com/sendEmail',
        clientID: '48f404b1-2b62-4e7a-8e67-98a5d72f361c',
        clientSecret: 'lrbkEE0010ziuGMURO3-=$}',
        identityMetadata: 'https://login.microsoftonline.com/common/v2.0/.well-known/openid-configuration',
        skipUserProfile: true,
        responseType: 'code',
        validateIssuer: false,
        responseMode: 'query',
        scope: ['User.Read', 'Mail.Send', 'profile'],
        allowHttpForRedirectUrl: true
    }
};