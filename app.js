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
    // var dialogFlowResponse ={        
    //             speech : "hello",
    //             messages : []
    // }
    var dialogFlowResponse = {
  "speech": "hello",
  "messages": [
    {
      "type": 4,
      "platform": "Facebook",
      "payload": {
        "facebook": {
          "text": "Please find the list of funds avaialable for your risk category",
          "quick_replies": [
            {
              "content_type": "text",
              "title": "FULL",
              "payload": "Add new fund"
            },
            {
              "content_type": "text",
              "title": "FRANK",
              "payload": "Add new fund"
            },
            {
              "content_type": "text",
              "title": "FIRST",
              "payload": "Add new fund"
            },
            {
              "content_type": "text",
              "title": "GF INTERNATIONAL",
              "payload": "Add new fund"
            }
          ]
        }
      }
    }
  ]
};

var content ={
speech: '',
messages: [{
"type": 4,
"platform": "facebook",
"payload": {
"facebook": {
"text": "Your alternate contact number and alternate communication channel will be updated on or before " + myDate + ". The ticket# is " + data.result.u_number + ". Is there anything else I may help you with?",
"quick_replies": [{
"content_type": "text",
"title": "Yes",
"payload": "another_query"
},
{
"content_type": "text",
"title": "No thanks",
"payload": "no_thanks"
}
]
}
}
}]
};
   
    var msg = {
        type: 4,
        platform: "Facebook",
        payload :{
            facebook : {
                text : null,
                quick_replies : []
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
            msg.payload.facebook.text = "Please find the list of funds avaialable for your risk category";          
            listOfFunds.forEach(async function (value) {                
                objList.title = value;
                 await msgList.push(JSON.parse(JSON.stringify(objList)));
            });
            //console.log("masssssssssssssss",JSON.stringify(msgList));
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
            // listOfFunds.forEach(async function (value) {                
            //     objList.title = value;
            //      await msgList.push(JSON.parse(JSON.stringify(objList)));
            // });
            // console.log("masssssssssssssss",JSON.stringify(msgList));
            // msg.payload.facebook.text = "Please find the list of funds avaialable for your risk category";
            // msg.payload.facebook.quick_replies = msgList;
            // await dialogFlowResponse.messages.push(msg);
            console.log("Final msgggggggggggggggggg", JSON.stringify(content));
            return res.json(content);
        } else {
            response = "Sorry!!There are no funds available under your new risk category";
            return res.json({
                speech: response,
                displayText: response,
                source: 'portal',
            });
        }


    }
    if (req.body.result.metadata.intentName == 'CHANGE-RISK-PROFILE-SEND-EMAIL') {
        console.log("i am inside exit fund");
        var clientId = req.body.result.parameters.ClientID;

    }
})
console.log("Server Running at Port : " + port);

app.listen(port, function () {
    console.log('Listening my app on  PORT: ' + port);
});




