const socket = io();
/*let cr = document.getElementById('createRoom');
cr.addEventListener('click', e => {
    let roomId = document.getElementById('roomId').value;
    socket.emit('check', roomId);
    document.location.href = 'http://localhost:3000/login/' + roomId;
});*/
let jr = document.getElementById('joinRoom');
jr.addEventListener('click', e => {
    let roomId = document.getElementById('roomId').value;
    socket.emit('check', roomId);
    socket.on('roomOpen', (roomId) => {
        document.location.href = 'https://listening-party-spotify.herokuapp.com/login/' + roomId;
    });
    socket.on('roomMade', (msg) => {
        console.log(msg);
        document.location.href = 'https://listening-party-spotify.herokuapp.com/login/' + roomId + '/' + msg;
    });
});