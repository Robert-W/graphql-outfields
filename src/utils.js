// @flow
import type { GraphQLOutfieldTree } from './definitions';

let hasValue = function (tree: GraphQLOutfieldTree = {}, path: string = ''): boolean {
	let props: Array<string> = path.split('.');
	let property: string = props.shift();
	// If the path is invalid, return false
	if (tree[property] === undefined) {
		return false;
	}
	// If this is the end of the line, return current value as bool
	else if (typeof tree[property] === 'boolean' || props.length === 0) {
		return !!tree[property];
	}
	// Continue traversing
	else {
		return hasValue(tree[property], props.join('.'));
	}
};

module.exports = { hasValue };
