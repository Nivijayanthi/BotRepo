

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

module.exports.TargetProfileSelectResponse = {
    "facebook": {
        "text": "Please choose the target risk category",
        "quick_replies": []
    }
}

module.exports.quickReplyResponse = [
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
        ];

module.exports.eventCall ={
followupEvent: {
name: null,
data: {
"phone-number": "",
"MSG": ""
}
} 
//contextOut: req.body.result.contexts
}
