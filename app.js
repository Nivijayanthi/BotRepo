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
const template = require('./template');

function showListOfFunds(clientId, riskProfile) {
    console.log("I am inside show method");
    let funds = [];
    query.giveFundDetails(clientId, riskProfile).then(async function (data) {
        console.log("The response from DB join..............", JSON.stringify(data));
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

function buildCarouselResponse(list){
    let result = [];
    var objList = new template.CustomListTemplate();
        if (list.length > 0) {
            list.forEach(async function (value) {
                objList.speech = "Please find the list of funds avaialable for your risk category";
                objList.title = values;
                await result.push(JSON.parse(JSON.stringify(objList)));
            });
            
        } else {
            objList.speech = "Sorry!!There are no funds available under your new risk category";
            result.push(JSON.parse(JSON.stringify(objList)));
        }
    return result;
}


app.post('/fulfillment', function (req, res) {
     var msg = [];
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
        msg = buildCarouselResponse(listOfFunds);
        // return res.json({
        //     speech: response,
        //     displayText: response,
        //     source: 'portal',
        // });
        return res.json(msg);
    }
    if (req.body.result.metadata.intentName == 'ADD-FUND') {       
        console.log("i am inside Add fund");
        var clientId = req.body.result.parameters.ClientId;
        var val;
        query.ClientRiskProfileGet({ ClientID: clientId, Active: 'Y' }).then( async function (data) {
           await  console.log("The response from DB risk profile..............", JSON.stringify(data.RiskCategory));
            val = data.RiskCategory;
        });
        listOfFunds = showListOfFunds(clientId, val);
        console.log("List of fund........", listOfFunds);
        msg = buildCarouselResponse(listOfFunds);     
        // return res.json({
        //     speech: response,
        //     displayText: response,
        //     source: 'portal',
        // });
        return res.json(msg);
    }
    if(req.body.result.metadata.intentName == 'CHANGE-RISK-PROFILE-SEND-EMAIL'){
        console.log("i am inside exit fund");
        var clientId = req.body.result.parameters.ClientID;

    }
})
console.log("Server Running at Port : " + port);

app.listen(port, function () {
    console.log('Listening my app on  PORT: ' + port);
});




