const express = require('express')

const publish = require('./zeebe/publish')
const deploy = require('./zeebe/deploy')
const instance = require('./zeebe/instance')

//require('./zeebe/workers/github')

const router = express.Router()

router.post('/publishMessage', publishMessage)
router.post('/createProcess', deployProcess)
router.post('/createProcessInstance', createProcessInstance)

async function publishMessage(req, res, next) {
    const {
        correlationKey,
        name,
        variables = {},
        timeToLive = 10, // seconds
    } = req.body

    const response = await publish.publishMessage(correlationKey, name, variables, timeToLive)
    await res.json(response)
}

async function createProcessInstance(req, res, next) {
    const {
        processId,
        variables = {},
        timeout, // seconds
    } = req.body

    const response = await instance.createProcessInstance(processId, variables, timeout)
    await res.json(response)
}

async function deployProcess(req, res, next) {
    try {
        req.pipe(req.busboy);
        req.busboy.on('file', function (fieldname, file, filename) {
            const chunks = [];
            file.on('data', function (d) {
                chunks.push(d);
            }).on('end', async function () {
                try {
                    const response = await deploy.deployProcess(Buffer.concat(chunks), filename)
                    await res.json(response)
                } catch (e) {
                    console.error(new Date().toISOString())
                    console.error(e)
                    res.status(500)
                    await res.send(e.toString())
                }
            });
        })
    } catch (e) {
        console.error(new Date().toISOString())
        console.error(e)
        res.status(500)
        await res.send(e.toString())
    }
}

module.exports = router