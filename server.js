const express = require("express");
const { WebSocketServer } = require("ws");
const http = require("http");

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
  ws.frequency = null;

  ws.on("message", (msg) => {
    let data;
    try {
      data = JSON.parse(msg);
    } catch (err) {
      return;
    }

    if (data.type === "join") {
      ws.frequency = data.frequency;
      ws.send(JSON.stringify({ type: "system", text: `Tuned to frequency ${data.frequency}` }));
    }

    if (data.type === "message" && ws.frequency) {
      wss.clients.forEach(client => {
        if (client.readyState === ws.OPEN && client.frequency === ws.frequency) {
          client.send(JSON.stringify({ type: "chat", text: data.text }));
        }
      });
    }

    if (data.type === "voice" && ws.frequency) {
      wss.clients.forEach(client => {
        if (client.readyState === ws.OPEN && client.frequency === ws.frequency) {
          client.send(JSON.stringify({ type: "voice", buffer: data.buffer }));
        }
      });
    }
  });

  ws.on("close", () => {
    console.log("A user disconnected");
  });
});

app.use(express.static("public"));

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
const express = require("express");
const { WebSocketServer } = require("ws");
const http = require("http");

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
  ws.frequency = null;

  ws.on("message", (msg) => {
    let data;
    try {
      data = JSON.parse(msg);
    } catch (err) {
      return;
    }

    if (data.type === "join") {
      ws.frequency = data.frequency;
      ws.send(JSON.stringify({ type: "system", text: `Tuned to frequency ${data.frequency}` }));
    }

    if (data.type === "message" && ws.frequency) {
      wss.clients.forEach(client => {
        if (client.readyState === ws.OPEN && client.frequency === ws.frequency) {
          client.send(JSON.stringify({ type: "chat", text: data.text }));
        }
      });
    }

    if (data.type === "voice" && ws.frequency) {
      wss.clients.forEach(client => {
        if (client.readyState === ws.OPEN && client.frequency === ws.frequency) {
          client.send(JSON.stringify({ type: "voice", buffer: data.buffer }));
        }
      });
    }
  });

  ws.on("close", () => {
    console.log("A user disconnected");
  });
});

app.use(express.static("public"));

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
