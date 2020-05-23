const socket = io();

let jr = document.getElementById('joinRoom');
jr.addEventListener('click', e => {
    let roomID = document.getElementById('roomID').value;
    console.log(roomID);
    socket.emit('check', roomID);
    socket.on('roomOpen', (roomID) => {
        sessionStorage.host = true;
        document.location.href = ('https://listening-party-spotify.herokuapp.com/login/' + roomID);
        //'https://listening-party-spotify.herokuapp.com/login/' + roomID;
        //('http://localhost:3000/login/' + roomID);
        //(process.env.FRONTEND_URI_LOGIN + roomID) ||
    });
    socket.on('roomMade', (roomID) => {
        sessionStorage.host = false;
        document.location.href = ('https://listening-party-spotify.herokuapp.com/login/' + roomID);
        //'https://listening-party-spotify.herokuapp.com/login/' + roomID;
        //('http://localhost:3000/login/' + roomID);
        //(process.env.FRONTEND_URI_LOGIN + roomID);
    });
});