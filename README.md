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

**Description:** In JSON the string references a path to a file under the root (if it is there) on which a `require` will be called. An object with the following properties will be expected:

  Name : Type : Parameters : Return Type : Description
- getPath : <function> : No Params : String : Returns the string that is the virtual path of the binding
- open : response, request, path : Number : Will be called when that binding is requested, should return the response code 
