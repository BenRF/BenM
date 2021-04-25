let clientConns = [null, null];
let names = ["Fred", "Josh"];

function connectClient(id) {
    console.log("Connecting client " + id);
    let conn = new WebSocket('ws://localhost:8080');
    conn.addEventListener('open', function (event) {
      conn.send(JSON.stringify({
        name: names[id]
      }));
    });
    clientConns[id] = conn;
    setClientToStage(id,1);
}

function setClientToStage(id, stage) {
    let container = document.querySelector("#" + names[id] + " div.container");
    if (stage == 0) {
        //Client is not connected
        container.innerHTML = "<button class='large-btn btn-1 middle' onclick='connectClient(" + id + ")'>Connect</button>";
    } else if (stage == 1) {
        //Client waiting to hear back from Ben
        container.innerHTML = "<h2 class='WaitingTitle'>Waiting on Ben</h2>";
    }
}
