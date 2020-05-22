let SpotifyWebApi = require('spotify-web-api-js');
let s = new SpotifyWebApi();
let queryString = require('query-string');

const input = document.querySelector('input');
let parsed = queryString.parse(window.location.search);
let accessToken = parsed.access_token;
s.setAccessToken(accessToken);

input.addEventListener('input', e => {
    let value = input.value;

    const trimmed = value.trim();

    if (trimmed) {
        input.dataset.state = 'valid';
        let search = s.searchTracks(trimmed, { limit: 5 });
        search.then(
            function (data) {
                for (let i = 0; i < 5; i++) {
                    document.getElementById('s' + i).innerHTML = '';
                }
                let artist;
                let song;
                let album;
                let link;
                let found = data.tracks.items;
                for (let i = 0; i < found.length; i++) {
                    artist = found[i].artists[0].name;
                    song = found[i].name;
                    album = found[i].album.name;
                    link = found[i].uri;
                    document.getElementById('s' + i).innerHTML += song + ' - ' + artist + ' - ' + album;
                    document.getElementById('s' + i).setAttribute("data-uri", link);
                    document.getElementById('s' + i).setAttribute("data-artist", artist);
                    document.getElementById('s' + i).setAttribute("data-song", song);
                    document.getElementById('s' + i).setAttribute("data-album", album);
                }
                document.getElementById('searchItems').style.display = 'block';
            },
            function (err) {
                console.log(err);
            }
        );
    } else {
        input.dataset.state = 'invalid';
        for (let i = 0; i < 5; i++) {
            document.getElementById('s' + i).innerHTML = '';
        }
        document.getElementById('searchItems').style.display = 'none';
    }
});
