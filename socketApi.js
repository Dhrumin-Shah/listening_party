var socket_io = require('socket.io');
var io = socket_io();
var socketApi = {};

io.on('connection', function(socket){
    socket.on('joinRoom', (roomId) => {
        console.log(roomId);
        socket.join(roomId);

        io.to(roomId).emit('message', 'another mf joined');
    });

    socket.on('addToSession', (data) => {
        io.to(data).emit('joinUsRequest');
    });

    socket.on('joinUsRequest', (data) => {
        io.to(data).emit('joinUs');
    });

    socket.on('joinUs', (data) => {
        io.to(data.roomID).emit('joinUs', (data));
    });

    socket.on('check', (roomId) => {
        if (io.sockets.adapter.rooms[roomId] === undefined) {
            io.to(socket.id).emit('roomOpen', roomId);
        } else {
            io.to(socket.id).emit('roomMade', 'newMember');
        }
    });

    socket.on('joined', (data) => {
        io.to(data.roomID).emit('joined', data);
    });

    socket.on('copyMe', (data) => {
        if (data.target === 'toggle') {
            io.to(data.roomID).emit('playPause', data);
        } else if (data.target === 'rewind') {
            io.to(data.roomID).emit('rewind');
        } else if (data.target === 'forward') {
            io.to(data.roomID).emit('forward');
        }
    });

    socket.on('add', (data) => {
        io.to(data.roomID).emit('add', data.uri);
    })

});

socketApi.io = io;

module.exports = socketApi;