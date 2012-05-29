var assert = require('assert');
var version = require('./genver');

suite('Version', function() {
	suite('compare', function() {
		[
			{left: '0', right: '0', result: 0},
			{left: '0', right: '1', result: 1},
			{left: '1', right: '0', result: -1},
			{left: '10', right: '1', result: -1},
			{left: '10.0', right: '10.1', result: 1},
			{left: '10.88', right: '10.755', result: 1},
			{left: '10.088', right: '10.0755', result: -1},
			{left: '10.0755', right: '10.088', result: 1},
			{left: '10.0755', right: '10.0880', result: 1},
			{left: '10.07550', right: '10.088', result: 1},
			{left: '10.0755000', right: '10.08800', result: 1},
			{left: '10.075500', right: '10.088000', result: 1},
			{left: '10', right: '10a', result: 1},
			{left: '10a', right: '10', result: -1},
			{left: '10b', right: '10a', result: -1},
			{left: '10b', right: '10b', result: 0},
			{left: '10.5.7', right: '10.5', result: -1},
			{left: '10.5', right: '10.5.7', result: 1},
			{left: '10.5_alpha', right: '10.5', result: 1},
			{left: '10.5_alpha', right: '10.5_beta', result: 1},
			{left: '10.5_beta_rc1', right: '10.5_alpha', result: -1},
			{left: '10.5_beta_p', right: '10.5_beta', result: -1},
			{left: '10.5_rc4', right: '10.5_rc5', result: 1},
			{left: '10.5-r3', right: '10.5', result: -1},
			{left: '10.5-r1', right: '10.5-r2', result: 1},
			{left: '1.0.2', right: '1.0.2-r0', result: 0},
			{left: '1.0.2', right: '1.000.2', result: 0},
			{left: '1.0.2-r0', right: '1.000.2', result: 0}
		].forEach(function (condition) {
			test(condition.left + ' to ' + condition.right + ' = ' + condition.result, function () {
				assert.equal(version.compare(condition.left, condition.right), condition.result);
			});
		});
	});

	suite('parse', function () {
		[
			{val: "10", result: {numerics: ["10"]}},
			{val: "10.1", result: {numerics: ["10", "1"]}},
			{val: "10a", result: {numerics: ["10"], letter:"a"}},
			{val: "10_beta", result: {numerics: ["10"], suffixes: [{type: "beta", value: 0}]}},
			{val: "10_beta5", result: {numerics: ["10"], suffixes: [{type: "beta", value: 5}]}},
			{val: "10_beta5_rc30", result: {numerics: ["10"], suffixes: [{type: "beta", value: 5}, {type: "rc", value: 30}]}},
			{val: "10-r4", result: {numerics: ["10"], revision: 4}},
			{val: "20080420133045.1.020.3.4a_alpha67_rc_pre13-r33", result: {
				numerics: ["20080420133045", "1", "020", "3", "4"],
				letter: "a",
				suffixes: [ {type: "alpha", value: 67},
							{type: "rc", value: 0},
							{type: "pre", value:13} ],
				revision: 33
			}},
			{val: "10.0600", result: {numerics: ["10", "0600"]}},
			{val: "10.0-r2.3", result: {"numerics":["10","0"],"revision":"2","invalid":true,"invalidText":".3"}}
		].forEach(function (condition) {
			test(condition.val, function () {
				assert.deepEqual(version.parse(condition.val), condition.result);
			});
		});
	});
	
	suite('mixedParsing', function() {
		test('object vs string', function() {
			var A = version.parse('10.0');
			var B = '10.1';
			assert.equal(1, version.compare(A, B));
		});

		test('string vs object', function() {
			var A = '10.0';
			var B = version.parse('10.1');
			assert.equal(1, version.compare(A, B));
		});

		test('object vs object', function() {
			var A = version.parse('10.0');
			var B = version.parse('10.1');
			assert.equal(1, version.compare(A, B));
		});
	});
});

