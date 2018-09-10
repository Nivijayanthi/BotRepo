var apiai = require('apiai');
require('dotenv').config();
var appai = apiai("ee3683b183ec498ea5a1f277a85974fd");
const util = require('util');
var moment=require('moment');
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
var mail = require('./SendEmail');
var MicrosoftGraph = require("@microsoft/microsoft-graph-client");

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

    var clientId =  req.body.sessionId.slice(-6);
    
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
    //console.log("request from dialogflow", JSON.stringify(req.body));

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
                                "address": "32128@hexaware.com"
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

        user = {
            profile: {
                oid: "1b02070e-606c-42df-b83d-1af09b29bb1f",
                displayName: "Nivetha K",
                accessToken: "'eyJ0eXAiOiJKV1QiLCJub25jZSI6IkFRQUJBQUFBQUFEWHpaM2lmci1HUmJEVDQ1ek5TRUZFWGdzRTZIRXdweWktNFB3dFotX2xqOGhSM1VjTUJZRjAtTjY3SHRyZkV4VXkyOE5ERzNXYmo3TGZONnhYdHRHY0Fwb0Y0djhpSTFpQ0l4R0ZyYXlHaGlBQSIsImFsZyI6IlJTMjU2IiwieDV0IjoiN19adWYxdHZrd0x4WWFIUzNxNmxValVZSUd3Iiwia2lkIjoiN19adWYxdHZrd0x4WWFIUzNxNmxValVZSUd3In0.eyJhdWQiOiJodHRwczovL2dyYXBoLm1pY3Jvc29mdC5jb20iLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC83YzBjMzZmNS1hZjgzLTRjMjQtODg0NC05OTYyZTAxNjM3MTkvIiwiaWF0IjoxNTM2NTU5MjcxLCJuYmYiOjE1MzY1NTkyNzEsImV4cCI6MTUzNjU2MzE3MSwiYWNjdCI6MCwiYWNyIjoiMSIsImFpbyI6IjQyQmdZREE5Zkc3ZXgzUUYzUzFNOWg4VW82dWNOWnRWTXczUE05MFVXL0xoMVpGTElUOEEiLCJhbXIiOlsid2lhIl0sImFwcF9kaXNwbGF5bmFtZSI6IkFsaWNlIiwiYXBwaWQiOiI0OGY0MDRiMS0yYjYyLTRlN2EtOGU2Ny05OGE1ZDcyZjM2MWMiLCJhcHBpZGFjciI6IjEiLCJmYW1pbHlfbmFtZSI6IksiLCJnaXZlbl9uYW1lIjoiTml2ZXRoYSIsImlwYWRkciI6IjE2NS4yMjUuMTA0Ljk2IiwibmFtZSI6Ik5pdmV0aGEgSyIsIm9pZCI6IjFiMDIwNzBlLTYwNmMtNDJkZi1iODNkLTFhZjA5YjI5YmIxZiIsIm9ucHJlbV9zaWQiOiJTLTEtNS0yMS0xNjQ0NDkxOTM3LTgxMzQ5NzcwMy02ODIwMDMzMzAtMTUzODg0IiwicGxhdGYiOiIzIiwicHVpZCI6IjEwMDNCRkZEQTVBQzQzQTQiLCJzY3AiOiJNYWlsLlNlbmQgb3BlbmlkIHByb2ZpbGUgVXNlci5SZWFkIGVtYWlsIiwic3ViIjoiSUNUMFdnaG9CZXFUS0NQb0FHTjYxRHBtbWZNUmYtRlhHUXB3S1hibTJLayIsInRpZCI6IjdjMGMzNmY1LWFmODMtNGMyNC04ODQ0LTk5NjJlMDE2MzcxOSIsInVuaXF1ZV9uYW1lIjoiMzkxMzJASGV4YXdhcmUuY29tIiwidXBuIjoiMzkxMzJASGV4YXdhcmUuY29tIiwidXRpIjoiODhVYWVLQ1p6VTJldTRBV1JzMFFBQSIsInZlciI6IjEuMCIsInhtc19zdCI6eyJzdWIiOiJfV1ZWbjdFbnRCS0xkTU9aOGk0bGJ6QmVrWFVkaElobFFwU0JudGFKX2Q0In19.iq2n1lUIH9puA2T6RKvHlXQJE1mI4CaneFfwK-Vg92wZSe9pq8-MwhYlzKxQcOedGlo7COgAK4xontD1yU2F8n0h0oIevuQo9q5LH4LqrzBdIIj5W7c5VB_AMtNFS4R404V12x0vnoRAUx_38BfSs6TLfn4i1pZ_fHQhzPEGWaMX2gIxqUAHTAnkxT7O0AW1yExk2_92Kv5T0kGXBSfokaiIhlncsfrTIUPa85TC9pH7tWe3zlz6vEDQO1dC8VfxluCuLGIXklIdc273jkxS9zeb3a9KhSAtYgqFC0Bvei4yKPsUd6PCr0zpaGqfUuUS4IfJJ1f63-Vn1slwUyMjdw"
            }
        };  

        mail.sendEmail(user, mailBody, function (response,err) {
           console.log("user1,,,,,,,,",JSON.stringify(user));
           console.log("mailbody...............",JSON.stringify(mailBody));
            console.log("inside send mail app.js")
            if (err) {
                renderError(res, err);
                return;
            }
            if(res){
                console.log("response from outlook",res);
            }
            console.log("Sent an email");
            response = 'Email has been sent';
            return res.json({
                speech: response,
                displayText: response,
                source: 'portal',
            });
        });

        //         var credentials = {
        //     client: {
        //       id: '8a6b25b5-7148-45ac-a716-98faf826d2fe',
        //       secret: 'dqvntQRX930|=%msRYKD10(',
        //     },
        //     auth: {
        //       tokenHost: 'https://login.microsoftonline.com',
        //       authorizePath: 'common/oauth2/v2.0/authorize',
        //       tokenPath: 'common/oauth2/v2.0/token'
        //     }
        //   };
        //   var oauth2 = require('simple-oauth2').create(credentials);
        //   console.log("valllllllllllllllll", oauth2);
        //             var clientId = req.body.result.parameters.clientId;
        //             var val;
        //             await query.ClientRiskProfileGet({ ClientID: clientId, Active: 'Y' }).then(function (data) {
        //                 console.log("The response from DB risk profile..............", JSON.stringify(data));
        //                 val = data.RiskCategory;
        //             });
        //             response = `Your current risk profile is ${val}`;
        //             return res.json({
        //                 speech: response,
        //                 displayText: response,
        //                 source: 'portal',
        //             });
    }
    if (req.body.result.metadata.intentName == 'EXIT-FUND-OPTION-YES') {
        var fundname = req.body.result.contexts[1].parameters.fund_name ? req.body.result.contexts[1].parameters.fund_name : req.body.result.parameters.fund_name;
        var clientId =  req.body.result.contexts[1].parameters.clientid?req.body.result.contexts[1].parameters.clientid:req.body.sessionId.slice(-6);
        await query.ProductGet({ Name: fundname,Type:'ETF' }).then(async function (funddetails) {
            let productID = funddetails[0].ProductID;
            let productName = funddetails[0].Name;
            await query.productperformanceGet({ ProductID: productID }).then(async function (product) {
                console.log(productID + "=>" + clientId)
                await query.holdingsProfileGet({ ProductID: productID, CustomerID: clientId }).then(async function (holdingsd) {
                    if (product.length > 0 && holdingsd.length > 0) {
                        let currentPrice = product[0].Currentprice;
                        let quantity = holdingsd[0].Quantity;
                        let marketvalue = parseInt(quantity.split(',').join('')) * parseInt(currentPrice);
                        response = `Your ${fundname} is exited. Details of the funds will be emailed to you shortly.`;
                        response += "<br/>Current Price: " + currentPrice + "<br/>";
                        response += "Quantity: " + quantity + "<br/>";
                        response += "Market Value: " + marketvalue + "<br/>";
                        responses = response.replace("<br/>","\n");
                        await query.saveTransactionDetails({CustomerID:clientId,ProductID:productID,Quantity:quantity,Price:currentPrice,Action:"Sell",Date:moment().format("DD-MMM-YY")});
                        const mailBody =
                        {
                            "message": {
                                "subject": "Your Fund "+fundname+" is Exited",
                                "body": {
                                    "contentType": "Text",
                                    "content": responses
                                },
                                "toRecipients": [
                                    {
                                        "emailAddress": {
                                            "address": "40140@hexaware.com"
                                        }
                                    }
                                ]
                            }
                        };
            
                    user = {
                        profile: {
                            oid: "1b02070e-606c-42df-b83d-1af09b29bb1f",
                            displayName: "Nivetha K",
                            accessToken: "eyJ0eXAiOiJKV1QiLCJub25jZSI6IkFRQUJBQUFBQUFEWHpaM2lmci1HUmJEVDQ1ek5TRUZFZjVpSHlwYWtOaGV3NzU0b1U1eUw2ZnBYRHk2dWg0aHdDUGlycnk5aGlya29tZEJuOFctSEo3U3V6QXVHT3MzdjVvVjkzdGhxUzdUTEJGd2lzX01sYUNBQSIsImFsZyI6IlJTMjU2IiwieDV0IjoiN19adWYxdHZrd0x4WWFIUzNxNmxValVZSUd3Iiwia2lkIjoiN19adWYxdHZrd0x4WWFIUzNxNmxValVZSUd3In0.eyJhdWQiOiJodHRwczovL2dyYXBoLm1pY3Jvc29mdC5jb20iLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC83YzBjMzZmNS1hZjgzLTRjMjQtODg0NC05OTYyZTAxNjM3MTkvIiwiaWF0IjoxNTM2NTU2MjY3LCJuYmYiOjE1MzY1NTYyNjcsImV4cCI6MTUzNjU2MDE2NywiYWNjdCI6MCwiYWNyIjoiMSIsImFpbyI6IjQyQmdZTGh0SkxCeDhmbmwvb3NraXZ2NW1WT1VXTlJ1TjUrOS9WRTdYYmNxLzFhdCtVOEEiLCJhbXIiOlsid2lhIl0sImFwcF9kaXNwbGF5bmFtZSI6IkNoYXJsZXNCb3QiLCJhcHBpZCI6IjBlNzY1YjcwLWI1MGUtNDAxNC1iN2IwLTdmZjFjZTM0MzhjNyIsImFwcGlkYWNyIjoiMSIsImZhbWlseV9uYW1lIjoiVmVsdSIsImdpdmVuX25hbWUiOiJTcmluaXZhc2FuIiwiaXBhZGRyIjoiMTY1LjIyNS4xMDQuOTYiLCJuYW1lIjoiU3Jpbml2YXNhbiBWZWx1Iiwib2lkIjoiZTY4ZTYxMmYtYTQ5MC00ODYxLTk0NzQtNjAwMGIyYmEzMjRjIiwib25wcmVtX3NpZCI6IlMtMS01LTIxLTE2NDQ0OTE5MzctODEzNDk3NzAzLTY4MjAwMzMzMC0xNjAxODUiLCJwbGF0ZiI6IjMiLCJwdWlkIjoiMTAwMzAwMDBBODEzM0NGOSIsInNjcCI6IkNhbGVuZGFycy5SZWFkIE1haWwuUmVhZCBvcGVuaWQgcHJvZmlsZSBVc2VyLlJlYWQgZW1haWwiLCJzdWIiOiJYeTBRTXJ0WUk0ck1RcVdIaTA5Q0IwcVo1dEN0ZVlqSHR5Um9qc3BpS0lNIiwidGlkIjoiN2MwYzM2ZjUtYWY4My00YzI0LTg4NDQtOTk2MmUwMTYzNzE5IiwidW5pcXVlX25hbWUiOiI0MDE0MEBoZXhhd2FyZS5jb20iLCJ1cG4iOiI0MDE0MEBoZXhhd2FyZS5jb20iLCJ1dGkiOiJOTm5DczBid3VrR2hNVHJwb2NVQ0FBIiwidmVyIjoiMS4wIiwieG1zX3N0Ijp7InN1YiI6ImJRTi1DNVYyMjRndEwwZlppN052bUNJWGhISVF6alR0LWZNMHFmMDQ3RzQifX0.mxvkGFya1e322jGNUFMRbZGxGkcFd4WnVmdq9QCx_1MIb8R9Q2MvDpWcwBLFyiI3uVJybgNFBRqWNTlCy2PNLXaAmEOzwTTqAldzk0hgP4573-YqCBw_F0UBAjRgSe7imWFVtzB-g3uA90ecl6PcKBFpBu7XQkUGu00gyVkMmhbODRcwaIC4ZrvEHh-H861CjMa-L10YTIQkPcnvfvyNcgZ90QPr1QtvmQ5-ztOc3DimIg0EuZfGv_R-lNXk8GhvWf60_hYUc7bPI4xxWazXWaxodWZADArsRu1LmvqF1i2RBHMmYVk_iNPrEMMz6OTsL66-hdV-7waDDOglr5ptgg"
                        }
                    };  
                   await sendEmail(user, mailBody, function (response,err) {
                       console.log("user1,,,,,,,,",JSON.stringify(user));
                       console.log("mailbody...............",JSON.stringify(mailBody));
                        console.log("inside send mail app.js")
                        if (err) {
                            renderError(res, err);
                            return;
                        }
                        if(res){
                            console.log("response from outlook",res);
                        }
                        console.log("Sent an email");
                    });
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
        await query.ProductGet({ Name: fundname,Type:'ETF' }).then(function (funddetails) {

            if (funddetails.length > 0) {
                msg = {
                    "speech": "",
                    "displayText": "",
                    "messages": [{
                        "type": 4,
                        "platform": "facebook",
                        "payload": {
                            "facebook": {
                                "text": `Do you want to exit the fund ` + fundname,
                                "quick_replies": [{
                                    "content_type": "text",
                                    "title": "Yes",
                                    "payload": "Yes"
                                }, {
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
            else {
                return res.json({
                    speech: "Sorry! The selected funds is Not Available",
                    displayText: response,
                    source: 'portal',
                });
            }
        })
    }
    if (req.body.result.metadata.intentName == 'EXIT-FUND') {
      
        var clientId = req.body.result.parameters.clientid?req.body.result.parameters.clientid:req.body.sessionId.slice(-6);
        console.log(clientId);
        await query.getLowPerformingFund(clientId).then(async function (data) {
            quickreplies = [];
            await data.forEach(function (value) {
                quickreplies.push({
                    "content_type": "text",
                    "title": value.product.Name,
                    "payload": value.product.Name
                })
            })
            console.log(quickreplies)
            if(data.length>0)
            {
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
        } else{
            return res.json({
                speech: "Sorry! No Fund Details Available currently for your profile",
                displayText: response,
                source: 'portal',
            });
        }
        })

    }
})
console.log("Server Running at Port : " + port);

app.listen(port, function () {
    console.log('Listening my app on  PORT: ' + port);
});
