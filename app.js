const logger = require('koa-logger');
const router = require('koa-router')();
const views = require('co-views');
const koa = require('koa');
const path = require('path');
const app = koa();
const promisify = require("promisify-node");
const fse = promisify(require("fs-extra"));
const fs = require('fs');
const serve = require('koa-static');
const bodyParser = require('koa-bodyparser');

const args = process.argv;

app.use(logger());
app.use(bodyParser());
app.use(serve(__dirname + '/dist'));

const render = views(path.join(__dirname, '/views'), {ext: 'ejs'});

router.get(
    '/',
    function *(next) {
        var streamUrl = JSON.parse(yield fse.readFile(path.join(__dirname, 'json/url.json'), 'utf8'));
        console.log(streamUrl);
        this.body = yield render('user', {user: streamUrl});
    }
);

router.post(
    '/url',
    function *(next) {
        console.log(this.request.body);
        var streamUrl = JSON.parse(yield fse.readFile(path.join(__dirname, 'json/url.json'), 'utf8'));
        console.log(streamUrl);

        this.body = streamUrl;
    }
);

app.use(router.routes());
app.use(router.allowedMethods());

// catch all middleware, only land here
// if no other routing rules match
// make sure it is added after everything else
app.use(function *() {
    this.status = 404;
    this.body = 'Invalid URL!';
    // or redirect etc
    // this.redirect('/someotherspot');
});

args.forEach((x, y)=>{
    if (x == "p") {
        port = args[y + 1];
    }
});

const port = process.env.NODE_PORT || 8000
app.listen(port)

console.log('Server start ' + port)
