

module.exports.CustomListTemplate = function () {

    var objectList = {
        "type": 1,
        "platform": "facebook",
        "title": null,
        "subtitle": null,
        "buttons": [{
            "text": "Buy",
            "postback": "Add new fund"
        }]

    }

    return objectList;
}

module.exports.QuickReplyTemplate = function () {

    var objectList = {
        "content_type": "text",
        "title": null,
        "payload": null
    }
    return objectList;
}

module.exports.showMore = function(){
    var show = {
        "content_type": "text",
        "title": "Show more",
        "payload": "Show more"
      }
      return show;
}

module.exports.quickReplyResponse = function(){ 
    var objArr =[
            {
                "content_type": "text",
                "title": "Growth",
                "payload": "Growth"
            },
            {
                "content_type": "text",
                "title": "Adventurous",
                "payload": "Adventurous"
            },
            {
                "content_type": "text",
                "title": "Moderate",
                "payload": "Moderate"
            }
        ]
    return objArr; 
}

module.exports.eventCall ={
followupEvent: {
name: null,
data: {
CurrentProfile: null,
TargetProfile: null,
ClientId : null
}
}
//contextOut: req.body.result.contexts
}

module.exports.CommonEventCall = {
    followupEvent: {
name: null,
data: {    
}
} 
}

module.exports.ExitEventCall ={
    followupEvent : {
        name : null,
        data : {
            ClientId : null,
            fundName : null
        }
    }
};

module.exports.TargetProfileSelectResponse = function(){
    TargetProfileSelectResponse = {
        speech: "",
        messages: [
            {
                "type": 4,
                "platform": "facebook",
                payload: {
                    facebook: {
                        "text": "Please choose the target risk category",
                        quick_replies: []
                    }
                }
            }]
    };
return TargetProfileSelectResponse;
}
