const express = require('express');
const bodyParser = require('body-parser');
const busboy = require('connect-busboy');

const app = express();

app.use(bodyParser.json());
app.use(busboy());
app.use(bodyParser.urlencoded({
    extended: true
}));

async function init() {
    app.use(cors)
    app.use(logRequest)
    app.use('/', require('./router'))
    app.use(handleError)

    return app
}

async function cors(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
    next()
}

function logRequest(req, res, next) {
    const obj = {
        headers: req.headers,
        url: req.url,
        method: req.method,
        params: req.params,
        query: req.query,
        body: req.body,
    }

    console.log(`${new Date().toISOString()} [${req.method}] ${req.url}`)
    if (Object.keys(req.body).length) console.log(req.body)

    next()
}

async function handleError(err, req, res, next) {
    console.error(`${new Date().toISOString()} [ERROR]`)
    console.error(err)
    let response = err.response
    if (response && response.data) {
        res.status(response.data.code || response.status || err.status || 500)
    } else {
        res.status(500)
        response = {}
        response.data = {reason: err.message}
    }

    await res.json(response.data)
}

module.exports = {
    init,
}