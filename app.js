const app = require('express')();
const uID = require('uid');
const WebSocket = require('ws');

// configuring port to listen
app.set('port', process.env.PORT || 8080);
var server = app.listen(app.get('port'), function(req,res){
	console.log('app listen on :'+ server.address().port);
})

const wss = new WebSocket.Server({ server: server});

let connections = [];
wss.on('connection', function(ws) {
    ws.id = uID(10);
    connections.push(ws);
    console.log('connect with ' + ws.id);
    console.log('current connections: ', connections.length);
    sendMessageToConnection(ws, 'connect message', JSON.stringify(connections.map((i)=> i.id)));
    ws.on('message', function(data) {
        console.log("received from "+ ws.id +": ", data);
        connections.forEach(function(connection) {
            sendMessageToConnection(connection, 'text message', data);
        })
    });

    ws.on('close', function () {
        console.log('close connection');
        connections.splice(connections.indexOf(ws), 1);
    })
})

function sendMessageToConnection(connection, type, message) {
    // check if connection is still avalable
    if(connections.find((session) => session.id === connection.id) == -1) return;
    let payload = {
        type: type,
        data: message
    };
    connection.send(JSON.stringify(payload));
}

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/public/index.html');
});

