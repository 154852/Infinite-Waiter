# Waiter

Waiter is a simple node.js program to serve webpages, run a websocket do reverse proxies and use `jshtml`.

## How it works:

**Base class**: `Server`

Everything comes under server, you just need to make sure it is properly configured. This can be done in `JSON` or in `JavaScript`.

**Examples can be found in the 'examples' folder**

To load some JSON into a server:

```
let server = Server.loadFromConfig('path/to/json/file.json');
server.start();
```

### Port
JSON: ```"port": <number>```

JavaScript: ```server.port = <number>```

Default: ```8080```

**Description:** The port for the server to run on

### Root
JSON: ```"root": <string>```

JavaScript: ```server.root = <string>```

Default: ```null```

**Description:** The served directory, eg if the folder ```/folder/website``` was the root then ```/folder/website/main.html``` could be accessed at ```main.html.``` Can be null, but then webpages are not served. This is good for reverse proxy or websocket only servers.

### Bindings
JSON: ```"bindings": [<string>, <string>, etc...]```

JavaScript: ```server.specific = [<object>, <object>]```

Default: ```[]```

**Description:** In JSON the string references a path to a file under the root (if it is there) on which a `require` will be called. An object with the following methods will be expected:

  Name : Parameters : Return Type : Description
- getPath : No Params : String : Returns the string that is the virtual path of the binding
- open : response, request, path : Number : Will be called when that binding is requested, should return the response code 

### Equal
JSON: ```"equal": {<string>: <string>}```

JavaScript: ```server.equal = {<string>: <string>, <string>: <string>, etc...}```

Default: ```{'/': 'index.html'}```

**Description:** If the key is requested, we will instead return the value, ie, requesting '/' will actually be treated as requesting 'index.html'.

### Error Pages
JSON: ```"error-pages": [{"type": <number>, "text": <string>}, {"type": <number>, "file": <string>}, etc...]```

JavaScript: ```server.errorPages = {<number>: {"text": <string>}, <number>: {"file": <string>}}```

Default: ```{}```

**Description:** Error pages to be used when an error http code comes up such as 404 or 403. `type` in the JSON is the code, eg 404, this is the key number in the JavaScript also. If the value is of type `text` then that string will be returned, otherwise if `file` is  given then the file at that path will be given.

### Illegal
JSON: `"illegal": [{"value": "forbidden-dir", "regex": false}, {"value": "other-forbidden-dir/.*", "regex": true}, etc...]`

JavaScript: `server.illegal = ["forbidden-dir", /other-forbidden-dir/.*/]`

Default: `[/\.\./, /~/]`

**Description:** These will return a 403 when matched. Due to regexp not being available in JSON a regex can be marked with `"regex": true`, in which case `"flags": "<flags>"` is available. If it is not a regex then it has to be an exact match to be illegal.

### Hidden
JSON: `"hidden": [{"value": "hidden-dir", "regex": false}, {"value": "other-hidden-dir/.*", "regex": true}, etc...]`

JavaScript: `server.hidden = ["hidden-dir", /other-hidden-dir/.*/]`

Default: `[]`

**Description:** Works the same way as illegals, except these will return a 404, even if they exist.

### Websockets
JSON: `"websocket": {"enabled": "true", "handler": "path/to/js/file.js"}`

JavaScript: `server.websocket = 'path/to/js/file.js'`

Default: `null`

**Description:** Similar to bindings, except the handler js file is expected to have the following export:

  Name : Parameters : Return Type : Description
- connection : connection, request : No return : Called when someone opens the socket
- message : connection, string : No return : Called when someone submits data to the socket
- close : connection : No return : Called when someone closes the socket

**Note:** The connection object comes from (here)[https://www.npmjs.com/package/websocket], as does the request object.

### Reverse Proxies:
JSON: `"reverse-proxies": [{"input": "some-path", "target": "localhost:5050/something", "cut": 2}]`

JavaScript: `server.reverseProxies = [{input: "some-path", target: "localhost:5050/something", cut: 2}]`

Default: `[]`

**Description:** Basic reverse proxies, input is the listening path, `*` matches everything. Target is the destintination, can be alternate server with path on the end. Cut is used like so: `req.url.split('/').splice(reverseProxy.cut).join('/')`, meaning it is how many slashed sections to remove... This path is then put on the end of the target (kind of).

**Example:**
```
input: 'some-path'
target: 'localhost:9090/abc'
cut: 2

requested: '/some-path/hello-world'
cut-part: 'hello-world'
output: 'localhost:9090/abc/hello-world'
```

### JSHTML
When a page is distributed if it's extension is `.jshtml` then it is treated as JavaScript HTML. This means that any text within `<: <javascript> :>` is treated as javascript and is run *on the server*, as a function. The current http request and reponse are accessible with `request` and `response`. A string should be returned here. Text within `<* <javascript> *>` will be treated the same, but imagine a return statement before your code, this should be for a simple object. New lines are allowed in the code.

**Examples:**
```
<p>The date and time is <* new Date().toString(); *>.</p>

<p>This is <:
  const date = new Date();
  return date.getTime().toString()
:> in milliseconds</p>
```

### Directory Configuration
When a page is requested we will go all the way up through the file tree up to the root path looking for `dir.conf` files.
These files can contain the following information:

`#comments;` Comments

`default: <path name>;` A default file to give if only a path to that directory is given. Eg: if `folder/inner-folder` is requested, but inside of `inner-folder` there is a file called `dir.conf` with `default: app.html;` in it, then `app.html` inside of that folder is instead returned.

`hidden: [true|false];` Marks that that directory and *all* sub files and directories should return a 404.

`illegal: [true|false];` Marks that that directory and *all* sub files and directories should return a 403.
