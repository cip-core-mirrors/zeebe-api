const zeebe = require('zeebe-node');
const zbc = require('./client');

async function publishMessage(correlationKey, name, variables, timeToLive) {
    return await zbc.publishMessage({
        correlationKey,
        name,
        variables,
        timeToLive: zeebe.Duration.seconds.of(timeToLive), // seconds
    });
}

module.exports = {
    publishMessage,
}