const zeebe = require('zeebe-node');

// See options at https://www.npmjs.com/package/zeebe-node#client-side-retry
const zbc = new zeebe.ZBClient();

async function onReady() {
    await pingTopology()
}

async function onConnectionError() {
    await pingTopology()
}

let firstCall = true
async function pingTopology() {
    const topology = await zbc.topology()
    if (firstCall) {
        console.log(JSON.stringify(topology, null, 2))
        firstCall = false
        const pingIntervalSeconds = process.env.ZEEBE_PING ? parseInt(process.env.ZEEBE_PING) : 60
        setInterval(pingTopology, pingIntervalSeconds * 1000)
    }
}

zbc.on('ready', onReady);
zbc.on('connectionError', onConnectionError);

module.exports = zbc;