const WebSocket = require('ws');

const wss = new WebSocket.Server({
    port: 8080
});

//don't forget to replace with file!!
const password = "pudding";

let clientId = 0;
let benConn = null;

wss.on("connection", function connection(client) {

    console.log("CLIENT JOINED");

    client.info = {
        id: clientId++,
        name: null,
        stage: null,
        isBen: false,
        messages: [],
        active: false
    };

    client.on("message", function incoming(message) {
        let msg = JSON.parse(message);
        if (client.info.stage == null) {
            client.info.name = msg.name;
            if (msg.password == undefined) {
                console.log(msg.name + " HAS JOINED");
                client.info.stage = "waiting";
                updateBen();
            } else if (msg.password == password) {
                console.log("THE BEN IS HERE")
                client.info.isBen = true;
                client.info.stage = "approved";
                benConn = client;
                updateBen();
            }
        } else if (client.info.isBen) {
            //recieve contact and message replies from Ben
            if (msg.purpose == "requestResponce") {
                let client = getClientById(msg.clientId);
                console.log(client.info.name + " was " + (msg.verdict ? "accepted":"denied"));
                client.respond(msg.verdict);
                updateBen();
            }
        } else {
            //recieve message replies from accepted clients
        }
    });

    client.sendMessage = function(message) {
        client.send(JSON.stringify(message));
    }

    client.respond = function(verdict) {
        if (verdict) {
            //client was approved
            client.info.active = true;
            client.info.stage = "approved";
        } else {
            //client was denied
            client.info.active = false;
            client.info.stage = "denied";
        }
        client.sendMessage({
            accepted: verdict
        });
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
            } else if (client.info.stage == "approved") {
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

function getClientById(id) {
    for (client of wss.clients) {
        if (!client.info.isBen && client.info.id == id) {
            return client;
        }
    }
    return null;
}

function messageClient(id, message) {
    getClientById(id).sendMessage(message);
}

function IsJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}
