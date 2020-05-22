(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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
},{}]},{},[1]);
