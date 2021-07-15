const axios = require('axios');
const zeebe = require('zeebe-node');

const zbc = new zeebe.ZBClient(process.env.ZEEBE_HOST, {
    retry: true,
    maxRetries: -1, // infinite retries
});

zbc.on('ready', () => console.log(`Client connected!`));
zbc.on('connectionError', () => console.log(`Client disconnected!`));

function logVariables(job, worker) {
    worker.log(`Task variables: ${JSON.stringify(job.variables)}`);
}

const githubInstance = axios.create({
    headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
    },
    baseURL: process.env.GITHUB_URL,
});

async function listActions(job, _, worker) {
    logVariables(job, worker);
    await job.complete({
        available_actions: [
            'create-repository',
            'delete-repository',
        ],
    });
}

async function createRepository(job, _, worker) {
    logVariables(job, worker);

    const output = {};

    const { org_id, repo } = job.variables;
    try {
        const repository = await githubInstance.post(`/orgs/${org_id}/repos`, {
            name: repo,
        });
        output.repo_created = true;
        output.repo = repository.data;
    } catch (e) {
        console.error(e);
        output.repo_created = false;
        output.error = JSON.parse(JSON.stringify(e));
    } finally {
        await job.complete(output);
    }
}

async function deleteRepository(job, _, worker) {
    logVariables(job, worker);

    const output = {};

    const { org_id, repo } = job.variables;
    try {
        const repository = await githubInstance.delete(`/repos/${org_id}/${repo}`);
        output.repo_deleted = true;
    } catch (e) {
        console.error(e);
        output.repo_deleted = false;
        output.error = JSON.parse(JSON.stringify(e));
    } finally {
        await job.complete(output);
    }
}

async function checkRepository(job, _, worker) {
    logVariables(job, worker);

    const output = {};

    const { org_id, repo } = job.variables;
    try {
        const repository = await githubInstance.get(`/repos/${org_id}/${repo}`);
        output.repo_exists = true;
        output.repo = repository.data;
    } catch (e) {
        output.repo_exists = false;
    } finally {
        await job.complete(output);
    }
}

function createWorker(type, handler, options = {}) {
    Object.assign(options, {
        taskType: type,
        taskHandler: handler,
    });
    const zbWorker = zbc.createWorker(options);

    zbWorker.on('ready', () => console.log(`Worker "${type}" connected!`));
    zbWorker.on('connectionError', () => console.log(`Worker "${type}" disconnected!`));
}

createWorker('list-github-actions', listActions, {
    timeout: zeebe.Duration.seconds.of(5),
});
createWorker('check-github-repository', checkRepository);
createWorker('create-github-repository', createRepository);
createWorker('delete-github-repository', deleteRepository);