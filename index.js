const express = require('express');
const fetch = require('node-fetch');
const FormData = require('form-data');
const compress = require('compression');
const bodyParser = require('body-parser');
const encode = require('./formurlencoded.js');
const sqlite = require('sqlite');
const util = require('util');
const app = express();

app.use(compress());
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());

const asyncDiscard = (cb) => (req, res, next) => cb(req, res).catch(next);

// Authentication
app.post('/', async (req, res) => {
    try {
        const response = await fetch('http://64.30.224.237' + req.originalUrl, {
            method: 'POST',
            headers: req.headers,
            compress: true,
        });

        res.send(await response.text());
    } catch (err) { }
});

// Now playing. This doesn't work, not exactly sure why. Could try using Last FM's official API.
app.post('/np_1.2', async (req, res) => {
    try {
        console.log(req.body['a']);
        console.log(req.body['t']);
        const filter = await app.settings.db.get(`SELECT * FROM filters WHERE artist = '${req.body['a']}' AND track = '${req.body['t']}'`);
        console.log(filter);

        const body = {};
        if (filter) {
            body['a'] = filter.newArtist;
            body['t'] = filter.newTrack;
            body['b'] = filter.newAlbum;
            body['n'] = filter.newNumber;
        } else {
            body['a'] = req.body['a'];
            body['t'] = req.body['t'];
            body['b'] = req.body['b'];
            body['n'] = req.body['n'];
        }

        for (let [k, v] of Object.entries(req.body).filter(i => i[0] !== 'a' && i[0] !== 't' && i[0] !== 'b' && i[0] !== 'n')) {
            body[k] = v;
        }

        const response = await fetch('http://64.30.224.237:80' + req.originalUrl, {
            method: 'POST',
            headers: req.headers,
            body: encode(req.body)
        });

        const text = await response.text();
        res.send(text);
    } catch (err) { }
});

// Scrobble
app.post('/protocol_1.2', async (req, res) => {
    try {
        const filter = await app.settings.db.get(`SELECT * FROM filters WHERE artist = '${req.body['a[0]']}' AND track = '${req.body['t[0]']}'`);

        const body = {};
        if (filter) {
            body['a[0]'] = filter.newArtist;
            body['t[0]'] = filter.newTrack;
        } else {
            body['a[0]'] = req.body['a[0]'];
            body['t[0]'] = req.body['t[0]'];
        }

        for (let [k, v] of Object.entries(req.body).filter(i => i[0] !== 'a[0]' && i[0] !== 't[0]')) {
            body[k] = v;
        }

        const response = await fetch('http://64.30.224.237:80' + req.originalUrl, {
            method: 'POST',
            headers: req.headers,
            body: encode(body)
        });

        res.send(await response.text());
    } catch (err) { }
});

app.listen('80', async () => {
    app.set('db', await sqlite.open('database.db'));

    await app.settings.db.get('CREATE TABLE IF NOT EXISTS filters(ID INTEGER PRIMARY KEY, artist TEXT, track TEXT, newArtist TEXT, newTrack TEXT)');
    console.log('listening');
});