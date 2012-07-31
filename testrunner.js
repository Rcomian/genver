var Mocha = require('mocha'); //The root mocha path 

var mocha = new Mocha({
        ui: 'tdd',
        reporter: 'min'
    });

Mocha.useColors = false;

var passed = [];
var failed = [];

mocha.addFile('test.js'); // direct mocha to test.js


mocha.run(function(){


}).on('fail', function(test){
    failed.push(test.title);
}).on('pass', function(test){
    passed.push(test.title);
});