const socket = io();
const randomString = require('random-string');

let sr = document.getElementById('startRoom');
sr.addEventListener('click', e => {
    let roomID = randomString().toLowerCase();
    socket.emit('check', roomID);
    socket.on('roomOpen', (madeRoom) => {
        sessionStorage.host = true;
        roomID = madeRoom;
        document.location.href = ('https://listening-party-spotify.herokuapp.com/login/' + roomID);
        //'https://listening-party-spotify.herokuapp.com/login/' + roomID;
        //('http://localhost:3000/login/' + roomID);
    });
    socket.on('roomMade', (data) => {
        roomID = randomString().toLowerCase();
        socket.emit('check', roomID);
    });
});
let jr = document.getElementById('joinRoom');
jr.addEventListener('click', e => {
    let roomID = document.getElementById('roomID').value.toLowerCase().trim();
    console.log(roomID);
    socket.emit('check', roomID);
    socket.on('roomMade', (roomID) => {
        sessionStorage.host = false;
        document.location.href = ('https://listening-party-spotify.herokuapp.com/login/' + roomID);
        //'https://listening-party-spotify.herokuapp.com/login/' + roomID;
        //('http://localhost:3000/login/' + roomID);
    });
});