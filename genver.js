// Returns -1 if A is the greater version number
// Returns 1 if B is the greater version number
// Returns 0 if A & B are the same version number
// Returns NaN if either A or B are invalid version numbers
function compareVersion(A, B) {
	var Atype = typeof(A) === 'object';
	var Btype = typeof(B) === 'object';
	
	var An = Atype ? A : parseVersion(A);
	var Bn = Btype ? B : parseVersion(B);

	if (An.invalid || Bn.invalid) {
		return Nan;
	}
	
	var result = compareNumerics(An, Bn);
	if (result != 0) {
		return result;
	}
	
	result = compareLetter(An, Bn);
	if (result != 0) {
		return result;
	}
	
	result = compareSuffix(An, Bn);
	if (result != 0) {
		return result;
	}
	
	result = compareRevision(An, Bn);
	
	return result;
}

// Creates a version object from a version string
// the object is more useful for comparisons 
function parseVersion (V) {
	var result = {};
//		invalid: false,
//		invalidText: '',
//		original: V,
//		numerics: [],
//		letter: '',
//		suffixes: [],
//		revision: 0
//	};
	
	var remainder = V;
	
	// Get the first numeric
	var split = splitNumeric(remainder);
	if (split) {
		result.numerics = [split.numeric];
		remainder = split.remainder;
	}
	
	// Get all the additional numeric parts into the numerics array
	var split = splitDotNumeric(remainder);
	while (split) {
		(result.numerics || function () { return result.numerics = []; }()).push(split.numeric);
		remainder = split.remainder;
		
		split = splitDotNumeric(remainder);
	}
	
	// Split out the letter if there is one
	var split = splitLetter(remainder);
	if (split != null) {
		result.letter = split.letter;
		remainder = split.remainder;
	}

	// Process our suffixes if there are any
	var split = splitSuffix(remainder);
	while (split != null) {
		(result.suffixes || function () { return result.suffixes = []; }()).push(split.suffix);
		remainder = split.remainder;
		
		split = splitSuffix(remainder);
	}
	
	// Process release indicator if any
	var split = splitRevision(remainder);
	if (split != null) {
		result.revision = split.revision;
		remainder = split.remainder;
	}

	if (remainder.length > 0) {
		result.invalid = true;
		result.invalidText = remainder;
	}
	
	return result;
}

function splitDotNumeric(V) {
	var result = /^\.([0-9]+)/.exec(V);
	if (result == null || result.length != 2) {
		return null;
	} else {
		return {
			numeric: result[1],
			remainder: V == result[0] ? '' : V.slice(-1 * (V.length - result[0].length))
		};
	}
}

function splitRevision(V) {
	var result = /^-r([0-9]+)/.exec(V);
	if (result == null || result.length != 2) {
		return null;
	} else {
		return {
			revision: result[1],
			remainder: V == result[0] ? '' : V.slice(-1 * (V.length - result[0].length))
		};
	}
}

function splitSuffix(V) {
	var result = /^(_alpha|_beta|_pre|_rc|_p)([0-9]*)/.exec(V);
	if (result == null || result.length != 3) {
		return null;
	} else {
		return {
			suffix : {
				type: result[1].slice(1),
				value: result[2]
			},
			remainder: V == result[0] ? '' : V.slice(-1 * (V.length - result[0].length)),
		};
	}
}

function splitNumeric(V) {
	var result = /^[0-9]+/.exec(V);
	if (result == null || result.length != 1) {
		return null;
	} else {
		return {
			remainder: V == result[0] ? '' : V.slice(-1 * (V.length - result[0].length)),
			numeric: result[0]
		};
	}
}

function splitLetter(V) {
	var result = /^[a-z]/.exec(V);
	if (result == null || result.length != 1) {
		return null;
	} else {
		return {
			remainder: V == result[0] ? '' : V.slice(-1 * (V.length - result[0].length)),
			letter: result[0]
		};
	}
}

function isAllNumeric(V) {
	return /^[0-9]*$/.test(V);
}

var SUFFIXVALUES = {
	'alpha' : 0,
	'beta' :1,
	'pre' : 2,
	'rc' : 3,
	'p' : 4
}

