const socket = io();
const randomString = require('random-string');

var elems = document.querySelectorAll('.modal');
var instances = M.Modal.init(elems);

let emptyIDModal = instances[0];

let sr = document.getElementById('startRoom');
sr.addEventListener('click', e => {
    let roomID = randomString().toLowerCase();
    socket.emit('check', roomID);
    socket.on('roomOpen', (madeRoom) => {
        sessionStorage.host = true;
        roomID = madeRoom;
        document.location.href = ('https://listening-party-spotify.herokuapp.com/login/' + roomID);
        //document.location.href = ('http://localhost:3000/login/' + roomID);
    });
    socket.on('roomMade', (data) => {
        roomID = randomString().toLowerCase();
        socket.emit('check', roomID);
    });
});
let jr = document.getElementById('joinRoom');
jr.addEventListener('click', e => {
    let roomID = document.getElementById('roomID').value.toLowerCase().trim();
    if (roomID === '' || roomID.length < 8) {
        emptyIDModal.open();
        document.getElementById('roomID').value = '';
    } else {
        socket.emit('check', roomID);
        socket.on('roomMade', (roomID) => {
            sessionStorage.host = false;
            document.location.href = ('https://listening-party-spotify.herokuapp.com/login/' + roomID);
            //document.location.href = ('http://localhost:3000/login/' + roomID);
        });
    }
});