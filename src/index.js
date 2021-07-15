const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

async function init() {
    app.use(cors)
    app.use(logRequest)
    app.use('/', createRouter())
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

function createRouter() {
    try {
        require('./workers/github')
        const publish = require('./publish')

        const router = express.Router()
        router.post('/publish', async function(req, res, next) {
            const {
                correlationKey,
                name,
                variables = {},
                timeToLive = 10, // seconds
            } = req.body

            const response = await publish.publishMessage(correlationKey, name, variables, timeToLive)
            await res.json(response)
        })

        return router
    } catch (e) {
        console.error(e)
    }
}

module.exports = {
    init,
}