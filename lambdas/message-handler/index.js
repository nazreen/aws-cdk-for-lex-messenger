'use strict';

const assert = require('assert');
const https = require('https');
const AWS = require('aws-sdk');

const CONFIG = {
    BOT_NAME: process.env.BOT_NAME,
    BOT_ALIAS: process.env.BOT_ALIAS,
    PAGE_TOKEN: process.env.PAGE_TOKEN,
    VERIFY_TOKEN: process.env.VERIFY_TOKEN
};

exports.handler = async (event) => {
    Object.keys(CONFIG).forEach(key => {
        assert.ok(CONFIG[key], `process.env.${key} must be set`)
    })

    if (event.params && event.params.querystring) {
        // process GET request
        const queryParams = event.params.querystring;
        const rVerifyToken = queryParams['hub.verify_token']

        if (rVerifyToken === CONFIG.VERIFY_TOKEN) {
            const challenge = queryParams['hub.challenge']
            return parseInt(challenge)
        } else {
            return 'Error, wrong validation token'
        }

    } else {
        // process POST request
        assert(event.entry, 'event.entry is undefined')
        const messagingEvents = event.entry[0].messaging;
        for (let i = 0; i < messagingEvents.length; i++) {
            const messagingEvent = messagingEvents[i];

            const sender = messagingEvent.sender.id;
            if (messagingEvent.message && messagingEvent.message.text) {
                const text = messagingEvent.message.text;

                const lexRuntimeOptions = {
                    apiVersion: '2016-11-28',
                    region: 'us-east-1'// for now Lex is only available in selected regions
                }
                const lexruntime = new AWS.LexRuntime(lexRuntimeOptions);
                const lexParams = {
                    botAlias: CONFIG.BOT_ALIAS, /* required */
                    botName: CONFIG.BOT_NAME, /* required */
                    inputText: text,
                    userId: 'STRING_VALUE', /* required */
                };

                const lexResult = await lexruntime.postText(lexParams).promise()

                sendTextMessage(sender, lexResult.message);

                return lexResult
            }
        }

        // return event
    }
};

function sendTextMessage(senderFbId, text) {

    const json = {
        recipient: { id: senderFbId },
        message: { text: text },
    };
    sendAll(json);

}

function sendAll(jsonParameter) {
    let json;
    if (Array.isArray(jsonParameter)) {
        json = jsonParameter[0];
    }
    else {
        json = jsonParameter;
    }

    const body = JSON.stringify(json);
    const path = '/v2.6/me/messages?access_token=' + CONFIG.PAGE_TOKEN;
    const options = {
        host: "graph.facebook.com",
        path: path,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    };
    const callback = function (response) {
        const str = ''
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

    const req = https.request(options, callback);
    req.on('error', function (e) {
        console.log('problem with request: ' + e);
    });

    req.write(body);
    req.end();
}
