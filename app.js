var apiai = require('apiai');

var appai = apiai("ee3683b183ec498ea5a1f277a85974fd");
const util = require('util');

var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var port = process.env.PORT || 4000;
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(__dirname));
//imports
const query = require('./query');

function showListOfFunds(clientId, riskProfile) {
    let funds = [];
    query.giveFundDetails(clientId, riskProfile).then(async function (data) {
        console.log("The responae from DB join..............", JSON.stringify(data));
        await data.forEach(async function (arrayItem) {
            console.log("%%%%%%%%%%", JSON.stringify(arrayItem));
            if (arrayItem.ProductIDStatus == true) {
                await funds.push(arrayItem.Name);
            }
            console.log("&&&&&&&&&&", JSON.stringify(funds));
        });
    });
        return funds;
}


app.post('/fulfillment', function (req, res) {
    debugger
    var response;
    let listOfFunds = [];
    console.log("request from dialogflow", JSON.stringify(req.body.result));

    if (req.body.result.metadata.intentName == 'CHANGE-RISK-PROFILE') {
        var currentProfile = req.body.result.parameters.CurrentProfile;
        var targetProfile = req.body.result.parameters.TargetProfile;
        var clientId = req.body.result.parameters.ClientId;

        console.log("currentProfile", currentProfile);
        console.log("targetProfile", targetProfile);
        console.log("clientId", clientId);

        listOfFunds = showListOfFunds(clientId, targetProfile);
        console.log("Out...........", listOfFunds);
        if (listOfFunds.length > 0) {
            console.log("I am inside if loop");
            response = 'Please find the fund details';
        } else {
            response = 'Sorry!!There are no funds available under your new risk category';
        }
        return res.json({
            speech: response,
            displayText: response,
            source: 'portal',
        });
    }
    if (req.body.result.metadata.intentName == 'ADD-FUND') {
        console.log("i am inside Add fund");
        var clientId = req.body.result.parameters.ClientId;
        var val;
        query.ClientRiskProfileGet({ ClientID: clientId, Active: 'Y' }).then(function (data) {
            console.log("The responae from DB..............", JSON.stringify(data));
            val = data.RiskCategory;
        });
        listOfFunds = showListOfFunds(clientId, val);
        console.log("List of fund........", listOfFunds);
        if (listOfFunds.length > 0) {
            response = "Please find the funds prescribed for your risk profile and their performance over 3 years.";
        } else {
            response = "Sorry!!There are no funds available under your risk category ";
        }
        return res.json({
            speech: response,
            displayText: response,
            source: 'portal',
        });

    }


})
console.log("Server Running at Port : " + port);

app.listen(port, function(){
    console.log('Listening my app on  PORT: ' + port);
});




