

module.exports.CustomListTemplate = function () {

    var objectList = {
   "speech": null,
   "displayText" : null,
  "messages" : [{
        "type": 1,
        "platform": "Facebook",
        "title" : null,
        "subtitle" : null,
        "buttons" : [{
                "text": "Buy",
                "postback": "Add new fund"

    }]

}]
    }

return objectList;
}
