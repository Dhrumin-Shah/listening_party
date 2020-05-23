let SpotifyWebApi = require('spotify-web-api-js');
let s = new SpotifyWebApi();
let queryString = require('query-string');

let parsed = queryString.parse(window.location.search);
let accessToken = parsed.access_token;
let roomID = parsed.room_id;
let device;
let verified = false;
let playlistID;
let playlistURI;

s.setAccessToken(accessToken);

let host = (sessionStorage.host === 'true');
console.log(host);

const socket = io();

window.onSpotifyWebPlaybackSDKReady = () => {
    const token = accessToken;
    const player = new Spotify.Player({
        name: 'Listening Party Player',
        getOAuthToken: cb => {
            cb(token);
        }
    });

    // Error handling
    player.addListener('initialization_error', ({message}) => {
        console.error(message);
    });
    player.addListener('authentication_error', ({message}) => {
        console.error(message);
    });
    player.addListener('account_error', ({message}) => {
        console.error(message);
    });
    player.addListener('playback_error', ({message}) => {
        console.error(message);
    });

    // Playback status updates
    player.addListener('player_state_changed', state => {
        console.log(state);
    });

    // Ready
    player.addListener('ready', ({device_id}) => {
        console.log('Ready with Device ID', device_id);
        device = device_id;
        socket.emit('joinRoom', {roomID: roomID, host: host});
        initialize();
    });

    // Not Ready
    player.addListener('not_ready', ({device_id}) => {
        console.log('Device ID has gone offline', device_id);
    });

    player.connect();

    socket.on('joinUsRequest', (data) => {
        if (verified) {
            s.pause({device_id: device});
        }
        if (host) {
            getState().then(
                (state) => {
                    socket.emit('joinUs', {
                        roomID: roomID,
                        playlistID: playlistID,
                        playlistURI: playlistURI,
                        progress: state.progress_ms,
                        track: state.item,
                        state: state.state,
                        newSocket: data.id
                    });
                },
                (error) => {
                    console.log(error);
                }
            );
        }
    });

    socket.on('joinUs', (data) => {
        s.followPlaylist(data.playlistID, {public: false}).then(
            (res) => {
                console.log('follow successful');
                playlistID = data.playlistID;
                playlistURI = data.playlistURI;
                verified = true;
                socket.emit('joined', data);
            },
            (error) => {
                console.log(error);
            }
        );
    });

    socket.on('message', (msg) => {
        console.log(msg);
    });

    socket.on('joined', (data) => {
        if (data.state === false) {
            s.setVolume(0, {device_id: device});
            s.play({context_uri: playlistURI, device_id: device, offset: {'uri': data.track.uri}});
            setTimeout(() => {
                s.seek(data.progress, {device_id: device});
                s.setVolume(100, {device_id: device});
            }, 1500);
        } else {
            console.log('man joined');
        }
    });

    socket.on('hostLeft', () => {
        socket.disconnect();
        s.pause();
        player.disconnect();
    });


    socket.on('playPause', (data) => {
        playToggle(data);
        console.log(data);
    });

    socket.on('rewind', (e) => {
        s.skipToPrevious();
    });

    socket.on('forward', (e) => {
        s.skipToNext();
    });

    socket.on('add', (data) => {
        if (host) {
            addSong(data);
        }
    });

    socket.on('editTable', (data) => {
        editTable(data);
    });

    async function getUserID() {
        return await s.getMe().then(
            function (data) {
                return data.id;
            },
            function (error) {
                console.log(error);
            });
    }

    async function makePlaylist() {
        let userID = await getUserID();
        return await s.createPlaylist(userID, {name: 'lptest', public: false, collaborative: true}).then(
            function (data) {
                console.log(data);
                return data;
            },
            function (error) {
                console.log(error);
            });
    }

    async function initialize() {
        if (host) {
            verified = true;
            makePlaylist().then(
                (madePlaylist) => {
                    playlistID = madePlaylist.id;
                    playlistURI = madePlaylist.uri;
                    console.log('id ' + playlistID);
                    console.log('uri ' + playlistURI);
                },
                (error) => {
                    console.log(error);
                });
        } else {
            socket.emit('addToSession', {roomID: roomID, id: socket.id});
        }
    }

    for (let i = 0; i < 5; i++) {
        document.getElementById('s' + i).addEventListener('click', e => {
            let track = e.target;
            let uri = track.getAttribute('data-uri');
            let artist = track.getAttribute('data-artist');
            let song = track.getAttribute('data-song');
            let album = track.getAttribute('data-album');
            socket.emit('add', {roomID: roomID, uri: uri, song: song, artist: artist, album: album});
        });
    }

    document.getElementById('rewind').addEventListener('click', e => {
        socket.emit('copyMe', {
            roomID: roomID,
            target: 'rewind'
        });
    });

    document.getElementById('forward').addEventListener('click', e => {
        socket.emit('copyMe', {
            roomID: roomID,
            target: 'forward'
        });
    });

    document.getElementById('toggle').addEventListener('click', e => {
        getState().then(
            (state) => {
                console.log(state);
                socket.emit('copyMe', {
                    roomID: roomID,
                    target: 'toggle',
                    progress: state.progress_ms,
                    track: state.item,
                    state: state.is_playing,
                });
            },
            (error) => {
                console.log(error);
            });
    });

    async function getState() {
        return await s.getMyCurrentPlaybackState().then(
            function (data) {
                return data;
            },
            function (error) {
                console.log(error);
            });
    }


    function addSong(data) {
        s.addTracksToPlaylist(playlistID, [data.uri]).then(
            function (data) {
                console.log('added ' + data);
            },
            function (error) {
                console.log(error);
            });
        socket.emit('editTable', data);
    }

    function editTable(data) {
        let playlist = document.getElementById('playlistItems');
        let newTrack = playlist.insertRow();
        let songCell = newTrack.insertCell(0);
        let artistCell = newTrack.insertCell(1);
        let albumCell = newTrack.insertCell(2);
        songCell.appendChild(document.createTextNode(data.song));
        artistCell.appendChild(document.createTextNode(data.artist));
        albumCell.appendChild(document.createTextNode(data.album));
    }

    function playToggle(data) {
        console.log(data);
        if (data.state === undefined) {
            s.play({context_uri: playlistURI, device_id: device});
                //'offset': {'uri': data.track.uri, 'position_ms': data.progress}});
        } else if (data.state === true) {
            s.pause();
        } else if (data.state === false) {
            s.setVolume(0, {device_id: device});
            s.play({context_uri: playlistURI, device_id: device, offset: {'uri': data.track.uri}});
            setTimeout(() => {
                s.seek(data.progress, {device_id: device});
                s.setVolume(100, {device_id: device});
            }, 1500);
        }
    }

};
