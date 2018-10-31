const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail', // Although not always - check https://nodemailer.com/ for more information
    auth: {
        user: '<YOUR EMAIL - 3rd party applications must be enabled to work>',
        pass: '<YOUR PASSWORD>'
    }
});

const URLS = require('url');
const pendingConfirms = {};
const users = [];

String.prototype.hash = function() {
    var hash = 0, i, chr;
    if (this.length === 0) return hash;
    for (i = 0; i < this.length; i++) {
        chr = this.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0;
    }
    return hash;
};

function key(length) {
    let id = '';
    const string = 'abcdefhijklmnopqrstuvwxyz0123456789ABDECFGHIJKLMNOPQRSTUVWXYZ';
    for (var i = 0; i < length; i++) {
        id += string[parseInt(Math.random() * string.length)];
    }

    return id;
}

const server = require('infinite-waiter').loadFromConfig({
    port: 1234,
    root: '<PATH TO ROOT>',
    equal: {
        '/': '/index.html'
    },
    illegal: [{
        value: '/server.js',
        regex: false
    }],
    'error-pages': [{
        type: 404,
        file: '/error/404.html'
    },{
        type: 403,
        file: '/error/403.html'
    }]
});

server.specific.push({
    getPath: function() {
        return '/signup'
    },
    open: function(res, req) {
        const data = URLS.parse(req.url, true);

        res.writeHead(200, {'content-type': 'application/json'});
        res.write(JSON.stringify({
            success: true,
            email: data.query.email
        }));
        res.end();

        const id = key(15);
        pendingConfirms[id] = {email: data.query.email, username: data.query.username, password: data.query.password.hash(), note: '', keys: []};

        transporter.sendMail({
            from: '<SAME EMAIL AS LOGGED IN WITH ABOVE>',
            to: data.query.email,
            subject: 'IntelliNote: Please Confirm Your Email Address',
            html: require('fs').readFileSync(server.root + '/email-content.html').toString().replace('[USERNAME]', data.query.username).replace(/\[ADDRESS\]/g, 'localhost:' + server.port).replace('[ID]', id)
        }, function(error, info){
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });

        return 200;
    }
});

server.specific.push({
    getPath: function() {
        return '/confirm'
    },
    open: function(res, req) {
        const data = URLS.parse(req.url, true);

        if (pendingConfirms[data.query.id] != null) {
            const user = pendingConfirms[data.query.id];
            users.push(user);

            res.writeHead(200, {'content-type': 'application/json'});
            res.write(JSON.stringify({
                success: true,
                key: genKey(user, req),
                username: user.username
            }));
            res.end();

            delete pendingConfirms[data.query.id];

            return 200;
        } else {
            res.writeHead(403, {'content-type': 'application/json'});
            res.write(JSON.stringify({
                success: false,
                error: 'ID does not exist.'
            }));
            res.end();

            return 403;
        }
    }
});

server.specific.push({
    getPath: function() {
        return '/read'
    },
    open: function(res, req) {
        const data = URLS.parse(req.url, true);

        for (const user of users) {
            for (const userKey of user.keys) {
                if (userKey.id == data.query.key && userKey.ip == req.connection.remoteAddress) {
                    res.writeHead(200, {'content-type': 'application/json'});
                    res.write(JSON.stringify({
                        success: true,
                        content: user.note,
                    }));
                    res.end();
                    return 200;
                }
            }
        }

        res.writeHead(403, {'content-type': 'application/json'});
        res.write(JSON.stringify({
            success: false,
            error: 'Invalid key'
        }));
        res.end();

        return 403;
    }
});

function genKey(user, req) {
    const id = key(50);
    user.keys.push({id: id, ip: req.connection.remoteAddress});

    return id;
}

server.specific.push({
    getPath: function() {
        return '/key';
    },
    open: function(res, req) {
        const data = URLS.parse(req.url, true);

        for (const user of users) {
            if (user.email == data.query.email && user.password == data.query.password.hash()) {
                res.writeHead(200, {'content-type': 'application/json'});
                res.write(JSON.stringify({
                    success: true,
                    key: genKey(user, req),
                    username: user.username
                }));
                res.end();
                return 200;
            }
        }

        res.writeHead(403, {'content-type': 'application/json'});
        res.write(JSON.stringify({
            success: false,
            error: 'Invalid username or password'
        }));
        res.end();

        return 403;
    }
})

server.specific.push({
    getPath: function() {
        return '/write'
    },
    open: function(res, req) {
        const data = URLS.parse(req.url, true);

        for (const user of users) {
            for (const userKey of user.keys) {
                if (userKey.id == data.query.key && userKey.ip == req.connection.remoteAddress) {
                    user.note = data.query.text;

                    res.writeHead(200, {'content-type': 'application/json'});
                    res.write(JSON.stringify({
                        success: true
                    }));
                    res.end();
                    return 200;
                }
            }
        }

        res.writeHead(403, {'content-type': 'application/json'});
        res.write(JSON.stringify({
            success: false,
            error: 'Invalid key'
        }));
        res.end();
        return 403;
    }
});

server.specific.push({
    getPath: function() {
        return '/logout'
    },
    open: function(res, req) {
        const data = URLS.parse(req.url, true);

        for (const user of users) {
            for (var i = 0; i < user.keys.length; i++) {
                const userKey = user.keys[i];
                if (userKey.id == data.query.key && userKey.ip == req.connection.remoteAddress) {
                    user.keys.splice(i, 1);

                    res.writeHead(200, {'content-type': 'application/json'});
                    res.write(JSON.stringify({
                        success: true
                    }));
                    res.end();
                    return 200;
                }
            }
        }

        res.writeHead(403, {'content-type': 'application/json'});
        res.write(JSON.stringify({
            success: false,
            error: 'Invalid key'
        }));
        res.end();
        return 403;
    }
});

server.specific.push({
    getPath: function() {
        return '/pending'
    },
    open: function(res, req) {
        const data = URLS.parse(req.url, true);

        res.writeHead(200, {'content-type': 'application/json'});
        res.write(JSON.stringify({
            success: true,
            pending: (function () {
                for (const pending in pendingConfirms) {
                    if (pendingConfirms[pending].email == data.query.email) {
                        return true;
                    }
                }
                return false;
            })()
        }));
        res.end();
        
        return 200;
    }
});

server.start();