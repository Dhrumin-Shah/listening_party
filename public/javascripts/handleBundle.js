(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
/*
 * random-string
 * https://github.com/valiton/node-random-string
 *
 * Copyright (c) 2013 Valiton GmbH, Bastian 'hereandnow' Behrens
 * Licensed under the MIT license.
 */

'use strict';

var numbers = '0123456789',
    letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
    specials = '!$%^&*()_+|~-=`{}[]:;<>?,./';


function _defaults (opts) {
  opts || (opts = {});
  return {
    length: opts.length || 8,
    numeric: typeof opts.numeric === 'boolean' ? opts.numeric : true,
    letters: typeof opts.letters === 'boolean' ? opts.letters : true,
    special: typeof opts.special === 'boolean' ? opts.special : false,
    exclude: Array.isArray(opts.exclude)       ? opts.exclude : []
  };
}

function _buildChars (opts) {
  var chars = '';
  if (opts.numeric) { chars += numbers; }
  if (opts.letters) { chars += letters; }
  if (opts.special) { chars += specials; }
  for (var i = 0; i <= opts.exclude.length; i++){
    chars = chars.replace(opts.exclude[i], "");
  }
  return chars;
}

module.exports = function randomString(opts) {
  opts = _defaults(opts);
  var i, rn,
      rnd = '',
      len = opts.length,
      exclude = opts.exclude,
      randomChars = _buildChars(opts);
  for (i = 1; i <= len; i++) {
    rnd += randomChars.substring(rn = Math.floor(Math.random() * randomChars.length), rn + 1);
  }
  return rnd;
};


},{}],2:[function(require,module,exports){
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
},{"random-string":1}]},{},[2]);
