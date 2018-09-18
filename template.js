

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
},
contextOut: req.body.result.contexts
}

module.exports.CommonEventCall = {
    followupEvent: {
name: null,
data: {    
}
} 
}
