'use strict';

function _checkLength(string, length, replacement) {
    for (var i = string.length; i < length; i++) string = replacement + string;

    return string;
}

Date.prototype.format = function(string) {
    const regex = '[CHAR]+';

    const data = {
        'n': this.getMilliseconds(),
        's': this.getSeconds(),
        'm': this.getMinutes(),
        'h': this.getHours(),
        'd': this.getDate(),
        'M': this.getMonth() + 1,
        'y': this.getFullYear()
    };

    for (const key in data) {
        const part = new RegExp(regex.replace('CHAR', key), 'g').exec(string);

        if (part != null) {
            for (var i = 0; i < part.length; i++) {
                string = string.replace(part[i], _checkLength(data[key] + '', part[i].length, '0'));
            }
        }
    }

    return string;
}

var http = require('http');
var url = require('url');
var pathReq = require('path');
var fs = require('fs');
var WebSocketServer = require('websocket').server;
var httpProxy = require('http-proxy');

class Binding {
    getPath() {

    }

    open(res, req) {

    }
}

class Server {
    constructor(root, port) {
        this.port = port? port:8080;
        this.root = root;
        this.specific = [];

        this.equal = {
            '/': 'index.html'
        }

        this.errorPages = {}

        this.illegal = [/\.\./, /~/];
        this.hidden = [];

        this.websocket = null;

        this.reverseProxies = [];
        this.reverseProxyServer = httpProxy.createProxyServer();
    }

    log(text, full, newLine) {
        process.stdout.write((full? ('[' + new Date().format('dd/MM/yyyy hh:mm:ss') + '] [INFO] ' + text):text) + (newLine? '\n':''));
    }

    warn(text, full, newLine) {
        process.stdout.write((full? ('[' + new Date().format('dd/MM/yyyy hh:mm:ss') + '] [WARN] ' + text):text) + (newLine? '\n':''));
    }

    error(text, full, newLine) {
        process.stdout.write((full? ('[' + new Date().format('dd/MM/yyyy hh:mm:ss') + '] [ERROR] ' + text):text) + (newLine? '\n':''));
    }


    handleRequest(req, res) {
        var q = url.parse(req.url, true);
        this.log(q.path, true, false);

        for (const illegal of this.illegal) {
            if (illegal == q.path || (illegal.constructor.name == 'RegExp' && illegal.exec(q.path))) {
                res.writeHead(403, {'content-type': 'text/html'});
                res.write(this.getErrorPage(403));
                res.end();

                this.log(' : 403', false, true);

                return;
            }
        }

        for (const hidden of this.hidden) {
            if (hidden == q.path || (hidden.constructor.name == 'RegExp' && hidden.exec(q.path))) {
                res.writeHead(404, {'content-type': 'text/html'});
                res.write(this.getErrorPage(404));
                res.end();

                this.log(' : 404', false, true);

                return;
            }
        }

        for (const reverseProxy of this.reverseProxies) {
            if (reverseProxy.input.exec('/' + q.pathname) != null) {
                req.url = '/' + req.url.split('/').splice(reverseProxy.cut).join('/');

                this.reverseProxyServer.web(req, res, {target: reverseProxy.target});
                this.log(' : <REDIRECT> : ' + reverseProxy.target + req.url, false, true);

                return;
            }
        }

        let path = q.path;
        if (q.path in this.equal) {
            path = this.equal[q.path];
        }

        for (const binding of this.specific) {
            if ((binding.getPath().constructor.name == 'RegExp' && binding.getPath().exec(path)) || (binding.getPath().constructor.name == 'String' && (binding.getPath() == path))) {
                this.log(' : <DYNAMIC> : ' + binding.open(res, req, path), false, true);
                return;
            }
        }

        let data;
        if (this.root != null) {
            path = this.root + path;
            this.log(' : ' + path, false, false);

            data = this.getResponseForFile(path, res, req);
        } else {
            data = {code: 404, type: 'text/html', data: this.getErrorPage(404)}
        }

        res.writeHead(data.code, {'content-type': data.type});
        res.write(data.data);
        res.end();

        if (data.code != 500) this.log(' : ' + data.code, false, true);
    }

    start() {
        const self = this;

        let server = http.createServer(function(req, res) {
            self.handleRequest(req, res);
        });
        server.listen(this.port);

        this.log('Started server on port ' + this.port, true, true);

        if (this.websocket != null) {
            var wsServer = new WebSocketServer({
                httpServer: server
            });
    
            wsServer.on('request', function(request) {
                var connection = request.accept(null, request.origin);
                self.websocket.connection(connection, request);
                
                connection.on('message', function(message) {
                    if (message.type === 'utf8') {
                        self.websocket.message(connection, message.utf8Data);
                    }
                });
                
                connection.on('close', function() {
                    self.websocket.close(connection);
                });
            });

            this.log('Started websocket', true, true);
        }
    }
    
    addBinding(binding) {
        this.specific.push(binding);
    }

