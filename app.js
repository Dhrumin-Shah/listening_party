var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var request = require('request');
var querystring = require('querystring');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var roomRouter = require('./routes/room.js');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/room', roomRouter);

let redirect_uri =
    process.env.REDIRECT_URI ||
    'http://localhost:3000/callback';

let roomId;
let newMember;
app.get('/login/:roomId', function(req, res) {
    roomId = req.params.roomId;
    res.redirect('https://accounts.spotify.com/authorize?' +
        querystring.stringify({
            response_type: 'code',
            client_id: process.env.SPOTIFY_CLIENT_ID,
            scope: 'user-read-private user-read-email streaming user-modify-playback-state user-read-playback-state user-read-currently-playing playlist-modify-private playlist-modify-public',
            redirect_uri
        }))
});

app.get('/login/:roomId/:newMember', function(req, res) {
    roomId = req.params.roomId;
    newMember = req.params.newMember;
    res.redirect('https://accounts.spotify.com/authorize?' +
        querystring.stringify({
            response_type: 'code',
            client_id: process.env.SPOTIFY_CLIENT_ID,
            scope: 'user-read-private user-read-email streaming user-modify-playback-state user-read-playback-state user-read-currently-playing playlist-modify-private playlist-modify-public',
            redirect_uri
        }))
});

app.get('/callback', function(req, res) {
    let code = req.query.code || null;
    let authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        form: {
            code: code,
            redirect_uri,
            grant_type: 'authorization_code'
        },
        headers: {
            'Authorization': 'Basic ' + (new Buffer(
                process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET
            ).toString('base64'))
        },
        json: true
    };
    request.post(authOptions, function(error, response, body) {
        var access_token = body.access_token;
        let uri = process.env.FRONTEND_URI_HANDLE || 'http://localhost:3000/room';
        if (newMember === null) {
            res.redirect(uri + '?access_token=' + access_token + '&room_id=' + roomId);
        } else {
            res.redirect(uri + '?access_token=' + access_token + '&room_id=' + roomId + '&newMember=' + newMember);
        }
    })
});

module.exports = app;
