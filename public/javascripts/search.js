let SpotifyWebApi = require('spotify-web-api-js');
let s = new SpotifyWebApi();
let queryString = require('query-string');

const input = document.querySelector('input');
let parsed = queryString.parse(window.location.search);
let accessToken = parsed.access_token;
s.setAccessToken(accessToken);

let timer = '';

input.addEventListener('input', e => {
    let value = input.value;

    const trimmed = value.trim();

    if (trimmed) {
        clearTimeout(timer);
        input.dataset.state = 'valid';
        timer = setTimeout( () => {
            let search = s.searchTracks(trimmed, { limit: 5 });
            search.then(
                function (data) {
                    let artist;
                    let song;
                    let album;
                    let link;
                    let albumImage;
                    let found = data.tracks.items;
                    for (let i = 0; i < found.length; i++) {
                        artist = found[i].artists[0].name;
                        song = found[i].name;
                        album = found[i].album.name;
                        albumImage = found[i].album.images[0].url;
                        link = found[i].uri;
                        let parent = document.getElementById('s' + i);
                        let childNodes = parent.children;
                        childNodes[0].setAttribute('src', albumImage);
                        childNodes[1].innerHTML = song;
                        childNodes[2].innerHTML = artist;
                        childNodes[3].innerHTML = album;
                        parent.setAttribute("data-uri", link);
                        parent.setAttribute("data-artist", artist);
                        parent.setAttribute("data-song", song);
                        parent.setAttribute("data-album", album);
                        parent.setAttribute("data-albumImage", albumImage);
                    }
                    document.getElementById('searchItems').style.display = 'block';
                },
                function (err) {
                    console.log(err);
                });
        }, 1000);
    } else {
        clearTimeout(timer);
        input.dataset.state = 'invalid';
        document.getElementById('searchItems').style.display = 'none';
    }
});
