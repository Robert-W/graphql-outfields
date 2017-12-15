const { hasValue } = require('./utils');

/**
 * @function parser
 * @description
 */
let parseAST = function (nodes = []) {
	// Let's generate a JSON tree of nodes
	return nodes.reduce((tree = {}, node = {}) => {
		let name = node.name && node.name.value;
		let children = node.selectionSet && node.selectionSet.selections;
		// Store true for the node existing if this is the final depth
		// otherwise, continue to traverse the AST to find all nodes
		tree[name] = children ? parseAST(children) : true;
		return tree;
	}, {});
};

/**
 * @function has
 * @description Check if a particular field is in the outfields for a query
 * @example
 * // returns true if foo.bar.baz is in query, or false if it does not
 * has(resolverInfo, 'foo.bar.baz')
 */
let has = function (info = {}, path = '') {
	return hasValue(parseAST(info.fieldNodes), path);
};

/**
 * @function parser
 * @description Parse the resolvers info.fieldNodes and return a JSON
 * tree representing the query outfields. Also return a convenience
 * getter to test nested path's easily.
 * @example
 * let { fields, has } = parser(resolversInfo);
 * // if has('foo.bar.baz') is true, user asked for foo.bar.baz in their results
 */
let parser = function (info = {}) {
	let fields = parseAST(info.fieldNodes);

	return {
		fields,
		has: (path) => hasValue(fields, path)
	};
};

module.exports = { parser, has };
