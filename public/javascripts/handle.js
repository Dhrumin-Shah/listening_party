const socket = io();

let jr = document.getElementById('joinRoom');
jr.addEventListener('click', e => {
    let roomId = document.getElementById('roomId').value;
    console.log(roomId);
    socket.emit('check', roomId);
    socket.on('roomOpen', (roomId) => {
        document.location.href = 'https://listening-party-spotify.herokuapp.com/login/' + roomId;
        //('http://localhost:3000/login/' + roomId);
        //(process.env.FRONTEND_URI_LOGIN + roomId) ||
    });
    socket.on('roomMade', (msg) => {
        console.log(msg);
        document.location.href = 'https://listening-party-spotify.herokuapp.com/login/' + roomId + '/' + msg;
        //('http://localhost:3000/login/' + roomId + '/' + msg);
        //(process.env.FRONTEND_URI_LOGIN + roomId + '/' + msg)
    });
});