const zeebe = require('zeebe-node');
const zbc = require('./client');

async function createProcessInstance(processId, variables = {}, timeout) {
    const options = {
        bpmnProcessId: processId,
        variables,
    }

    if (timeout) {
        options.requestTimeout = zeebe.Duration.seconds.of(timeout)
        return await zbc.createProcessInstanceWithResult(options)
    } else {
        return await zbc.createProcessInstance(options)
    }
}

module.exports = {
    createProcessInstance,
}