

module.exports.CustomListTemplate = function () {

    var objectList = {
        "type": 1,
        "platform": "Facebook",
        "title" : null,
        "subtitle" : null,
        "buttons" : [{
                "text": "Buy",
                "postback": "Add new fund"

    }]

}

return objectList;
}

module.exports.QuickReplyTemplate = function () {

    var objectList ={
                    "content_type": "text",
                    "title": null,
                    "payload": null
                }

return objectList;
}
