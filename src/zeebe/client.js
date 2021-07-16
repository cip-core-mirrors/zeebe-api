const zeebe = require('zeebe-node');

const zbc = new zeebe.ZBClient(process.env.ZEEBE_HOST, {
    retry: true,
    maxRetries: -1, // infinite retries
    maxRetryTimeout: zeebe.Duration.seconds.of(5),
});

zbc.on('ready', () => console.log(`Client connected!`));
zbc.on('connectionError', () => console.log(`Client disconnected!`));

module.exports = zbc;