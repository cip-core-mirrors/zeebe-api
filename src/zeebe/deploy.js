const zbc = require('./client');

async function deployProcess(definition, name) {
    return await zbc.deployProcess({
        definition,
        name,
    });
}

async function deployProcessFile(path) {
    return await zbc.deployProcess(path);
}

module.exports = {
    deployProcess,
    deployProcessFile,
}