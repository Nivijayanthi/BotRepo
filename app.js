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
var authHelper = require('./auth');
const graphHelper = require('./try');

async function showListOfFunds(clientId, riskProfile) {
    console.log("I am inside show method");
    let funds = [];
    await query.giveFundDetails(clientId, riskProfile).then(async function (data) {
        console.log("The response from DB join..............", JSON.stringify(data));
        await data.forEach(async function (arrayItem) {
            console.log("%%%%%%%%%%", JSON.stringify(arrayItem));
            if (arrayItem.ProductIDStatus == true) {
                await funds.push(arrayItem.Name);
            }
            console.log("&&&&&&&&&&", JSON.stringify(funds));
        });
    });
    console.log("return..........", funds)
    return funds;


}

// function buildCarouselResponse(list){
//     let result = [];

//     return result;
// }


app.post('/fulfillment', async function (req, res) {
    console.log(req.body)
    var dialogFlowResponse = {
        speech: "hello",
        messages: []
    }

    var msg = {
        type: 4,
        platform: "facebook",
        payload: {
            facebook: {
                text: null,
                quick_replies: []
            }
        }
    };
    var response;
    let msgList = [];
    let listOfFunds = [];
    console.log("request from dialogflow", JSON.stringify(req.body.result));

    if (req.body.result.metadata.intentName == 'CHANGE-RISK-PROFILE') {
        var currentProfile = req.body.result.parameters.CurrentProfile;
        var targetProfile = req.body.result.parameters.TargetProfile;
        var clientId = req.body.result.parameters.clientId;

        console.log("currentProfile", currentProfile);
        console.log("targetProfile", targetProfile);
        console.log("clientId", clientId);

        listOfFunds = await showListOfFunds(clientId, targetProfile);
        console.log("Out...........", listOfFunds);
        var objList = new template.QuickReplyTemplate;
        if (listOfFunds.length > 0) {
            msg.payload.facebook.text = "Please find the list of funds available for your risk category";
            listOfFunds.forEach(async function (value) {
                objList.title = value;
                await msgList.push(JSON.parse(JSON.stringify(objList)));
            });
            //console.log("masssssssssssssss",JSON.stringify(msgList));
            msg.payload.facebook.text = "Please find the list of funds avaialable for your risk category";
            msg.payload.facebook.quick_replies = msgList;
            await dialogFlowResponse.messages.push(msg);
            console.log("Final msgggggggggggggggggg", JSON.stringify(dialogFlowResponse));
            //       query.clientRiskProfileUpdate(clientId, {To : '06-Sep-2018'}).then(function(data){
            //     console.log("updated successfully" , JSON.stringify(data));
            // });
            return res.json(dialogFlowResponse);

        } else {
            response = "Sorry!!There are no funds available under your new risk category";
            return res.json({
                speech: response,
                displayText: response,
                source: 'portal',
            });

        }

    }
    if (req.body.result.metadata.intentName == 'ADD-FUND') {
        console.log("i am inside Add fund");
        var clientId = req.body.result.parameters.clientId;
        console.log(req.body.result.parameters);
        var val;
        console.log(clientId);
        await query.ClientRiskProfileGet({ ClientID: clientId, Active: 'Y' }).then(function (data) {
            console.log("The response from DB risk profile..............", JSON.stringify(data));
            val = data.RiskCategory;
        });
        if (val) {
            listOfFunds = await showListOfFunds(clientId, val);
        } else {
            listOfFunds = await showListOfFunds(clientId, 'Growth');
        }

        console.log("List of fund........", listOfFunds);
        var objList = new template.QuickReplyTemplate;
        if (listOfFunds.length > 0) {
            listOfFunds.forEach(async function (value) {
                objList.title = value;
                await msgList.push(JSON.parse(JSON.stringify(objList)));
            });
            console.log("masssssssssssssss", JSON.stringify(msgList));
            msg.payload.facebook.text = "Please find the list of funds avaialable for your risk category";
            msg.payload.facebook.quick_replies = msgList;
            await dialogFlowResponse.messages.push(msg);
            console.log("Final msgggggggggggggggggg", JSON.stringify(dialogFlowResponse));
            return res.json(dialogFlowResponse);
        } else {
            response = "Sorry!!There are no funds available under your new risk category";
            return res.json({
                speech: response,
                displayText: response,
                source: 'portal',
            });
        }


    }
    if (req.body.result.metadata.intentName == 'SEND-EMAIL') {
        console.log("i am inside exit fund", JSON.stringify(req.body.result));
        var clientId = req.body.result.contexts[0].parameters.clientId;
        var resType = req.body.result.contexts[0].name;
        console.log("Hellllllllllllllllllo", resType);
        if (resType == 'change-risk-profile-followup') {
            console.log("Inside change");
            var currentProfile = req.body.result.contexts[0].parameters.CurrentProfile;
            var targetProfile = req.body.result.contexts[0].parameters.TargetProfile;
            response = `Your change request for risk category from ${currentProfile} to ${targetProfile} has been sent to the Trading desk. You will be receiving a detailed  email shortly.`;
        } if (resType == 'add-fund-folowup') {
            console.log("Inside add");
            response = `Your request to add new fund has been sent to the Trading desk. You will be receiving a detailed  email shortly.`;

        }
        return res.json({
            speech: response,
            displayText: response,
            source: 'portal',
        });

    }
    if (req.body.result.metadata.intentName == 'CURRENT-RISK-PROFILE') {
        console.log("Authentication..................", authHelper.getAuthUrl());
        const mailBody =
            {
                "message": {
                    "subject": "Meet for lunch?",
                    "body": {
                        "contentType": "Text",
                        "content": "The new cafeteria is open."
                    },
                    "toRecipients": [
                        {
                            "emailAddress": {
                                "address": "39416@hexaware.com",
                                "address" : "32128@hexaware.com"
                            }
                        }
                    ],
                    "ccRecipients": [
                        {
                            "emailAddress": {
                                "address": "37351@hexaware.com"
                            }
                        }
                    ]
                },
                "saveToSentItems": "true"
            };




        graphHelper.sendEmail('39132@hexaware.com', mailBody, function (err) {
            if (err) {
                renderError(res, err);
                return;
            };
            console.log("Sent an email");
        });
            var clientId = req.body.result.parameters.clientId;
            var val;
            await query.ClientRiskProfileGet({ ClientID: clientId, Active: 'Y' }).then(function (data) {
                console.log("The response from DB risk profile..............", JSON.stringify(data));
                val = data.RiskCategory;
            });
            response = `Your current risk profile is ${val}`;
            return res.json({
                speech: response,
                displayText: response,
                source: 'portal',
            });
    }
    if(req.body.result.metadata.intentName == 'EXIT-FUND-OPTION-YES'){
        var fundname = req.body.result.contexts[1].parameters.fund_name?req.body.result.contexts[1].parameters.fund_name:req.body.result.parameters.fund_name;
        var clientId = req.body.result.contexts[1].parameters.clientid?req.body.result.contexts[1].parameters.clientid:req.body.result.parameters.clientid;
        await query.ProductGet({Name:fundname}).then(async function(funddetails){
         let productID=funddetails[0].ProductID;
         let productName=funddetails[0].Name;
         await query.productperformanceGet({ProductID:productID}).then(async function(product){
             console.log(productID + "=>" +clientId)
        await query.holdingsProfileGet({ProductID:productID,CustomerID:clientId}).then(function(holdingsd){
         if(product.length>0 && holdingsd.length>0){
             let currentPrice=product[0].Currentprice;
             let quantity=holdingsd[0].Quantity;
             let marketvalue=parseInt(quantity.split(',').join('')) * parseInt(currentPrice);
             response=`Your ${fundname} is exited. Details of the funds will be emailed to you shortly.`;
             response+="<br/>Current Price: "+currentPrice + "<br/>";
             response+="Quantity: "+quantity + "<br/>";
             response+="Market Value: "+marketvalue + "<br/>";
             console.log(marketvalue);
             return res.json({
                speech: response,
                displayText: response,
                source: 'portal',
            });
         }
         })    
        })   
        });
    }
    if (req.body.result.metadata.intentName == 'EXIT-FUND-OPTION') {
        var fundname = req.body.result.parameters.fund_name;
        await query.ProductGet({Name:fundname}).then(function(funddetails){

        if(funddetails.length>0){
            msg = {
                "speech": "",
                "displayText": "",
                "messages": [{
                  "type": 4,
                  "platform": "facebook",
                  "payload": {
                    "facebook": {
                      "text": `Do you want to exit the fund `+fundname,
                      "quick_replies": [{
                        "content_type": "text",
                        "title": "Yes",
                        "payload": "Yes"
                      },{
                        "content_type": "text",
                        "title": "No",
                        "payload": "No"
                      }]
                    }
                  }
                }]
              };
            return res.json(msg);
        }
        else{
            return res.json({
                speech: "Sorry! The selected funds is Not Available",
                displayText: response,
                source: 'portal',
            });
        }
        })
    }
    if (req.body.result.metadata.intentName == 'EXIT-FUND') {
        var clientId = req.body.result.parameters.clientid;
        await query.getLowPerformingFund(clientId).then(async function(data){
            quickreplies=[];
            await data.forEach(function(value){
                quickreplies.push({
                    "content_type": "text",
                    "title": value.product.Name,
                    "payload": value.product.Name
                  })
            })
            console.log(quickreplies)
              
            msg = {
                "speech": "",
                "displayText": "",
                "messages": [{
                  "type": 4,
                  "platform": "facebook",
                  "payload": {
                    "facebook": {
                      "text": `Please Select the low peforming fund to exit`,
                      "quick_replies": quickreplies
                    }
                  }
                }]
              };
            return res.json(msg);
        })

    }
})
console.log("Server Running at Port : " + port);

app.listen(port, function () {
    console.log('Listening my app on  PORT: ' + port);
});




