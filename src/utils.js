let hasValue = function (object = {}, path = '') {
	let props = path.split('.');
	let current = props.shift();
	// If we only have one property, return the value
	if (props.length === 0) {
		return object[current] !== undefined ? object[current] : false;
	}
	// If the path is invalid, return false
	else if (object[current] === undefined) {
		return false;
	}
	// keep going until we have traversed the full path
	else {
		return hasValue(object[current], props.join('.'));
	}
};

module.exports = { hasValue };
