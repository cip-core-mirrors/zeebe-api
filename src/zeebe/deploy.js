const zbc = require('./client');

async function deployProcess(definition, name) {
    return await zbc.deployProcess({
        definition,
        name,
    });
}

module.exports = {
    deployProcess,
}