function compareRevision(An, Bn) {
	return integerCompare(An.revision || '0', Bn.revision || '0');
}

function compareSuffix(An, Bn) {
	var i, 
		AnSuffixLength = An.suffixes ? An.suffixes.length : 0,
		BnSuffixLength = Bn.suffixes ? Bn.suffixes.length : 0;
		
	for (var i = 0; i < Math.min(AnSuffixLength, BnSuffixLength); i++) {
		var As = SUFFIXVALUES[An.suffixes[i].type];
		var Bs = SUFFIXVALUES[Bn.suffixes[i].type];
		
		if (As === Bs) {
			var result = integerCompare(An.suffixes[i].value, Bn.suffixes[i].value);
			if (result != 0) {
				return result;
			}
		} else if (As < Bs) {
			return 1;
		} else {
			return -1;
		}
	}
	
	// Got this far, matched suffixes are equal
	if (AnSuffixLength > BnSuffixLength) {
		if (An.suffixes[BnSuffixLength].type === 'p') {
			return -1;
		} else {
			return 1;
		}
	} else if (AnSuffixLength < BnSuffixLength) {
		if (Bn.suffixes[AnSuffixLength].type === 'p') {
			return 1;
		} else {
			return -1;
		}
	}
	
	return 0;
}

function compareLetter(An, Bn) {
	if ((An.letter || '') < (Bn.letter || '')) {
		return 1;
	} else if ((An.letter || '') > (Bn.letter || '')) {
		return -1;
	}
	
	return 0;
}

function compareNumerics(An, Bn) {
	if (An.invalid || Bn.invalid) {
		return NaN;
	}

	// Compare the first numeric of each version with integer comparison
	var result = integerCompare(An.numerics[0], Bn.numerics[0]);
	
	if (result != 0) {
		return result;
	}

	var Ann = An.numerics.length;
	var Bnn = Bn.numerics.length;
	
	// Compare each subsequent numeric with numeric comparison
	for (var i = 1; i < Math.min(Ann, Bnn); i++) {
		result = numericCompare(An.numerics[i], Bn.numerics[i]);
		if (result != 0) {
			return result;
		}
	}
	
	if (result != 0) {
		return result;
	}
	
	// Count the number of numerics
	if (Ann > Bnn) {
		return -1;
	} else if (Ann < Bnn) {
		return 1;
	}
	
	return 0;
}


function numericCompare(A, B) {
	var useAsciiCompare = false;
	useAsciiCompare |= (A.length > 1 && A[0] === '0');
	useAsciiCompare |= (B.length > 1 && B[0] === '0');
	
	var result = 0;
	if (useAsciiCompare) {
		return asciiCompare(A, B);
	} else {
		return integerCompare(A, B);
	}
}

function asciiCompare(A, B) {
	var An = '' + stripTrailingZeros(A);
	var Bn = '' + stripTrailingZeros(B);
	
	if (An < Bn) {
		return 1;
	} else if (An > Bn) {
		return -1;
	}
	
	return 0;
}

function integerCompare(A, B) {
	// Comparing digit by digit so we can have arbitrary length numeric values
	var An = stripLeadingZeros(A).split('');
	var Bn = stripLeadingZeros(B).split('');
	
	if (An.length > Bn.length) {
		return -1;
	} else if (An.length < Bn.length) {
		return 1;
	}
	
	for (var i = 0; i < An.length; i++) {
		var a = parseInt(An[i]);
		var b = parseInt(Bn[i]);
		
		if (a < b) {
			return 1;
		} else if (a > b) {
			return -1;
		}
	}
	
	return 0;
}

function stripLeadingZeros(V) {
	var result = /^0*([0-9][0-9]*)/.exec(V);
	if (result == null || result.length != 2) {
		return V || '';
	} else {
		return result[1];
	}
}

function stripTrailingZeros(V) {
	if (V.length == 0) {
		return V;
	}
	
	var n = V.length - 1;
	while (V[n] === '0' && n > 0) {
		n--;
	}
	
	return V.slice(0, n+1);
}

exports.compare = compareVersion;
exports.parse = parseVersion;
