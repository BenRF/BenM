let clientConns = [null, null];
let names = ['Fred', 'Josh'];

function connectClient(id) {
    console.log('Connecting client ' + id);
    let conn = new WebSocket('ws://localhost:8080');
    conn.addEventListener('open', function (event) {
      conn.send(JSON.stringify({
        name: names[id]
      }));
    });
    conn.onmessage = function(msg) {
        recieveResponce(id,msg)
    };
    conn.onclose = function(event) {
        setClientToStage(id, 0);
        clientConns[id] = null;
    };
    clientConns[id] = conn;
    setClientToStage(id,1);
}

function recieveResponce(id,message) {
    let msg = JSON.parse(message.data);
    if (msg.accepted) {
        //client was accepted
        setClientToStage(id,2);
        clientConns[id].onmessage = function(msg) {
            recieveMessage(id,msg);
        }
    } else {
        setClientToStage(id,0);
    }
}

function recieveMessage(id, message) {

}

function setClientToStage(id, stage) {
    let container = document.querySelector('#' + names[id] + ' div.container');
    if (stage == 0) {
        //Client is not connected
        container.innerHTML = "<button class='large-btn btn-1 middle' onclick='connectClient(" + id + ")'>Connect</button>";
    } else if (stage == 1) {
        //Client waiting to hear back from Ben
        container.innerHTML = "<h2 class='WaitingTitle'>Waiting on Ben</h2>";
    } else if (stage == 2) {
        //Client accepted and chat starting
        container.innerHTML = `
            <div class='messageBox'></div>
            <div class='inputBox'>
                <input type='text' class='messageTextBox' placeholder='Message'/>
                <button type='button' name='Send' class='btn-1 send-btn'>Send</button>
            </div>
        `;
    }
}
