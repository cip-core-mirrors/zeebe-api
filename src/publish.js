const zeebe = require('zeebe-node');

const zbc = new zeebe.ZBClient(process.env.ZEEBE_HOST, {
    retry: true,
    maxRetries: -1, // infinite retries
});

zbc.on('ready', () => console.log(`Client connected!`));
zbc.on('connectionError', () => console.log(`Client disconnected!`));

async function publishMessage(correlationKey, name, variables, timeToLive) {
    return await zbc.publishMessage({
        correlationKey,
        name,
        variables,
        timeToLive: zeebe.Duration.seconds.of(timeToLive), // seconds
    });
}

/*
zbc.publishMessage({
        correlationKey: 'cengizmurat',
        name: 'github-repo-name',
        variables: { repo: 'test-zeebe-2' },
        timeToLive: zeebe.Duration.seconds.of(timeToLive), // seconds
});

zbc.publishMessage({
    correlationKey: 'cengizmurat',
    //messageId: uuid.v4(),
    name: 'github-choose-action',
    variables: { action: 'create-repository' },
    //timeToLive: zeebe.Duration.seconds.of(10), // seconds
});
 */

module.exports = {
    publishMessage,
}