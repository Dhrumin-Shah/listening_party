var socket_io = require('socket.io');
var io = socket_io();
var socketApi = {};

let rooms = new Map();

io.on('connection', function(socket){
    socket.on('check', (roomID) => {
        if (!rooms.has(roomID)) {
            console.log(roomID + ' created');
            rooms.set(roomID, []);
            io.to(socket.id).emit('roomOpen', roomID);
        } else {
            io.to(socket.id).emit('roomMade', roomID);
        }
    });

    socket.on('joinRoom', (data) => {
        console.log(data.roomID);
        socket.join(data.roomID);
        if (rooms.has(roomID)) {
            rooms.get(data.roomID).push(socket.id);
        }

        socket.broadcast.to(data.roomID).emit('message', 'another person joined');
    });

    socket.on('addToSession', (data) => {
        socket.broadcast.to(data.roomID).emit('joinUsRequest', data);
    });

    socket.on('joinUsRequest', (data) => {
        io.to(data).emit('joinUs');
    });

    socket.on('joinUs', (data) => {
        io.to(data.newSocket).emit('joinUs', (data));
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
        io.to(data.roomID).emit('add', data);
    });

    socket.on('editTable', (data) => {
        io.to(data.roomID).emit('editTable', data);
    });

    socket.on('changeSong', (data) => {
        io.to(data.roomID).emit('changeSong', data.uri);
    });

    socket.on('newChat', (data) => {
        console.log('new chat');
        io.to(data.roomID).emit('newChat', data);
    });

    socket.on('disconnecting', (stuff) => {
        let socketRooms = Object.keys(socket.rooms);
        socket.on('disconnect', (reason) => {
            if (reason === 'transport close') {
                console.log(socket.id + ' disconnected');
                socketRooms.forEach((roomID) => {
                    if (rooms.has(roomID)) {
                        let roomSockets = rooms.get(roomID);
                        if (roomSockets[0] === socket.id) {
                            io.to(roomID).emit('hostLeft');
                            rooms.delete(roomID);
                            /*for (let i = 1; i < roomSockets.length; i++) {
                                io.to()
                            }*/
                        }
                    }
                });
            }
        });
    });

});

socketApi.io = io;

module.exports = socketApi;