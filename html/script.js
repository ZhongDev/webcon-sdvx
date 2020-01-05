var ws = new WebSocket("ws://" + window.location.hostname + ":8443");

var vol = {
  l: -1,
  r: -1
};

var volprevdir = {
  l: -1,
  r: -1
};

var voldictinverse = {
  l: ["0", "1"],
  r: ["2", "3"]
};

var voldict = {
  l: ["1", "0"],
  r: ["3", "2"]
};

var keydict = {
  a: "5",
  b: "6",
  c: "7",
  d: "8",
  fxa: "9",
  fxb: "A",
  start: "4"
};

ws.onmessage = function(event) {
  console.log(event.data);
};

async function btdown(key) {
  ws.send("1" + keydict[key]);
}

async function btup(key) {
  ws.send("0" + keydict[key]);
}

async function volup(key) {
  ws.send("0" + voldict[key][volprevdir[key]]);
}

async function voldown(event, key) {
  vol[key] = event.touches[0].clientX;
}

async function vollmove(event, key) {
  var direction = -1;
  var x = event.touches[0].clientX;
  if (x > vol[key]) {
    direction = 1;
  } else if (x < vol[key]) {
    direction = 0;
  } else {
    return;
  }
  if (direction != volprevdir[key]) {
    ws.send("0" + voldictinverse[key][direction]);
    ws.send("1" + voldict[key][direction]);
    volprevdir[key] = direction;
  }
}
