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
        if (rooms.has(data.roomID)) {
            rooms.get(data.roomID).push([socket.id, data.user.display_name, data.host]);
        }
        socket.emit('roomEntered', data);
    });

    socket.on('addToSession', (data) => {
        socket.broadcast.to(data.roomID).emit('joinUsRequest', data);
    });

    socket.on('joinUs', (data) => {
        io.to(data.newSocket).emit('joinUs', (data));
    });

    socket.on('joined', (data) => {
        io.to(data.state.roomID).emit('joined', data);
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
        io.to(data.roomID).emit('newChat', data);
    });

    socket.on('roomMessage', (data) => {
        io.to(data.roomID).emit('roomMessage', data);
    });

    socket.on('disconnecting', (stuff) => {
        let socketRooms = Object.keys(socket.rooms);
        socket.on('disconnect', (reason) => {
            if (reason === 'transport close') {
                console.log(socket.id + ' disconnected');
                socketRooms.forEach((roomID) => {
                    if (rooms.has(roomID)) {
                        let roomSockets = rooms.get(roomID);
                        roomSockets.forEach(element => {
                            if (element[0] === socket.id) {
                                if (element[2]) {
                                    io.to(roomID).emit('hostLeft');
                                    rooms.delete(roomID);
                                } else {
                                    io.to(roomID).emit('roomMessage', {user: element[1], type: 'left'});
                                }
                            }
                        });
                    }
                });
            }
        });
    });

});

socketApi.io = io;

module.exports = socketApi;