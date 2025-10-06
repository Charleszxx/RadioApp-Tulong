const express = require("express");
const { WebSocketServer } = require("ws");
const http = require("http");

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// WebSocket handling
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
      ws.name = data.name || "Anonymous";
    
      // Send to self
      ws.send(JSON.stringify({ type: "system", text: `Tuned to ${data.frequency}` }));
    
      // Broadcast join
      wss.clients.forEach(client => {
        if (client !== ws && client.readyState === ws.OPEN && client.frequency === ws.frequency) {
          client.send(JSON.stringify({ type: "system", text: `${ws.name} has joined the channel.` }));
        }
      });
    }

    if (data.type === "message" && ws.frequency) {
      wss.clients.forEach(client => {
        if (client.readyState === ws.OPEN && client.frequency === ws.frequency) {
          client.send(JSON.stringify({ type: "chat", text: `${ws.name}: ${data.text}` }));
        }
      });
    }

    if (data.type === "voice" && ws.frequency) {
      wss.clients.forEach(client => {
        if (
          client !== ws && // exclude the sender
          client.readyState === ws.OPEN &&
          client.frequency === ws.frequency
        ) {
          client.send(JSON.stringify({ type: "voice", buffer: data.buffer }));
        }
      });
    }

    if (data.type === "sos" && ws.frequency) {
      wss.clients.forEach(client => {
        if (
          client !== ws && // exclude sender
          client.readyState === ws.OPEN &&
          client.frequency === ws.frequency
        ) {
          // Send SOS to other clients (modal + message)
          client.send(JSON.stringify({ type: "sos", text: data.text, name: ws.name }));
    
          // Trigger SOS sound playback
          client.send(JSON.stringify({ type: "sos-sound" }));
        }
      });
    }

    if (data.type === "start-speaking" && ws.frequency) {
      // Notify others that this user is speaking
      wss.clients.forEach(client => {
        if (client !== ws && client.readyState === ws.OPEN && client.frequency === ws.frequency) {
          client.send(JSON.stringify({ type: "user-speaking", name: ws.name }));
        }
      });
    }
    
    if (data.type === "stop-speaking" && ws.frequency) {
      // Notify others that this user stopped speaking
      wss.clients.forEach(client => {
        if (client !== ws && client.readyState === ws.OPEN && client.frequency === ws.frequency) {
          client.send(JSON.stringify({ type: "user-stopped-speaking" }));
        }
      });
    }
  });

  ws.on("close", () => {
    if (ws.frequency && ws.name) {
      wss.clients.forEach(client => {
        if (client !== ws && client.readyState === ws.OPEN && client.frequency === ws.frequency) {
          client.send(JSON.stringify({ type: "system", text: `${ws.name} has left the channel.` }));
        }
      });
    }
  });
});

// Serve static frontend from /public folder
app.use(express.static("public"));

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
