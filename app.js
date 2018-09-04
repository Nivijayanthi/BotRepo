var apiai = require('apiai');

var appai = apiai("ee3683b183ec498ea5a1f277a85974fd");
const util = require('util');

var express=require('express');
var bodyParser = require('body-parser');
var app = express();
var port = process.env.PORT || 4000;
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(express.static(__dirname));
//imports
const query = require('./query');


app.post('/fulfillment',function(req,res){
    debugger
    var response;
    console.log("request from dialogflow",JSON.stringify(req.body.result));
    
    if(req.body.result.metadata.intentName == 'CHANGE-RISK-PROFILE'){
      var currentProfile = req.body.result.parameters.CurrentProfile;
      var targetProfie =  req.body.result.parameters.TargetProfile;
      var clientId = req.body.result.parameters.ClientId;
      var val;
      let listOfFunds;

      if(clientId){        
             console.log("currentProfile",currentProfile);
          console.log("targetProfie",targetProfie);
          console.log("clientId",clientId);
         query.ClientRiskProfileGet({ClientID : clientId, Active : 'Y' }).then(function (data){
            console.log("The responae from DB..............",JSON.stringify(data));
            val=data;
         });
         query.giveFundDetails(
             {clientId,currentProfile}).then(function (data){
                console.log("The responae from DB join..............",JSON.stringify(data));
                listOfFunds = data;
            });
          if(val){
          response = 'Please find the fund details';
          }
      }
    

    }   

    return res.json({
        speech:response,
        displayText:response,
        source:'portal',
    });  
        });

console.log("Server Running at Port : " + port);

app.listen(port);
       
            
  
// app.listen(portC, function(){
//     console.log('Listening my app on  PORT: ' + portC);
// });
        