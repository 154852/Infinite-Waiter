module.exports = {
  getPath: function() {
    return '/app'
  },
  open: function(response, request, path) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write(new Date().toString());
    res.end();

    return 200;
  }
};
