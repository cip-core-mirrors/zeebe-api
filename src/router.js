const express = require('express')
const fs = require('fs')

const publish = require('./zeebe/publish')
const deploy = require('./zeebe/deploy')
const instance = require('./zeebe/instance')

//require('./zeebe/workers/github')

const router = express.Router()

router.post('/publishMessage', publishMessage)
router.post('/createProcess', deployProcess)
router.post('/createProcessFile', deployProcessFile)
router.post('/createProcessInstance', createProcessInstance)

async function publishMessage(req, res, next) {
    const {
        correlationKey,
        name,
        variables = {},
        timeToLive = 10, // seconds
    } = req.body

    try {
        const response = await publish.publishMessage(correlationKey, name, variables, timeToLive)
        await res.json(response)
    } catch (e) {
        next(e)
    }
}

async function createProcessInstance(req, res, next) {
    const {
        processId,
        variables = {},
        timeout, // seconds
    } = req.body

    try {
        const response = await instance.createProcessInstance(processId, variables, timeout)
        await res.json(response)
    } catch (e) {
        next(e)
    }
}

const directory = './files'
if (!fs.existsSync(directory)){
    fs.mkdirSync(directory);
}

async function deployProcessFile(req, res, next) {
    try {
        req.pipe(req.busboy);
        req.busboy.on('file', function (fieldname, file, filename) {
            const path = directory + '/' + filename
            fs.closeSync(fs.openSync(path, 'w'))
            const fstream = fs.createWriteStream(path)
            file.pipe(fstream)
            fstream.on('close', async function () {
                const response = await deploy.deployProcessFile(path)
                await res.json(response)
                fs.unlinkSync(path)
            })
        })
    } catch (e) {
        next(e)
    }
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
        next(e)
    }
}

module.exports = router