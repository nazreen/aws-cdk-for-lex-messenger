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

function sendDots(senderFbId) {
    var json = {
        recipient: { id: senderFbId },
        sender_action: "typing_on"
    };
    sendAll(json);
}