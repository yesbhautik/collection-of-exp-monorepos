const express = require('express');
const app = express();
__path = process.cwd()
const bodyParser = require("body-parser");
const PORT = process.env.PORT || 8000;
let code = require('./pair');
const path = require('path');
require('events').EventEmitter.defaultMaxListeners = 500;
app.use('/code', code);
app.use('/pair', async (req, res, next) => {
    res.sendFile(path.join(__dirname, '/pair.html'));
});
app.use('/', async (req, res, next) => {
    res.sendFile(path.join(__dirname, '/main.html'));
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.listen(PORT, () => {
    console.log(`YoutTube: @yesbhautik\nTelegram: @yesbhautik\nGitHub: @yesbhautik\nInstsgram: @yesbhautik\n\nServer running on http://localhost:` + PORT)
})

module.exports = app
