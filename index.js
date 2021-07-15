require('dotenv').config()

const app = require('./src')

app.init().then(app => {
    const port = process.env.PORT || 3000
    app.listen(port, () => {
        console.log(`[INFO] Listening on port ${port}`)
    })
}).catch(e => {
    console.error(`[FATAL] Error starting server`)
    console.error(e)
})