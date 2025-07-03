const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const usersInRoom = {}
io.on('connection', (socket) => {
  console.log(`[+] New connection: ${socket.id}`);

  socket.on('joinRoom', (room, username) => {
    console.log(`[ROOM JOIN] User "${username}" joining room "${room}"`);

    socket.join(room);

    if (!usersInRoom[room]) {
      usersInRoom[room] = new Set();
      console.log(`[ROOM CREATED] Room "${room}" initialized.`);
    }

    usersInRoom[room].add(username);
    socket.username = username;
    socket.room = room;

    console.log(`[ROOM STATUS] Room "${room}" users:`, Array.from(usersInRoom[room]));

    socket.to(room).emit('userJoined', username);

    io.to(room).emit('roomUsers', Array.from(usersInRoom[room]));

    console.log(`[+] "${username}" joined room "${room}"`);
  });

  socket.on('message', (message) => {
    const { roomId, username, text } = message;
    console.log(`[MSG] ${username} in ${roomId}: ${text}`);

    socket.to(roomId).emit('message', { username, text });
  });

  socket.on('codeChange', ({ newHtmlCode, newCssCode, newJavascriptCode, roomId, sender }) => {
    if (!roomId || !sender) {
      console.error('Invalid codeChange payload:', { newHtmlCode, newCssCode, newJavascriptCode, roomId, sender });
      return;
    }
  
    console.log('Received codeChange event:', { newHtmlCode, newCssCode, newJavascriptCode, roomId, sender });
    console.log(`[CODE] Room: ${roomId}, Sender: ${sender}`);
    console.log(`HTML: ${newHtmlCode}, CSS: ${newCssCode}, JS: ${newJavascriptCode}`);
  
    socket.to(roomId).emit('codeChange', { newHtmlCode, newCssCode, newJavascriptCode, sender });
    console.log('Broadcasting codeChange to room:', roomId);
  });

  socket.on('canvasChange', ({ newCanvasData, roomId, sender }) => {
    if (!roomId || !sender) {
      console.error('Invalid canvasChange payload:', { newCanvasData, roomId, sender });
      return;
    }
  
    console.log('Received canvasChange event:', { newCanvasData, roomId, sender });
    console.log(`[CANVAS] Room: ${roomId}, Sender: ${sender}`);
  
    socket.to(roomId).emit('canvasChange', { newCanvasData, sender });
    console.log('Broadcasting canvasChange to room:', roomId);
  
  });

  socket.on("send-file-to", ({ targetId, file }) => {
    if (!targetId || !file || !file.name || !file.buffer) {
      console.warn("Invalid file transfer payload", { targetId, file });
      return;
    }
  
    console.log(`[FILE] ${socket.id} is sending file "${file.name}" to ${targetId}`);
  
    socket.to(targetId).emit("receive-file", {
      from: socket.id,
      file: {
        name: file.name,
        buffer: file.buffer,
        type: file.type || "application/octet-stream",
        size: file.size || 0
      }
    });
  });

  

  socket.on('disconnect', () => {
    const { username, room } = socket;
    console.log(`[-] Disconnection: ${socket.id} (${username || 'unknown user'})`);

    if (room && usersInRoom[room]) {
      usersInRoom[room].delete(username);
      console.log(`[ROOM UPDATE] "${username}" left room "${room}".`);
      console.log(`[ROOM STATUS] Room "${room}" users:`, Array.from(usersInRoom[room]));

      io.to(room).emit('roomUsers', Array.from(usersInRoom[room]));

      if (usersInRoom[room].size === 0) {
        delete usersInRoom[room];
        console.log(`[ROOM CLEANUP] Room "${room}" deleted (empty).`);
      }
    }
  });


  socket.on('leaveRoom', (room, username) => {
    console.log(`[LEAVE] ${username} is leaving room ${room}`);
  
    socket.leave(room);
  
    if (usersInRoom[room]) {
      usersInRoom[room].delete(username);
      io.to(room).emit('roomUsers', Array.from(usersInRoom[room]));
  
      socket.to(room).emit('message', { username: 'System', text: `${username} has left the room.` })
  
      if (usersInRoom[room].size === 0) {
        delete usersInRoom[room];
        console.log(`[ROOM CLEANUP] Room "${room}" deleted (empty).`);
      }
    }
  });

});

server.listen(3000, () => { 
  console.log('Server listening on http://localhost:3000');
});
