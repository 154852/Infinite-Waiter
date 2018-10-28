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

