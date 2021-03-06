const request = require('request-promise-native');
const db = require('./db');
const user = require('./user');
const config = require('./config');
const address = require('../../package.json').config.server;


module.exports = {
    vol: {
        update: updateVol,
        like: likeVol,
        likeTrack: likeVolTrack,
        isLiked: vol => config.get('likedVols').includes(vol)
    },
    single: {
        update: updateSingle,
        like: likeSingle,
        isLiked: id => config.get('liedSingles').includes(id)
    }
};


async function updateVol() {
    const data = JSON.parse(await request(`http://${address}/vols/${await db.vol.latest()}`));
    if (data.length === 0) return console.log(`All vol updated`);
    for (vol of data) {
        await db.vol.add(vol);
        for (track of vol.tracks)
            await db.track.add(track)
    }
}


async function updateSingle() {
    const data = JSON.parse(await request(`http://${address}/singles/${await db.single.latest()}`));
    if (data.length === 0) return console.log(`All single updated`);
    for (single of data)
        await db.single.add(single)
}


async function likeVol(volIndex, volId, liked) {
    let index;
    await user.like({
        type: 'vol',
        id: volId
    });
    let likedVols = config.get('likedVols');
    if (liked) likedVols.unshift(volIndex);
    else {
        index = likedVols.indexOf(volIndex);
        likedVols = likedVols.slice(0, index)
            .concat(likedVols.slice(index + 1, likedVols.length))
    }
    config.set({ likedVols: likedVols });
    return likedVols;
}


async function likeVolTrack(volId, trackId, liked) {
    await user.like({
        type: 'volTrack',
        id: trackId,
        from: volId,
    });
    return _likedTrackToConfig(trackId, liked);
}


async function likeSingle(singleId, fromId, liked) {
    await user.like({
        type: 'single',
        id: singleId,
        from: fromId,
    });
    return _likedTrackToConfig(singleId, liked);
}


function _likedTrackToConfig(id, liked) {
    let index;
    let likedTracks = config.get('likedTracks');
    if (liked) likedTracks.unshift(id);
    else  {
        index = likedTracks.indexOf(id);
        likedTracks = likedTracks.slice(0, index)
            .concat(likedTracks.slice(index + 1, likedTracks.length))
    }
    config.set({ likedTracks: likedTracks });
    return likedTracks;
}
