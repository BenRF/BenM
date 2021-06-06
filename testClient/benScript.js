let benConn = null;

function connectBen() {
    console.log("Connecting Ben");

    let conn = new WebSocket('ws://localhost:8080');
    conn.addEventListener('open', function (event) {
      conn.send(JSON.stringify({
        name: "Ben",
        password: "pudding"
      }));
    });
    conn.onmessage = newMessage;
    conn.onclose = function(event) {
        setBenToStage(0);
        benConn = null;
    };
    benConn = conn;
    setBenToStage(1);
}

function newMessage(message) {
    let msg = JSON.parse(message.data);
    if (msg.purpose === "generalUpdate") {
        createRequests(msg.clientRequests);
        createChats(msg.activeConversations);
    } else {
        console.log(msg);
    }
}

function setBenToStage(stage) {
    let container = document.querySelector("#Ben div.container");
    if (stage == 0) {
        //Ben is not connected
        container.innerHTML = "<button class='large-btn btn-1 middle' onclick='connectBen()'>Connect</button>";
    } else if (stage == 1) {
        //Bens connected
        container.innerHTML = "<div id='requests' class='request-box'></div><div id='chats' class='current-chat-box'></div><div id='chat' class='chat-box'></div>";
    }
}

function respondToRequest(id, accepted) {
    benConn.send(JSON.stringify({
        purpose: "requestResponce",
        clientId: id,
        verdict: accepted
    }));
}

function createRequests(requests) {
    let container = document.querySelector("div#requests");
    let content = "";
    for (request of requests) {
        content += `
            <div class="request">
                <h1 class="request-title">` + request.name + `</h1>
                <button type="button" class="small-btn btn-1 accept-btn request-btn" onclick="respondToRequest(` + request.id + `,true)">Accept</button>
                <button type="button" class="small-btn btn-1 deny-btn request-btn" onclick="respondToRequest(` + request.id + `,false)">Decline</button>
            </div>
        `;
    }
    container.innerHTML = content;
}

function loadChat(id) {
    console.log("LOADING CHAT FOR ID:" + id);
}

function createChats(chats) {
    let container = document.querySelector("div#chats");
    let content = "";
    for (let chat of chats) {
        content += `
            <div class="request chatOption" onclick="loadChat(` + chat.id + `)">
                <h1 class="request-title">` + chat.name + `</h1>
            </div>
        `;
    }
    container.innerHTML = content;
}
