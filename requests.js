var request=require('request');
console.log(`https://login.microsoftonline.com/common/oauth2/token?grant_type = password&scope = openid&resource = ${encodeURIComponent('https://graph.windows.net')}&client_id=5debfcce-7535-4035-8265-27988218e515&username =39781@hexaware.com&password=j###W14&$`);
request(`https://login.microsoftonline.com/common/oauth2/token?grant_type = password&scope = openid&resource = ${encodeURIComponent('https://graph.windows.net')}&client_id=5debfcce-7535-4035-8265-27988218e515&username =39781@hexaware.com&password=j###W14&$`, function (error, response, body) {
    console.log('error:', error); // Print the error if one occurred
    console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
    console.log('body:', body); // Print the HTML for the Google homepage.
})