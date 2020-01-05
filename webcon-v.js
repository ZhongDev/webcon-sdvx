// require
const fs = require("fs");
const os = require("os");
//const robot = require("robotjs");
const ks = require("node-key-sender");
ks.setOption("startDelayMillisec", 0);
ks.setOption("globalDelayBetweenMillisec", 0);
ks.setOption("globalDelayPressMillisec", 0);
const WebSocket = require("ws");
const connect = require("connect");
const serveStatic = require("serve-static");

// configuration of imported packages
//robot.setKeyboardDelay(0); //remove 10ms sleep delay
const wss = new WebSocket.Server({ port: 8443 });

// import key configuration
const keyencodingmap = JSON.parse(fs.readFileSync("keyencodingmap.json"));
const keybindings = JSON.parse(fs.readFileSync("keybindings.json"));
var encodedbindings = {};
MergeEncodingBinding(keyencodingmap, keybindings);

// handle websocket requests
wss.on("connection", function connection(ws) {
  ws.on("message", function incoming(msg) {
    console.log(msg);
    if (msg.length > 1) {
      var unbufferedmsg = msg.match(/.{1,2}/g);
      for (var arr of unbufferedmsg) {
        var arr = msg.split("");
        switch (arr[0]) {
          case "1":
            keydown(arr[1]);
            break;
          case "0":
            keyup(arr[1]);
            break;
        }
      }
    }
  });
});

// initiate sever
connect()
  .use(serveStatic(__dirname + "/html"))
  .listen(8080, function() {
    console.log("HTML Server is running on http://" + getipv4() + ":8080");
  });

//getipv4
function getipv4() {
  var ifaces = os.networkInterfaces();
  var addr = [];

  Object.keys(ifaces).forEach(function(ifname) {
    var alias = 0;
    ifaces[ifname].forEach(function(iface) {
      if ("IPv4" !== iface.family || iface.internal !== false) {
        // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
        return;
      }

      if (alias >= 1) {
        // this single interface has multiple ipv4 addresses
        addr.push(iface.address);
      } else {
        // this interface has only one ipv4 adress
        addr.push(iface.address);
      }
      ++alias;
    });
  });

  return addr[0];
}

function MergeEncodingBinding(keyencodingmap, keybindings) {
  for (var key of Object.entries(keyencodingmap)) {
    var path = key[1].split(".");
    encodedbindings[key[0]] = keybindings[path[0]][path[1]];
  }
}

async function keydown(key) {
  ks.startBatch()
    .batchTypeKey(encodedbindings[key], 0, 3)
    .sendBatch();
}

async function keyup(key) {
  ks.startBatch()
    .batchTypeKey(encodedbindings[key], 0, 2)
    .sendBatch();
}
