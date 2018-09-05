

module.exports.CustomListTemplate = function () {

    var objectList = {

    "speech" : null,

   "displayText" : null,

   "title" : null,

    "subtitle" : null,

  "messages" : [{

        "type": 1,

        "platform": "Facebook",

        "title": null,

        "buttons" : [{
                "text": "Buy",
                "postback": "Add new fund"

    }]

}]
    }

return objectList;
}
