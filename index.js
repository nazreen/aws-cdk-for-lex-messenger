'use strict';

var https = require('https');
var AWS = require('aws-sdk');
var PAGE_TOKEN = "PAGE_TOKEN_HERE";

var VERIFY_TOKEN = "12345678";

var CONFIG = {
    BOT_NAME: 'BOT_NAME',
    BOT_ALIAS: 'BOT_ALIAS',
};

exports.handler = (event, context, callback) => {

    // process GET request
    if (event.params && event.params.querystring) {
        var queryParams = event.params.querystring;
        var rVerifyToken = queryParams['hub.verify_token']

        if (rVerifyToken === VERIFY_TOKEN) {
            var challenge = queryParams['hub.challenge']
            callback(null, parseInt(challenge))
        } else {
            callback(null, 'Error, wrong validation token');
        }

        // process POST request
    } else {

        var messagingEvents = event.entry[0].messaging;
        for (var i = 0; i < messagingEvents.length; i++) {
            var messagingEvent = messagingEvents[i];

            var sender = messagingEvent.sender.id;
            if (messagingEvent.message && messagingEvent.message.text) {
                var text = messagingEvent.message.text;

                var lexruntime = new AWS.LexRuntime();
                var lexParams = {
                    botAlias: CONFIG.BOT_ALIAS, /* required */
                    botName: CONFIG.BOT_NAME, /* required */
                    inputText: text,
                    userId: 'STRING_VALUE', /* required */
                };

                lexruntime.postText(lexParams, function (err, data) {
                    if (err) console.log(err, err.stack); // an error occurred
                    else {
                        console.log(data)

                        sendTextMessage(sender, data.message);

                        callback(null, "Done")
                    }
                });


            }
        }

        callback(null, event);
    }
};

function sendDots(senderFbId) {
    var json = {
        recipient: { id: senderFbId },
        sender_action: "typing_on"
    };
    sendAll(json);
}

function sendTextMessage(senderFbId, text) {

    var json = {
        recipient: { id: senderFbId },
        message: { text: text },
    };
    sendAll(json);

}

function sendMediaMessage(senderFbId, url, type) {

    var json = {
        recipient: { id: senderFbId },
        message: { attachment: { type: type, payload: { url: url } } }
    };
    sendAll(json);

}

function sendTextAndMediaMessage(senderFbId, text, url, type) {
    var jsonArray = [];

    jsonArray.push({
        recipient: { id: senderFbId },
        message: { text: text },
    });

    jsonArray.push({
        recipient: { id: senderFbId },
        message: { attachment: { type: type, payload: { url: url } } }
    });

    sendAll(jsonArray);

}

function sendAll(jsonParameter) {
    var json;
    if (Array.isArray(jsonParameter)) {
        json = jsonParameter[0];
    }
    else {
        json = jsonParameter;
    }

    var body = JSON.stringify(json);
    var path = '/v2.6/me/messages?access_token=' + PAGE_TOKEN;
    var options = {
        host: "graph.facebook.com",
        path: path,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    };
    var callback = function (response) {
        var str = ''
        response.on('data', function (chunk) {
            str += chunk;
        });
        response.on('end', function () {
            if (Array.isArray(jsonParameter)) {
                if (jsonParameter.length > 1) {
                    jsonParameter.shift();
                    sendAll(jsonParameter);
                }
            }
        });
    }

    var req = https.request(options, callback);
    req.on('error', function (e) {
        console.log('problem with request: ' + e);
    });

    req.write(body);
    req.end();
}
