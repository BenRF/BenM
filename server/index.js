const WebSocket = require('ws');

const wss = new WebSocket.Server({
    port: 8080
});

//don't forget to replace with file!!
const password = "pudding";

let clientId = 0;
let benConn = null;

wss.on("connection", function connection(client) {

    client.info = {
        id: clientId++,
        name: null,
        stage: null,
        isBen: false,
        messages: [],
        active: false
    };

    client.on("message", function incoming(message) {
        if (IsJsonString(message.data)) {
            let msg = JSON.parse(message.data);

            if (client.info.stage == null) {
                client.info.name = msg.name;
                if (msg.password == undefined) {
                    client.info.stage = "waiting";
                    updateBen();
                } else if (msg.password == password) {
                    client.info.isBen = true;
                    client.info.stage = "approved";
                    benConn = client;
                }
            } else if (client.info.isBen) {
                //recieve contact and message replies from Ben
            } else {
                //recieve message replies from accepted clients
            }
        } else {
            client.send("NOT VALID JSON");
        }
    });

    client.sendMessage = function(message) {
        client.send(JSON.stringify(message));
    }

    client.getSummary = function() {
        let summary = {
            id: client.info.id,
            name: client.info.name,
        };
        if (client.info.stage == "approved") {
            summary.msgCount = client.info.messages.length;
        }
        return summary;
    }

    client.on("close", function close(){
        if (client.info.isBen) {
            benConn = null;
        } else {
            client.info.active = false;
            updateBen();
        }
    });
});

function updateBen() {
    let updateMsg = {
        purpose: "generalUpdate",
        clientRequests: [],
        activeConversations: [],
        inActiveConversations: []
    }
    for (client of wss.clients) {
        if (!client.info.isBen) {
            let summary = client.getSummary();
            if (client.info.stage == "waiting") {
                updateMsg.clientRequests.push(summary);
            } else if (client.stage == "approved") {
                if (client.info.active) {
                    updateMsg.activeConversations.push(summary);
                } else {
                    updateMsg.inActiveConversations.push(summary);
                }
            }
        }
    }
    messageBen(updateMsg);
}

function messageBen(message) {
    if (benConn !== null) {
        benConn.sendMessage(message);
    }
}

function messageClient(id, message) {
    for (client of wss.clients) {
        if (!client.info.isBen && client.info.id == id) {
            client.sendMessage(message);
            break;
        }
    }
}

function IsJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}
