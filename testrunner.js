var Mocha = require('mocha'); //The root mocha path 

var mocha = new Mocha({
        ui: 'tdd'
    });

var passed = [];
var failed = [];

mocha.addFile('test.js'); // direct mocha to test.js


mocha.run(function(){

    console.log(passed.length + ' Tests Passed');
    passed.forEach(function(testName){
        console.log('Passed:', testName);
    });

    console.log("\n"+failed.length + ' Tests Failed');
    failed.forEach(function(testName){
        console.log('Failed:', testName);
    });

}).on('fail', function(test){
    failed.push(test.title);
}).on('pass', function(test){
    passed.push(test.title);
});