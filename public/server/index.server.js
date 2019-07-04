const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const fs = require('fs');
const path = require('path');

server.listen(9318);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.get('/settings', (req, res) => {
  res.json(
    JSON.parse(
      fs.readFileSync(path.resolve(__dirname, '../../runtime/settings.json')).toString()
    )
  );
});

app.use('/assets', express.static(path.join(__dirname, 'assets')));

io.on('connection', function (socket) {
  socket.on('refresh-settings', (data) => {
    socket.broadcast.emit('refresh-settings', data);
  });
  socket.on('update-result', (data) => {
    socket.broadcast.emit('update-result', data);
  });
  socket.on('update-language', (data) => {
    socket.broadcast.emit('update-language', data);
  });
  socket.on('update-colors', (data) => {
    socket.broadcast.emit('update-colors', data);
  });
});

module.exports = {};