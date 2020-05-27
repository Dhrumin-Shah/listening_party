let SpotifyWebApi = require('spotify-web-api-js');
let s = new SpotifyWebApi();
let queryString = require('query-string');

let parsed = queryString.parse(window.location.search);
let accessToken = parsed.access_token;
let roomID = parsed.room_id;
let device;
let verified = false;

s.setAccessToken(accessToken);

let host = (sessionStorage.host === 'true');
console.log(host);

let trackList = [];
let user;

document.getElementById('roomID').innerHTML = 'Room ID: ' + roomID;

let elems = document.querySelectorAll('.modal');
let instances = M.Modal.init(elems);

let joiningModal = instances[0];

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
        if (
            this.state
            && state.track_window.previous_tracks.find(x => x.id === state.track_window.current_track.id)
            && !this.state.paused
            && state.paused
        ) {
            console.log('Track ended');

        }
        if (state.paused) {
            document.getElementById('playButton').innerHTML = 'play_arrow';
        } else if (!state.paused) {
            document.getElementById('playButton').innerHTML = 'pause';
        }
        document.getElementById('currentlyPlaying').innerHTML = 'Now Playing: ' + state.track_window.current_track.name + ' by ' + state.track_window.current_track.artists[0].name;
    });

    // Ready
    player.addListener('ready', ({device_id}) => {
        console.log('Ready with Device ID', device_id);
        device = device_id;
        s.getMe().then((data) => {
            user = data;
            socket.emit('joinRoom', {roomID: roomID, host: host, user: user});
        });
    });

    // Not Ready
    player.addListener('not_ready', ({device_id}) => {
        console.log('Device ID has gone offline', device_id);
    });

    player.connect();

    socket.on('roomEntered', (data) => {
        initialize();
    });

    socket.on('joinUsRequest', (data) => {
        joiningModal.open();
        if (verified) {
            player.getCurrentState().then((state) => {
                if (host) {
                    if (!state) {
                        socket.emit('joinUs', {
                            roomID: roomID,
                            newSocket: data.id,
                            trackList: trackList
                        })
                    } else {
                        socket.emit('joinUs', {
                            roomID: roomID,
                            progress: state.position,
                            track: state.track_window.current_track,
                            newSocket: data.id,
                            trackList: trackList,
                            paused: state.paused
                        });
                    }
                }
            });
        }
    });

    socket.on('joinUs', (data) => {
        trackList = data.trackList;
        verified = true;
        socket.emit('roomMessage', {user: user, type: 'joined', roomID: roomID});
        if (editTableJoining(data.trackList)) {
            socket.emit('joined', {state: data, user: user});
        }
    });

    socket.on('joined', (data) => {
        joiningModal.close();
        if (data.state.paused !== undefined) {
            if (!data.state.paused) {
                player.setVolume(0).then(() => {
                    s.play({device_id: device, uris: trackList, offset: {uri: data.state.track.uri}}).then(() => {
                        s.seek(data.state.progress).then(() => {
                            s.setVolume(100);
                        });
                    });
                });
            } else if (data.state.paused) {
                player.setVolume(0).then(() => {
                    s.play({device_id: device, uris: trackList, offset: {uri: data.state.track.uri}}).then(() => {
                        s.seek(data.state.progress).then(() => {
                            s.pause().then(() => {
                                s.setVolume(100);
                            });
                        });
                    });
                });
            }
        }
    });

    socket.on('hostLeft', () => {
        socket.disconnect();
        s.pause();
        player.disconnect();

    });


    socket.on('playPause', (data) => {
        if (data.paused !== undefined) {
            player.togglePlay();
        } else {
            s.play({device_id: device, uris: trackList});
        }
    });

    socket.on('rewind', (e) => {
        player.previousTrack();
    });

    socket.on('forward', (e) => {
        player.nextTrack();
    });

    socket.on('add', (data) => {
        trackList.push(data.uri);
        editTable(data);
        if (data.paused !== undefined) {
            if (data.paused) {
                player.setVolume(0);
                s.play({device_id: device, uris: trackList, offset: {uri: data.track.uri}}).then(() => {
                    s.seek(data.progress).then(() => {
                        s.pause().then(() => {
                            s.setVolume(100);
                        });
                    });
                });
            } else if (!data.paused) {
                player.setVolume(0);
                s.play({device_id: device, uris: trackList, offset: {uri: data.track.uri}}).then(() => {
                    s.seek(data.progress).then(() => {
                        player.setVolume(1);
                    });
                });
            }
        }
    });

    socket.on('editTable', (data) => {
        editTable(data);
    });

    socket.on('changeSong', (uri) => {
        s.play({uris: trackList, device_id: device, offset: {uri: uri}});
    });

    socket.on('newChat', (data) => {
        let messageBox = document.createElement('div');
        messageBox.className += 'messageBox';
        let messageSender = document.createElement('span');
        messageSender.classList.add('grey-text');
        messageSender.innerHTML = data.user.display_name;
        let message = document.createElement('div');
        message.classList.add('message', 'grey', 'darken-4');
        let messageContent = document.createElement('span');
        messageContent.className += 'white-text';
        messageContent.innerHTML = data.newChat;
        message.appendChild(messageContent);
        messageBox.appendChild(messageSender);
        messageBox.appendChild(message);
        chatMessages.insertBefore(messageBox, chatMessages.firstChild);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    });

    socket.on('roomMessage', (data) => {
        let messageBox = document.createElement('div');
        messageBox.className += 'messageBox';
        let messageSender = document.createElement('span');
        messageSender.classList.add('grey-text');
        if (data.type === 'joined') {
            messageSender.innerHTML = data.user.display_name + ' joined';
        } else if (data.type === 'left') {
            console.log('wtf');
            messageSender.innerHTML = data.user + ' left';
        } else {
            messageSender.innerHTML = data.user.display_name + ' added ' + data.song;
        }
        messageBox.appendChild(messageSender);
        chatMessages.insertBefore(messageBox, chatMessages.firstChild);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    });

    async function initialize() {
        if (host) {
            verified = true;
        } else {
            socket.emit('addToSession', {roomID: roomID, id: socket.id});
        }
    }

    for (let i = 0; i < 5; i++) {
        let track = document.getElementById('s' + i);
        track.addEventListener('click', e => {
            let uri = track.getAttribute('data-uri');
            let artist = track.getAttribute('data-artist');
            let song = track.getAttribute('data-song');
            let album = track.getAttribute('data-album');
            let tag = e.target;
            if (tag.tagName === 'I') {
                player.getCurrentState().then((state) => {
                    if (!state) {
                        socket.emit('add', {
                            roomID: roomID,
                            uri: uri,
                            song: song,
                            artist: artist,
                            album: album
                        });
                    } else {
                        socket.emit('add', {
                            roomID: roomID,
                            uri: uri,
                            song: song,
                            artist: artist,
                            album: album,
                            paused: state.paused,
                            progress: state.position,
                            track: state.track_window.current_track
                        });
                    }
                });
                document.getElementById('search').value = '';
                socket.emit('roomMessage', { roomID: roomID, song: song, user: user, type: 'addSong'});
            }
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
        console.log(trackList);
        player.getCurrentState().then((state) => {
            if (!state) {
                socket.emit('copyMe', {
                    roomID: roomID,
                    target: 'toggle',
                });
            } else {
                socket.emit('copyMe', {
                    roomID: roomID,
                    target: 'toggle',
                    progress: state.position,
                    track: state.track_window.current_track,
                    paused: state.paused
                });
            }
        });
    });

    document.getElementById('playlistItems').addEventListener('click', e => {
        let element = e.target.parentNode;
        console.log(element);
        let uri = element.getAttribute('data-uri');
        socket.emit('changeSong', {roomID: roomID, uri: uri});
    });

    let chatMessages = document.getElementById('chatMessages');
    document.getElementById('messageSend').addEventListener('click', e => {
        let newChat = document.getElementById('messageInput').value;
        socket.emit('newChat', {newChat: newChat, roomID: roomID, user: user});
        document.getElementById('messageInput').value = '';
    });

    document.getElementById('messageInput').addEventListener('keypress', e => {
        if (e.key === 'Enter') {
            e.preventDefault();
            document.getElementById('messageSend').click();
        }
    });

    function editTable(data) {
        let playlistBody = document.getElementById('playlistBody');
        let newTrack = playlistBody.insertRow();
        newTrack.setAttribute('data-uri', data.uri);
        newTrack.setAttribute('href', '#');
        let songCell = newTrack.insertCell(0);
        let artistCell = newTrack.insertCell(1);
        let albumCell = newTrack.insertCell(2);
        songCell.appendChild(document.createTextNode(data.song));
        artistCell.appendChild(document.createTextNode(data.artist));
        albumCell.appendChild(document.createTextNode(data.album));
    }

    function editTableJoining(data) {
        let playlistBody = document.getElementById('playlistBody');
        let trackIDs = [];
        data.forEach((element) => {
            let id = element.slice(14);
            trackIDs.push(id);
        });
        s.getTracks(trackIDs).then((trackList) => {
            trackList.tracks.forEach((element) => {
                let newTrack = playlistBody.insertRow();
                newTrack.setAttribute('data-uri', element.uri);
                newTrack.setAttribute('href', '#');
                let songCell = newTrack.insertCell(0);
                let artistCell = newTrack.insertCell(1);
                let albumCell = newTrack.insertCell(2);
                songCell.appendChild(document.createTextNode(element.name));
                artistCell.appendChild(document.createTextNode(element.artists[0].name));
                albumCell.appendChild(document.createTextNode(element.album.name));
            });
        });
        return true;
    }

};
