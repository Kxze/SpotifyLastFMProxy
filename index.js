const express = require('express');
const fetch = require('node-fetch');
const FormData = require('form-data');
var compress = require('compression');
const util = require('util');
const app = express();

app.use(compress());

// Authentication
app.post('/', async (req, res) => {
    const response = await fetch('http://64.30.224.237' + req.originalUrl, {
        method: 'POST',
        headers: req.headers,
        compress: true,
    });

    //console.log(util.inspect(response, false, null));
    res.send(await response.text());
});

app.post('/np_1.2', (req, res) => {
    console.log('Now playing request');
    res.send();
});

app.post('/protocol_1.2', (req, res) => {
    console.log('request!');
});

app.listen('80', () => {
    console.log('listening');
});