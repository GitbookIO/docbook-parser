var fs = require('fs');

var Docbook = require('./docbook');

var filename = process.argv[2];

fs.readFile(filename, 'utf-8', function(err, data) {
    if (err) {
        console.log(err.stack);
        throw err;
    }

    var docbook = new Docbook(data);
});