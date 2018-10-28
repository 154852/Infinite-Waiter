# Waiter

Waiter is a simple node.js program to serve webpages, run a websocket do reverse proxies and use `jshtml`.

## How it works:

**Base class**: `Server`

Everything comes under server, you just need to make sure it is properly configured. This can be done in `JSON` or in `JavaScript`.

### Example JSON:
```
{
  "root": "/my/path/to/a/folder",
  "port": 8080,
  "equal": {
    "/": "index.html"
  },
  "error-pages": [
    {
      "type": 404,
      "file": "404.html"
    }, {
      "type": 403,
      "text": "You do not have permission to access this page!"
    }
  ],
  "illegal": [
    {
      "value": "~",
      "regex": false
    }, {
      "value": "NO-ACCESS-DIR/.*",
      "regex": true
    }
  ],
  "hidden": [
    {
      "value": "FILE-THAT-WILL-RETURN-404-EVEN-THOUGH-IT-EXISTS",
      "regex": false
    }
  ],
  "bindings": ["JSHTML-SOURCE-FILE.js"],
  "websocket": {
    "enabled": true,
    "handler": "ws-handler.js"
  },
  "reverse-proxies": [
    {
      "input": "app*",
      "target": "http://localhost:1000/other-domain",
      "cut": 2
    }, {
      "input": "thing*",
      "target": "http://google.com",
      "cut": 2
    }
  ]
}
```