    getErrorPage(code) {
        const data = this.errorPages[code];
        if (data == null) return 'ERROR: ' + code;

        if ('file' in data) {
            return fs.readFileSync(this.root + data.file);
        }

        if ('text' in data) {
            return data.text;
        }

        return 'ERROR: ' + code;
    }

    getFileType(path) {
        return {
            html: 'text/html',
            jshtml: 'text/html',
            txt: 'text/plaintext',
            json: 'application/json',
            js: 'text/javascript',
            css: 'text/css'
        }[pathReq.extname(path).slice(1)];
    }

    jshtml(text, res, req) {
        const start = 'const response = arguments[0]; const request = arguments[1];';

        try {
            const regex1 = /<:(((?!:>)[\s\S])*):>/g;
            let match;
            do {
                match = regex1.exec(text);

                if (match != null) {
                    text = text.replace(match[0], new Function(start + match[1])(res, req));
                }
            } while (match != null);

            const regex2 = /<\*(((?!\*>)[\s\S])*)\*>/g;
            do {
                match = regex2.exec(text);

                if (match != null) {
                    text = text.replace(match[0], new Function(start + 'return ' + match[1])(res, req));
                }
            } while (match != null);
        } catch (exc) {
            console.log(' : 500');
            this.error(exc, true, true);
            return 500;
        }

        return text;
    }

    loadConfig(path) {
        const lines = fs.readFileSync(path).toString().replace(/\n/g, '').split(';');

        const data = {};
        for (const line of lines) {
            if (line.trim() == '') continue;

            const parts = line.split(':');
            data[parts[0].trim()] = parts[1].trim();
        }

        return data;
    }

    read200(path) {
        return [fs.readFileSync(path), this.getFileType(path)];
    }

    getResponseForFile(path, res, req) {
        let page, code, type;

        const name = pathReq.basename(path);
        const dir = pathReq.dirname(path) + '/';

        const files = fs.readdirSync(dir);
        for (const file of files) {
            if (file == name || file == name + pathReq.extname(file)) {
                let data;
                try {
                    data = this.read200(dir + file);
                } catch (exc) {
                    if (fs.existsSync(dir + file + '/dir.conf')) {
                        const config = Server.loadConfig(dir + file + '/dir.conf');
                        if ('default' in config) {
                            data = this.read200(dir + file + '/' + config.default);
                        }
                    }
                }

                if (data != null) {
                    page = pathReq.extname(file) == '.jshtml'? this.jshtml(data[0].toString(), res, req):data[0];

                    if (typeof page == 'number') {
                        code = page;
                        page = this.getErrorPage(code);
                        type = 'text/html';
                    } else {
                        code = 200;
                        type = data[1];
                    }
                }

                break;
            }
        }

        if (page == null) {
            page = this.getErrorPage(404);
            code = 404;
            type = 'text/html';
        }
        
        return {
            code: code,
            type: type,
            data: page
        };
    }
}
Server.loadConfig = function(path) {
    const lines = fs.readFileSync(path).toString().replace(/\n/g, '').split(';');

    const data = {};
    for (const line of lines) {
        if (line.trim() == '') continue;

        const parts = line.split(':');
        data[parts[0].trim()] = parts[1].trim();
    }

    return data;
}

Object.prototype.withoutKey = function(key) {
    const x = JSON.parse(JSON.stringify(this));
    x[key] = undefined;
    return x;
}

Server.loadFromConfig = function(path) {
    const data = JSON.parse(fs.readFileSync(path).toString());

    const server = new Server(data.root, data.port);
    server.equal = data.equal == null? {}:data.equal;

    if (process.argv[2]) {
        server.port = process.argv[2];
    }

    if (data.errorPages != null) {
        for (const errorPage of data['error-pages']) {
            server.errorPages[errorPage.type] = errorPage.withoutKey('type');
        }
    }

    if (data.illegal != null) {
        for (const illegal of data.illegal) {
            if (illegal.regex) {
                server.illegal.push(new RegExp(illegal.value, illegal.flags));
            } else {
                server.illegal.push(illegal.value);
            }
        }
    }

    if (data.hidden != null) {
        for (const hidden of data.hidden) {
            if (hidden.regex) {
                server.hidden.push(new RegExp(hidden.value, hidden.flags));
            } else {
                server.hidden.push(hidden.value);
            }
        }
    }

    if (data.bindings != null) {
        for (const binding of data.bindings) {
            server.specific.push(require(server.root == null? binding : server.root + binding));
        }
    }

    if (data.websocket && data.websocket.enabled) {
        server.websocket = require(server.root == null? data.websocket.handler : server.root + '/' + data.websocket.handler);
    }

    for (const reverseProxy of data['reverse-proxies']) {
        server.reverseProxies.push({
            input: new RegExp(reverseProxy.input.replace(/\*/g, '.*')),
            target: reverseProxy.target,
            cut: reverseProxy.cut
        });
    }

    return server;
}
